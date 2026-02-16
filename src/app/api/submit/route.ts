import { NextResponse } from 'next/server';
import { getDB, saveDB, Submission } from '@/lib/db';
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

        const db = getDB();

        // 1. Uniqueness Check
        if (db.submissions[hash]) {
            return NextResponse.json({
                error: "Duplicate! This exact puzzle was already found in the vault.",
                originalId: db.submissions[hash]
            }, { status: 409 });
        }

        // 2. Increment & Save
        db.count++;
        const newId = db.count;

        const submission: Submission = {
            id: newId,
            grid: gridString,
            hash: hash,
            createdAt: new Date().toISOString()
        };

        db.submissions[hash] = newId;
        db.recent.unshift(submission);
        if (db.recent.length > 10) db.recent.pop(); // Keep only last 10

        saveDB(db);

        // 3. Return Success
        const formattedHash = formatHash(newId, hash);
        return NextResponse.json({
            success: true,
            id: newId,
            hash: formattedHash
        });

    } catch (error) {
        console.error("Submit error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
