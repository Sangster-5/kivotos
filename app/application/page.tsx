'use client';

import { useState, useEffect } from "react";
import { postRequest } from "@/lib/fetch";
import { Poppins, Raleway } from "next/font/google";
import { formatDate } from "@/lib/formatDate";
import { useSearchParams } from "next/navigation";

const p300 = Poppins({ subsets: ["latin"], weight: "300" })
const p400 = Poppins({ subsets: ["latin"], weight: "400" })
const r300 = Raleway({ subsets: ["latin"], weight: "300" })
const r400 = Raleway({ subsets: ["latin"], weight: "400" })
const r600 = Raleway({ subsets: ["latin"], weight: "600" })

interface User {
    id: number;
    username: string;
    name: string;
    approve_applications: boolean;
    create_leases: boolean;
    tasks_admin: boolean;
}

const Application = () => {
    const searchParams = useSearchParams();
    const id = searchParams.get('id');

    return (
        <>
            {id && <ApplicationView applicationID={parseInt(id)} />}
        </>)
}

export default Application;

interface ApplicationViewProps {
    applicationID: number;
}

type Reference = {
    name: string;
    relationship: string;
    address: string;
    telephone: string;
    howLong: string;
}

type ReferencesObject = {
    personal: Reference[];
    professional: Reference[];
}

interface Application {
    applicant_signature: string;
    application_unit_number: string;
    approximate_occupancy_date: string;
    birth_date: string;
    broken_lease: boolean;
    broken_lease_reason: string;
    drivers_license_number: string;
    drivers_license_sin: string;
    email_address: string;
    emergency_contact_address: string;
    emergency_contact_name: string;
    emergency_contact_phone: string;
    filled_bankruptcy: boolean;
    first_choice_unit: string;
    holding_fee: number;
    id: string;
    intended_rental_duration: string;
    landlord_address: string;
    landlord_name: string;
    landlord_telephone: string;
    marital_status: string;
    monthly_rental: number;
    name: string;
    number_of_occupants: number;
    pay_stubs: string;
    permission_contact_references: boolean;
    present_address: string;
    present_inhabitance_period: string;
    present_ownership_type: string;
    present_rental_amount: number;
    present_residence_type: string;
    refused_pay_rent: boolean;
    second_choice_unit: string;
    tax_return: string;
    telephone_number: string;
    timestamp: string;
    user_id: string;
    vehicle_1: string;
    vehicle_2: string;
    vehicle_3: string;
    approved: boolean;
    rejected: boolean;
    tenants: Tenant[];
    occupants: Occupant[];
    property: string;
    references: ReferencesObject;
    number_cheques_nsf: number;
    moving_reason: string;
    number_late_payments: number;
}

type Occupant = {
    tenantName: string;
    tenantRelationship: string;
    tenantAge: number;
    tenantEmail: string;
}

type Tenant = {
    tenantFullname: string;
    tenantAnnualIncome: number;
    tenantBank: string;
    tenantBankBranch: string;
    tenantBusinessTelephone: string;
    tenantEmployer: string;
    tenantEmployerAddress: string;
    tenantEmploymentDuration: string;
    tenantEmploymentType: string;
    tenantOccupation: string;
}

const ApplicationView: React.FC<ApplicationViewProps> = ({ applicationID }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [initialRender, setInitialRender] = useState(false);
    const applicationId = applicationID;

    const handleApproval = (event: React.MouseEvent<HTMLButtonElement>) => {

        postRequest("api/application/approve", { applicationId })
            .then((data) => {
                if (data.error) return console.warn(data.error);
                location.replace("/admin");
            })
    };

    const handleDeny = (event: React.MouseEvent<HTMLButtonElement>) => {

        postRequest("api/application/deny", { applicationId })
            .then((data) => {
                if (data.error) return console.warn(data.error);
                location.replace("/admin");
            })
    };

    useEffect(() => {
        if (document.cookie.includes("adminUsername") && document.cookie.includes("adminPassword") && !isLoggedIn) {

            postRequest("/api/auth/admin", { validateCookie: true })
                .then((data) => {
                    if (data.error) return location.replace("/");
                    if (data.message === "Admin Cookie Validated") {

                        setUser(data.user);
                        setIsLoggedIn(true);
                    }
                    setInitialRender(true);
                })
        } else {
            setInitialRender(true);
        }
    }, [isLoggedIn]);

    const [application, setApplication] = useState<Application | undefined>(undefined);

    useEffect(() => {
        postRequest("/api/application", { applicationID })
            .then((data) => {
                setApplication(data.application);
            })
            .catch((error) => {
                console.warn(error);
            });
    }, [applicationID]);


    return (
        <>
            {application && (
                <div className="overflow-y-auto h-[85vh] w-screen md:w-auto">
                    <fieldset id="fieldset-1" className="flex flex-row bg-[#A09D8F] py-10 px-8 md:px-16">
                        <div className="flex flex-col">
                            <div className="flex border-b-[1px] border-[#6C6B62] mb-2 flex-row text-white">
                                <div>
                                    <h1 className={"text-4xl font-bold mb-2 " + r600.className}>General Information</h1>
                                    <p className={"text-lg mb-4 " + p300.className}><span className="text-red-500">*</span> All of the fields are required</p>
                                </div>
                            </div>
                            <div className={"grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-2 text-white text-sm " + r400.className}>
                                <div>
                                    <label htmlFor="name" className="mb-2">Name:</label>
                                    <input type="text" id="name" name="name" className="bg-[#868374] p-2 w-full" defaultValue={application.name} readOnly />
                                </div>

                                <div>
                                    <label htmlFor="birthdate" className="mb-2">Birth date:</label>
                                    <input type="date" id="birthdate" name="birthdate" className="bg-[#868374] p-2 w-full" defaultValue={formatDate(new Date(application.birth_date))} readOnly />
                                </div>

                                <div>
                                    <label htmlFor="driverLicense" className="mb-2">Driver’s License No:</label>
                                    <input type="text" id="driverLicense" name="driverLicense" className="bg-[#868374] p-2 w-full" defaultValue={application.drivers_license_number} readOnly />
                                </div>

                                <div>
                                    <label htmlFor="telephone" className="mb-2">Telephone No.:</label>
                                    <input type="tel" id="telephone" name="telephone" className="bg-[#868374] p-2 w-full" defaultValue={application.telephone_number} readOnly />
                                </div>

                                <div>
                                    <label htmlFor="presentAddress" className="mb-2">Present Address:</label>
                                    <input type="text" id="presentAddress" name="presentAddress" className="bg-[#868374] p-2 w-full" defaultValue={application.present_address} readOnly />
                                </div>


                                <div>
                                    <label htmlFor="email" className="mb-2">Email address:</label>
                                    <input type="email" id="email" name="email" className="bg-[#868374] p-2 w-full" defaultValue={application.email_address} readOnly />
                                </div>

                                <div>
                                    <label htmlFor="howLong" className="mb-2">How Long?</label>
                                    <input type="text" id="howLong" name="howLong" className="bg-[#868374] p-2 w-full" defaultValue={application.present_inhabitance_period} readOnly />
                                </div>

                                <div>
                                    <label htmlFor="property">Select Property</label>
                                    <select name="property" id="property" className="bg-[#868374] p-2 w-full" defaultValue={application.name} disabled>
                                        <option value="theArborVictorianLiving">The Arbor Victorian Living</option>
                                        <option value="arborVitaliaCourtyard">Arbor Vitalia Courtyard</option>
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="residenceType" className="mb-2">Residence Type</label>
                                    <select
                                        id="residenceType"
                                        className="bg-[#868374] p-2 w-full"
                                        defaultValue={application.present_residence_type}
                                        name="residenceType"
                                        disabled
                                    >
                                        <option value="Home">Home</option>
                                        <option value="Apartment">Apartment</option>
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="ownershipType" className="mb-2 w-full">Buy or Rent?</label>
                                    <select
                                        id="ownershipType"
                                        className="bg-[#868374] p-2 w-full"
                                        defaultValue={application.present_ownership_type}
                                        name="ownershipType"
                                        disabled
                                    >
                                        <option value="Own">Own</option>
                                        <option value="Rent">Rent</option>
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="maritalStatus" className="mb-2">Marital Status:</label>
                                    <input type="text" id="maritalStatus" name="maritalStatus" className="bg-[#868374] p-2 w-full" defaultValue={application.marital_status} readOnly />
                                </div>

                                <div>
                                    <label htmlFor="presentRental" className="mb-2">Present Rental ($):</label>
                                    <input type="text" id="presentRental" name="presentRental" className="bg-[#868374] p-2 w-full" defaultValue={application.present_rental_amount} readOnly />
                                </div>
                            </div>
                            <div className={"grid grid-cols-2 md:grid-cols-4 border-t-[1px] border-[#6C6B62] mt-8 gap-x-6 pt-2 text-white text-sm " + r400.className}>
                                <div className="grid grid-rows-2">
                                    <label htmlFor="occupants" className="mb-2">Number of Persons to Occupy Unit:</label>
                                    <input type="number" id="occupants" name="occupants" className="bg-[#868374] p-2 w-full" defaultValue={application.number_of_occupants} readOnly />
                                </div>
                                <div className="relative">
                                    <label htmlFor="occupancyDate" className="mb-2">Approx. Date of Occupancy:</label>
                                    <input type="date" id="occupancyDate" name="occupancyDate" className="bg-[#868374] p-2 w-full absolute bottom-0 left-0 right-0" defaultValue={application.approximate_occupancy_date} readOnly />
                                </div>
                                <div>
                                    <label htmlFor="unitNumber" className="mb-2">The Application for Townhouse/Apartment #:</label>
                                    <input type="text" id="unitNumber" name="unitNumber" className="bg-[#868374] p-2 w-full" defaultValue={application.application_unit_number} readOnly />
                                </div>
                                <div>
                                    <label htmlFor="rentalDuration" className="mb-2">How long do you plan to live in the rental unit?</label>
                                    <input type="text" id="rentalDuration" name="rentalDuration" className="bg-[#868374] p-2 w-full" defaultValue={application.intended_rental_duration} readOnly />
                                </div>
                            </div>
                        </div>
                    </fieldset >

                    <fieldset id="fieldset-2" className="flex flex-row bg-[#A09D8F] py-10 p-8 md:px-16">
                        <div className="flex flex-col gap-y-2 text-white">
                            <div className="flex border-b-[1px] border-[#6C6B62] mb-2 flex-row">
                                <div>
                                    <h1 className={"text-4xl font-bold mb-2 " + r600.className}>Tenancy</h1>
                                    <p className={"text-lg mb-4 " + p300.className}>Only persons listed on this application will be permitted to occupy the premises.</p>
                                </div>
                            </div>
                            <div className={"flex flex-row gap-x-4 text-white text-sm " + r400.className}>
                                <div className="flex flex-col w-1/2 md:w-1/5">
                                    <label htmlFor="brokenLease" className="mb-2 pr-2 flex items-center">Have you ever broken a lease?</label>
                                    <input type="text" id="brokenLease" name="brokenLease" className="p-2 bg-[#868374]" defaultValue={application.broken_lease ? "Yes" : "No"} readOnly />
                                </div>
                                <div className="flex flex-col w-1/2 md:w-4/5 relative">
                                    <label htmlFor="brokenLeaseReason" className="mb-2 md:px-2 flex items-center">If so, what was the reason?</label>
                                    <input type="text" id="brokenLeaseReason" name="brokenLeaseReason" className="p-2 bg-[#868374] absolute bottom-0 left-0 right-0" defaultValue={application.broken_lease_reason} readOnly />
                                </div>
                            </div>
                            <div className={"grid grid-cols-2 gap-x-4 mt-2 gap-y-2 text-white text-sm " + r400.className}>
                                <div>
                                    <label htmlFor="refusedToPayRent" className="flex items-center">Have you ever refused to pay rent for any reason?</label>
                                    <input type="text" id="refusedToPayRent" name="refusedToPayRent" className="bg-[#868374] w-full p-2" defaultValue={application.refused_pay_rent ? "Yes" : "No"} readOnly />
                                </div>
                                <div className="flex flex-col justify-between h-full">
                                    <label htmlFor="filedForBankruptcy" className="flex items-center">Have you ever filed for bankruptcy?</label>
                                    <input type="text" id="filedForBankruptcy" name="filedForBankruptcy" className="bg-[#868374] w-full p-2 flex flex-grow-1" defaultValue={application.filled_bankruptcy ? "Yes" : "No"} readOnly />
                                </div>
                                <div>
                                    <label htmlFor="firstChoice" className="flex items-center">Apartment/Townhouse 1st Choice:</label>
                                    <input type="text" id="firstChoice" name="firstChoice" className="bg-[#868374] w-full p-2" defaultValue={application.first_choice_unit} readOnly />
                                </div>
                                <div>
                                    <label htmlFor="secondChoice" className="flex items-center">2nd Choice:</label>
                                    <input type="text" id="secondChoice" name="secondChoice" className="bg-[#868374] w-full p-2" defaultValue={application.second_choice_unit} readOnly />
                                </div>
                                <div>
                                    <label htmlFor="monthlyRental" className="flex items-center">Monthly Rental:</label>
                                    <input type="text" id="monthlyRental" name="monthlyRental" className="bg-[#868374] w-full p-2" defaultValue={application.monthly_rental} readOnly />
                                </div>
                            </div>
                            <h1 className={"text-2xl mt-4 " + r600.className}>Occupants</h1>
                            <div className={"grid grid-cols-2md:grid-cols-4 gap-x-2 text-sm " + p400.className}>
                                <div className="grid grid-rows gap-y-1">
                                    <h2 className={"flex items-center h-12 text-sm " + r300.className}>First name, initial, Last name (Tenants to occupy the unit)</h2>
                                    {application.occupants.map((occupant, index) => {
                                        return <input key={index} type="text" id={`tenant${index + 1}Name`} name={`tenant${index + 1}Name`} className="bg-[#868374] h-10 p-2" defaultValue={occupant.tenantName}></input>
                                    })}
                                </div>
                                <div className="grid grid-rows gap-y-1">
                                    <h2 className={"flex items-center h-12 text-sm " + r300.className}>Relationship</h2>
                                    {application.occupants.map((occupant, index) => {
                                        return <input key={index} type="text" id={`tenant${index + 1}Relationship`} name={`tenant${index + 1}Relationship`} className="bg-[#868374] h-10 p-2" defaultValue={occupant.tenantRelationship} />
                                    })}
                                </div>
                                <div className="grid grid-rows gap-y-1">
                                    <h2 className={"flex items-center h-12 text-sm " + r300.className}>Age</h2>
                                    {application.occupants.map((occupant, index) => {
                                        return <input key={index} type="number" id={`tenant${index + 1}Age`} name={`tenant${index + 1}Age`} className="bg-[#868374] h-10 p-2" defaultValue={occupant.tenantAge} />
                                    })}
                                </div>
                                <div className="grid grid-rows gap-y-1">
                                    <h2 className={"flex items-center h-12 text-sm " + r300.className}>Email address</h2>
                                    {application.occupants.map((occupant, index) => {
                                        return <input key={index} type="email" id={`tenant${index + 1}Email`} name={`tenant${index + 1}Email`} className="bg-[#868374] h-10 p-2" defaultValue={occupant.tenantEmail} />
                                    })}
                                </div>
                            </div>
                            <div className="mt-2">
                                {/* <button className={"rounded-md text-sm flex flex-row gap-x-2 " + r400.className} onClick={handleAddOccupant}><Image height={20} width={20} src="/icons/Add.png" alt="" /> Add Occupant</button> */}
                            </div>
                            <h1 className={"text-2xl mt-4 " + r600.className}>Tenants</h1>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-2">
                                {application.tenants.map((tenant, index) => {
                                    return (
                                        <div key={index} className={"grid grid-cols-2 gap-x-4 gap-y-2 text-sm mt-4 " + r400.className}>
                                            <h2 className="mb-2 grid col-span-2 text-lg mb-0">Tenant {index + 1}</h2>
                                            <div className="grid gap-y-1 items-center">
                                                <label htmlFor={`tenant${index + 1}Fullname`}>First Name, Initial, Last Name:</label>
                                                <input type="text" id={`tenant${index + 1}Fullname`} name={`tenant${index + 1}Fullname`} defaultValue={tenant.tenantFullname} className="w-full bg-[#868374] p-2" />
                                            </div>
                                            <div className="grid gap-y-1">
                                                <label htmlFor={`tenant${index + 1}Occupation`}>Occupation:</label>
                                                <input type="text" id={`tenant${index + 1}Occupation`} name={`tenant${index + 1}Occupation`} defaultValue={tenant.tenantOccupation} className="w-full bg-[#868374] p-2" />
                                            </div>
                                            <div className="grid gap-y-1">
                                                <label htmlFor={`tenant${index + 1}EmploymentType`}>Full or Part Time:</label>
                                                <input type="text" id={`tenant${index + 1}EmploymentType`} name={`tenant${index + 1}EmploymentType`} defaultValue={tenant.tenantEmploymentType} className="w-full bg-[#868374] p-2" />
                                            </div>
                                            <div className="grid gap-y-1">
                                                <label htmlFor={`tenant${index + 1}Employer`}>Employed by:</label>
                                                <input type="text" id={`tenant${index + 1}Employer`} name={`tenant${index + 1}Employer`} defaultValue={tenant.tenantEmployer} className="w-full bg-[#868374] p-2" />
                                            </div>
                                            <div className="grid gap-y-1">
                                                <label htmlFor={`tenant${index + 1}EmployerAddress`}>Address:</label>
                                                <input type="text" id={`tenant${index + 1}EmployerAddress`} name={`tenant${index + 1}EmployerAddress`} defaultValue={tenant.tenantEmployerAddress} className="w-full bg-[#868374] p-2" />
                                            </div>
                                            <div className="grid gap-y-1">
                                                <label htmlFor={`tenant${index + 1}EmploymentDuration`}>How Long?</label>
                                                <input type="text" id={`tenant${index + 1}EmploymentDuration`} name={`tenant${index + 1}EmploymentDuration`} defaultValue={tenant.tenantEmploymentDuration} className="w-full bg-[#868374] p-2" />
                                            </div>
                                            <div className="grid gap-y-1">
                                                <label htmlFor={`tenant${index + 1}AnnualIncome`}>Annual Income?</label>
                                                <input type="text" id={`tenant${index + 1}AnnualIncome`} name={`tenant${index + 1}AnnualIncome`} defaultValue={tenant.tenantAnnualIncome} className="w-full bg-[#868374] p-2" />
                                            </div>
                                            <div className="grid gap-y-1">
                                                <label htmlFor={`tenant${index + 1}BusinessTelephone`}>Business Telephone:</label>
                                                <input type="tel" id={`tenant${index + 1}BusinessTelephone`} name={`tenant${index + 1}BusinessTelephone`} defaultValue={tenant.tenantBusinessTelephone} className="w-full bg-[#868374] p-2" />
                                            </div>
                                            <div className="grid gap-y-1">
                                                <label htmlFor={`tenant${index + 1}Bank`}>Bank:</label>
                                                <input type="text" id={`tenant${index + 1}Bank`} name={`tenant${index + 1}Bank`} defaultValue={tenant.tenantBank} className="w-full bg-[#868374] p-2" />
                                            </div>
                                            <div className="grid gap-y-1">
                                                <label htmlFor={`tenant${index + 1}BankBranch`}>Branch:</label>
                                                <input type="text" id={`tenant${index + 1}BankBranch`} name={`tenant${index + 1}BankBranch`} defaultValue={tenant.tenantBankBranch} className="w-full bg-[#868374] p-2" />
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                            <div className="mt-2">
                                {/* <button className={"rounded-md text-sm flex flex-row gap-x-2 " + r400.className} onClick={addTenantDiv}><Image height={20} width={20} src="/icons/Add.png" alt="" /> Add Tenant</button> */}
                            </div>
                        </div>
                    </fieldset >
                    <fieldset id="fieldset-3" className="flex flex-row bg-[#A09D8F] py-10 p-8 md:px-16">
                        <div className={"gap-y-2 gap-x-4 text-white bg-[#A09D8F] grid grid-cols-2 text-sm " + r400.className}>
                            <div className="grid col-span-2 border-b-[1px] border-[#6C6B62] mb-2">
                                <div>
                                    <h1 className={"text-4xl font-bold mb-2 " + r600.className}>Vehicles</h1>
                                    <p className={"text-lg mb-4 " + p300.className}>Please correctly enter make, model, colour, and year for all vehicles.</p>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="vehicle1" className="flex flex-row">Vehicle #1 (Make, Model, Colour, Year):</label>
                                <input type="text" id="vehicle1" name="vehicle1" className="flex flex-row w-full bg-[#868374] p-2" defaultValue={application.vehicle_1} readOnly />
                            </div>

                            <div>
                                <label htmlFor="vehicle2" className="flex flex-row">Vehicle #2 (Make, Model, Colour, Year):</label>
                                <input type="text" id="vehicle2" name="vehicle2" className="flex flex-row w-full bg-[#868374] p-2" defaultValue={application.vehicle_2} readOnly />
                            </div>

                            <div>
                                <label htmlFor="vehicle3" className="flex flex-row">Vehicle #3 (Make, Model, Colour, Year):</label>
                                <input type="text" id="vehicle3" name="vehicle3" className="flex flex-row w-full bg-[#868374] p-2" defaultValue={application.vehicle_3} readOnly />
                            </div>
                        </div>
                    </fieldset>
                    <fieldset id="fieldset-4" className="flex flex-row bg-[#A09D8F] py-10 p-8 md:px-16">
                        <div className={"gap-y-2 gap-x-4 text-white bg-[#A09D8F] text-sm " + r400.className}>
                            <div className="border-b-[1px] border-[#6C6B62]">
                                <div>
                                    <h1 className={"text-4xl font-bold mb-2 " + r600.className}>References</h1>
                                    <p className={"text-lg mb-4 " + p300.className}>Please fill out all required fields.</p>
                                </div>
                            </div>

                            <div className={"border-b-[1px] border-[#6C6B62] mb-2 text-md py-4 " + r400.className}>
                                * Personal
                            </div>
                            {application.references.personal.map((reference: Reference, index) => {
                                return (
                                    <div key={index} className="relative grid grid-cols-2 md:grid-cols-4 gap-x-4">
                                        <div className={"absolute text-[#868274] text-xl left-[-3rem] top-10 " + r600.className}>#{index + 1}</div>
                                        <div className="grid grid-rows-2 items-center">
                                            <label htmlFor={`personalRef${index + 1}Name`} className="">Full Name:</label>
                                            <input type="text" id={`personalRef${index + 1}Name`} name={`personalRef${index + 1}Name`} defaultValue={reference.name} readOnly className="bg-[#868374] p-2" />
                                        </div>
                                        <div className="grid grid-rows-2 items-center">
                                            <label htmlFor={`personalRef${index + 1}Address`} className="">Address:</label>
                                            <input type="text" id={`personalRef${index + 1}Address`} name={`personalRef${index + 1}Address`} defaultValue={reference.address} readOnly className="bg-[#868374] p-2" />
                                        </div>
                                        <div className="grid grid-rows-2 items-center">
                                            <label htmlFor={`personalRef${index + 1}Telephone`} className="">Telephone:</label>
                                            <input type="text" id={`personalRef${index + 1}Telephone`} name={`personalRef${index + 1}Telephone`} defaultValue={reference.telephone} readOnly className="bg-[#868374] p-2" />
                                        </div>
                                        <div className="grid grid-rows-2 items-center">
                                            <label htmlFor={`personalRef${index + 1}Relationship`} className="">Relationship:</label>
                                            <input type="text" id={`personalRef${index + 1}Relationship`} name={`personalRef${index + 1}Relationship`} defaultValue={reference.relationship} readOnly className="bg-[#868374] p-2" />
                                        </div>
                                        <div className="grid grid-rows-2 items-center">
                                            <label htmlFor={`personalRef${index + 1}HowLong`} className="">How Long?</label>
                                            <input type="text" id={`personalRef${index + 1}HowLong`} name={`personalRef${index + 1}HowLong`} defaultValue={reference.howLong} readOnly className="bg-[#868374] p-2" />
                                        </div>
                                    </div>
                                )
                            })}

                            <div className={"border-y-[1px] border-[#6C6B62] mb-2 mt-4 text-md py-4 " + r400.className}>
                                * Professional (e.g. attorney, doctor)
                            </div>
                            {application.references.professional.map((reference: Reference, index) => {
                                return (
                                    <div key={index} className="relative grid grid-cols-2 md:grid-cols-4 gap-x-4">
                                        <div className={"absolute text-[#868274] text-xl left-[-3rem] top-10 " + r600.className}>#1</div>
                                        <div className="grid grid-rows-2 items-center">
                                            <label htmlFor={`professionalRef${index + 1}Name`} className="">Full Name:</label>
                                            <input type="text" id={`professionalRef${index + 1}Name`} name={`professionalRef${index + 1}Name`} defaultValue={reference.name} readOnly className="bg-[#868374] p-2" />
                                        </div>
                                        <div className="grid grid-rows-2 items-center">
                                            <label htmlFor={`professionalRef${index + 1}Address`} className="">Address:</label>
                                            <input type="text" id={`professionalRef${index + 1}Address`} name={`professionalRef${index + 1}Address`} defaultValue={reference.address} readOnly className="bg-[#868374] p-2" />
                                        </div>
                                        <div className="grid grid-rows-2 items-center">
                                            <label htmlFor={`professionalRef${index + 1}Telephone`} className="">Telephone:</label>
                                            <input type="text" id={`professionalRef${index + 1}Telephone`} name={`professionalRef${index + 1}Telephone`} defaultValue={reference.telephone} readOnly className="bg-[#868374] p-2" />
                                        </div>
                                        <div className="grid grid-rows-2 items-center">
                                            <label htmlFor={`professionalRef${index + 1}Relationship`} className="">Relationship:</label>
                                            <input type="text" id={`professionalRef${index + 1}Relationship`} name={`professionalRef${index + 1}Relationship`} defaultValue={reference.relationship} readOnly className="bg-[#868374] p-2" />
                                        </div>
                                        <div className="grid grid-rows-2 items-center">
                                            <label htmlFor={`professionalRef${index + 1}HowLong`} className="">How Long?</label>
                                            <input type="text" id={`professionalRef${index + 1}HowLong`} name={`professionalRef${index + 1}HowLong`} defaultValue={reference.howLong} readOnly className="bg-[#868374] p-2" />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </fieldset >
                    <fieldset id="fieldset-5" className="flex flex-row bg-[#A09D8F] py-10 p-8 md:px-16">
                        <div className={"grid gap-y-2 gap-x-4 text-white bg-[#A09D8F] text-sm " + r400.className}>
                            <div className="flex flex-row border-b-[1px] border-[#6C6B62]">
                                <div>
                                    <h1 className={"hidden md:block text-3xl font-bold mb-2 " + r600.className}>Current Landlord/Owner/Superintendent/Company</h1>
                                    <h1 className={"block md:hidden text-xl font-bold mb-2 " + r600.className}>Current Landlord/Owner/ Superintendent/Company</h1>
                                    <p className={"text-lg mb-4 " + p300.className}>Please input accuate information.</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-x-4">
                                <div className="grid grid-rows-2 items-center">
                                    <label htmlFor="landlordName" className="">Full Name:</label>
                                    <input type="text" id="landlordName" name="landlordName" defaultValue={application.landlord_name} readOnly className="bg-[#868374] p-2" />
                                </div>
                                <div className="grid grid-rows-2 items-center">
                                    <label htmlFor="landlordAddress" className="">Address:</label>
                                    <input type="text" id="landlordAddress" name="landlordAddress" defaultValue={application.landlord_address} readOnly className="bg-[#868374] p-2" />
                                </div>
                                <div className="grid grid-rows-2 items-center">
                                    <label htmlFor="landlordTelephone" className="">Telephone:</label>
                                    <input type="text" id="landlordTelephone" name="landlordTelephone" defaultValue={application.landlord_telephone} readOnly className="bg-[#868374] p-2" />
                                </div>
                                <div className="grid grid-rows-2 items-center">
                                    <label htmlFor="numberChequesNsf">No. of Cheques Returned NSF</label>
                                    <input type="text" id="numberChequesNsf" name="numberChequesNsf" defaultValue={application.number_cheques_nsf} readOnly className="bg-[#868374] p-2" />
                                </div>
                                <div className="grid col-spam-2 md:col-span-3 grid-rows-2 items-center">
                                    <label htmlFor="movingReason">Reason for Leaving:</label>
                                    <input type="text" id="movingReason" name="movingReason" defaultValue={application.moving_reason ? application.moving_reason : "None given"} readOnly className="bg-[#868374] p-2" />
                                </div>
                                <div className="grid grid-rows-2 items-center">
                                    <label htmlFor="numberLatePayments">No. of Late Payments</label>
                                    <input type="text" id="numberLatePayments" name="numberLatePayments" defaultValue={application.number_late_payments} readOnly className="bg-[#868374] p-2" />
                                </div>
                            </div>
                        </div>
                    </fieldset>
                    <fieldset id="fieldset-6" className="flex flex-row bg-[#A09D8F] py-10 px-8 md:px-16">
                        <div className={"gap-y-2 gap-x-4 text-white bg-[#A09D8F] text-sm " + r400.className}>
                            <div className="border-b-[1px] border-[#6C6B62]">
                                <div>
                                    <h1 className={"text-4xl font-bold mb-2 " + r600.className}>Emergency Contact</h1>
                                    <p className={"text-lg mb-4 " + p300.className}>Please input the correct contact information.</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4">
                                <div className="grid grid-rows-2 items-center">
                                    <label htmlFor="emergencyContactName" className="">Full Name:</label>
                                    <input type="text" id="emergencyContactName" name="emergencyContactName" defaultValue={application.emergency_contact_name} readOnly className="bg-[#868374] p-2" />
                                </div>
                                <div className="grid grid-rows-2 items-center">
                                    <label htmlFor="emergencyContactAddress" className="">Address:</label>
                                    <input type="text" id="emergencyContactAddress" name="emergencyContactAddress" defaultValue={application.emergency_contact_address} readOnly className="bg-[#868374] p-2" />
                                </div>
                                <div className="grid grid-rows-2 items-center">
                                    <label htmlFor="emergencyContactTelephone" className="">Telephone:</label>
                                    <input type="text" id="emergencyContactTelephone" name="emergencyContactTelephone" defaultValue={application.emergency_contact_phone} readOnly className="bg-[#868374] p-2" />
                                </div>
                            </div>
                        </div>
                    </fieldset>
                    <fieldset id="fieldset-7" className="flex flex-row bg-[#A09D8F] py-10 px-8 md:px-16 text-white">
                        <div className={"gap-y-2 gap-x-4 text-white bg-[#A09D8F] text-sm " + r400.className}>
                            <div className="border-b-[1px] border-[#6C6B62]">
                                <div>
                                    <h1 className={"text-4xl font-bold mb-2 " + r600.className}>Further Details and Consent</h1>
                                </div>
                            </div>
                            <div className="">
                                <h1 className={"text-3xl " + r400.className}></h1>
                                <div className="grid md:grid-rows-2 mt-4 gap-y-2">
                                    <p className={"w-3/4 " + p400.className}>Do you give management permission to contact the personal or professional references listed above, both now and in the
                                        future for rental consideration or for collection purposes should they be deemed necessary?</p>

                                    <div>
                                        <input type="text" placeholder="Yes or No" defaultValue={application.permission_contact_references ? "Yes" : "No"} readOnly id="permissionContactReferences" name="permissionContactReferences" className={"bg-[#868374] placeholder-white p-2 text-sm mt-2 " + p300.className} />

                                    </div>
                                    <div>
                                        <p className="text-left w-fullmd:w-3/4">Thank you for completing an application to rent from us. Please sign below. Also note that a completed application requires
                                            submission of the following documents which will be copied and attached to this application.</p>
                                    </div>
                                    <div className="grid grid-rows-3 my-5">
                                        <div className="flex flex-col">
                                            <label htmlFor="driversLicenseOrSin">Driver’s License or Social Insurance Number:</label>
                                            <a className="underline" target="blank" href={`/file?type=applicant&filename=${encodeURIComponent(application.drivers_license_sin)}`}>View File <span className="hidden md:block">{application.drivers_license_sin}</span></a>

                                            {/* <input type="checkbox" onChange={handleIsUploadingID} name="driversLicenseOrSin" />
  
                        {isUploadingID && <input name="driversLicenseOrSinUpload" type="file" />} */}
                                        </div>

                                        <div className="flex flex-col">
                                            <label htmlFor="payStubs">Two weeks of the most current pay stubs of each income source listed:</label>
                                            <a className="underline" target="blank" href={`/file?type=applicant&filename=${encodeURIComponent(application.pay_stubs)}`}>View File <span className="hidden md:block">{application.pay_stubs}</span></a>
                                            {/* <input type="checkbox" onChange={handleIsUploadingPayStubs} name="payStubs" />
  
                        {isUploadingPayStubs && <input name="payStubsUpload" type="file" />} */}
                                        </div>
                                        <div className="flex flex-col">
                                            <label htmlFor="taxReturn">If self-employed, most current tax return as proof of income.</label>
                                            <a className="underline" target="blank" href={`/file?type=applicant&filename=${encodeURIComponent(application.tax_return)}`}>View File <span className="hidden md:block">{application.tax_return}</span></a>
                                            {/* <input type="checkbox" onChange={handleIsUploadingTaxReturn} name="taxReturn" />
  
                        {isUploadingTaxReturn && <input name="taxReturnUpload" type="file" />} */}
                                        </div>
                                    </div>
                                    <p className="text-left">The applicant offers to lease the said townhouse and hereby agrees to pay the sum of $ <input type="number" name="holdingFee" defaultValue={application.holding_fee} readOnly className={"bg-[#A09D8F] border-b-[1px] px-2 text-center"} /> as a holding fee on the
                                        understanding that if the offer is accepted the fee shall be retained by the landlord or his agent as a Security Deposit during
                                        the tenancy of the premises and will be refunded at termination of the tenancy pursuant to the Residential Tenancies Act
                                        provided all the covenants of the Lease Agreement have been complied with and that the premises are left in a proper state of
                                        cleanliness and repair, reasonable wear and tear excepted, AND, if the offer is not accepted, the full deposit will be refunded,
                                        PROVIDED HOWEVER, that if on notification of the offer the Tenant fails to execute the lease the said fee shall forthwith be
                                        forfeited and retained by the Landlord or his agent.</p>
                                    <label htmlFor="applicantSignature" className="text-lg">Signature:</label>
                                    <input type="text" id="applicantSignature" name="applicantSignature" defaultValue={application.applicant_signature} readOnly placeholder="Type here" className="bg-[#A09D8F] placeholder-white border-b-[1px] w-1/5" />
                                </div>
                            </div>
                        </div>
                    </fieldset >
                    {isLoggedIn && (
                        <div className="bg-[#A09D8F] flex flex-row gap-x-2 px-16 justify-end pb-4">
                            <button onClick={handleApproval} className="grid text-center bg-[#192F3D] rounded-md text-white p-1 h-8 w-1/2 md:w-24">Approve</button>
                            <button onClick={handleDeny} className="grid text-center bg-red-500 rounded-md text-white p-1 h-8 w-1/2 md:w-24">Deny</button>
                        </div>
                    )
                    }
                </div >
            )}
        </>
    );
}