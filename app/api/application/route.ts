import readStream from "@/lib/read-stream";
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/encryption-keys";

export async function POST(request: NextRequest) {
    if (!request.body) return NextResponse.json({ message: "Invalid Request" }, { status: 400 });
    const applicationID = JSON.parse(await readStream(request.body)).applicationID as number;

    const cookieStore = cookies();
    let adminID = cookieStore.get("adminID")?.value
    if(cookieStore && adminID) {
        adminID = decrypt(adminID);

        const client = await pool.connect();
        const query = "SELECT * FROM admin WHERE id = $1";
        const values = [adminID];
        const result = await client.query(query, values);

        if(result.rows.length < 1) return NextResponse.json({ message: "Invalid Admin Cookie" }, { status: 401 });

        const applicationQuery = "SELECT * FROM applications WHERE id = $1";
        const applicationValues = [applicationID];
        const applicationResult = await client.query(applicationQuery, applicationValues);
        const application = applicationResult.rows[0];

        client.release();

        return NextResponse.json({ message: "Admin Cookie Validated", application }, { status: 200});
    }

    let userID = cookieStore.get("userID")?.value;
    if(!cookieStore || !userID) return NextResponse.json({ message: "Invalid Cookie" }, { status: 401 });
    userID = decrypt(userID);

    const client = await pool.connect();
    const query = "SELECT * FROM applications WHERE id = $1";
    const values = [applicationID];
    const result = await client.query(query, values);
    client.release();

    if(!result.rows[0].id) return NextResponse.json({ message: "Invalid application ID" }, { status: 400 });
    const application = result.rows[0];
    if(userID !== application["user_id"]) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    return NextResponse.json({ message: "Application Fetched", application }, { status: 200 });
}
