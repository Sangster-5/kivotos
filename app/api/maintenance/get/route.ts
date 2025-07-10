import pool from "@/lib/db";
import { decrypt } from "@/lib/encryption-keys";
import { parseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { NextRequest, NextResponse } from "next/server";
import readStream from "@/lib/read-stream";

export async function GET(req: NextRequest) {
    const cookies = parseCookie(req.cookies.toString());
    if (!cookies.get("adminUsername") || !cookies.get("adminPassword") || !cookies.get("adminID")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const client = await pool.connect();
    const adminQuery = "SELECT * FROM admin WHERE id = $1;"
    const adminValues = [parseInt(decrypt(cookies.get("adminID") as string))];
    const adminResult = await client.query(adminQuery, adminValues);

    if (adminResult.rows.length === 0) return client.release(), NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const query = "SELECT * FROM maintenance_requests;";
    const result = await client.query(query);
    const data = result.rows;

    client.release();

    return NextResponse.json({ data }, { status: 200 });
}

export async function POST(req: NextRequest) {
    if (!req.body) return NextResponse.json({ error: "No data provided" }, { status: 400 });
    const data = JSON.parse(await readStream(req.body));

    const cookies = parseCookie(req.cookies.toString());
    const client = await pool.connect();
    if (cookies.get("adminUsername") && cookies.get("adminPassword") && cookies.get("adminID")) {
        const adminQuery = "SELECT * FROM admin WHERE id = $1;"
        const adminValues = [parseInt(decrypt(cookies.get("adminID") as string))];
        const adminResult = await client.query(adminQuery, adminValues);

        if (adminResult.rows.length === 0) return client.release(), NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    } else if (data.id != decrypt(cookies.get("userID") as string)) return client.release(), NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    switch (data.source) {
        case "user":
            const userID = data.id

            const userRequestsQuery = "SELECT * FROM maintenance_requests WHERE user_id = $1";
            const userRequestsValues = [userID];
            const userRequestsResult = await client.query(userRequestsQuery, userRequestsValues);

            return client.release(), NextResponse.json({ data: userRequestsResult.rows }, { status: 200 });
        case "id":
            const requestID = data.id

            const requestQuery = "SELECT * FROM maintenance_requests WHERE user_id = $1";
            const requestValues = [requestID];
            const requestResult = await client.query(requestQuery, requestValues);

            return client.release(), NextResponse.json({ data: requestResult.rows }, { status: 200 });
        default:
        //ID
    }
    client.release()

    return NextResponse.json("{ data }", { status: 200 });
}