import pool from "@/lib/db";
import { decrypt } from "@/lib/encryption-keys";
import readStream from "@/lib/read-stream";
import { parseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { NextRequest, NextResponse } from "next/server";
import { generateUserID } from "@/lib/generateID";

export async function POST(req: NextRequest) {
    if(!req.body) return NextResponse.json({ message: "Invalid Request" }, { status: 400 });
    const data = JSON.parse(await readStream(req.body));

    const cookie = parseCookie(req.cookies.toString());

    if(!cookie.get("adminUsername") || !cookie.get("adminPassword") || !cookie.get("adminID")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const client = await pool.connect();
    const adminQuery = "SELECT * FROM admin WHERE id = $1 AND username = $2 AND password = $3";
    const adminValues = [parseInt(decrypt(cookie.get("adminID") as string)), decrypt(cookie.get("adminUsername") as string), decrypt(cookie.get("adminPassword") as string)];
    const adminResult = await client.query(adminQuery, adminValues);
    if(adminResult.rowCount === 0) return NextResponse.json({ error: "Unauthorized" }, { status: 401 }), client.release();

    type Employee = {
        name: string,
        id: number
    }

    const query = "INSERT INTO tasks (id, status, title, description, assigned_employees, created_by, created_timestamp, category) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)";
    const values = [generateUserID(), "todo", data.title, data.description, data.employees.map((x: Employee) => x.id), adminResult.rows[0].id, new Date().toISOString(), data.category];
    const result = await client.query(query, values);

    data.employees.map(async (employee: Employee) => {
        const eID = employee.id;

        const eQuery = "UPDATE admin SET tasks = array_append(tasks, $1) WHERE id = $2";
        const eValues = [values[0], eID];
        await client.query(eQuery, eValues);
    });

    client.release();

    return NextResponse.json({ message: "Task created" }, { status: 200 });
}