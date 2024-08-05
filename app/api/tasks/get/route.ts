import pool from "@/lib/db";
import { decrypt } from "@/lib/encryption-keys";
import { parseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { NextRequest, NextResponse } from "next/server";

type Task = {
    id: number,
    status: string,
    title: string,
    description: string,
    assigned_employees: string [],
    created_by: number,
    created_timestamp: Date,
    finished_timestamp: Date | null,
    category: string
}

export async function GET(req: NextRequest) {
    const cookie = parseCookie(req.cookies.toString());
    if(!cookie.get("adminUsername") || !cookie.get("adminPassword") || !cookie.get("adminID")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const client = await pool.connect();
    const adminQuery = "SELECT * FROM admin WHERE id = $1 AND username = $2 AND password = $3";
    const adminValues = [parseInt(decrypt(cookie.get("adminID") as string)), decrypt(cookie.get("adminUsername") as string), decrypt(cookie.get("adminPassword") as string)];
    const adminResult = await client.query(adminQuery, adminValues);
    if(adminResult.rowCount === 0) return client.release(), NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const query = "SELECT * FROM tasks";
    const result = await client.query(query);
    
    let tasks: Task[] = result.rows;
    const taskPromise = new Promise((resolve, reject) => {
        tasks.forEach((task, taskIndex) => {
        task.assigned_employees.forEach(async (employee, index) => {
            const employeeQuery = "SELECT * FROM admin WHERE id = $1";
            const employeeValues = [employee];
            const employeeResult = await client.query(employeeQuery, employeeValues);

            const name = employeeResult.rows[0].name;
            tasks[taskIndex].assigned_employees[index] = `${name} - ${employee}`;
            
            if(taskIndex === tasks.length - 1 && index === task.assigned_employees.length - 1) resolve(true);
        });
    })});

    await taskPromise;
    client.release();
    return NextResponse.json({ tasks }, { status: 200 });
}