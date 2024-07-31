import pool from "@/lib/db";
import { decrypt } from "@/lib/encryption-keys";
import readStream from "@/lib/read-stream";
import { parseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { NextRequest, NextResponse } from "next/server";

export async function GET (req: NextRequest) {
    const cookie = parseCookie(req.cookies.toString());
    if(!cookie.get("adminUsername") || !cookie.get("adminPassword") || !cookie.get("adminID")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const client = await pool.connect();
    const adminQuery = "SELECT * FROM admin WHERE id = $1 AND username = $2 AND password = $3";
    const adminValues = [parseInt(decrypt(cookie.get("adminID") as string)), decrypt(cookie.get("adminUsername") as string), decrypt(cookie.get("adminPassword") as string)];
    const adminResult = await client.query(adminQuery, adminValues);
    if(adminResult.rowCount === 0) return NextResponse.json({ error: "Unauthorized" }, { status: 401 }), client.release();

    const result = await client.query('SELECT task_categories FROM metadata');
    client.release();
    const categories = result.rows.flatMap(row => row.task_categories);

    return NextResponse.json(categories, {status: 200});
}