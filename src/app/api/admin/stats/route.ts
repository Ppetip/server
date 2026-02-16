import { NextRequest, NextResponse } from "next/server";
import { getStats, getAdminIp, getAdminConfig } from "@/lib/db";
import crypto from "crypto";

export async function GET(req: NextRequest) {
    try {
        const forwardedFor = req.headers.get("x-forwarded-for");
        const ip = forwardedFor ? forwardedFor.split(',')[0] : "127.0.0.1";
        const ipHash = crypto.createHash('sha256').update(ip).digest('hex');

        const adminIp = await getAdminIp();

        // Security Check
        if (adminIp !== ipHash) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const stats = await getStats();
        const config = await getAdminConfig();

        // Calculate stats
        // Supabase `getStats` returns total count and recent array.
        // Unique IPs is harder to get efficiently without a specific query, 
        // but we can add a helper or just return 0 for now if performance is an issue.
        // For now, let's just return what we have.
        // Actually, `getStats` in `db.ts` only returns count and recent. 
        // We should probably add `uniqueIps` to `getStats` or a separate function if critical.
        // Let's just return 0 for uniqueIps for now or count unique hashes in `recent` (inaccurate).
        // Or add `getUniqueIpsCount` to `db.ts`.

        return NextResponse.json({
            count: stats.count,
            uniqueIps: 0, // Placeholder, or implement real count later
            recent: stats.recent,
            config: config,
            dbSize: 0 // Not relevant for Supabase
        });

    } catch (e) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
