import pool from "@/lib/db";
import { decrypt } from "@/lib/encryption-keys";
import readStream from "@/lib/read-stream";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    if (!request.body) return NextResponse.json({ error: "Bad request" }, { status: 400 });
    const data = JSON.parse(await readStream(request.body));
    const cookieStore = cookies();
    const adminID = cookieStore.get("adminID")?.value;
    const adminUsername = cookieStore.get("adminUsername")?.value;
    const adminPassword = cookieStore.get("adminPassword")?.value;
    if (!adminUsername || !adminPassword || !adminID) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const client = await pool.connect();
    const adminQuery = "SELECT * FROM admin WHERE id = $1;"
    const adminValues = [parseInt(decrypt(adminID as string))];
    const adminResult = await client.query(adminQuery, adminValues);
    const query = "UPDATE applications SET rejected = true, approved = false, action_timestamp = NOW(), action_admin = $1 WHERE id = $2;";
    const values = [parseInt(decrypt(adminID as string)), parseInt(data.applicationId)];
    const result = await client.query(query, values);

    client.release();

    if (adminResult.rows.length === 0) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!result.rowCount && result.rowCount == 0) NextResponse.json({ error: "Bad Request" }, { status: 400 });

    return NextResponse.json({ message: "Application approved" });
}