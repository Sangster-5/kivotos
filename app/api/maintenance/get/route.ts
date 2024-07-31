import pool from "@/lib/db";
import { decrypt } from "@/lib/encryption-keys";
import { parseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const cookies = parseCookie(req.cookies.toString());
    if(!cookies.get("adminUsername") || !cookies.get("adminPassword") || !cookies.get("adminID")) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    
    const client = await pool.connect();
    const adminQuery = "SELECT * FROM admin WHERE id = $1;"
    const adminValues = [parseInt(decrypt(cookies.get("adminID") as string))];
    const adminResult = await client.query(adminQuery, adminValues);

    if(adminResult.rows.length === 0) return NextResponse.json({ message: "Unauthorized" }, { status: 401 }), client.release();

    const query = "SELECT * FROM maintenance_requests;";
    const result = await client.query(query);
    const data = result.rows;

    return NextResponse.json({ data }, {status: 200});
}