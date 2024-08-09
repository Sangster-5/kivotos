'use client'

import { useState } from "react";

type TenantType = {
    tenantFullname: FormDataEntryValue | null;
    tenantOccupation: FormDataEntryValue | null;
    tenantEmploymentType: FormDataEntryValue | null;
    tenantEmployer: FormDataEntryValue | null;
    tenantEmployerAddress: FormDataEntryValue | null;
    tenantEmploymentDuration: FormDataEntryValue | null;
    tenantAnnualIncome: number;
    tenantBusinessTelephone: FormDataEntryValue | null;
    tenantBank: FormDataEntryValue | null;
    tenantBankBranch: FormDataEntryValue | null;
};

type OccupantType = {
    tenantName: FormDataEntryValue | null;
    tenantRelationship: FormDataEntryValue | null;
    tenantAge: FormDataEntryValue | null;
    tenantEmail: FormDataEntryValue | null;
};


const RentalApplicationForm = () => {
    const [showMainForm, setShowMainForm] = useState(false);
    const handleKivotosRegistration = () => {
        const kivotosEmail = document.getElementById("kivotosEmail") as HTMLInputElement;
        const kivotosPassword = document.getElementById("kivotosPassword") as HTMLInputElement;
        if (kivotosEmail && kivotosPassword && kivotosEmail.value != "" && kivotosPassword.value != "" && kivotosEmail.value.includes("@")) {
            kivotosEmail.classList.toggle("hidden");
            kivotosPassword.classList.toggle("hidden");
            document.getElementById("kivotosTitle")?.classList.toggle("hidden");
            document.getElementById("registerButton")?.classList.toggle("hidden");

            setShowMainForm(true);
        } else {
            const errorMsg = document.getElementById("error-msg");
            if (errorMsg) {
                errorMsg.textContent = "Please fill in all fields and ensure property email formatting";
                errorMsg.classList.remove("hidden");
                setTimeout(() => { errorMsg.classList.add("hidden") }, 2500)
            }
        }
    }

    const [showSuccess, setShowSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    const [occupantCount, setOccupantCount] = useState<number[]>([]);
    const maxOccupants = 6; // Set the maximum number tenants - 5 (for the initial 5 Occupants)

    const [tenantCount, setTenantCount] = useState<number[]>([]);
    const maxTenants = 6; // Set the maximum number tenants - 2 (for the initial 2 tenants)

    const submitApplication = async (formData: FormData) => {
        let tenants: TenantType[] = [];
        let occupants: OccupantType[] = [];

        for (let i = 0; i < tenantCount.length + 2; i++) {
            const currentTenant = {
                tenantFullname: formData.get(`tenant${i + 1}Fullname`),
                tenantOccupation: formData.get(`tenant${i + 1}Occupation`),
                tenantEmploymentType: formData.get(`tenant${i + 1}EmploymentType`),
                tenantEmployer: formData.get(`tenant${i + 1}Employer`),
                tenantEmployerAddress: formData.get(`tenant${i + 1}EmployerAddress`),
                tenantEmploymentDuration: formData.get(`tenant${i + 1}EmploymentDuration`),
                tenantAnnualIncome: parseInt(formData.get(`tenant${i + 1}AnnualIncome`) as string) ? parseInt(formData.get(`tenant${i + 1}AnnualIncome`) as string) : 0,
                tenantBusinessTelephone: formData.get(`tenant${i + 1}BusinessTelephone`),
                tenantBank: formData.get(`tenant${i + 1}Bank`),
                tenantBankBranch: formData.get(`tenant${i + 1}BankBranch`),
            }
            tenants.push(currentTenant);
        }

        for (let i = 0; i < occupantCount.length + 5; i++) {
            const currentOccupant = {
                tenantName: formData.get(`tenant${i + 1}Name`),
                tenantRelationship: formData.get(`tenant${i + 1}Relationship`),
                tenantAge: formData.get(`tenant${i + 1}Age`),
                tenantEmail: formData.get(`tenant${i + 1}Email`),
            }
            occupants.push(currentOccupant);
        }

        formData.append('tenants', JSON.stringify(tenants));
        formData.append('occupantsData', JSON.stringify(occupants));

        fetch("/api/application/submit", {
            method: "POST",
            credentials: "include",
            body: formData
        })
            .then((res) => res.json())
            .then((data) => {
                setShowMainForm(false);
                setSuccessMessage(data.message);
                setShowSuccess(true);

                setTimeout(() => {
                    location.replace("/")
                }, 2000)
            })
            .catch((error) => {
                console.log(error);
            });
    }

    return (
        <>
            {!showSuccess && (
                <>
                    <div className="p-4 flex justify-center items-center">
                        <form action={submitApplication}>
                            <h1 id="kivotosTitle">Create your Kivotos login</h1>
                            <input required type="email" name="kivotosEmail" id="kivotosEmail" placeholder="Email Address" className="border-2" />
                            <input required type="password" name="kivotosPassword" id="kivotosPassword" placeholder="Password" className="border-2" />
                            <p id="error-msg" className="hidden text-red-500"></p>
                            <button id="registerButton" type="button" onClick={handleKivotosRegistration}>Proceed to Application</button>

                            {showMainForm && <MainApplicationForm tenantCount={tenantCount} setTenantCount={setTenantCount} maxTenants={maxTenants} occupantCount={occupantCount} setOccupantCount={setOccupantCount} maxOccupants={maxOccupants} />}
                        </form >
                    </div >
                </>
            )}

            {showSuccess && (
                <h1>{successMessage}</h1>
            )}
        </>
    );
}

export default RentalApplicationForm;

interface MainApplicationFormProps {
    tenantCount: number[];
    setTenantCount: React.Dispatch<React.SetStateAction<number[]>>;
    maxTenants: number;
    occupantCount: number[];
    setOccupantCount: React.Dispatch<React.SetStateAction<number[]>>;
    maxOccupants: number;
}

const MainApplicationForm: React.FC<MainApplicationFormProps> = ({ tenantCount, setTenantCount, maxTenants, occupantCount, setOccupantCount, maxOccupants }) => {
    const [isUploadingID, setIsUploadingID] = useState(false);
    const [isUploadingPayStubs, setIsUploadingPayStubs] = useState(false);
    const [isUploadingTaxReturn, setIsUploadingTaxReturn] = useState(false);

    const handleIsUploadingID = (e: React.ChangeEvent<HTMLInputElement>) => {
        setIsUploadingID(e.target.checked);
    }

    const handleIsUploadingPayStubs = (e: React.ChangeEvent<HTMLInputElement>) => {
        setIsUploadingPayStubs(e.target.checked);
    }

    const handleIsUploadingTaxReturn = (e: React.ChangeEvent<HTMLInputElement>) => {
        setIsUploadingTaxReturn(e.target.checked);
    }

    const addTenantDiv = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (tenantCount.length < maxTenants) {
            setTenantCount([...tenantCount, tenantCount.length + 1]);
        }
    };

    const handleAddOccupant = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (occupantCount.length < maxOccupants) {
            setOccupantCount([...occupantCount, occupantCount.length + 1]);
        }
    }

    return (
        <>
            <div className="text-center">
                <h1 className="text-2xl font-bold mb-4">Rental Application Form</h1>
                <p className="mb-4">Incomplete Applications will not be processed.</p>
            </div>

            <fieldset id="fieldset-1" className="flex flex-row mb-4">
                <div className="flex flex-col mr-4">
                    <label htmlFor="name" className="mb-2">Name:</label>
                    <input type="text" id="name" name="name" className="border-2 p-2" />

                    <label htmlFor="birthdate" className="mb-2">Birth date:</label>
                    <input type="date" id="birthdate" name="birthdate" className="border-2 p-2" />

                    <label htmlFor="driverLicense" className="mb-2">Driver’s License No:</label>
                    <input type="text" id="driverLicense" name="driverLicense" className="border-2 p-2" />

                    <label htmlFor="telephone" className="mb-2">Telephone No.:</label>
                    <input type="tel" id="telephone" name="telephone" className="border-2 p-2" />

                    <label htmlFor="presentAddress" className="mb-2">Present Address:</label>
                    <input type="text" id="presentAddress" name="presentAddress" className="border-2 p-2" />

                    <label htmlFor="email" className="mb-2">Email address:</label>
                    <input type="email" id="email" name="email" className="border-2 p-2" />

                    <label htmlFor="rentalDuration" className="mb-2">How long do you plan to live in the rental unit?</label>
                    <input type="text" id="rentalDuration" name="rentalDuration" className="border-2 p-2" />

                    <label htmlFor="property">Select Property</label>
                    <select name="property" id="property" className="border-2 p-2" defaultValue={"theArborVictorianLiving"}>
                        <option value="theArborVictorianLiving">The Arbor Victorian Living</option>
                        <option value="arborVitaliaCourtyard">Arbor Vitalia Courtyard</option>
                    </select>
                </div>

                <div className="flex flex-col">
                    <label htmlFor="residenceType" className="mb-2">Residence Type</label>
                    <select
                        id="residenceType"
                        className="border p-2"
                        defaultValue={"Home"}
                        name="residenceType"
                    >
                        <option value="Home">Home</option>
                        <option value="Apartment">Apartment</option>
                    </select>

                    <label htmlFor="ownershipType" className="mb-2">Buy or Rent?</label>
                    <select
                        id="ownershipType"
                        className="border p-2"
                        defaultValue={"Home"}
                        name="ownershipType"
                    >
                        <option value="Own">Own</option>
                        <option value="Rent">Rent</option>
                    </select>

                    <label htmlFor="howLong" className="mb-2">How Long?</label>
                    <input type="text" id="howLong" name="howLong" className="border-2 p-2" />

                    <label htmlFor="maritalStatus" className="mb-2">Marital Status:</label>
                    <input type="text" id="maritalStatus" name="maritalStatus" className="border-2 p-2" />

                    <label htmlFor="presentRental" className="mb-2">Present Rental ($):</label>
                    <input type="text" id="presentRental" name="presentRental" className="border-2 p-2" />

                    <label htmlFor="occupants" className="mb-2">Number of Persons to Occupy Unit:</label>
                    <input type="number" id="occupants" name="occupants" className="border-2 p-2" />

                    <label htmlFor="unitNumber" className="mb-2">The Application for Townhouse/Apartment #:</label>
                    <input type="text" id="unitNumber" name="unitNumber" className="border-2 p-2" />

                    <label htmlFor="occupancyDate" className="mb-2">Approx. Date of Occupancy:</label>
                    <input type="date" id="occupancyDate" name="occupancyDate" className="border-2 p-2" />
                </div>
            </fieldset >

            <p className="flex flex mb-4 font-bold">Only persons listed on this application will be permitted to occupy the premises.</p>
            <fieldset id="fieldset-2" className="flex flex-row mb-4">
                <div className="flex flex-col">
                    <div className="flex flex-row mr-4">
                        <label htmlFor="brokenLease" className="mb-2 pr-2 flex items-center">Have you ever broken a lease?</label>
                        <input type="text" id="brokenLease" name="brokenLease" className="border-2 p-2" />

                        <label htmlFor="brokenLeaseReason" className="mb-2 px-2 flex items-center">If so, what was the reason?</label>
                        <input type="text" id="brokenLeaseReason" name="brokenLeaseReason" className="border-2 p-2" />
                    </div>
                    <div className="flex flex-row">
                        <label htmlFor="refusedToPayRent" className="mb-2 pr-2 flex items-center">Have you ever refused to pay rent for any reason?</label>
                        <input type="text" id="refusedToPayRent" name="refusedToPayRent" className="border-2 p-2" />

                        <label htmlFor="filedForBankruptcy" className="mb-2 px-2 flex items-center">Have you ever filed for bankruptcy?</label>
                        <input type="text" id="filedForBankruptcy" name="filedForBankruptcy" className="border-2 p-2" />
                    </div>
                </div>
            </fieldset>
            <button className="border-2 bg-white rounded-md px-2 py-1" onClick={handleAddOccupant}>Add Occupant</button>
            <fieldset id="fieldset-3" className="flex flex-row mb-4">
                <div className="grid grid-cols-4 gap-4">
                    <div>
                        <h2 className="mb-2">First name, initial, Last name (Tenants to occupy the unit)</h2>
                        <input type="text" id="tenant1Name" name="tenant1Name" className="border-2 p-2" />
                        <input type="text" id="tenant2Name" name="tenant2Name" className="border-2 p-2" />
                        <input type="text" id="tenant3Name" name="tenant3Name" className="border-2 p-2" />
                        <input type="text" id="tenant4Name" name="tenant4Name" className="border-2 p-2" />
                        <input type="text" id="tenant5Name" name="tenant5Name" className="border-2 p-2" />
                        {occupantCount.map((div, index) => {
                            return <input key={index} type="text" id={`tenant${div + 5}Name`} name={`tenant${div + 5}Name`} className="border-2 p-2" />
                        })}
                    </div>
                    <div>
                        <h2 className="mb-2">Relationship</h2>
                        <input type="text" id="tenant1Relationship" name="tenant1Relationship" className="border-2 p-2" />
                        <input type="text" id="tenant2Relationship" name="tenant2Relationship" className="border-2 p-2" />
                        <input type="text" id="tenant3Relationship" name="tenant3Relationship" className="border-2 p-2" />
                        <input type="text" id="tenant4Relationship" name="tenant4Relationship" className="border-2 p-2" />
                        <input type="text" id="tenant5Relationship" name="tenant5Relationship" className="border-2 p-2" />
                        {occupantCount.map((div, index) => {
                            return <input key={index} type="text" id={`tenant${div + 5}Relationship`} name={`tenant${div + 5}Relationship`} className="border-2 p-2" />
                        })}
                    </div>
                    <div>
                        <h2 className="mb-2">Age</h2>
                        <input type="number" id="tenant1Age" name="tenant1Age" className="border-2 p-2" />
                        <input type="number" id="tenant2Age" name="tenant2Age" className="border-2 p-2" />
                        <input type="number" id="tenant3Age" name="tenant3Age" className="border-2 p-2" />
                        <input type="number" id="tenant4Age" name="tenant4Age" className="border-2 p-2" />
                        <input type="number" id="tenant5Age" name="tenant5Age" className="border-2 p-2" />
                        {occupantCount.map((div, index) => {
                            return <input key={index} type="number" id={`tenant${div + 5}Age`} name={`tenant${div + 5}Age`} className="border-2 p-2" />
                        })}
                    </div>
                    <div>
                        <h2 className="mb-2">Email address</h2>
                        <input type="email" id="tenant1Email" name="tenant1Email" className="border-2 p-2" />
                        <input type="email" id="tenant2Email" name="tenant2Email" className="border-2 p-2" />
                        <input type="email" id="tenant3Email" name="tenant3Email" className="border-2 p-2" />
                        <input type="email" id="tenant4Email" name="tenant4Email" className="border-2 p-2" />
                        <input type="email" id="tenant5Email" name="tenant5Email" className="border-2 p-2" />
                        {occupantCount.map((div, index) => {
                            return <input key={index} type="email" id={`tenant${div + 5}Email`} name={`tenant${div + 5}Email`} className="border-2 p-2" />
                        })}
                    </div>
                </div>
            </fieldset>

            <fieldset id="fieldset-4" className="flex flex-row mb-4">
                <label htmlFor="firstChoice" className="flex items-center mb-2 mr-2">Apartment/Townhouse 1st Choice:</label>
                <input type="text" id="firstChoice" name="firstChoice" className="border-2 p-2" />

                <label htmlFor="secondChoice" className="flex items-center mb-2 mx-2">2nd Choice:</label>
                <input type="text" id="secondChoice" name="secondChoice" className="border-2 p-2" />

                <label htmlFor="monthlyRental" className="flex items-center mx-2">Monthly Rental:</label>
                <input type="text" id="monthlyRental" name="monthlyRental" className="border-2 p-2" />
            </fieldset>
            <fieldset id="fieldset-5" className="flex flex-row mb-4">
                <div className="flex flex-col">
                    <div className="flex flex-row">
                        <label htmlFor="vehicle1" className="mb-2 mr-2">Vehicle #1:</label>
                        <input type="text" id="vehicle1" name="vehicle1" className="border-2 p-2" />
                    </div>

                    <div className="flex flex-row">
                        <label htmlFor="vehicle2" className="mb-2 mr-2">Vehicle #2:</label>
                        <input type="text" id="vehicle2" name="vehicle2" className="border-2 p-2" />
                    </div>

                    <div className="flex flex-row">
                        <label htmlFor="vehicle3" className="mb-2 mr-2">Vehicle #3:</label>
                        <input type="text" id="vehicle3" name="vehicle3" className="border-2 p-2" />
                    </div>
                </div>
            </fieldset>
            <div className="flex flex-row my-2">
                <button onClick={addTenantDiv} className="border-2 bg-white rounded-md px-2 py-1">Add Tenant</button>
            </div>
            <fieldset id="fieldset-6" className="flex flex-row mb-4">
                <div id="tenants-container" className="grid grid-cols-2 gap-4">
                    <div className="grid grid-rows-8">
                        <h2 className="mb-2">Tenant 1</h2>
                        <div className="flex items-center justify-center gap-x-2">
                            <label htmlFor="tenant1Fullname" className="flex flex-col mb-2">First Name, Initial, Last Name:</label>
                            <input type="text" id="tenant1Fullname" name="tenant1Fullname" className="flex flex-col border-2 p-2" />
                        </div>
                        <div className="flex items-center justify-center gap-x-2">
                            <label htmlFor="tenant1Occupation" className="flex flex-col mb-2">Occupation:</label>
                            <input type="text" id="tenant1Occupation" name="tenant1Occupation" className="flex flex-col border-2 p-2" />
                        </div>
                        <div className="flex items-center justify-center gap-x-2">
                            <label htmlFor="tenant1EmploymentType" className="mb-2">Full or Part Time:</label>
                            <input type="text" id="tenant1EmploymentType" name="tenant1EmploymentType" className="border-2 p-2" />
                        </div>
                        <div className="flex items-center justify-center gap-x-2">
                            <label htmlFor="tenant1Employer" className="mb-2">Employed by:</label>
                            <input type="text" id="tenant1Employer" name="tenant1Employer" className="border-2 p-2" />
                        </div>
                        <div className="flex items-center justify-center gap-x-2">
                            <label htmlFor="tenant1EmployerAddress" className="mb-2">Address:</label>
                            <input type="text" id="tenant1EmployerAddress" name="tenant1EmployerAddress" className="border-2 p-2" />
                        </div>
                        <div className="flex items-center justify-center gap-x-2">
                            <label htmlFor="tenant1EmploymentDuration" className="mb-2">How Long?</label>
                            <input type="text" id="tenant1EmploymentDuration" name="tenant1EmploymentDuration" className="border-2 p-2" />
                        </div>
                        <div className="flex items-center justify-center gap-x-2">
                            <label htmlFor="tenant1AnnualIncome" className="mb-2">Annual Income?</label>
                            <input type="text" id="tenant1AnnualIncome" name="tenant1AnnualIncome" className="border-2 p-2" />
                        </div>
                        <div className="flex items-center justify-center gap-x-2">
                            <label htmlFor="tenant1BusinessTelephone" className="mb-2">Business Telephone:</label>
                            <input type="tel" id="tenant1BusinessTelephone" name="tenant1BusinessTelephone" className="border-2 p-2" />
                        </div>
                        <div className="flex items-center justify-center gap-x-2">
                            <label htmlFor="tenant1Bank" className="mb-2">Bank:</label>
                            <input type="text" id="tenant1Bank" name="tenant1Bank" className="border-2 p-2" />
                        </div>
                        <div className="flex items-center justify-center gap-x-2">
                            <label htmlFor="tenant1BankBranch" className="mb-2">Branch:</label>
                            <input type="text" id="tenant1BankBranch" name="tenant1BankBranch" className="border-2 p-2" />
                        </div>
                    </div>
                    <div className="grid grid-rows-8">
                        <h2 className="mb-2">Tenant 2</h2>
                        <div className="flex items-center justify-center gap-x-2">
                            <label htmlFor="tenant2Fullname" className="flex flex-col mb-2">First Name, Initial, Last Name:</label>
                            <input type="text" id="tenant2Fullname" name="tenant2Fullname" className="flex flex-col border-2 p-2" />
                        </div>
                        <div className="flex items-center justify-center gap-x-2">
                            <label htmlFor="tenant2Occupation" className="flex flex-col mb-2">Occupation:</label>
                            <input type="text" id="tenant2Occupation" name="tenant2Occupation" className="flex flex-col border-2 p-2" />
                        </div>
                        <div className="flex items-center justify-center gap-x-2">
                            <label htmlFor="tenant2EmploymentType" className="mb-2">Full or Part Time:</label>
                            <input type="text" id="tenant2EmploymentType" name="tenant2EmploymentType" className="border-2 p-2" />
                        </div>
                        <div className="flex items-center justify-center gap-x-2">
                            <label htmlFor="tenant2Employer" className="mb-2">Employed by:</label>
                            <input type="text" id="tenant2Employer" name="tenant2Employer" className="border-2 p-2" />
                        </div>
                        <div className="flex items-center justify-center gap-x-2">
                            <label htmlFor="tenant2EmployerAddress" className="mb-2">Address:</label>
                            <input type="text" id="tenant2EmployerAddress" name="tenant2EmployerAddress" className="border-2 p-2" />
                        </div>
                        <div className="flex items-center justify-center gap-x-2">
                            <label htmlFor="tenant2EmploymentDuration" className="mb-2">How Long?</label>
                            <input type="text" id="tenant2EmploymentDuration" name="tenant2EmploymentDuration" className="border-2 p-2" />
                        </div>
                        <div className="flex items-center justify-center gap-x-2">
                            <label htmlFor="tenant2AnnualIncome" className="mb-2">Annual Income?</label>
                            <input type="text" id="tenant2AnnualIncome" name="tenant2AnnualIncome" className="border-2 p-2" />
                        </div>
                        <div className="flex items-center justify-center gap-x-2">
                            <label htmlFor="tenant2BusinessTelephone" className="mb-2">Business Telephone:</label>
                            <input type="tel" id="tenant2BusinessTelephone" name="tenant2BusinessTelephone" className="border-2 p-2" />
                        </div>
                        <div className="flex items-center justify-center gap-x-2">
                            <label htmlFor="tenant2Bank" className="mb-2">Bank:</label>
                            <input type="text" id="tenant2Bank" name="tenant2Bank" className="border-2 p-2" />
                        </div>
                        <div className="flex items-center justify-center gap-x-2">
                            <label htmlFor="tenant2BankBranch" className="mb-2">Branch:</label>
                            <input type="text" id="tenant2BankBranch" name="tenant2BankBranch" className="border-2 p-2" />
                        </div>
                    </div>
                    {tenantCount.map((div, index) => (
                        <div key={index} className="grid grid-rows-8">
                            <h2 className="mb-2">Tenant {div + 2}</h2>
                            <div className="flex items-center justify-center gap-x-2">
                                <label htmlFor={`tenant${div + 2}Fullname`} className="flex flex-col mb-2">First Name, Initial, Last Name:</label>
                                <input type="text" id={`tenant${div + 2}Fullname`} name={`tenant${div + 2}Fullname`} className="flex flex-col border-2 p-2" />
                            </div>
                            <div className="flex items-center justify-center gap-x-2">
                                <label htmlFor={`tenant${div + 2}Occupation`} className="flex flex-col mb-2">Occupation:</label>
                                <input type="text" id={`tenant${div + 2}Occupation`} name={`tenant${div + 2}Occupation`} className="flex flex-col border-2 p-2" />
                            </div>
                            <div className="flex items-center justify-center gap-x-2">
                                <label htmlFor={`tenant${div + 2}EmploymentType`} className="mb-2">Full or Part Time:</label>
                                <input type="text" id={`tenant${div + 2}EmploymentType`} name={`tenant${div + 2}EmploymentType`} className="border-2 p-2" />
                            </div>
                            <div className="flex items-center justify-center gap-x-2">
                                <label htmlFor={`tenant${div + 2}Employer`} className="mb-2">Employed by:</label>
                                <input type="text" id={`tenant${div + 2}Employer`} name={`tenant${div + 2}Employer`} className="border-2 p-2" />
                            </div>
                            <div className="flex items-center justify-center gap-x-2">
                                <label htmlFor={`tenant${div + 2}EmployerAddress`} className="mb-2">Address:</label>
                                <input type="text" id={`tenant${div + 2}EmployerAddress`} name={`tenant${div + 2}EmployerAddress`} className="border-2 p-2" />
                            </div>
                            <div className="flex items-center justify-center gap-x-2">
                                <label htmlFor={`tenant${div + 2}EmploymentDuration`} className="mb-2">How Long?</label>
                                <input type="text" id={`tenant${div + 2}EmploymentDuration`} name={`tenant${div + 2}EmploymentDuration`} className="border-2 p-2" />
                            </div>
                            <div className="flex items-center justify-center gap-x-2">
                                <label htmlFor={`tenant${div + 2}AnnualIncome`} className="mb-2">Annual Income?</label>
                                <input type="text" id={`tenant${div + 2}AnnualIncome`} name={`tenant${div + 2}AnnualIncome`} className="border-2 p-2" />
                            </div>
                            <div className="flex items-center justify-center gap-x-2">
                                <label htmlFor={`tenant${div + 2}BusinessTelephone`} className="mb-2">Business Telephone:</label>
                                <input type="tel" id={`tenant${div + 2}BusinessTelephone`} name={`tenant${div + 2}BusinessTelephone`} className="border-2 p-2" />
                            </div>
                            <div className="flex items-center justify-center gap-x-2">
                                <label htmlFor={`tenant${div + 2}Bank`} className="mb-2">Bank:</label>
                                <input type="text" id={`tenant${div + 2}Bank`} name={`tenant${div + 2}Bank`} className="border-2 p-2" />
                            </div>
                            <div className="flex items-center justify-center gap-x-2">
                                <label htmlFor={`tenant${div + 2}BankBranch`} className="mb-2">Branch:</label>
                                <input type="text" id={`tenant${div + 2}BankBranch`} name={`tenant${div + 2}BankBranch`} className="border-2 p-2" />
                            </div>
                        </div>
                    ))}
                </div>
            </fieldset>
            <fieldset id="fieldset-7" className="flex flex-row mb-4">
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <h2 className="mb-2">Personal Reference</h2>
                        <div className="flex items-center justify-center gap-x-2">
                            <label htmlFor="personalRef1Name" className="flex flex-col mb-2">Name:</label>
                            <input type="text" id="personalRef1Name" name="personalRef1Name" className="flex flex-col border-2 p-2" />
                        </div>
                        <div className="flex items-center justify-center gap-x-2">
                            <label htmlFor="personalRef1Address" className="mb-2">Address:</label>
                            <input type="text" id="personalRef1Address" name="personalRef1Address" className="border-2 p-2" />
                        </div>
                        <div className="flex items-center justify-center gap-x-2">
                            <label htmlFor="personalRef1Telephone" className="mb-2">Telephone:</label>
                            <input type="text" id="personalRef1Telephone" name="personalRef1Telephone" className="border-2 p-2" />
                        </div>
                        <div className="flex items-center justify-center gap-x-2">
                            <label htmlFor="personalRef1Relationship" className="mb-2">Relationship:</label>
                            <input type="text" id="personalRef1Relationship" name="personalRef1Relationship" className="border-2 p-2" />
                        </div>
                        <div className="flex items-center justify-center gap-x-2">
                            <label htmlFor="personalRef1HowLong" className="mb-2">How Long?</label>
                            <input type="text" id="personalRef1HowLong" name="personalRef1HowLong" className="border-2 p-2" />
                        </div>
                    </div>
                    <div>
                        <h2 className="mb-2">Professional (e.g. attorney, doctor)</h2>
                        <div className="flex items-center justify-center gap-x-2">
                            <label htmlFor="personalRef2Name" className="flex flex-col mb-2">Name:</label>
                            <input type="text" id="personalRef2Name" name="personalRef2Name" className="flex flex-col border-2 p-2" />
                        </div>
                        <div className="flex items-center justify-center gap-x-2">
                            <label htmlFor="personalRef2Address" className="mb-2">Address:</label>
                            <input type="text" id="personalRef2Address" name="personalRef2Address" className="border-2 p-2" />
                        </div>
                        <div className="flex items-center justify-center gap-x-2">
                            <label htmlFor="personalRef2Telephone" className="mb-2">Telephone:</label>
                            <input type="text" id="personalRef2Telephone" name="personalRef2Telephone" className="border-2 p-2" />
                        </div>
                        <div className="flex items-center justify-center gap-x-2">
                            <label htmlFor="personalRef2Relationship" className="mb-2">Relationship:</label>
                            <input type="text" id="personalRef2Relationship" name="personalRef2Relationship" className="border-2 p-2" />
                        </div>
                        <div className="flex items-center justify-center gap-x-2">
                            <label htmlFor="personalRef2HowLong" className="mb-2">How Long?</label>
                            <input type="text" id="personalRef2HowLong" name="personalRef2HowLong" className="border-2 p-2" />
                        </div>
                    </div>

                    <div>
                        <h2 className="mb-2">Current Landlord/Superintendent/Owner/Mortgage Company</h2>
                        <div className="flex items-center justify-center gap-x-2">
                            <label htmlFor="personalRef3Name" className="flex flex-col mb-2">Name:</label>
                            <input type="text" id="personalRef3Name" name="personalRef3Name" className="flex flex-col border-2 p-2" />
                        </div>
                        <div className="flex items-center justify-center gap-x-2">
                            <label htmlFor="personalRef3Address" className="mb-2">Address:</label>
                            <input type="text" id="personalRef3Address" name="personalRef3Address" className="border-2 p-2" />
                        </div>
                        <div className="flex items-center justify-center gap-x-2">
                            <label htmlFor="personalRef3Telephone" className="mb-2">Telephone:</label>
                            <input type="text" id="personalRef3Telephone" name="personalRef3Telephone" className="border-2 p-2" />
                        </div>
                    </div>
                </div>
            </fieldset>
            <fieldset id="fieldset-8" className="flex flex-row mb-4">
                <div className="flex flex-col">
                    <label htmlFor="emergencyContactName" className="mb-2">Emergency Contact Name:</label>
                    <input type="text" id="emergencyContactName" name="emergencyContactName" className="border-2 p-2" />

                    <label htmlFor="emergencyContactAddress" className="mb-2">Address:</label>
                    <input type="text" id="emergencyContactAddress" name="emergencyContactAddress" className="border-2 p-2" />

                    <label htmlFor="emergencyContactTelephone" className="mb-2">Phone number:</label>
                    <input type="text" id="emergencyContactTelephone" name="emergencyContactTelephone" className="border-2 p-2" />
                </div>
            </fieldset>
            <fieldset id="fieldset-9" className="flex flex-row mb-4">
                <div className="flex flex-col gap-y-4">
                    <div className="flex">
                        <p className="text-left">Do you give management permission to contact the personal or professional references listed above, both now and in the
                            future for rental consideration or for collection purposes should they be deemed necessary?</p>

                        <input type="text" placeholder="Yes or No" id="permissionContactReferences" name="permissionContactReferences" className="border-2 p-2" />
                    </div>

                    <div className="flex">
                        <p className="text-left">Thank you for completing an application to rent from us. Please sign below. Also note that a completed application requires
                            submission of the following documents which will be copied and attached to this application.</p>
                    </div>

                    <div className="grid grid-rows-3">
                        <div className="flex items-start items-center gap-x-2">
                            <label htmlFor="driversLicenseOrSin">Driver’s License or Social Insurance Number:</label>
                            <input type="checkbox" onChange={handleIsUploadingID} name="driversLicenseOrSin" />

                            {isUploadingID && <input name="driversLicenseOrSinUpload" type="file" />}
                        </div>

                        <div className="flex items-start items-center gap-x-2">
                            <label htmlFor="payStubs">Two weeks of the most current pay stubs of each income source listed:</label>
                            <input type="checkbox" onChange={handleIsUploadingPayStubs} name="payStubs" />

                            {isUploadingPayStubs && <input name="payStubsUpload" type="file" />}
                        </div>
                        <div className="flex items-start items-center gap-x-2">
                            <label htmlFor="taxReturn">If self-employed, most current tax return as proof of income.</label>
                            <input type="checkbox" onChange={handleIsUploadingTaxReturn} name="taxReturn" />

                            {isUploadingTaxReturn && <input name="taxReturnUpload" type="file" />}
                        </div>
                    </div>
                </div>
            </fieldset>
            <fieldset id="fieldset-10" className="flex flex-row mb-4">
                <p className="text-left">The applicant offers to lease the said townhouse and hereby agrees to pay the sum of $ <input type="number" name="holdingFee" className="border-2" /> as a holding fee on the
                    understanding that if the offer is accepted the fee shall be retained by the landlord or his agent as a Security Deposit during
                    the tenancy of the premises and will be refunded at termination of the tenancy pursuant to the Residential Tenancies Act
                    provided all the covenants of the Lease Agreement have been complied with and that the premises are left in a proper state of
                    cleanliness and repair, reasonable wear and tear excepted, AND, if the offer is not accepted, the full deposit will be refunded,
                    PROVIDED HOWEVER, that if on notification of the offer the Tenant fails to execute the lease the said fee shall forthwith be
                    forfeited and retained by the Landlord or his agent.</p>
            </fieldset>
            <fieldset id="fieldset-11" className="flex flex-row mb-4 items-center gap-x-2">
                <label htmlFor="applicantSignature" className="mb-2">Signature:</label>
                <input type="text" id="applicantSignature" name="applicantSignature" className="border-2 p-2" />

                {/* Done on Office side
                        <label htmlFor="leasingAgentSignature" className="mb-2">Leasing Agent Signature:</label>
                        <input type="text" id="applicantSignature" name="applicantSignature" className="border-2 p-2" /> */}
            </fieldset>

            <button type="submit" className="border-2 px-4">Submit</button></>
    )
};