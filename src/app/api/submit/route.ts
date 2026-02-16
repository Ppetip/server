import { NextResponse } from 'next/server';
import { addSubmission, hasIpSubmitted, type Submission } from '@/lib/db';
import { normalizeGrid, formatHash } from '@/lib/sudoku';
import crypto from 'crypto';
//hi
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { grid } = body;

        if (!grid || !Array.isArray(grid) || grid.length !== 81) {
            return NextResponse.json({ error: "Invalid grid format" }, { status: 400 });
        }

        const gridString = normalizeGrid(grid);

        // Server-side SHA-256 (Node crypto)
        const hash = crypto.createHash('sha256').update(gridString).digest('hex').toUpperCase();

        // 1. Check if it already exists (Note the 'await')
        const alreadyExists = await hasIpSubmitted(hash);

        if (alreadyExists) {
            return NextResponse.json({
                error: "Duplicate! This exact puzzle was already found in the vault.",
            }, { status: 409 });
        }

        // 2. Prepare the submission object for Supabase
        const submissionData: Submission = {
            grid: gridString,
            hash: hash,
            original_name: "Sudoku Submission"
        };

        // 3. Save to Supabase (Note the 'await')
        const savedRecord = await addSubmission(submissionData, hash);

        // 4. Return Success using the 'id' returned by Supabase
        const formattedHash = formatHash(savedRecord.id, hash);
        
        return NextResponse.json({
            success: true,
            id: savedRecord.id,
            hash: formattedHash
        });

    } catch (error) {
        console.error("Submit error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
