import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from "fs";
import path from "path";
import pool from '@/lib/db';
import { cookies } from 'next/headers';
import { encrypt, decrypt } from '@/lib/encryption-keys';
import { generateUserID } from '@/lib/generateID';

const uploadDir = path.join(process.cwd(), '/applicant-file-uploads');
fs.mkdir(uploadDir, { recursive: true });

export async function POST(request: NextRequest) {
    const formData = await request.formData();

    const files: { [key: string]: string } = {
        payStubsUpload: '',
        taxReturnUpload: '',
        driversLicenseOrSinUpload: ''
    };
    const userID = generateUserID();
    const applicationID = generateUserID();

    const fileEntries = Array.from(formData.entries()).filter((entry): entry is [string, File] => entry[1] instanceof File);

    const saveFilePromises = fileEntries.map(async ([fieldName, file]) => {
        const buffer = Buffer.from(await file.arrayBuffer());
        files[fieldName as keyof typeof files] = `${userID}_${fieldName}_${file.name}`
        const filePath = path.join(uploadDir, `${userID}_${fieldName}_${file.name}`);
        await fs.writeFile(filePath, buffer);
    });

    await Promise.all(saveFilePromises);

    console.log(userID, applicationID, files);

    const data = {
        name: formData.get('name'),
        birthdate: formData.get('birthdate') ? formData.get('birthdate') : new Date().toISOString(),
        driverLicense: formData.get('driverLicense'),
        telephone: formData.get('telephone'),
        presentAddress: formData.get('presentAddress'),
        email: formData.get('email'),
        rentalDuration: formData.get('rentalDuration'),
        residenceType: formData.get('residenceType'),
        ownershipType: formData.get('ownershipType'),
        howLong: formData.get('howLong'),
        maritalStatus: formData.get('maritalStatus'),
        presentRental: parseInt((formData.get('presentRental') as string).replace('$', '')) ? parseInt((formData.get('presentRental') as string).replace('$', '')) : 0,
        occupants: parseInt(formData.get('occupants') as string) ? parseInt(formData.get('occupants') as string) : 0,
        unitNumber: formData.get('unitNumber'),
        occupancyDate: formData.get('occupancyDate') ? formData.get('occupancyDate') : new Date().toISOString(),
        brokenLease: (formData.get('brokenLease') as string).toLowerCase() === 'yes',
        brokenLeaseReason: formData.get('brokenLeaseReason'),
        refusedToPayRent: (formData.get('refusedToPayRent') as string).toLowerCase() === 'yes',
        filedForBankruptcy: (formData.get('filedForBankruptcy') as string).toLowerCase() === 'yes',
        occupantsData: formData.get('occupantsData'),
        firstChoice: formData.get('firstChoice'),
        secondChoice: formData.get('secondChoice'),
        monthlyRental: parseInt((formData.get('monthlyRental') as string).replace('$', '')) ? parseInt((formData.get('monthlyRental') as string).replace('$', '')) : 0,
        vehicle1: formData.get('vehicle1'),
        vehicle2: formData.get('vehicle2'),
        vehicle3: formData.get('vehicle3'),
        tenants: formData.get('tenants'),
        personalRef1Name: formData.get('personalRef1Name'),
        personalRef1Address: formData.get('personalRef1Address'),
        personalRef1Telephone: formData.get('personalRef1Telephone'),
        personalRef1Relationship: formData.get('personalRef1Relationship'),
        personalRef1HowLong: formData.get('personalRef1HowLong'),
        professionalRefName: formData.get('personalRef2Name'),
        professionalRefAddress: formData.get('personalRef2Address'),
        professionalRefTelephone: formData.get('personalRef2Telephone'),
        professionalRefRelationship: formData.get('personalRef2Relationship'),
        professionalRefHowLong: formData.get('personalRef2HowLong'),
        landlordName: formData.get('personalRef3Name'),
        landlordAddress: formData.get('personalRef3Address'),
        landlordTelephone: formData.get('personalRef3Telephone'),
        emergencyContactName: formData.get('emergencyContactName'),
        emergencyContactAddress: formData.get('emergencyContactAddress'),
        emergencyContactTelephone: formData.get('emergencyContactTelephone'),
        permissionContactReferences: formData.get('permissionContactReferences') === 'Yes',
        driversLicenseOrSin: files.driversLicenseOrSinUpload,
        payStubs: files.payStubsUpload,
        taxReturn: files.taxReturnUpload,
        holdingFee: parseInt(formData.get('holdingFee') as string) ? parseInt(formData.get('holdingFee') as string) : 0,
        applicantSignature: formData.get('applicantSignature'),
        userId: userID,
        applicationID: applicationID,
        kivotosEmail: formData.get('kivotosEmail'),
        kivotosPassword: formData.get('kivotosPassword'),
        timestamp: new Date().toISOString(),
        property: formData.get('property')
    };

    try {
        const client = await pool.connect();
        
        const query = `
        INSERT INTO applications (
            name, birth_date, drivers_license_number, telephone_number, present_address, email_address, 
            intended_rental_duration, present_residence_type, present_ownership_type, present_inhabitance_period, 
            marital_status, present_rental_amount, number_of_occupants, application_unit_number, 
            approximate_occupancy_date, broken_lease, broken_lease_reason, refused_pay_rent, filled_bankruptcy, first_choice_unit, 
            second_choice_unit, monthly_rental, vehicle_1, vehicle_2, vehicle_3, personal_ref_name, personal_ref_address, 
            personal_ref_telephone, personal_ref_relationship, personal_ref_how_long, professional_ref_name, professional_ref_address, 
            professional_ref_telephone, professional_ref_relationship, professional_ref_how_long, landlord_name, landlord_address, 
            landlord_telephone, emergency_contact_name, emergency_contact_address, emergency_contact_phone, 
            permission_contact_references, drivers_license_sin, pay_stubs, tax_return, holding_fee, applicant_signature, user_id, id, timestamp,
            tenants, occupants, property
        ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, 
            $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41, $42, 
            $43, $44, $45, $46, $47, $48, $49, $50, $51, $52, $53
        ) RETURNING *;
        `;

        const values = [
        data.name, data.birthdate, data.driverLicense, data.telephone, data.presentAddress, data.email, 
        data.rentalDuration, data.residenceType, data.ownershipType, data.howLong, data.maritalStatus, 
        data.presentRental, data.occupants, data.unitNumber, data.occupancyDate, data.brokenLease, 
        data.brokenLeaseReason, data.refusedToPayRent, data.filedForBankruptcy, data.firstChoice, data.secondChoice, 
        data.monthlyRental, data.vehicle1, data.vehicle2, data.vehicle3, data.personalRef1Name, data.personalRef1Address, 
        data.personalRef1Telephone, data.personalRef1Relationship, data.personalRef1HowLong, data.professionalRefName, 
        data.professionalRefAddress, data.professionalRefTelephone, data.professionalRefRelationship, 
        data.professionalRefHowLong, data.landlordName, data.landlordAddress, data.landlordTelephone, 
        data.emergencyContactName, data.emergencyContactAddress, data.emergencyContactTelephone, 
        data.permissionContactReferences, data.driversLicenseOrSin, data.payStubs, data.taxReturn, data.holdingFee, 
        data.applicantSignature, data.userId, data.applicationID, data.timestamp, data.tenants, data.occupantsData, data.property
        ];
        
        const insertUserResult = await client.query(`INSERT INTO users (id, email, password, application_id, name) VALUES (${userID}, '${formData.get("kivotosEmail")}', '${formData.get("kivotosPassword")}', ${applicationID}, '${data.name}')`);

        const insertApplicationResult = await client.query(query, values);
        
        const encryptedEmail = encrypt(data.kivotosEmail as string);
        const encryptedPassword = encrypt(data.kivotosPassword as string);
        const encryptedUserID = encrypt(userID);

        const cookieStore = cookies();
        cookieStore.delete("email");
        cookieStore.delete("password");
        cookieStore.delete("userID");
        cookieStore.set('email', encryptedEmail);
        cookieStore.set('password', encryptedPassword);
        cookieStore.set('userID', encryptedUserID);
        
        client.release();
        return NextResponse.json({ message: `Application Submitted, you are now logged in under ${data.kivotosEmail} of password ${data.kivotosPassword}. Please save it now.` }, { status: 200 });
        
    } catch (error) {
        console.error('Error querying PostgreSQL:', error);
        return NextResponse.json({ message: "Error Submitting Application" }, { status: 500 });
    }
};