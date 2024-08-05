import pool from "@/lib/db";
import { decrypt } from "@/lib/encryption-keys";
import readStream from "@/lib/read-stream";
import { parseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const cookie = parseCookie(req.cookies.toString());
    const adminID = cookie.get("adminID");
    const adminUsername = cookie.get("adminUsername");
    const adminPassword = cookie.get("adminPassword");


    if(!adminID || !adminUsername || !adminPassword) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    
    const client = await pool.connect();
    const adminQuery = "SELECT * FROM admin WHERE id = $1 AND username = $2 AND password = $3";
    const adminValues = [parseInt(decrypt(adminID)), decrypt(adminUsername), decrypt(adminPassword)];
    const adminResult = await client.query(adminQuery, adminValues);
    
    if(adminResult.rowCount === 0) return client.release(), NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const leaseQuery = "SELECT * FROM leases";
    const leaseResult = await client.query(leaseQuery);
    const data = leaseResult.rows;

    client.release();

    return NextResponse.json({ data }, {status: 200});
}