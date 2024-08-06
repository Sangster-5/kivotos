import { NextRequest, NextResponse } from "next/server";
import ExcelJS, { Borders, BorderStyle } from 'exceljs';
import path from "path";
import { existsSync, readFileSync, writeFile, writeFileSync } from "fs";
import readStream from "@/lib/read-stream";
import pool from "@/lib/db";
import { parseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { decrypt } from "@/lib/encryption-keys";
import { getMonthName } from "@/lib/getMonthName";

export async function POST(req: NextRequest) {
    if(!req.body) return NextResponse.json({ message: "Bad Request" }, { status: 400 });
    const data = JSON.parse(await readStream(req.body));

    const filepath = path.join(process.cwd(), `/app/api/lease/3.1_Fixed_Term_Lease_TH_&_Apartment.xlsx`);
    if(!existsSync(filepath)) return NextResponse.json({ message: "File not found, alert developer." }, {status: 404});
    
    const cookie = parseCookie(req.cookies.toString());
    const adminID = cookie.get("adminID");
    const adminUsername = cookie.get("adminUsername");
    const adminPassword = cookie.get("adminPassword");

    const client = await pool.connect();
    if(!adminID || !adminUsername || !adminPassword) return client.release(), NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const adminQuery = "SELECT * FROM admin WHERE id = $1 AND username = $2 AND password = $3";
    const adminValues = [parseInt(decrypt(adminID)), decrypt(adminUsername), decrypt(adminPassword)];
    const adminResult = await client.query(adminQuery, adminValues);
    
    if(adminResult.rowCount === 0) return client.release(), NextResponse.json({ message: "Unauthorized" }, { status: 401 });


    const query = "SELECT * FROM applications WHERE id = $1";
    const values = [data.applicationId];
    const result = (await client.query(query, values));
    
    if(result.rowCount === 0) return client.release(), NextResponse.json({ message: "Application not found" }, { status: 404 });
    const application = result.rows[0];

    await client.query("UPDATE applications SET lease_created = $1 WHERE id = $2", [true, data.applicationId]);
    await client.query("UPDATE admin SET leases_created = array_append(leases_created, $1) WHERE id = $2", [application.id, parseInt(decrypt(adminID))]);

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filepath);

    const worksheet = workbook.getWorksheet(1);
    if(!worksheet) return client.release(), NextResponse.json({ message: "Error processing the Excel file" }, { status: 500 });

    let masterUnitNumber;
    const makeVitalia = () => {
        //Section 1
        worksheet.getCell('A1').value = "ARBOR VITALIA COURTYARD PROPERTIES LTD";
        worksheet.getCell("E11").value = "Arbor Vitalia Courtyard Properties LTD";
        worksheet.getCell("B20").value = "Email: management@arborvitalia.ca";

        worksheet.getCell("S14").value = "Suite 200";
        worksheet.getCell("S16").value = "B3SOH4";
        worksheet.getCell("B16").value = "Halifax, NS";
        worksheet.getCell("B14").value = "372 Washmill Lake";
        
        data.unitNumber ? masterUnitNumber = data.unitNumber : masterUnitNumber = parseInt(application.application_unit_number);
        worksheet.getCell("T47").value = masterUnitNumber;

        //Section 3
        //Check for Vitalia

        if (data.unitNumber < 100) {
            //Townhouse
            worksheet.getCell("B51").value = "Townhouse";
            worksheet.getCell("B47").value = "Vitalia";
            worksheet.getCell("D47").value = "Court";
        } else {
            //Apartment
            worksheet.getCell("B51").value = "Apartment";
            worksheet.getCell("B47").value = "372";
            worksheet.getCell("D47").value = "Washmill Lake";
        }

        worksheet.getCell("B49").value = "Halifax, NS";
        worksheet.getCell("S49").value = "B3S 0H4";

        //Section 5 
        worksheet.getCell("B76").value = "Arbor Vitalia Courtyard Properties LTD (Ioannis Paliatsos)";

        worksheet.getCell("G109").value = "management@arborvitalia.ca";

        worksheet.getCell("B173").value = "And is payable to Arbor Vitalia Courtyard Properties LTD";

        const thinBorder: Partial<Borders> = {
            top: { style: 'thin', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } }
        }

        //Amenities Section 13
        worksheet.getCell("J206").value = "Garbage removal";
        worksheet.getCell("I206").border = thinBorder;
        
        worksheet.getCell("S198").style = {}; worksheet.getCell("S200").style = {}; worksheet.getCell("S202").style = {};

        worksheet.getCell("S196").value = "";  worksheet.getCell("T198").value = "";  worksheet.getCell("T200").value = "";  worksheet.getCell("T202").value = "";
        worksheet.getCell("AA198").style = {}; worksheet.getCell("AA200").style = {}; worksheet.getCell("AA202").style = {};
        worksheet.getCell("AB198").style = {}; worksheet.getCell("AB200").style = {}; worksheet.getCell("AB202").style = {};
        worksheet.getCell("AC198").style = {}; worksheet.getCell("AC200").style = {}; worksheet.getCell("AC202").style = {};
    }

    const makeVictorianLiving = () => {
        if (1011 <= data.unitNumber && data.unitNumber <= 1152) {
            //Townhouse
            worksheet.getCell("B51").value = "Townhouse";
        } else {
            //Apartment
            worksheet.getCell("B51").value = "Apartment";
        }
    }

    (data.property != "theArborVictorianLiving") ? makeVitalia() : makeVictorianLiving();

    //Section 3 Premises
    worksheet.getCell("B54").value = application.email_address;
    worksheet.getCell("B57").value = application.telephone_number;

    //Section 4 Emergency Contact
    worksheet.getCell("B61").value = application.emergency_contact_name;
    worksheet.getCell("B63").value = application.emergency_contact_phone;
    worksheet.getCell("B65").value = application.emergency_contact_address;
    worksheet.getCell("B67").value = application.emergency_contact_phone;

    //Section 8B Lease
    worksheet.getCell("I137").value = getMonthName(data.initialMonth.split("-")[1] as number);
    worksheet.getCell("M137").value = data.initialMonth.split("-")[0];
    worksheet.getCell("I138").value = data.endingDate.split("-")[2];
    worksheet.getCell("M138").value = getMonthName(data.endingDate.split("-")[1]);
    worksheet.getCell("Q138").value = data.endingDate.split("-")[0];

    //Section 10 Rent
    worksheet.getCell("K156").value = `$${data.rentPrice}`;

    //Section 15 Security Deposit
    worksheet.getCell("K244").value = `$${data.rentPrice/2}`;

    workbook.xlsx.writeFile(path.join(process.cwd(), `leases/${data.applicationId}.xlsx`))
    .then(() => {
        console.log('Workbook saved successfully.');
    })
    .catch((error) => {
        console.log('Error saving workbook:', error);
    });

    const existingLease = await client.query("SELECT id FROM leases WHERE id = $1", [data.applicationId]);
    if(existingLease.rows.length > 0) await client.query("DELETE FROM leases WHERE id = $1", [data.applicationId]);

    const leaseQuery = `INSERT INTO leases (id, unit, created_by, created_timestamp, effective_date, termination_date, rental_amount, "user", property) VALUES ($1, $2, $3, NOW(), $4, $5, $6, $7, $8)`;
    
    const leaseValues = [data.applicationId, data.unitNumber ? masterUnitNumber = data.unitNumber : masterUnitNumber = parseInt(application.application_unit_number), adminResult.rows[0].id, new Date(data.initialMonth), new Date(data.endingDate), data.rentPrice, application.user_id, data.property];
    const leaseResult = await client.query(leaseQuery, leaseValues);
    
    client.release();

    return NextResponse.json({ message: "Hello, World!" });
}