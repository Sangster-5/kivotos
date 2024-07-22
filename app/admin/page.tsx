'use client';

import { ChangeEvent, MouseEventHandler, useEffect, useState } from 'react';

interface User {
    id: number;
    username: string;
    name: string;
    approve_applications: boolean;
    create_leases: boolean;
}

const AdminLoginForm = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState<User | null>(null);

    const [tabView, setTabView] = useState("tasks-tab");

    const [applicationProgressFilter, setApplicationProgressFilter] = useState("In Progress");
    const [applicantSearchFilter, setApplicantSearchFilter] = useState("");

    const handleApplicantStatusFilterChange = (event: ChangeEvent<HTMLSelectElement>) => {
        setApplicationProgressFilter(event.target.value);
    }

    const handleApplicantNameSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
        setApplicantSearchFilter(event.target.value);
    }

    useEffect(() => {
        if (document.cookie.includes("adminUsername") && document.cookie.includes("adminPassword") && !isLoggedIn) {
            fetch("/api/auth/admin", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ validateCookie: true })
            })
                .then((res) => res.json())
                .then((data) => {
                    if (data.message === "Admin Cookie Validated") {
                        setUser(data.user);
                        setIsLoggedIn(true);
                    }
                })
                .catch((error) => {
                    console.log(error);
                });
        }
    });


    const handleLoginSubmit = (FormData: FormData) => {
        const data = {
            username: FormData.get("username"),
            password: FormData.get("password"),
            validateCookie: false
        }

        if (!data.username || !data.password) {
            document.getElementById("errorMSG")?.classList.remove("hidden");
            setTimeout(() => {
                document.getElementById("errorMSG")?.classList.add("hidden");
            }, 2000);
            return 0;
        }

        fetch("/api/auth/admin", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.message === "Admin Session Created") {
                    setUser(data.user);
                    setIsLoggedIn(true);
                } else {
                    document.getElementById("errorMSG")?.classList.remove("hidden");
                    setTimeout(() => {
                        document.getElementById("errorMSG")?.classList.add("hidden");
                    }, 2000);
                }
            })
            .catch((error) => {
                console.log(error);
            });
    }

    const redirectLogin = () => {
        window.location.href = "/login";
    }

    const handleTabBtnClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        if (event.currentTarget.id !== tabView) setTabView(event.currentTarget.id);
    }

    return (
        <>
            {!isLoggedIn && (
                <>
                    <form action={handleLoginSubmit}>
                        <div>
                            <label htmlFor="username">Username:</label>
                            <input
                                type="text"
                                id="username"
                                className='border-2'
                                name='username'
                            />
                        </div>
                        <div>
                            <label htmlFor="password">Password:</label>
                            <input
                                type="password"
                                id="password"
                                className='border-2'
                                name='password'
                            />
                        </div>
                        <button type="submit" className='border-2 px-4 mt-4'>Login</button>
                    </form>
                    <p id="errorMSG" className="hidden mb-2">Invalid Credentials</p>
                    <button onClick={redirectLogin}>Here by Accident?, Click for Tenant Login</button>
                </>
            )}

            {(isLoggedIn && user) && (
                <>
                    <h1 className='px-20 text-2xl font-bold mt-4'>Welcome, {user.name}</h1>

                    <div className='flex flex-col w-full justify-center px-20 py-8 gap-y-2'>
                        <div className="flex flex-row gap-x-2">
                            <button id="tasks-tab" onClick={handleTabBtnClick} className='border-2 px-2'>Tasks</button>
                            {user.approve_applications && <button id="applications-tab" onClick={handleTabBtnClick} className='border-2 px-2'>Applications</button>}
                        </div>
                        <div className="flex flex-row">
                            {tabView == "Tasks" && (
                                <section>Tasks</section>
                            )}
                            {(user.approve_applications && tabView == "applications-tab") && (
                                <section className='flex flex-col'>
                                    <div className='flex flex-row gap-x-2'>
                                        <select onChange={handleApplicantStatusFilterChange} className='border-2 px-2' name="filter-applicant-status" id="filter-applicant-status">
                                            <option selected value="In Progress">In Progress</option>
                                            <option value="Accepted">Accepted</option>
                                            <option value="Rejected">Rejected</option>
                                        </select>
                                        <input onChange={handleApplicantNameSearchChange} className='border-2 px-2' type="text" name='search-applicant-name' id='search-applicant-name' placeholder='Search Applicant' />
                                    </div>
                                    <div className="flex flex-row mt-2">
                                        <RentalApplications statusFilter={applicationProgressFilter} nameFilter={applicantSearchFilter} user={user} />
                                    </div>
                                </section>
                            )}
                        </div>
                    </div>
                </>
            )}

            {/* Check if user is allowed to approve applications, create leases. Then task panel / create task */}
        </>
    );
};

export default AdminLoginForm;

interface RentalApplicationProps {
    statusFilter: string;
    nameFilter: string;
    user: User | null;
}

type RentalApplication = {
    name: string
    birth_date: Date,
    drivers_license_number: string,
    telephone_number: string,
    present_address: string,
    email_address: string,
    intended_rental_duration: string,
    present_residence_type: string,
    present_ownership_type: string,
    present_inhabitance_period: string,
    marital_status: string,
    present_rental_amount: number,
    number_of_occupants: number,
    application_unit_number: string,
    approximate_occupancy_date: Date,
    broken_lease: boolean,
    broken_lease_reason: string,
    refused_pay_rent: boolean,
    filled_bankruptcy: boolean,
    occupant_1_name: string,
    occupant_1_relationship: string,
    occupant_1_age: number,
    occupant_1_email: string,
    occupant_2_name: string,
    occupant_2_relationship: string,
    occupant_2_age: number,
    occupant_2_email: string,
    occupant_3_name: string,
    occupant_3_relationship: string,
    occupant_3_age: number,
    occupant_3_email: string,
    occupant_4_name: string,
    occupant_4_relationship: string,
    occupant_4_age: number,
    occupant_4_email: string,
    occupant_5_name: string,
    occupant_5_relationship: string,
    occupant_5_age: number,
    occupant_5_email: string,
    first_choice_unit: string,
    second_choice_unit: string,
    monthly_rental: number,
    vehicle_1: string,
    vehicle_2: string,
    vehicle_3: string,
    tenant_1_occupation: string,
    tenant_1_full_or_part_time: string,
    tenant_1_employer: string,
    tenant_1_address: string,
    tenant_1_employment_term: string,
    tenant_1_annual_income: number,
    tenant_1_business_telephone: string,
    tenant_1_bank: string,
    tenant_1_branch: string,
    tenant_2_occupation: string,
    tenant_2_full_or_part_time: string,
    tenant_2_employed_by: string,
    tenant_2_address: string,
    tenant_2_how_long: string,
    tenant_2_annual_income: string,
    tenant_2_business_telephone: string,
    tenant_2_bank: string,
    tenant_2_branch: string,
    personal_ref_name: string,
    personal_ref_address: string,
    personal_ref_telephone: string,
    personal_ref_relationship: string,
    personal_ref_how_long: string,
    professional_ref_name: string,
    professional_ref_address: string,
    professional_ref_telephone: string,
    professional_ref_relationship: string,
    professional_ref_how_long: string,
    landlord_name: string,
    landlord_address: string,
    landlord_telephone: string,
    emergency_contact_name: string,
    emergency_contact_address: string,
    emergency_contact_phone: string,
    permission_contact_references: boolean,
    drivers_license_sin: string,
    pay_stubs: string,
    tax_return: string,
    holding_fee: number,
    applicant_signature: string,
    user_id: string,
    id: string,
    timestamp: Date,
    approved: boolean,
    rejected: boolean,
    approved_timestamp: Date | null,
    approved_admin: Date | null
}

const RentalApplications: React.FC<RentalApplicationProps> = ({ statusFilter, nameFilter, user }) => {
    const [applications, setApplications] = useState([]);
    const [previousFilters, setPreviousFilters] = useState({ nameFilter: "_", statusFilter: "" });

    if (previousFilters.statusFilter !== statusFilter || previousFilters.nameFilter !== nameFilter) {
        setPreviousFilters({ nameFilter, statusFilter });
        fetch("/api/application/filter", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ statusFilter, nameFilter })
        })
            .then((res) => res.json())
            .then((data) => {
                setApplications(data.applications);
            })
            .catch((error) => {
                console.log(error);
            });
    }

    const handleApproval = (event: React.MouseEvent<HTMLButtonElement>) => {
        const applicationId = event.currentTarget.id;

        fetch("/api/application/approve", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ applicationId })
        })
            .then((res) => res.json())
            .then((data) => {
                //Handle Approval Confirmation
            })
            .catch((error) => {
                console.log(error);
            });
    };

    return (
        <div>
            {applications.length > 0 && applications.map((application: RentalApplication) => {
                return <>
                    {application &&
                        <div className='flex flex-row gap-x-2' key={application.id}>
                            <p className='flex flex-col'>{application.name}</p>
                            <p className='flex flex-col'>{application.email_address}</p>
                            <p className='flex flex-col'>{application.telephone_number}</p>
                            <p className='flex flex-col'>{new Date(application.timestamp).toDateString()}</p>
                            {(user?.create_leases && application.approved) && (<button className="flex flex-col border-2 px-2">Create Lease</button>)}
                            {user?.approve_applications && (
                                <>
                                    <button id={application.id} onClick={handleApproval} className="flex flex-col border-2 px-2">Approve</button>
                                    <button id={application.id} className="flex flex-col border-2 px-2">Deny</button>
                                </>
                            )}
                        </div >
                    }
                </>
            })}
            {/* Show yet to be reviewed ones (filtered by dropdown), search by name of user. */}
        </div >
    );
}