import { NextRequest, NextResponse } from "next/server";
import { addSubmission, hasIpSubmitted, hasFileSubmitted } from "@/lib/db";
import { supabaseAdmin } from "@/lib/supabase";
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";

// Helper to get IP
function getIp(req: NextRequest) {
    const forwardedFor = req.headers.get("x-forwarded-for");
    if (forwardedFor) {
        return forwardedFor.split(",")[0].trim();
    }
    // Fallback for local dev if needed, or just return a default
    return req.headers.get("x-real-ip") || "127.0.0.1";
}

export async function POST(req: NextRequest) {
    try {
        const ip = getIp(req);
        const ipHash = crypto.createHash("sha256").update(ip).digest("hex");

        // 1. IP Limit Check
        if (await hasIpSubmitted(ipHash)) {
            return NextResponse.json(
                { error: "Access Denied: You have already submitted a puzzle." },
                { status: 403 }
            );
        }

        const formData = await req.formData();
        const file = formData.get("file") as File;

        // 2. Duplicate File Check
        if (file && await hasFileSubmitted(file.name)) {
            return NextResponse.json(
                { error: "A file with this name has already been submitted." },
                { status: 409 }
            );
        }

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        if (file.type !== "application/pdf") {
            return NextResponse.json({ error: "Only PDF files are allowed" }, { status: 400 });
        }

        const buffer = await file.arrayBuffer();
        const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
        const filename = `${uuidv4()}-${safeName}`;

        const { data: uploadData, error: uploadError } = await supabaseAdmin
            .storage
            .from('pdfs')
            .upload(filename, buffer, {
                contentType: 'application/pdf',
                upsert: false
            });

        if (uploadError) {
            console.error("Storage Upload Error:", uploadError);
            return NextResponse.json({ error: "File Upload Failed" }, { status: 500 });
        }

        const { data: { publicUrl } } = supabaseAdmin.storage.from('pdfs').getPublicUrl(filename);

        const submission = {
            file_path: publicUrl,
            original_name: file.name,
            hash: ipHash,
        };

        const savedData = await addSubmission(submission);

        return NextResponse.json({
            success: true,
            id: savedData.id,
            file_path: savedData.file_path,
            hash: ipHash
        });

    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
}
