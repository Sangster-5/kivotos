import pool from "@/lib/db";
import { decrypt } from "@/lib/encryption-keys";
import { generateUserID } from "@/lib/generateID";
import readStream from "@/lib/read-stream";
import { parseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    if(!req.body) return NextResponse.json({ message: "Bad Request" }, { status: 400 });
    const data = JSON.parse(await readStream(req.body));
    
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
    
    const leaseSignedQuery = "UPDATE leases SET signed = TRUE WHERE id = $1";
    const leaseSignedValues = [data.id];
    //const leaseSignedResult = await client.query(leaseSignedQuery, leaseSignedValues);

    // Add lease to unit
    // Fill out remaining unit data

    const leaseQuery = "SELECT * FROM leases WHERE id = $1";
    const leaseValues = [data.id];
    const leaseResult = await client.query(leaseQuery, leaseValues);
    const lease = leaseResult.rows[0];
    if(!lease) return client.release(), NextResponse.json({ message: "Lease not found" }, { status: 404 });

    const existingUnitQuery = await client.query("SELECT * FROM units WHERE unit = $1 AND property = $2", [lease.unit, lease.property]);
    
    let unitQuery = "";
    let unitValues = [];
    if(existingUnitQuery.rowCount === 0) {
        unitQuery = "INSERT INTO units (id, leases, email, phone, unit, property, active_lease, occupants, tenants, active_lease_start, active_lease_end, current_rent) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)";
        unitValues = [generateUserID(), [lease.id], lease.email, lease.phone, lease.unit, lease.property, lease.id, JSON.stringify(lease.occupants), JSON.stringify(lease.tenants), lease.effective_date, lease.termination_date, lease.rental_amount];
    } else {
        unitQuery = "UPDATE units SET leases = array_append(leases, $1::bigint), email = $2, phone = $3, active_lease = $4, occupants = $5, tenants = $6, active_lease_start = $7, active_lease_end = $8, current_rent = $9, past_rent = array_append(past_rent, $10) WHERE unit = $11 AND property = $12";
        unitValues =[existingUnitQuery.rows[0].active_lease, lease.email, lease.phone, lease.id, JSON.stringify(lease.occupants), JSON.stringify(lease.tenants), lease.effective_date, lease.termination_date, lease.rental_amount, existingUnitQuery.rows[0].current_rent, lease.unit, lease.property];
    }

    await client.query("UPDATE leases SET signed = TRUE WHERE id = $1", [lease.id]);

    const unitResult = await client.query(unitQuery, unitValues);
    
    return NextResponse.json({ message: "POST request to /api/lease/confirm" }, {status: 200});
}