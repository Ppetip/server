import { NextResponse } from 'next/server';
import { getStats, getAdminConfig, type Submission } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const stats = await getStats();
        const config = await getAdminConfig();

        return NextResponse.json({
            count: stats.count,
            donationGoal: config.donationGoal,
            donationCurrent: config.donationCurrent,
            donationLink: config.donationLink,
            // (s: Submission) fixes the "implicit any" build error
            recent: stats.recent.map((s: Submission) => ({
                id: s.id,
                hash: s.hash ? s.hash.substring(0, 8) + "..." : "Unknown",
                time: s.createdAt
            }))
        });
    } catch (error) {
        console.error("Stats API Error:", error);
        return NextResponse.json(
            { error: "Failed to fetch stats" }, 
            { status: 500 }
        );
    }
}
