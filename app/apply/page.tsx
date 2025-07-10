'use client'

import { useEffect, useState } from "react";
import { Poppins } from "next/font/google";
import { postRequest } from "@/lib/fetch";
import Image from "next/image";

const p300 = Poppins({ subsets: ["latin"], weight: "300" });
const p400 = Poppins({ subsets: ["latin"], weight: "400" });
const r300 = Poppins({ subsets: ["latin"], weight: "300" });
const r400 = Poppins({ subsets: ["latin"], weight: "400" });
const r600 = Poppins({ subsets: ["latin"], weight: "600" });

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

type Reference = {
    name: FormDataEntryValue | null;
    relationship: FormDataEntryValue | null;
    address: FormDataEntryValue | null;
    telephone: FormDataEntryValue | null;
    howLong: FormDataEntryValue | null;
}


const RentalApplicationForm = () => {
    const [showMainForm, setShowMainForm] = useState(false);
    const handleKivotosRegistration = () => {
        const kivotosAccountCreation = document.getElementById("kivotosAccountCreation") as HTMLDivElement;

        const kivotosEmail = document.getElementById("kivotosEmail") as HTMLInputElement;
        const kivotosPassword = document.getElementById("kivotosPassword") as HTMLInputElement;
        if ((kivotosEmail && kivotosPassword && kivotosEmail.value != "" && kivotosPassword.value != "" && kivotosEmail.validity.valid)) {
            kivotosAccountCreation.classList.toggle("hidden");
            document.getElementById("login-logo")?.classList.toggle("hidden");
            document.getElementById("aspect")?.remove()
            document.getElementById("application-form")?.style.setProperty("width", "100%");

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
    const maxOccupants = 7; // Set the maximum number tenants - 5 (for the initial 5 Occupants)

    const [tenantCount, setTenantCount] = useState<number[]>([]);
    const maxTenants = 7; // Set the maximum number tenants - 2 (for the initial 2 tenants)

    const submitApplication = async (formData: FormData) => {
        let tenants: TenantType[] = [];
        let occupants: OccupantType[] = [];
        let personal: Reference[] = [];
        let professional: Reference[] = [];
        let references = {
            personal: personal,
            professional: professional
        }

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

        const personalRef1: Reference = {
            name: formData.get('personalRef1Name'),
            relationship: formData.get('personalRef1Relationship'),
            address: formData.get('personalRef1Address'),
            telephone: formData.get('personalRef1Telephone'),
            howLong: formData.get('personalRef1HowLong'),
        }

        const personalRef2: Reference = {
            name: formData.get('personalRef2Name'),
            relationship: formData.get('personalRef2Relationship'),
            address: formData.get('personalRef2Address'),
            telephone: formData.get('personalRef2Telephone'),
            howLong: formData.get('personalRef2HowLong'),
        }

        const professionalRef1: Reference = {
            name: formData.get('professionalRef1Name'),
            relationship: formData.get('professionalRef1Relationship'),
            address: formData.get('professionalRef1Address'),
            telephone: formData.get('professionalRef1Telephone'),
            howLong: formData.get('professionalRef1HowLong'),
        }

        const professionalRef2: Reference = {
            name: formData.get('professionalRef2Name'),
            relationship: formData.get('professionalRef2Relationship'),
            address: formData.get('professionalRef2Address'),
            telephone: formData.get('professionalRef2Telephone'),
            howLong: formData.get('professionalRef2HowLong'),
        }

        personal.push(personalRef1, personalRef2);
        professional.push(professionalRef1, professionalRef2);

        formData.append('tenants', JSON.stringify(tenants));
        formData.append('occupantsData', JSON.stringify(occupants));
        formData.append('references', JSON.stringify(references));

        fetch("/api/application/submit", {
            method: "POST",
            body: formData,
            credentials: "include",
        }).then((res) => res.json())
            .then((data) => {
                if (data.error) return console.warn(data.error);
                setShowMainForm(false);
                setSuccessMessage(data.message);
                setShowSuccess(true);

                setTimeout(() => {
                    location.replace("/")
                }, 2000)
            })
    }

    const [ranOnce, setRanceOnce] = useState(false);
    useEffect(() => {
        if (ranOnce) return;
        const isMdScreen = window.matchMedia('(min-width: 768px)').matches;
        if (isMdScreen) {
            const mobileInputs = document.getElementById("mobile-inputs") as HTMLInputElement;
            if (mobileInputs) mobileInputs.remove();
            setRanceOnce(true);
            // Perform action for screens wider than or equal to 768px
        } else {
            const computerInputs = document.getElementById("computer-inputs") as HTMLInputElement;
            if (computerInputs) computerInputs.remove();
            setRanceOnce(true);
            // Perform action for screens smaller than 768px
        }
    })

    return (
        <>

            {!showSuccess && (
                <>
                    <div className={(showMainForm ? "bg-custom-gradient-1 md:bg-custom-gradient-1 h-full w-full flex items-center" : "bg-[#1c2932] md:bg-custom-gradient-1 h-full w-full flex items-center")}>
                        {/* shadow-[rgba(0,0,0,0.2)_3rem_3rem_30px_0px] */}
                        <form id="application-form" action={submitApplication} className="relative h-full md:h-auto w-full md:w-2/3 md:mx-auto md:shadow-[rgba(0,0,0,0.2)_3rem_3rem_30px_0px]">
                            <div id="aspect" className="hidden md:block aspect-w-16 aspect-h-9">
                                <Image id="login-logo" objectFit="cover" layout="fill" className="w-full h-full" src="/login-logo.png" alt="Description" />
                            </div>
                            <div id="kivotosAccountCreation" className="absolute inset-0 flex flex-row justify-center">
                                {/* Mobile */}
                                <div id="mobile-inputs" className="flex flex-col mt-8 md:mt-0 md:hidden">
                                    <h1 className={"flex flex-row text-white text-2xl " + p400.className}>Create an Account</h1>
                                    <p className={"flex flex-row w-4/5 text-white text-xs mt-4 " + p300.className} >Please enter an email and create a password to continue.</p>

                                    <div className="flex flex-row mt-6">
                                        <div className="w-full">
                                            <div className="flex flex-row bg-[#101D26] rounded-t-md items-center px-2 h-12">
                                                <div className="flex flex-col w-1/5 p-2">
                                                    <Image height={24} width={24} src="/icons/Mail.png" alt="" />
                                                </div>
                                                <div className="flex flex-col justify-center">
                                                    <label htmlFor="kivotosEmail" className={"text-white text-xs " + r400.className}>Email Address</label>
                                                    <input className={"w-full bg-[#101D26] text-white text-xs underline decoration-slate-500 " + r300.className} type="text" name="kivotosEmail" id="kivotosEmail" placeholder="Your email address..." />
                                                </div>
                                            </div>
                                            <div className="flex flex-row bg-white rounded-b-md items-center px-2 h-12">
                                                <div className="flex flex-col w-1/5 p-2">
                                                    <Image width={24} height={24} className="h-auto" src="/icons/Lock.png" alt="" />

                                                </div>
                                                <div className="flex flex-col justify-cente">
                                                    <label htmlFor="kivotosPassword" className={"text-[#101D26] text-xs " + r400.className}>Password</label>
                                                    <input className={"w-full text-[#101D26] text-xs underline decoration-slate-500 " + r300.className} type="password" name="kivotosPassword" id="kivotosPassword" placeholder="Your password..." />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <p id="error-msg" className="flex flex-row hidden text-red-500 mt-2"></p>
                                    <div className={"flex flex-row w-full items-center text-white text-sm mt-4 " + r400.className} >
                                        <div className="flex items-center">
                                            <input readOnly checked className="accent-white" type="checkbox" name="remember" id="remember" />
                                            <label htmlFor="remember" className="ml-2 text-xs">You&apos;re Remembered</label>
                                        </div>
                                    </div>
                                    <div className={"flex flex-row gap-x-4 mt-6 text-white text-xs items-center  " + r400.className}>
                                        <button id="registerButton" type="button" onClick={handleKivotosRegistration} className={"bg-[#73ACC9] text-[#101D26] text-xs w-24 h-8 rounded-sm " + r300.className}>Next</button>
                                    </div>
                                </div>
                                {/* End Mobile */}
                                <div id="computer-inputs" className="hidden md:flex flex-col w-[45%] p-8">
                                    <h1 className={"flex flex-row text-white text-2xl " + p400.className}>Create an Account</h1>
                                    <p className={"flex flex-row w-4/5 text-white text-xs mt-4 " + p300.className} >Please enter an email and create a password to continue.</p>

                                    <div className="flex flex-row mt-6">
                                        <div className="w-full">
                                            <div className="flex flex-row bg-[#101D26] rounded-t-md items-center px-2 h-12">
                                                <div className="flex flex-col w-1/5 p-2">
                                                    <Image height={24} width={24} src="/icons/Mail.png" alt="" />
                                                </div>
                                                <div className="flex flex-col justify-center">
                                                    <label htmlFor="kivotosEmail" className={"text-white text-xs " + r400.className}>Email Address</label>
                                                    <input className={"w-full bg-[#101D26] text-white text-xs underline decoration-slate-500 " + r300.className} required type="email" name="kivotosEmail" id="kivotosEmail" placeholder="Your email address..." />
                                                </div>
                                            </div>
                                            <div className="flex flex-row bg-white rounded-b-md items-center px-2 h-12">
                                                <div className="flex flex-col w-1/5 p-2">
                                                    <Image width={24} height={24} className="h-auto" src="/icons/Lock.png" alt="" />

                                                </div>
                                                <div className="flex flex-col justify-cente">
                                                    <label htmlFor="kivotosPassword" className={"text-[#101D26] text-xs " + r400.className}>Password</label>
                                                    <input className={"w-full text-[#101D26] text-xs underline decoration-slate-500 " + r300.className} required type="password" name="kivotosPassword" id="kivotosPassword" placeholder="Your password..." />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <p id="error-msg" className="flex flex-row hidden text-red-500 mt-2"></p>
                                    <div className={"flex flex-row w-full items-center text-white text-sm mt-4 " + r400.className} >
                                        <div className="flex items-center">
                                            <input readOnly checked className="accent-white" type="checkbox" name="remember" id="remember" />
                                            <label htmlFor="remember" className="ml-2 text-xs">You&apos;re Remembered</label>
                                        </div>
                                        <a href="#" className="ml-auto text-xs">Forgot Password?</a>
                                    </div>
                                    <div className={"flex flex-row gap-x-4 mt-6 text-white text-xs items-center  " + r400.className}>
                                        <button id="registerButton" type="button" onClick={handleKivotosRegistration} className={"bg-[#73ACC9] text-[#101D26] text-xs w-24 h-8 rounded-sm " + r300.className}>Next</button>
                                    </div>
                                </div>
                                <div className="hidden md:flex flex-col w-[55%]"></div>
                            </div>
                            {showMainForm && <MainApplicationForm tenantCount={tenantCount} setTenantCount={setTenantCount} maxTenants={maxTenants} occupantCount={occupantCount} setOccupantCount={setOccupantCount} maxOccupants={maxOccupants} />}
                        </form>
                    </div>
                </>
            )}

            {showSuccess && (
                <div className="bg-custom-gradient-1 h-full w-full">
                    <h1>{successMessage}</h1>
                </div>
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
        <div className="overflow-y-auto min-h-screen md:h-[85vh] w-screen md:w-auto px-0 md:p-16">
            <div className="text-white p-4">
                <h1 className={"text-2xl md:text-4xl font-bold mb-2 " + r600.className}>Rental Application Form</h1>
                <p className={"text-lg mb-4 " + p300.className}>Incomplete Applications will not be processed.</p>
            </div>

            <fieldset id="fieldset-1" className="rounded-md flex flex-row mb-4 bg-[#A09D8F] py-10 px-8 md:px-16">
                <div className="flex flex-col">
                    <div className="flex border-b-[1px] border-[#6C6B62] mb-2 flex-row text-white">
                        <div>
                            <h1 className={"text-3xl md:text-4xl font-bold mb-2 " + r600.className}>General Information</h1>
                            <p className={"text-lg mb-4 " + p300.className}><span className="text-red-500">*</span> All of the fields are required</p>
                        </div>
                    </div>
                    <div className={"grid grid-cols-2 gap-y-2 md:grid-cols-4 gap-x-6 text-white text-sm " + r400.className}>
                        <div>
                            <label htmlFor="name" className="mb-2">Name:</label>
                            <input type="text" id="name" name="name" className="bg-[#868374] p-2 w-full" />
                        </div>

                        <div>
                            <label htmlFor="birthdate" className="mb-2">Birth date:</label>
                            <input type="date" id="birthdate" name="birthdate" className="bg-[#868374] p-2 w-full" />
                        </div>

                        <div>
                            <label htmlFor="driverLicense" className="mb-2">Driver’s License No:</label>
                            <input type="text" id="driverLicense" name="driverLicense" className="bg-[#868374] p-2 w-full" />
                        </div>

                        <div>
                            <label htmlFor="telephone" className="mb-2">Telephone No.:</label>
                            <input type="tel" id="telephone" name="telephone" className="bg-[#868374] p-2 w-full" />
                        </div>

                        <div>
                            <label htmlFor="presentAddress" className="mb-2">Present Address:</label>
                            <input type="text" id="presentAddress" name="presentAddress" className="bg-[#868374] p-2 w-full" />
                        </div>


                        <div>
                            <label htmlFor="email" className="mb-2">Email address:</label>
                            <input type="email" id="email" name="email" className="bg-[#868374] p-2 w-full" />
                        </div>

                        <div>
                            <label htmlFor="howLong" className="mb-2">How Long?</label>
                            <input type="text" id="howLong" name="howLong" className="bg-[#868374] p-2 w-full" />
                        </div>

                        <div>
                            <label htmlFor="property">Select Property</label>
                            <select name="property" id="property" className="bg-[#868374] p-2 w-full" defaultValue={"theArborVictorianLiving"}>
                                <option value="theArborVictorianLiving">The Arbor Victorian Living</option>
                                <option value="arborVitaliaCourtyard">Arbor Vitalia Courtyard</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="residenceType" className="mb-2">Residence Type</label>
                            <select
                                id="residenceType"
                                className="bg-[#868374] p-2 w-full"
                                defaultValue={"Home"}
                                name="residenceType"
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
                                defaultValue={"Home"}
                                name="ownershipType"
                            >
                                <option value="Own">Own</option>
                                <option value="Rent">Rent</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="maritalStatus" className="mb-2">Marital Status:</label>
                            <input type="text" id="maritalStatus" name="maritalStatus" className="bg-[#868374] p-2 w-full" />
                        </div>

                        <div>
                            <label htmlFor="presentRental" className="mb-2">Present Rental ($):</label>
                            <input type="text" id="presentRental" name="presentRental" className="bg-[#868374] p-2 w-full" />
                        </div>
                    </div>
                    <div className={"grid grid-cols-2 md:grid-cols-4 gap-y-2 border-t-[1px] border-[#6C6B62] mt-8 gap-x-6 pt-2 text-white text-sm " + r400.className}>
                        <div>
                            <label htmlFor="occupants" className="mb-2">Number of Persons to Occupy Unit:</label>
                            <input type="number" id="occupants" name="occupants" className="bg-[#868374] p-2 w-full" />
                        </div>
                        <div className="relative">
                            <label htmlFor="occupancyDate" className="mb-2">Approx. Date of Occupancy:</label>
                            <input type="date" id="occupancyDate" name="occupancyDate" className="bg-[#868374] p-2 w-full absolute bottom-0 left-0 right-0" />
                        </div>
                        <div>
                            <label htmlFor="unitNumber" className="mb-2">The Application for Townhouse/Apartment #:</label>
                            <input type="text" id="unitNumber" name="unitNumber" className="bg-[#868374] p-2 w-full" />
                        </div>
                        <div>
                            <label htmlFor="rentalDuration" className="mb-2">How long do you plan to live in the rental unit?</label>
                            <input type="text" id="rentalDuration" name="rentalDuration" className="bg-[#868374] p-2 w-full" />
                        </div>
                    </div>
                </div>
            </fieldset >

            <fieldset id="fieldset-2" className="rounded-md flex flex-row mb-4 bg-[#A09D8F] py-10 px-8 md:px-16">
                <div className="flex flex-col gap-y-2 text-white">
                    <div className="flex border-b-[1px] border-[#6C6B62] mb-2 flex-row">
                        <div>
                            <h1 className={"text-4xl font-bold mb-2 " + r600.className}>Tenancy</h1>
                            <p className={"text-lg mb-4 " + p300.className}>Only persons listed on this application will be permitted to occupy the premises.</p>
                        </div>
                    </div>
                    <div className={"flex flex-row gap-x-4 text-white text-sm  " + r400.className}>
                        <div className="flex flex-col w-1/2 md:w-1/5">
                            <label htmlFor="brokenLease" className="mb-2 pr-2 flex items-center">Have you ever broken a lease?</label>
                            <input type="text" id="brokenLease" name="brokenLease" className="p-2 bg-[#868374]" />
                        </div>
                        <div className="flex flex-col w-1/2 md:w-4/5 relative">
                            <label htmlFor="brokenLeaseReason" className="mb-2 px-2 flex items-center">If so, what was the reason?</label>
                            <input type="text" id="brokenLeaseReason" name="brokenLeaseReason" className="p-2 bg-[#868374] absolute bottom-0 left-0 right-0" />
                        </div>
                    </div>
                    <div className={"grid grid-cols-2 gap-x-4 mt-2 gap-y-2 text-white text-sm " + r400.className}>
                        <div>
                            <label htmlFor="refusedToPayRent" className="flex items-center">Have you ever refused to pay rent for any reason?</label>
                            <input type="text" id="refusedToPayRent" name="refusedToPayRent" className="bg-[#868374] w-full p-2" />
                        </div>
                        <div className="flex flex-col justify-between h-full">
                            <label htmlFor="filedForBankruptcy" className="flex items-center">Have you ever filed for bankruptcy?</label>
                            <input type="text" id="filedForBankruptcy" name="filedForBankruptcy" className="bg-[#868374] w-full p-2" />
                        </div>
                        <div>
                            <label htmlFor="firstChoice" className="flex items-center">Apartment/Townhouse 1st Choice:</label>
                            <input type="text" id="firstChoice" name="firstChoice" className="bg-[#868374] w-full p-2" />
                        </div>
                        <div>
                            <label htmlFor="secondChoice" className="flex items-center">2nd Choice:</label>
                            <input type="text" id="secondChoice" name="secondChoice" className="bg-[#868374] w-full p-2" />
                        </div>
                        <div>
                            <label htmlFor="monthlyRental" className="flex items-center">Monthly Rental:</label>
                            <input type="text" id="monthlyRental" name="monthlyRental" className="bg-[#868374] w-full p-2" />
                        </div>
                    </div>
                    <h1 className={"text-2xl mt-4 " + r600.className}>Occupants</h1>
                    <div className={"grid grid-cols-1 md:grid-cols-4 gap-x-2 text-sm " + p400.className}>
                        <div className="grid grid-rows gap-y-1">
                            <h2 className={"flex items-center h-12 text-sm " + r300.className}>First name, initial, Last name (Tenants to occupy the unit)</h2>
                            <input type="text" id="tenant1Name" name="tenant1Name" className="bg-[#868374] h-10 p-2" />
                            {occupantCount.map((div, index) => {
                                return <input key={index} type="text" id={`tenant${div + 1}Name`} name={`tenant${div + 1}Name`} className="bg-[#868374] h-10 p-2" />
                            })}
                        </div>
                        <div className="grid grid-rows gap-y-1">
                            <h2 className={"flex items-center h-12 text-sm " + r300.className}>Relationship</h2>
                            <input type="text" id="tenant1Relationship" name="tenant1Relationship" className="bg-[#868374] h-10 p-2" />
                            {occupantCount.map((div, index) => {
                                return <input key={index} type="text" id={`tenant${div + 1}Relationship`} name={`tenant${div + 1}Relationship`} className="bg-[#868374] h-10 p-2" />
                            })}
                        </div>
                        <div className="grid grid-rows gap-y-1">
                            <h2 className={"flex items-center h-12 text-sm " + r300.className}>Age</h2>
                            <input type="number" id="tenant1Age" name="tenant1Age" className="bg-[#868374] h-10 p-2" />
                            {occupantCount.map((div, index) => {
                                return <input key={index} type="number" id={`tenant${div + 1}Age`} name={`tenant${div + 1}Age`} className="bg-[#868374] h-10 p-2" />
                            })}
                        </div>
                        <div className="grid grid-rows gap-y-1">
                            <h2 className={"flex items-center h-12 text-sm " + r300.className}>Email address</h2>
                            <input type="email" id="tenant1Email" name="tenant1Email" className="bg-[#868374] h-10 p-2" />
                            {occupantCount.map((div, index) => {
                                return <input key={index} type="email" id={`tenant${div + 1}Email`} name={`tenant${div + 1}Email`} className="bg-[#868374] h-10 p-2" />
                            })}
                        </div>
                    </div>
                    <div className="mt-2">
                        <button className={"rounded-md text-sm flex flex-row gap-x-2 " + r400.className} onClick={handleAddOccupant}><Image height={20} width={20} src="/icons/Add.png" alt="" /> Add Occupant</button>
                    </div>
                    <h1 className={"text-2xl mt-4 " + r600.className}>Tenants</h1>
                    <div className={"grid grid-cols-1 md:grid-cols-2 gap-x-2 text-sm " + p400.className}>
                        <div className={"grid grid-cols-2 gap-x-4 gap-y-2 text-sm mt-4 " + r400.className}>
                            <h2 className="mb-2 grid col-span-2">Tenant 1</h2>
                            <div className="grid gap-y-1 items-center">
                                <label htmlFor="tenant1Fullname">First Name, Initial, Last Name:</label>
                                <input type="text" id="tenant1Fullname" name="tenant1Fullname" className="w-full bg-[#868374] p-2" />
                            </div>
                            <div className="grid gap-y-1">
                                <label htmlFor="tenant1Occupation">Occupation:</label>
                                <input type="text" id="tenant1Occupation" name="tenant1Occupation" className="w-full bg-[#868374] p-2" />
                            </div>
                            <div className="grid gap-y-1">
                                <label htmlFor="tenant1EmploymentType">Full or Part Time:</label>
                                <input type="text" id="tenant1EmploymentType" name="tenant1EmploymentType" className="w-full bg-[#868374] p-2" />
                            </div>
                            <div className="grid gap-y-1">
                                <label htmlFor="tenant1Employer">Employed by:</label>
                                <input type="text" id="tenant1Employer" name="tenant1Employer" className="w-full bg-[#868374] p-2" />
                            </div>
                            <div className="grid gap-y-1">
                                <label htmlFor="tenant1EmployerAddress">Address:</label>
                                <input type="text" id="tenant1EmployerAddress" name="tenant1EmployerAddress" className="w-full bg-[#868374] p-2" />
                            </div>
                            <div className="grid gap-y-1">
                                <label htmlFor="tenant1EmploymentDuration">How Long?</label>
                                <input type="text" id="tenant1EmploymentDuration" name="tenant1EmploymentDuration" className="w-full bg-[#868374] p-2" />
                            </div>
                            <div className="grid gap-y-1">
                                <label htmlFor="tenant1AnnualIncome">Annual Income?</label>
                                <input type="text" id="tenant1AnnualIncome" name="tenant1AnnualIncome" className="w-full bg-[#868374] p-2" />
                            </div>
                            <div className="grid gap-y-1">
                                <label htmlFor="tenant1BusinessTelephone">Business Telephone:</label>
                                <input type="tel" id="tenant1BusinessTelephone" name="tenant1BusinessTelephone" className="w-full bg-[#868374] p-2" />
                            </div>
                            <div className="grid gap-y-1">
                                <label htmlFor="tenant1Bank">Bank:</label>
                                <input type="text" id="tenant1Bank" name="tenant1Bank" className="w-full bg-[#868374] p-2" />
                            </div>
                            <div className="grid gap-y-1">
                                <label htmlFor="tenant1BankBranch">Branch:</label>
                                <input type="text" id="tenant1BankBranch" name="tenant1BankBranch" className="w-full bg-[#868374] p-2" />
                            </div>
                        </div>
                        {tenantCount.map((div, index) => (
                            <div key={index} className={"grid grid-cols-2 gap-x-4 text-sm mt-4 gap-y-2 " + r400.className}>
                                <h2 className="mb-2 grid col-span-2">Tenant {index + 2}</h2>
                                <div className="grid gap-y-1">
                                    <label htmlFor={`tenant${index + 2}Fullname`}>First Name, Initial, Last Name:</label>
                                    <input type="text" id={`tenant${index + 2}Fullname`} name={`tenant${index + 2}Fullname`} className="w-full bg-[#868374] p-2" />
                                </div>
                                <div className="grid gap-y-1">
                                    <label htmlFor={`tenant${index + 2}Occupation`}>Occupation:</label>
                                    <input type="text" id={`tenant${index + 2}Occupation`} name={`tenant${index + 2}Occupation`} className="w-full bg-[#868374] p-2" />
                                </div>
                                <div className="grid gap-y-1">
                                    <label htmlFor={`tenant${index + 2}EmploymentType`}>Full or Part Time:</label>
                                    <input type="text" id={`tenant${index + 2}EmploymentType`} name={`tenant${index + 2}EmploymentType`} className="w-full bg-[#868374] p-2" />
                                </div>
                                <div className="grid gap-y-1">
                                    <label htmlFor={`tenant${index + 2}Employer`}>Employed by:</label>
                                    <input type="text" id={`tenant${index + 2}Employer`} name={`tenant${index + 2}Employer`} className="w-full bg-[#868374] p-2" />
                                </div>
                                <div className="grid gap-y-1">
                                    <label htmlFor={`tenant${index + 2}EmployerAddress`}>Address:</label>
                                    <input type="text" id={`tenant${index + 2}EmployerAddress`} name={`tenant${index + 2}EmployerAddress`} className="w-full bg-[#868374] p-2" />
                                </div>
                                <div className="grid gap-y-1">
                                    <label htmlFor={`tenant${index + 2}EmploymentDuration`}>How Long?</label>
                                    <input type="text" id={`tenant${index + 2}EmploymentDuration`} name={`tenant${index + 2}EmploymentDuration`} className="w-full bg-[#868374] p-2" />
                                </div>
                                <div className="grid gap-y-1">
                                    <label htmlFor={`tenant${index + 2}AnnualIncome`}>Annual Income?</label>
                                    <input type="text" id={`tenant${index + 2}AnnualIncome`} name={`tenant${index + 2}AnnualIncome`} className="w-full bg-[#868374] p-2" />
                                </div>
                                <div className="grid gap-y-1">
                                    <label htmlFor={`tenant${index + 2}BusinessTelephone`}>Business Telephone:</label>
                                    <input type="tel" id={`tenant${index + 2}BusinessTelephone`} name={`tenant${index + 2}BusinessTelephone`} className="w-full bg-[#868374] p-2" />
                                </div>
                                <div className="grid gap-y-1">
                                    <label htmlFor={`tenant${index + 2}Bank`}>Bank:</label>
                                    <input type="text" id={`tenant${index + 2}Bank`} name={`tenant${index + 2}Bank`} className="w-full bg-[#868374] p-2" />
                                </div>
                                <div className="grid gap-y-1">
                                    <label htmlFor={`tenant${index + 2}BankBranch`}>Branch:</label>
                                    <input type="text" id={`tenant${index + 2}BankBranch`} name={`tenant${index + 2}BankBranch`} className="w-full bg-[#868374] p-2" />
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-2">
                        <button className={"rounded-md text-sm flex flex-row gap-x-2 " + r400.className} onClick={addTenantDiv}><Image height={20} width={20} src="/icons/Add.png" alt="" /> Add Tenant</button>
                    </div>
                </div>
            </fieldset >
            <fieldset id="fieldset-3" className="rounded-md flex flex-row mb-4 bg-[#A09D8F] py-10 px-8 md:px-16">
                <div className={"gap-y-2 gap-x-4 text-white bg-[#A09D8F] grid grid-cols-1 md:grid-cols-2 text-sm " + r400.className}>
                    <div className="grid col-span-1 md:col-span-2 border-b-[1px] border-[#6C6B62] mb-2">
                        <div>
                            <h1 className={"text-4xl font-bold mb-2 " + r600.className}>Vehicles</h1>
                            <p className={"text-lg mb-4 " + p300.className}>Please correctly enter make, model, colour, and year for all vehicles.</p>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="vehicle1" className="flex flex-row">Vehicle #1 (Make, Model, Colour, Year):</label>
                        <input type="text" id="vehicle1" name="vehicle1" className="flex flex-row w-full bg-[#868374] p-2" />
                    </div>

                    <div>
                        <label htmlFor="vehicle2" className="flex flex-row">Vehicle #2 (Make, Model, Colour, Year):</label>
                        <input type="text" id="vehicle2" name="vehicle2" className="flex flex-row w-full bg-[#868374] p-2" />
                    </div>

                    <div>
                        <label htmlFor="vehicle3" className="flex flex-row">Vehicle #3 (Make, Model, Colour, Year):</label>
                        <input type="text" id="vehicle3" name="vehicle3" className="flex flex-row w-full bg-[#868374] p-2" />
                    </div>
                </div>
            </fieldset>
            <fieldset id="fieldset-4" className="rounded-md flex flex-row mb-4 bg-[#A09D8F] py-10 px-8 md:px-16">
                <div className={"gap-y-2 gap-x-4 text-white bg-[#A09D8F] text-sm "}>
                    {/* <div className={"gap-y-2 gap-x-4 text-white bg-[#A09D8F] text-sm " + r400.className}> */}
                    <div className="border-b-[1px] border-[#6C6B62]">
                        <div>
                            <h1 className={"text-4xl font-bold mb-2 " + r600.className}>References</h1>
                            <p className={"text-lg mb-4 " + p300.className}>Please fill out all required fields.</p>
                        </div>
                    </div>

                    <div className={"border-b-[1px] border-[#6C6B62] mb-2 text-md py-4 " + r400.className}>
                        * Personal
                    </div>
                    <div className="relative grid grid-cols-2 md:grid-cols-4 gap-x-4">
                        <div className={"absolute text-[#868274] text-xl left-[-3rem] top-10 "}>#1</div>
                        {/* <div className={"absolute text-[#868274] text-xl left-[-3rem] top-10 " + r600.className}>#1</div> */}
                        <div className="grid grid-rows-2 items-center">
                            <label htmlFor="personalRef1Name" className="">Full Name:</label>
                            <input type="text" id="personalRef1Name" name="personalRef1Name" className="bg-[#868374] p-2" />
                        </div>
                        <div className="grid grid-rows-2 items-center">
                            <label htmlFor="personalRef1Address" className="">Address:</label>
                            <input type="text" id="personalRef1Address" name="personalRef1Address" className="bg-[#868374] p-2" />
                        </div>
                        <div className="grid grid-rows-2 items-center">
                            <label htmlFor="personalRef1Telephone" className="">Telephone:</label>
                            <input type="text" id="personalRef1Telephone" name="personalRef1Telephone" className="bg-[#868374] p-2" />
                        </div>
                        <div className="grid grid-rows-2 items-center">
                            <label htmlFor="personalRef1Relationship" className="">Relationship:</label>
                            <input type="text" id="personalRef1Relationship" name="personalRef1Relationship" className="bg-[#868374] p-2" />
                        </div>
                        <div className="grid grid-rows-2 items-center">
                            <label htmlFor="personalRef1HowLong" className="">How Long?</label>
                            <input type="text" id="personalRef1HowLong" name="personalRef1HowLong" className="bg-[#868374] p-2" />
                        </div>
                    </div>
                    <div className="relative grid grid-cols-2 md:grid-cols-4 gap-x-4">
                        <div className={"absolute text-[#868274] text-xl left-[-3rem] top-10 " + r600.className}>#2</div>
                        <div className="grid grid-rows-2 items-center">
                            <label htmlFor="personalRef2Name" className="">Full Name:</label>
                            <input type="text" id="personalRef2Name" name="personalRef2Name" className="bg-[#868374] p-2" />
                        </div>
                        <div className="grid grid-rows-2 items-center">
                            <label htmlFor="personalRef2Address" className="">Address:</label>
                            <input type="text" id="personalRef2Address" name="personalRef2Address" className="bg-[#868374] p-2" />
                        </div>
                        <div className="grid grid-rows-2 items-center">
                            <label htmlFor="personalRef2Telephone" className="">Telephone:</label>
                            <input type="text" id="personalRef2Telephone" name="personalRef2Telephone" className="bg-[#868374] p-2" />
                        </div>
                        <div className="grid grid-rows-2 items-center">
                            <label htmlFor="personalRef2Relationship" className="">Relationship:</label>
                            <input type="text" id="personalRef2Relationship" name="personalRef2Relationship" className="bg-[#868374] p-2" />
                        </div>
                        <div className="grid grid-rows-2 items-center">
                            <label htmlFor="personalRef2HowLong" className="">How Long?</label>
                            <input type="text" id="personalRef2HowLong" name="personalRef2HowLong" className="bg-[#868374] p-2" />
                        </div>
                    </div>

                    <div className={"border-y-[1px] border-[#6C6B62] mb-2 mt-4 text-md py-4 " + r400.className}>
                        * Professional (e.g. attorney, doctor)
                    </div>
                    <div className="relative grid grid-cols-2 md:grid-cols-4 gap-x-4">
                        <div className={"absolute text-[#868274] text-xl left-[-3rem] top-10 " + r600.className}>#1</div>
                        <div className="grid grid-rows-2 items-center">
                            <label htmlFor="professionalRef1Name" className="">Full Name:</label>
                            <input type="text" id="professionalRef1Name" name="professionalRef1Name" className="bg-[#868374] p-2" />
                        </div>
                        <div className="grid grid-rows-2 items-center">
                            <label htmlFor="professionalRef1Address" className="">Address:</label>
                            <input type="text" id="professionalRef1Address" name="professionalRef1Address" className="bg-[#868374] p-2" />
                        </div>
                        <div className="grid grid-rows-2 items-center">
                            <label htmlFor="professionalRef1Telephone" className="">Telephone:</label>
                            <input type="text" id="professionalRef1Telephone" name="professionalRef1Telephone" className="bg-[#868374] p-2" />
                        </div>
                        <div className="grid grid-rows-2 items-center">
                            <label htmlFor="professionalRef1Relationship" className="">Relationship:</label>
                            <input type="text" id="professionalRef1Relationship" name="professionalRef1Relationship" className="bg-[#868374] p-2" />
                        </div>
                        <div className="grid grid-rows-2 items-center">
                            <label htmlFor="professionalRef1HowLong" className="">How Long?</label>
                            <input type="text" id="professionalRef1HowLong" name="professionalRef1HowLong" className="bg-[#868374] p-2" />
                        </div>
                    </div>
                    <div className="relative grid grid-cols-2 md:grid-cols-4 gap-x-4">
                        <div className={"absolute text-[#868274] text-xl left-[-3rem] top-10 " + r600.className}>#2</div>
                        <div className="grid grid-rows-2 items-center">
                            <label htmlFor="professionalRef2Name" className="">Full Name:</label>
                            <input type="text" id="professionalRef2Name" name="professionalRef2Name" className="bg-[#868374] p-2" />
                        </div>
                        <div className="grid grid-rows-2 items-center">
                            <label htmlFor="professionalRef2Address" className="">Address:</label>
                            <input type="text" id="professionalRef2Address" name="professionalRef2Address" className="bg-[#868374] p-2" />
                        </div>
                        <div className="grid grid-rows-2 items-center">
                            <label htmlFor="professionalRef2Telephone" className="">Telephone:</label>
                            <input type="text" id="professionalRef2Telephone" name="professionalRef2Telephone" className="bg-[#868374] p-2" />
                        </div>
                        <div className="grid grid-rows-2 items-center">
                            <label htmlFor="professionalRef2Relationship" className="">Relationship:</label>
                            <input type="text" id="professionalRef2Relationship" name="professionalRef2Relationship" className="bg-[#868374] p-2" />
                        </div>
                        <div className="grid grid-rows-2 items-center">
                            <label htmlFor="professionalRef2HowLong" className="">How Long?</label>
                            <input type="text" id="professionalRef2HowLong" name="professionalRef2HowLong" className="bg-[#868374] p-2" />
                        </div>
                    </div>
                </div >
                {/* Add second personal ref into db and backend
                Fix class name for professional refs frontend and backend*/}
            </fieldset >
            <fieldset id="fieldset-5" className="rounded-md flex flex-row mb-4 bg-[#A09D8F] py-10 px-8 md:px-16">
                <div className={"gap-y-2 gap-x-4 text-white bg-[#A09D8F] text-sm " + r400.className}>
                    <div className="border-b-[1px] border-[#6C6B62]">
                        <div>
                            <h1 className={"text-xl md:text-3xl font-bold mb-2 " + r600.className}>Current Landlord/Owner/<span className="md:hidden block"> </span>Superintendent/Company</h1>
                            <p className={"text-lg mb-4 " + p300.className}>Please input accuate information.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-x-4">
                        <div className="grid grid-rows-2 items-center">
                            <label htmlFor="landlordName" className="">Full Name:</label>
                            <input type="text" id="landlordName" name="landlordName" className="bg-[#868374] p-2" />
                        </div>
                        <div className="grid grid-rows-2 items-center">
                            <label htmlFor="landlordAddress" className="">Address:</label>
                            <input type="text" id="landlordAddress" name="landlordAddress" className="bg-[#868374] p-2" />
                        </div>
                        <div className="grid grid-rows-2 items-center">
                            <label htmlFor="landlordTelephone" className="">Telephone:</label>
                            <input type="text" id="landlordTelephone" name="landlordTelephone" className="bg-[#868374] p-2" />
                        </div>
                        <div className="grid grid-rows-2 items-center">
                            <label htmlFor="numberChequesNsf">No. of Cheques Returned NSF</label>
                            <input type="text" id="numberChequesNsf" name="numberChequesNsf" className="bg-[#868374] p-2" />
                        </div>
                        <div className="grid md:col-span-3 grid-rows-2 items-center">
                            <label htmlFor="movingReason">Reason for Leaving:</label>
                            <input type="text" id="movingReason" name="movingReason" className="bg-[#868374] p-2" />
                        </div>
                        <div className="grid grid-rows-2 items-center">
                            <label htmlFor="numberLatePayments">No. of Late Payments</label>
                            <input type="text" id="numberLatePayments" name="numberLatePayments" className="bg-[#868374] p-2" />
                        </div>
                    </div>
                </div>
            </fieldset>
            <fieldset id="fieldset-6" className="rounded-md flex flex-row mb-4 bg-[#A09D8F] py-10 px-8 md:px-16">
                <div className={"gap-y-2 gap-x-4 text-white bg-[#A09D8F] text-sm " + r400.className}>
                    <div className="border-b-[1px] border-[#6C6B62]">
                        <div>
                            <h1 className={"text-4xl font-bold mb-2 " + r600.className}>Emergency Contact</h1>
                            <p className={"text-lg mb-4 " + p300.className}>Please input the correct contact information.</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-x-4">
                        <div className="grid grid-rows-2 items-center">
                            <label htmlFor="emergencyContactName" className="">Full Name:</label>
                            <input type="text" id="emergencyContactName" name="emergencyContactName" className="bg-[#868374] p-2" />
                        </div>
                        <div className="grid grid-rows-2 items-center">
                            <label htmlFor="emergencyContactAddress" className="">Address:</label>
                            <input type="text" id="emergencyContactAddress" name="emergencyContactAddress" className="bg-[#868374] p-2" />
                        </div>
                        <div className="grid grid-rows-2 items-center">
                            <label htmlFor="emergencyContactTelephone" className="">Telephone:</label>
                            <input type="text" id="emergencyContactTelephone" name="emergencyContactTelephone" className="bg-[#868374] p-2" />
                        </div>
                    </div>
                </div>
            </fieldset>
            <fieldset id="fieldset-7" className="rounded-md flex flex-row mb-4 bg-[#A09D8F] py-10 px-8 md:px-16 text-white">
                <div className={"gap-y-2 gap-x-4 text-white bg-[#A09D8F] text-sm " + r400.className}>
                    <div className="border-b-[1px] border-[#6C6B62]">
                        <div>
                            <h1 className={"text-4xl font-bold mb-2 " + r600.className}>Further Details and Consent</h1>
                        </div>
                    </div>
                    <div>
                        <h1 className={"text-3xl " + r400.className}></h1>
                        <div className="grid md:grid-rows-2 mt-4 gap-y-2">
                            <p className={"w-3/4 " + p400.className}>Do you give management permission to contact the personal or professional references listed above, both now and in the
                                future for rental consideration or for collection purposes should they be deemed necessary?</p>

                            <div>
                                <input type="text" placeholder="Yes or No" id="permissionContactReferences" name="permissionContactReferences" className={"bg-[#868374] placeholder-white p-2 text-sm mt-2 " + p300.className} />
                            </div>
                            <div className="flex">
                                <p className="text-left w-3/4">Thank you for completing an application to rent from us. Please sign below. Also note that a completed application requires
                                    submission of the following documents which will be copied and attached to this application.</p>
                            </div>
                            <div className="grid grid-rows-3 gap-y-2">
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
                            <p className="text-left">The applicant offers to lease the said townhouse and hereby agrees to pay the sum of $ <input type="number" name="holdingFee" className="bg-[#A09D8F] border-b-[1px] px-2 text-center" /> as a holding fee on the
                                understanding that if the offer is accepted the fee shall be retained by the landlord or his agent as a Security Deposit during
                                the tenancy of the premises and will be refunded at termination of the tenancy pursuant to the Residential Tenancies Act
                                provided all the covenants of the Lease Agreement have been complied with and that the premises are left in a proper state of
                                cleanliness and repair, reasonable wear and tear excepted, AND, if the offer is not accepted, the full deposit will be refunded,
                                PROVIDED HOWEVER, that if on notification of the offer the Tenant fails to execute the lease the said fee shall forthwith be
                                forfeited and retained by the Landlord or his agent.</p>
                            <label htmlFor="applicantSignature" className="text-lg">Signature:</label>
                            <input type="text" id="applicantSignature" name="applicantSignature" placeholder="Type here" className="bg-[#A09D8F] placeholder-white border-b-[1px] w-1/5" />
                        </div>
                    </div>
                </div>
            </fieldset >

            <button type="submit" className="w-32 bg-[#A09D8F] text-white py-2 rounded-md">Submit</button>
        </div >
    )
};