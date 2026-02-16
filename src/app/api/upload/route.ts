import { NextRequest, NextResponse } from "next/server";
import { addSubmission, getStats, hasIpSubmitted, hasFileSubmitted } from "@/lib/db";
import { supabaseAdmin } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";

export async function POST(req: NextRequest) {
    try {
        // 1. IP Limitation Check
        const forwardedFor = req.headers.get("x-forwarded-for");
        const ip = forwardedFor ? forwardedFor.split(',')[0] : "127.0.0.1"; // Fallback for dev
        const ipHash = crypto.createHash('sha256').update(ip).digest('hex');

        if (await hasIpSubmitted(ipHash)) {
            return NextResponse.json(
                { error: "Access Denied: You have already submitted a puzzle." },
                { status: 403 }
            );
        }

        const formData = await req.formData();
        const file = formData.get("file") as File;

        // 2. Duplicate File Name Check
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
        // Sanitize filename to prevent directory traversal
        const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
        const filename = `${uuidv4()}-${safeName}`;

        // Upload to Supabase Storage
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

        // Get public URL
        const { data: { publicUrl } } = supabaseAdmin.storage.from('pdfs').getPublicUrl(filename);

        // Create submission record
        const submission = {
            file_path: publicUrl,
            original_name: file.name,
            hash: ipHash,
        };

        // Save to DB 
        const savedData = await addSubmission(submission, ipHash);

        return NextResponse.json({
            success: true,
            id: savedData.id,
            hash: savedData.hash,
            file_path: savedData.file_path,
        });

    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
}
