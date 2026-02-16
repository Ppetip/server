import { NextResponse } from 'next/server';
import { getStats, getAdminConfig } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
    const stats = await getStats();

    // Also fetch donation config to show on public page
    const config = await getAdminConfig();

    return NextResponse.json({
        count: stats.count,
        donationGoal: config.donationGoal,
        donationCurrent: config.donationCurrent,
        donationLink: config.donationLink,
        recent: stats.recent.map(s => ({
            id: s.id,
            hash: s.hash?.substring(0, 8) + "...",
            time: s.createdAt
        }))
    });
}
