import { NextRequest, NextResponse } from "next/server";
import ExcelJS, { Borders } from 'exceljs';
import path from "path";
import { existsSync, readFileSync, writeFile, writeFileSync } from "fs";
import readStream from "@/lib/read-stream";
import pool from "@/lib/db";
import { parseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { decrypt } from "@/lib/encryption-keys";
import { getMonthName } from "@/lib/getMonthName";

type Tenant = {
    tenantFullname: string | null;
    tenantOccupation: string | null;
    tenantEmploymentType: string | null;
    tenantEmployer: string | null;
    tenantEmployerAddress: string | null;
    tenantEmploymentDuration: string | null;
    tenantAnnualIncome: number;
    tenantBusinessTelephone: string | null;
    tenantBank: string | null;
    tenantBankBranch: string | null;
};

type Occupant = {
    tenantName: string | null;
    tenantRelationship: string | null;
    tenantAge: number | null;
    tenantEmail: string | null;
};

export async function POST(req: NextRequest) {
    if (!req.body) return NextResponse.json({ error: "Bad Request" }, { status: 400 });
    const data = JSON.parse(await readStream(req.body));

    const filepath = path.join(process.cwd(), `/app/api/lease/3.1_Fixed_Term_Lease_TH_&_Apartment.xlsx`);
    if (!existsSync(filepath)) return NextResponse.json({ error: "File not found, alert developer." }, { status: 404 });

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


    const query = "SELECT * FROM applications WHERE id = $1";
    const values = [data.applicationId];
    const result = (await client.query(query, values));
    const tenants = result.rows[0].tenants;
    const occupants = result.rows[0].occupants

    if (result.rowCount === 0) return client.release(), NextResponse.json({ error: "Application not found" }, { status: 404 });
    const application = result.rows[0];

    await client.query("UPDATE applications SET lease_created = $1 WHERE id = $2", [true, data.applicationId]);
    await client.query("UPDATE admin SET leases_created = array_append(leases_created, $1) WHERE id = $2", [application.id, parseInt(decrypt(adminID))]);

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filepath);

    const worksheet = workbook.getWorksheet(1);
    if (!worksheet) return client.release(), NextResponse.json({ error: "Error processing the Excel file" }, { status: 500 });

    //Section 1
    const tenantNameFields = ["B23", "R23", "B26", "R26", "B28", "R28", "B30", "R30"];
    tenants.forEach((tenant: Tenant, index: number) => {
        worksheet.getCell(tenantNameFields[index]).value = tenant.tenantFullname
    });

    //Section 2

    let tenantIndex = 0;
    let rowIndex = 0;
    occupants.forEach((occupant: Occupant, index: number) => {
        //Double check if I should exclude tenants from occupants
        if (occupant.tenantName && !tenants.some((tenant: Tenant) => tenant.tenantFullname === occupant.tenantName)) {
            if (tenantIndex % 2 === 0) {
                worksheet.getCell(`B${38 + rowIndex}`).value = occupant.tenantName;
            } else {
                worksheet.getCell(`R${38 + rowIndex}`).value = occupant.tenantName;
                rowIndex += 2;
            }
            tenantIndex++;
        }
    });


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
        worksheet.getCell("T51").value = masterUnitNumber;

        //Section 3
        //Check for Vitalia

        if (data.unitNumber < 100) {
            //Townhouse
            worksheet.getCell("B55").value = "Townhouse";
            worksheet.getCell("B51").value = "Vitalia";
            worksheet.getCell("D51").value = "Court";
        } else {
            //Apartment
            worksheet.getCell("B55").value = "Apartment";
            worksheet.getCell("B51").value = "372";
            worksheet.getCell("D51").value = "Washmill Lake";
        }

        worksheet.getCell("B53").value = "Halifax, NS";
        worksheet.getCell("S53").value = "B3S 0H4";

        //Section 5 
        worksheet.getCell("B78").value = "Arbor Vitalia Courtyard Properties LTD (Ioannis Paliatsos)";

        worksheet.getCell("G111").value = "management@arborvitalia.ca";

        worksheet.getCell("B175").value = "And is payable to Arbor Vitalia Courtyard Properties LTD";

        const thinBorder: Partial<Borders> = {
            top: { style: 'thin', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } }
        }

        //Amenities Section 13
        worksheet.getCell("J210").value = "Garbage removal";
        worksheet.getCell("I210").border = thinBorder;

        worksheet.getCell("S202").style = {}; worksheet.getCell("S204").style = {}; worksheet.getCell("S206").style = {};

        worksheet.getCell("S200").value = ""; worksheet.getCell("T202").value = ""; worksheet.getCell("T204").value = ""; worksheet.getCell("T206").value = "";
        worksheet.getCell("AA202").style = {}; worksheet.getCell("AA204").style = {}; worksheet.getCell("AA206").style = {};
        worksheet.getCell("AB202").style = {}; worksheet.getCell("AB204").style = {}; worksheet.getCell("AB206").style = {};
        worksheet.getCell("AC202").style = {}; worksheet.getCell("AC204").style = {}; worksheet.getCell("AC206").style = {};
    }

    const makeVictorianLiving = () => {
        data.unitNumber ? masterUnitNumber = data.unitNumber : masterUnitNumber = parseInt(application.application_unit_number);

        if (1011 <= masterUnitNumber && masterUnitNumber <= 1152) {
            //Townhouse
            worksheet.getCell("B55").value = "Townhouse";
        } else {
            //Apartment
            worksheet.getCell("B55").value = "Apartment";
        }
        worksheet.getCell("T51").value = masterUnitNumber;
    }

    (data.property != "theArborVictorianLiving") ? makeVitalia() : makeVictorianLiving();

    //Section 3 Premises
    worksheet.getCell("B58").value = application.email_address;
    worksheet.getCell("B61").value = application.telephone_number;

    //Section 4 Emergency Contact
    worksheet.getCell("B65").value = application.emergency_contact_name;
    worksheet.getCell("B67").value = application.emergency_contact_phone;
    worksheet.getCell("B69").value = application.emergency_contact_address;
    worksheet.getCell("B71").value = application.emergency_contact_phone;

    //Section 8B Lease
    worksheet.getCell("I141").value = getMonthName(data.initialMonth.split("-")[1] as number);
    worksheet.getCell("M141").value = data.initialMonth.split("-")[0];
    worksheet.getCell("I142").value = data.endingDate.split("-")[2];
    worksheet.getCell("M142").value = getMonthName(data.endingDate.split("-")[1]);
    worksheet.getCell("Q142").value = data.endingDate.split("-")[0];

    //Section 10 Rent
    worksheet.getCell("K160").value = `$${data.rentPrice}`;

    //Section 15 Security Deposit
    worksheet.getCell("K248").value = `$${data.rentPrice / 2}`;

    workbook.xlsx.writeFile(path.join(process.cwd(), `leases/${data.applicationId}.xlsx`))
        .then(() => {
            console.log('Workbook saved successfully.');
        })
        .catch((error) => {
            console.log('Error saving workbook:', error);
            return client.release(), NextResponse.json({ error: "Error saving workbook" }, { status: 500 });
        });

    const existingLease = await client.query("SELECT id FROM leases WHERE id = $1", [data.applicationId]);
    if (existingLease.rows.length > 0) await client.query("DELETE FROM leases WHERE id = $1", [data.applicationId]);

    const leaseQuery = `INSERT INTO leases (id, unit, created_by, created_timestamp, effective_date, termination_date, rental_amount, "user", property, tenants, occupants, email, phone, deposit_amount) VALUES ($1, $2, $3, NOW(), $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`;

    const leaseValues = [data.applicationId, data.unitNumber ? masterUnitNumber = data.unitNumber : masterUnitNumber = parseInt(application.application_unit_number), adminResult.rows[0].id, new Date(data.initialMonth), new Date(data.endingDate), data.rentPrice, application.user_id, data.property, JSON.stringify(tenants), JSON.stringify(occupants), application.email_address, application.telephone_number, data.rentPrice / 2];
    const leaseResult = await client.query(leaseQuery, leaseValues);

    client.release();

    return NextResponse.json({ message: "Lease Created" }, { status: 200 });
}