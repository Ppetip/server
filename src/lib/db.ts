import { NextResponse } from 'next/server';
// 1. Updated imports to match your actual db.ts
import { addSubmission, hasIpSubmitted, type Submission } from '@/lib/db';
import { normalizeGrid, formatHash } from '@/lib/sudoku';
import crypto from 'crypto';

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

        // 2. Use your new Supabase-backed functions
        // Using the hash of the grid as the unique identifier
        const alreadySubmitted = await hasIpSubmitted(hash); 

        if (alreadySubmitted) {
            return NextResponse.json({
                error: "Duplicate! This exact puzzle was already found in the vault.",
            }, { status: 409 });
        }

        // 3. Prepare and save the submission to Supabase
        const newSubmission: Submission = {
            grid: gridString,
            hash: hash,
            original_name: "Sudoku Puzzle", // Or whatever identifier you prefer
        };

        const savedData = await addSubmission(newSubmission, hash);

        // 4. Return Success
        const formattedHash = formatHash(savedData.id, hash);
        return NextResponse.json({
            success: true,
            id: savedData.id,
            hash: formattedHash
        });

    } catch (error) {
        console.error("Submit error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
