import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

import path from "path";

// Load .env first, then .env.local
dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
    console.error("Missing environment variables. Please check .env file.");
    process.exit(1);
}

export const supabase = createClient(url, key);
