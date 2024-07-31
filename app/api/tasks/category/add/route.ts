import pool from "@/lib/db";
import { decrypt } from "@/lib/encryption-keys";
import readStream from "@/lib/read-stream";
import { parseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { NextRequest, NextResponse } from "next/server";

export async function POST (req: NextRequest) {
    if(!req.body) return NextResponse.json({ error: "No data provided" }, { status: 400 });
    const data = JSON.parse(await readStream(req.body));
    
    const cookie = parseCookie(req.cookies.toString());
    if(!cookie.get("adminUsername") || !cookie.get("adminPassword") || !cookie.get("adminID")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const client = await pool.connect();
    const adminQuery = "SELECT * FROM admin WHERE id = $1 AND username = $2 AND password = $3";
    const adminValues = [parseInt(decrypt(cookie.get("adminID") as string)), decrypt(cookie.get("adminUsername") as string), decrypt(cookie.get("adminPassword") as string)];
    const adminResult = await client.query(adminQuery, adminValues);
    if(adminResult.rowCount === 0) return NextResponse.json({ error: "Unauthorized" }, { status: 401 }), client.release();

    const query = `
    UPDATE metadata
    SET task_categories = array_append(task_categories, $1)
    `;
    const values = [data.category];
    const result = await client.query(query, values);

    client.release();

    return NextResponse.json({ data }, {status: 200});
}