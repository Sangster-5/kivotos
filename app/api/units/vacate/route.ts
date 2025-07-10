import { NextRequest, NextResponse } from "next/server";
import readStream from "@/lib/read-stream";
import { parseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import pool from "@/lib/db";
import { decrypt } from "@/lib/encryption-keys";

export async function POST(req: NextRequest) {
    if (!req.body) return NextResponse.json({ error: "Invalid Request" }, { status: 400 });

    const data = JSON.parse(await readStream(req.body));

    const cookie = parseCookie(req.cookies.toString());
    if (!cookie.get("adminUsername") || !cookie.get("adminPassword") || !cookie.get("adminID")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const client = await pool.connect();

    const adminQuery = "SELECT * FROM admin WHERE id = $1 AND username = $2 AND password = $3";
    const adminValues = [parseInt(decrypt(cookie.get("adminID") as string)), decrypt(cookie.get("adminUsername") as string), decrypt(cookie.get("adminPassword") as string)];
    const adminResult = await client.query(adminQuery, adminValues);
    if (adminResult.rowCount === 0) return client.release(), NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const vacateQuery = `
    UPDATE units 
    SET 
      active_lease = $1, 
      active_lease_start = $2, 
      active_lease_end = $3, 
      current_rent = $4, 
      tenants = $5,
      occupants = $6,
      past_rent = array_append(past_rent, $7) 
    WHERE 
      id = $8
    `;
    const vacateValues = [null, null, null, 0, null, null, data.rent, data.unitID];
    const vacateResult = await client.query(vacateQuery, vacateValues);

    return NextResponse.json({ message: "Unit Vacated" }, { status: 200 });
}