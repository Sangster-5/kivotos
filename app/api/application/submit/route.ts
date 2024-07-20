import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from "fs";
import path from "path";
import pool from '@/lib/db';
import { cookies } from 'next/headers';
import { encrypt, decrypt } from '@/lib/encryption-keys';

const uploadDir = path.join(process.cwd(), '/applicant-file-uploads');
fs.mkdir(uploadDir, { recursive: true });

const generateUserID = (): string => {
  const characters = '0123456789';
  let userID = '';
  for (let i = 0; i < 11; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    userID += characters.charAt(randomIndex);
  }
  return userID;
};

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
        tenant1Name: formData.get('tenant1Name'),
        tenant2Name: formData.get('tenant2Name'),
        tenant3Name: formData.get('tenant3Name'),
        tenant4Name: formData.get('tenant4Name'),
        tenant5Name: formData.get('tenant5Name'),
        tenant1Relationship: formData.get('tenant1Relationship'),
        tenant2Relationship: formData.get('tenant2Relationship'),
        tenant3Relationship: formData.get('tenant3Relationship'),
        tenant4Relationship: formData.get('tenant4Relationship'),
        tenant5Relationship: formData.get('tenant5Relationship'),
        tenant1Age: parseInt(formData.get('tenant1Age') as string) ? parseInt(formData.get('tenant1Age') as string) : 0,
        tenant2Age: parseInt(formData.get('tenant2Age') as string) ? parseInt(formData.get('tenant2Age') as string) : 0,
        tenant3Age: parseInt(formData.get('tenant3Age') as string) ? parseInt(formData.get('tenant3Age') as string) : 0,
        tenant4Age: parseInt(formData.get('tenant4Age') as string) ? parseInt(formData.get('tenant4Age') as string) : 0,
        tenant5Age: parseInt(formData.get('tenant5Age') as string) ? parseInt(formData.get('tenant5Age') as string) : 0,
        tenant1Email: formData.get('tenant1Email'),
        tenant2Email: formData.get('tenant2Email'),
        tenant3Email: formData.get('tenant3Email'),
        tenant4Email: formData.get('tenant4Email'),
        tenant5Email: formData.get('tenant5Email'),
        firstChoice: formData.get('firstChoice'),
        secondChoice: formData.get('secondChoice'),
        monthlyRental: parseInt((formData.get('monthlyRental') as string).replace('$', '')) ? parseInt((formData.get('monthlyRental') as string).replace('$', '')) : 0,
        vehicle1: formData.get('vehicle1'),
        vehicle2: formData.get('vehicle2'),
        vehicle3: formData.get('vehicle3'),
        tenant1Occupation: formData.get('tenant1Occupation'),
        tenant1EmploymentType: formData.get('tenant1EmploymentType'),
        tenant1Employer: formData.get('tenant1Employer'),
        tenant1EmployerAddress: formData.get('tenant1EmployerAddress'),
        tenant1EmploymentDuration: formData.get('tenant1EmploymentDuration'),
        tenant1AnnualIncome: parseInt(formData.get('tenant1AnnualIncome') as string) ? parseInt(formData.get('tenant1AnnualIncome') as string) : 0,
        tenant1BusinessTelephone: formData.get('tenant1BusinessTelephone'),
        tenant1Bank: formData.get('tenant1Bank'),
        tenant1BankBranch: formData.get('tenant1BankBranch'),
        tenant2Occupation: formData.get('tenant2Occupation'),
        tenant2EmploymentType: formData.get('tenant2EmploymentType'),
        tenant2Employer: formData.get('tenant2Employer'),
        tenant2EmployerAddress: formData.get('tenant2EmployerAddress'),
        tenant2EmploymentDuration: formData.get('tenant2EmploymentDuration'),
        tenant2AnnualIncome: parseInt((formData.get('tenant2AnnualIncome') as string).replace('$', '')) ? parseInt((formData.get('tenant2AnnualIncome') as string).replace('$', '')) : 0,
        tenant2BusinessTelephone: formData.get('tenant2BusinessTelephone'),
        tenant2Bank: formData.get('tenant2Bank'),
        tenant2BankBranch: formData.get('tenant2BankBranch'),
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
    };

    try {
        const client = await pool.connect();
        
        const query = `
        INSERT INTO applications (
            name, birth_date, drivers_license_number, telephone_number, present_address, email_address, 
            intended_rental_duration, present_residence_type, present_ownership_type, present_inhabitance_period, 
            marital_status, present_rental_amount, number_of_occupants, application_unit_number, 
            approximate_occupancy_date, broken_lease, broken_lease_reason, refused_pay_rent, filled_bankruptcy, 
            occupant_1_name, occupant_1_relationship, occupant_1_age, occupant_1_email, occupant_2_name, 
            occupant_2_relationship, occupant_2_age, occupant_2_email, occupant_3_name, occupant_3_relationship, 
            occupant_3_age, occupant_3_email, occupant_4_name, occupant_4_relationship, occupant_4_age, occupant_4_email, 
            occupant_5_name, occupant_5_relationship, occupant_5_age, occupant_5_email, first_choice_unit, 
            second_choice_unit, monthly_rental, vehicle_1, vehicle_2, vehicle_3, tenant_1_occupation, 
            tenant_1_full_or_part_time, tenant_1_employer, tenant_1_address, tenant_1_employment_term, tenant_1_annual_income, 
            tenant_1_business_telephone, tenant_1_bank, tenant_1_branch, tenant_2_occupation, tenant_2_full_or_part_time, 
            tenant_2_employed_by, tenant_2_address, tenant_2_how_long, tenant_2_annual_income, tenant_2_business_telephone, 
            tenant_2_bank, tenant_2_branch, personal_ref_name, personal_ref_address, personal_ref_telephone, 
            personal_ref_relationship, personal_ref_how_long, professional_ref_name, professional_ref_address, 
            professional_ref_telephone, professional_ref_relationship, professional_ref_how_long, landlord_name, landlord_address, 
            landlord_telephone, emergency_contact_name, emergency_contact_address, emergency_contact_phone, 
            permission_contact_references, drivers_license_sin, pay_stubs, tax_return, holding_fee, applicant_signature, user_id, id, timestamp
        ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, 
            $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41, $42, 
            $43, $44, $45, $46, $47, $48, $49, $50, $51, $52, $53, $54, $55, $56, $57, $58, $59, $60, $61, $62, 
            $63, $64, $65, $66, $67, $68, $69, $70, $71, $72, $73, $74, $75, $76, $77, $78, $79, $80, $81, $82, 
            $83, $84, $85, $86, $87, $88
        ) RETURNING *;
        `;

        const values = [
        data.name, data.birthdate, data.driverLicense, data.telephone, data.presentAddress, data.email, 
        data.rentalDuration, data.residenceType, data.ownershipType, data.howLong, data.maritalStatus, 
        data.presentRental, data.occupants, data.unitNumber, data.occupancyDate, data.brokenLease, 
        data.brokenLeaseReason, data.refusedToPayRent, data.filedForBankruptcy, data.tenant1Name, data.tenant1Relationship, 
        data.tenant1Age, data.tenant1Email, data.tenant2Name, data.tenant2Relationship, data.tenant2Age, 
        data.tenant2Email, data.tenant3Name, data.tenant3Relationship, data.tenant3Age, data.tenant3Email, 
        data.tenant4Name, data.tenant4Relationship, data.tenant4Age, data.tenant4Email, data.tenant5Name, 
        data.tenant5Relationship, data.tenant5Age, data.tenant5Email, data.firstChoice, data.secondChoice, 
        data.monthlyRental, data.vehicle1, data.vehicle2, data.vehicle3, data.tenant2Occupation, data.tenant2EmploymentType, 
        data.tenant1Employer, data.tenant1EmployerAddress, data.tenant1EmploymentDuration, data.tenant1AnnualIncome, 
        data.tenant1BusinessTelephone, data.tenant1Bank, data.tenant1BankBranch, data.tenant2Occupation, 
        data.tenant2EmploymentType, data.tenant2Employer, data.tenant2EmployerAddress, data.tenant2EmploymentDuration, 
        data.tenant2AnnualIncome, data.tenant2BusinessTelephone, data.tenant2Bank, data.tenant2BankBranch, 
        data.personalRef1Name, data.personalRef1Address, data.personalRef1Telephone, data.personalRef1Relationship, 
        data.personalRef1HowLong, data.professionalRefName, data.professionalRefAddress, data.professionalRefTelephone, 
        data.professionalRefRelationship, data.professionalRefHowLong, data.landlordName, data.landlordAddress, 
        data.landlordTelephone, data.emergencyContactName, data.emergencyContactAddress, data.emergencyContactTelephone, 
        data.permissionContactReferences, data.driversLicenseOrSin, data.payStubs, data.taxReturn, data.holdingFee, 
        data.applicantSignature, data.userId, data.applicationID, data.timestamp
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
        return NextResponse.json({ message: `Application Submitted, you are now logged in under ${data.kivotosEmail} of password ${data.kivotosPassword}. Please save them now.` }, { status: 200 });
        
    } catch (error) {
        console.error('Error querying PostgreSQL:', error);
        return NextResponse.json({ message: "Error Submitting Application" }, { status: 500 });
    }
};