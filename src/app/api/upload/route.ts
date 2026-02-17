import { NextRequest, NextResponse } from "next/server";
import { addSubmission, hasUserSubmitted, hasFileSubmitted } from "@/lib/db";
import { supabaseAdmin } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
    try {
        // 1. Auth Check (Supabase JWT)
        const authHeader = req.headers.get('authorization');
        if (!authHeader) {
            return NextResponse.json({ error: "Missing Authorization Header" }, { status: 401 });
        }

        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized: Invalid Token" }, { status: 401 });
        }

        // 2. Submission Limit Check (User ID)
        if (await hasUserSubmitted(user.id)) {
            return NextResponse.json(
                { error: "Access Denied: You have already submitted a puzzle." },
                { status: 403 }
            );
        }

        const formData = await req.formData();
        const file = formData.get("file") as File;

        // 3. Duplicate File Name Check
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

        // Save to DB
        const submission = {
            file_path: publicUrl,
            original_name: file.name,
            hash: null, // Legacy field
            user_id: user.id
        };

        const savedData = await addSubmission(submission);

        return NextResponse.json({
            success: true,
            id: savedData.id,
            file_path: savedData.file_path,
        });

    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
}
