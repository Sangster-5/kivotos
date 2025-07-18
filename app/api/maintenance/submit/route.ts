import pool from "@/lib/db";
import { decrypt } from "@/lib/encryption-keys";
import { generateUserID } from "@/lib/generateID";
import readStream from "@/lib/read-stream";
import { parseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    if (!req.body) return NextResponse.json({ error: "No data provided" }, { status: 400 });
    const data = JSON.parse(await readStream(req.body));

    const client = await pool.connect();

    const query = "INSERT INTO maintenance_requests (id, tenant_name, unit, description, date_time, permission, created_timestamp, status, property, user_id) VALUES ($1, $2, $3, $4, $5, $6, NOW(), $7, $8, $9)";
    const values = [generateUserID(), data.name, data.unit, data.description, data.dateAndTime == "" ? null : data.dateAndTime, data.permission, "todo", data.property, null];

    const cookies = parseCookie(req.cookies.toString());
    if (cookies.get("userID")) {
        const userID = decrypt(cookies.get("userID") as string);
        values[8] = parseInt(userID);

        const userQuery = "UPDATE users SET maintenance = array_append(maintenance, $1) WHERE id = $2";
        const userValues = [values[0], userID];
        const result = await client.query(userQuery, userValues);
    }

    const result = await client.query(query, values);

    client.release();
    return NextResponse.json({ message: "Maintenance request submitted successfully!" }, { status: 200 });
}