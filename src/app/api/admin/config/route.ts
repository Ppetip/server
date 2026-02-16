import { NextRequest, NextResponse } from "next/server";
import { getAdminIp, updateAdminConfig, getAdminConfig, resetSystem } from "@/lib/db";
import crypto from "crypto";

export async function POST(req: NextRequest) {
    try {
        const forwardedFor = req.headers.get("x-forwarded-for");
        const ip = forwardedFor ? forwardedFor.split(',')[0] : "127.0.0.1";
        const ipHash = crypto.createHash('sha256').update(ip).digest('hex');

        const adminIp = await getAdminIp();

        if (adminIp !== ipHash) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();

        // Reset Logic
        if (body.action === "reset") {
            await resetSystem();
            return NextResponse.json({ success: true, message: "System Reset" });
        }

        // Config Logic
        if (body.config) {
            await updateAdminConfig(body.config);
            const newConfig = await getAdminConfig();
            return NextResponse.json({ success: true, config: newConfig });
        }

        return NextResponse.json({ error: "Invalid Action" }, { status: 400 });

    } catch (e) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
