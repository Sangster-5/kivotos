import pool from "@/lib/db";
import { decrypt } from "@/lib/encryption-keys";
import { parseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const cookie = parseCookie(req.cookies.toString());
    const adminID = cookie.get("adminID");
    const adminUsername = cookie.get("adminUsername");
    const adminPassword = cookie.get("adminPassword");

    const client = await pool.connect();
    if (!adminID || !adminUsername || !adminPassword) return client.release(), NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const adminQuery = "SELECT * FROM admin WHERE id = $1 AND username = $2 AND password = $3";
    const adminValues = [parseInt(decrypt(adminID)), decrypt(adminUsername), decrypt(adminPassword)];
    const adminResult = await client.query(adminQuery, adminValues);

    if (adminResult.rowCount === 0) return client.release(), NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const tableName = 'units';
    const query = `
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = $1;
    `;

    const res = await client.query(query, [tableName]);
    const columns = res.rows.map((row) => row.column_name);

    return NextResponse.json({ columns }, { status: 200 });
}