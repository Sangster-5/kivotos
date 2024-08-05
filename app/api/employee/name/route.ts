import { decrypt } from "@/lib/encryption-keys";
import { parseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import readStream from "@/lib/read-stream";

export async function POST (req: NextRequest) {
    if(!req.body) return NextResponse.json({ error: "Invalid Request" }, { status: 400 });
    const data = JSON.parse(await readStream(req.body));

    const cookie = parseCookie(req.cookies.toString());
    if(!cookie.get("adminUsername") || !cookie.get("adminPassword") || !cookie.get("adminID")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const client = await pool.connect();

    const adminQuery = "SELECT * FROM admin WHERE id = $1 AND username = $2 AND password = $3";
    const adminValues = [parseInt(decrypt(cookie.get("adminID") as string)), decrypt(cookie.get("adminUsername") as string), decrypt(cookie.get("adminPassword") as string)];
    const adminResult = await client.query(adminQuery, adminValues);
    if(adminResult.rowCount === 0) return client.release(), NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const query = `SELECT * FROM admin WHERE name ILIKE $1`;
    const values = [`%${data.name}%`];
    const result = await client.query(query, values);
    client.release();

    return NextResponse.json(result.rows, {status: 200});
}