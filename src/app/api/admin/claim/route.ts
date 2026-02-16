import { NextRequest, NextResponse } from "next/server";
import { getAdminIp, setAdminIp } from "@/lib/db";
import crypto from "crypto";

export async function POST(req: NextRequest) {
    try {
        const forwardedFor = req.headers.get("x-forwarded-for");
        const ip = forwardedFor ? forwardedFor.split(',')[0] : "127.0.0.1";
        // We store the raw IP for admin (or hash it, but for admin we might want to know?)
        // Let's hash it for consistency and privacy, unless we need to display it.
        // Actually, for "IP Locking", we need to compare incoming IP. Hashing is fine.
        const ipHash = crypto.createHash('sha256').update(ip).digest('hex');

        const adminIp = await getAdminIp();

        if (adminIp) {
            return NextResponse.json({ error: "Admin already claimed." }, { status: 403 });
        }

        await setAdminIp(ipHash);

        return NextResponse.json({ success: true, message: "Admin privileges claimed." });

    } catch (e) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
