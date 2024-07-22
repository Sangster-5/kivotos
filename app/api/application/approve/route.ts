import pool from "@/lib/db";
import { decrypt } from "@/lib/encryption-keys";
import readStream from "@/lib/read-stream";
import { parseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    if(!request.body) return NextResponse.json({ message: "Bad request" }, { status: 400 });
    const data = JSON.parse(await readStream(request.body));
    const cookies = parseCookie(request.cookies.toString());
    if(!cookies.get("adminUsername") || !cookies.get("adminPassword") || !cookies.get("adminID")) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    
    const adminQuery = "SELECT * FROM admin WHERE id = $1;"
    const adminValues = [parseInt(decrypt(cookies.get("adminID") as string))];
    const adminResult = await pool.query(adminQuery, adminValues);

    if(adminResult.rows.length === 0) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const query = "UPDATE applications SET approved = true, approved_timestamp = NOW(), approved_admin = $1 WHERE id = $2;";
    const values = [parseInt(decrypt(cookies.get("adminID") as string)), parseInt(data.applicationId)];
    const result = await pool.query(query, values);
    if (!result.rowCount && result.rowCount == 0) NextResponse.json({ message: "Bad Request" }, {status: 400});
    
    return NextResponse.json({ message: "Application approved" });
}