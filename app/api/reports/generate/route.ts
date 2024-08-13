import pool from "@/lib/db";
import { decrypt } from "@/lib/encryption-keys";
import readStream from "@/lib/read-stream";
import { parseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { NextRequest, NextResponse } from "next/server";
import ExcelJS from 'exceljs';
import path from "path";
import { existsSync } from "fs";
import { generateUserID } from "@/lib/generateID";

export async function POST(req: NextRequest) {
    if (!req.body) return NextResponse.json({ error: "No body provided" }, { status: 400 });

    const data = JSON.parse(await readStream(req.body));
    const report = data.report;

    let filepath = path.join(process.cwd(), `/app/api/reports/generate/Rentroll_Template.xlsx`);
    if (!existsSync(filepath)) return NextResponse.json({ error: "File not found, alert developer." }, { status: 404 });

    if (report != "rent-roll") filepath = path.join(process.cwd(), `/app/api/reports/generate/Unit_Report_Template.xlsx`);

    const cookie = parseCookie(req.cookies.toString());
    const adminID = cookie.get("adminID");
    const adminUsername = cookie.get("adminUsername");
    const adminPassword = cookie.get("adminPassword");

    const client = await pool.connect();
    if (!adminID || !adminUsername || !adminPassword) return client.release(), NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const adminQuery = "SELECT * FROM admin WHERE id = $1 AND username = $2 AND password = $3";
    const adminValues = [parseInt(decrypt(adminID)), decrypt(adminUsername), decrypt(adminPassword)];
    const adminResult = await client.query(adminQuery, adminValues);

    if (adminResult.rowCount === 0) return client.release(), NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filepath);

    const worksheet = workbook.getWorksheet(1);
    if (!worksheet) return client.release(), NextResponse.json({ error: "Error processing the Excel file" }, { status: 500 });

    const units = await client.query("SELECT * FROM units");
    switch (report) {
        case "rent-roll":
            units.rows.map((unit, index) => {
                worksheet.getCell(`B${index + 3}`).value = unit.current_rent;
                worksheet.getCell(`C${index + 3}`).value = unit.unit;
                worksheet.getCell(`D${index + 3}`).value = unit.tenants[0].tenantFullname;
                worksheet.getCell(`H${index + 3}`).value = unit.phone;
                return unit
            });
            break;

        default:
            worksheet.getCell(`B1`).value = report.replace("_", " ")
            const columnData = units.rows.map((unit, index) => {
                worksheet.getCell(`A${index + 2}`).value = unit.unit;
                worksheet.getCell(`B${index + 2}`).value = unit[`${report}`];
                return unit[`${report}`];
            });
            break;
    }

    workbook.xlsx.writeFile(path.join(process.cwd(), `reports/${report}_${data.property == "" ? "" : (data.property == "theArborVictorianLiving" ? "The Arbor Victorian Living" : "Vitalia Courtyard")}_${generateUserID()}.xlsx`)) //add properyty name 
        .then(() => {
            console.log('Workbook saved successfully.');
        })
        .catch((error) => {
            console.log('Error saving workbook:', error);
            return client.release(), NextResponse.json({ error: "Error saving workbook" }, { status: 500 });
        });

    return client.release(), NextResponse.json({ message: "Report generated" }, { status: 200 });
}