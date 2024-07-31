import pool from "@/lib/db";
import { decrypt } from "@/lib/encryption-keys";
import readStream from "@/lib/read-stream";
import { parseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    if(!req.body) return NextResponse.json({message: "No Body Provided"}, {status: 400});
    const data = JSON.parse(await readStream(req.body));

    const cookie = parseCookie(req.cookies.toString());

    if(!cookie.get("adminUsername") || !cookie.get("adminPassword") || !cookie.get("adminID")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const client = await pool.connect();
    const adminQuery = "SELECT * FROM admin WHERE id = $1 AND username = $2 AND password = $3";
    const adminValues = [parseInt(decrypt(cookie.get("adminID") as string)), decrypt(cookie.get("adminUsername") as string), decrypt(cookie.get("adminPassword") as string)];
    const adminResult = await client.query(adminQuery, adminValues);
    if(adminResult.rowCount === 0) return NextResponse.json({ error: "Unauthorized" }, { status: 401 }), client.release();

    switch(data.type) {
        case "status":
            const statusQuery = data.value == "completed" ? "UPDATE tasks SET status = $1, finished_timestamp = NOW() WHERE id = $2" : "UPDATE tasks SET status = $1 WHERE id = $2";
            const statusValues = [data.value, data.taskID];
            await client.query(statusQuery, statusValues);
            return NextResponse.json({message: "Status Updated"});

        default:
            return NextResponse.json({message: "Invalid Type"}, {status: 400});
    }
}