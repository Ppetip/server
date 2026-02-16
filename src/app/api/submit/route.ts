import { NextResponse } from 'next/server';
import { getStats, getAdminConfig, type Submission } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // Fetching data from Supabase via your db utilities
        const stats = await getStats();
        const config = await getAdminConfig();

        return NextResponse.json({
            count: stats.count,
            donationGoal: config.donationGoal,
            donationCurrent: config.donationCurrent,
            donationLink: config.donationLink,
            // (s: Submission) provides the type safety required by Next.js build workers
            recent: stats.recent.map((s: Submission) => ({
                id: s.id,
                // Using optional chaining to prevent crashes if hash is missing
                hash: s.hash ? s.hash.substring(0, 8) + "..." : "Unknown",
                time: s.createdAt
            }))
        });
    } catch (error) {
        console.error("Stats API Error:", error);
        return NextResponse.json(
            { error: "Failed to fetch stats from database" }, 
            { status: 500 }
        );
    }
}
