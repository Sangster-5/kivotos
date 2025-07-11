import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";
import { generateUserID } from "@/lib/generateID";
import pool from "@/lib/db";
import { parseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { decrypt } from "@/lib/encryption-keys";

export async function POST(req: NextRequest) {
    if (!req.body) return NextResponse.json({ error: "Invalid Request" }, { status: 400 });

    const formData = await req.formData();
    const complaintType = formData.get("complaintType") as string;
    const additionalDetails = formData.get("additionalDetails") as string;
    const proof = formData.get("proof") as File;

    const uploadDir = path.join(process.cwd(), "complaint-uploads");

    const complaintID = generateUserID();
    const fileExtension = path.extname(proof.name)
    const fileName = `${complaintID}${fileExtension}`;
    const filePath = path.join(uploadDir, fileName);

    fs.writeFile(filePath, Buffer.from(await proof.arrayBuffer()));

    const client = await pool.connect();

    const query = "INSERT INTO complaints (id, type, details, timestamp, status, user_id) VALUES ($1, $2, $3, NOW(), $4, $5)";
    const values = [complaintID, complaintType, additionalDetails, "pending", null];

    if (req.cookies) {
        const cookies = parseCookie(req.cookies.toString());

        if (!cookies.get("userID")) return client.release(), NextResponse.json({ error: "Incorrect Data" }, { status: 401 });

        const userID = cookies.get("userID");
        values[4] = decrypt(userID as string);
        const userQuery = "UPDATE users SET complaints = array_append(complaints, $1) WHERE id = $2";
        const userValues = [complaintID, parseInt(decrypt(userID as string))];
        const userResult = await client.query(userQuery, userValues);
    }

    const result = await client.query(query, values);

    client.release()

    return NextResponse.json({ message: "Complaint Submitted" }, { status: 200 });
}