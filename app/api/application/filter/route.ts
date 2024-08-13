import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/encryption-keys";
import readStream from "@/lib/read-stream";

export async function POST(request: NextRequest) {
    if (!request.body) return NextResponse.json({ error: "Invalid Request" }, { status: 400 });
    const filterData = JSON.parse(await readStream(request.body));

    const cookieStore = cookies();
    let adminID = cookieStore.get("adminID")?.value
    if (cookieStore && adminID) {
        adminID = decrypt(adminID);

        const client = await pool.connect();
        const query = "SELECT * FROM admin WHERE id = $1";
        const values = [adminID];
        const result = await client.query(query, values);

        if (result.rows.length < 1) return client.release(), NextResponse.json({ error: "Invalid Admin Cookie" }, { status: 401 });

        const inProgress = "approved = false AND rejected = false";
        const rejected = "rejected = true";
        const approved = "approved = true";

        let nameFilter = "";

        if (filterData.nameFilter) nameFilter = `AND name ILIKE '%${filterData.nameFilter}%'`;

        const applicationQuery = `SELECT * FROM applications WHERE ${filterData.statusFilter == "In Progress" ? inProgress : (filterData.statusFilter == "Accepted" ? approved : rejected)} ${nameFilter} ORDER BY timestamp DESC`;
        const applicationResult = await client.query(applicationQuery);
        const applications = applicationResult.rows;

        client.release();

        return NextResponse.json({ message: "Admin Cookie Validated", applications }, { status: 200 });
    } else {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
}