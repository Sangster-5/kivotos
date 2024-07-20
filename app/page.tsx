'use client';

import { useEffect, useState } from "react";
import { formatDate } from "@/lib/formatDate";

type User = {
  email: string;
  tenant: boolean;
  applicationID: number;
  name: string;
  id: number;
};
let userDetails: User;

const Home = () => {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const checkSession = () => {
      const cookieStore = document.cookie;

      return cookieStore ? cookieStore : false;
    }

    const data = { validateCookie: true };

    if (!checkSession()) window.location.href = "/login";
    fetch("/api/auth", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    })
      .then((res) => res.json())
      .then((data) => {
        userDetails = data.user;
        setLoggedIn(true);
      })
      .catch((error) => {
        console.log(error);
      });
  });

  return (
    <div>
      {loggedIn && userDetails ? (
        <div>
          <h1 className="text-2xl font-bold mb-2 ml-12 mt-12">Welcome, {userDetails.name}</h1>

          {userDetails.tenant ? <h1>Tenant</h1> : <ApplicationView applicationID={userDetails.applicationID} />}

        </div>
      ) : (
        <h1>Loading...</h1>
      )}
    </div>
  );
}

export default Home;

interface ApplicationViewProps {
  applicationID: number;
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
  occupant_1_age: number;
  occupant_1_email: string;
  occupant_1_name: string;
  occupant_1_relationship: string;
  occupant_2_age: number;
  occupant_2_email: string;
  occupant_2_name: string;
  occupant_2_relationship: string;
  occupant_3_age: number;
  occupant_3_email: string;
  occupant_3_name: string;
  occupant_3_relationship: string;
  occupant_4_age: number;
  occupant_4_email: string;
  occupant_4_name: string;
  occupant_4_relationship: string;
  occupant_5_age: number;
  occupant_5_email: string;
  occupant_5_name: string;
  occupant_5_relationship: string;
  pay_stubs: string;
  permission_contact_references: boolean;
  personal_ref_address: string;
  personal_ref_how_long: string;
  personal_ref_name: string;
  personal_ref_relationship: string;
  personal_ref_telephone: string;
  present_address: string;
  present_inhabitance_period: string;
  present_ownership_type: string;
  present_rental_amount: number;
  present_residence_type: string;
  professional_ref_address: string;
  professional_ref_how_long: string;
  professional_ref_name: string;
  professional_ref_relationship: string;
  professional_ref_telephone: string;
  refused_pay_rent: boolean;
  second_choice_unit: string;
  tax_return: string;
  telephone_number: string;
  tenant_1_address: string;
  tenant_1_annual_income: number;
  tenant_1_bank: string;
  tenant_1_branch: string;
  tenant_1_business_telephone: string;
  tenant_1_employer: string;
  tenant_1_employment_term: string;
  tenant_1_full_or_part_time: string;
  tenant_1_occupation: string;
  tenant_2_address: string;
  tenant_2_annual_income: number | string;
  tenant_2_bank: string;
  tenant_2_branch: string;
  tenant_2_business_telephone: string;
  tenant_2_employed_by: string;
  tenant_2_full_or_part_time: string;
  tenant_2_how_long: string;
  tenant_2_occupation: string;
  timestamp: string;
  user_id: string;
  vehicle_1: string;
  vehicle_2: string;
  vehicle_3: string;
  approved: boolean;
  rejected: boolean;
}

const ApplicationView: React.FC<ApplicationViewProps> = ({ applicationID }) => {
  const [application, setApplication] = useState<Application | undefined>(undefined);

  useEffect(() => {
    fetch("/api/application", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ applicationID })
    })
      .then((res) => res.json())
      .then((data) => {
        setApplication(data.application);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);


  return (
    <>
      {application && (
        <>
          <div className="mx-12">
            <h1 className="text-2xl font-bold mb-2">Rental Application Form</h1>
            <p>Submitted on {new Date(application.timestamp).toLocaleDateString()}</p>
            <p className="mb-4">Incomplete Applications will not be processed.</p>
            <p className="mb-4">Application Status: {application.rejected ? "Rejected" : (application.approved ? "Approved" : "In Progress")}</p>
          </div>
          <fieldset id="fieldset-1" className="flex flex-row mb-4 ml-12">
            <div className="flex flex-col mr-4">
              <label htmlFor="name" className="mb-2">Name:</label>
              <input type="text" id="name" name="name" className="border-2 p-2" value={application.name} readOnly />

              <label htmlFor="birthdate" className="mb-2">Birth date:</label>
              <input type="date" id="birthdate" name="birthdate" className="border-2 p-2" value={formatDate(new Date(application.birth_date))} readOnly />

              <label htmlFor="driverLicense" className="mb-2">Driver’s License No:</label>
              <input type="text" id="driverLicense" name="driverLicense" className="border-2 p-2" value={application.drivers_license_number} readOnly />

              <label htmlFor="telephone" className="mb-2">Telephone No.:</label>
              <input type="tel" id="telephone" name="telephone" className="border-2 p-2" value={application.telephone_number} readOnly />

              <label htmlFor="presentAddress" className="mb-2">Present Address:</label>
              <input type="text" id="presentAddress" name="presentAddress" className="border-2 p-2" value={application.present_address} readOnly />

              <label htmlFor="email" className="mb-2">Email address:</label>
              <input type="email" id="email" name="email" className="border-2 p-2" value={application.email_address} readOnly />

              <label htmlFor="rentalDuration" className="mb-2">How long do you plan to live in the rental unit?</label>
              <input type="text" id="rentalDuration" name="rentalDuration" className="border-2 p-2" value={application.intended_rental_duration} readOnly />
            </div>

            <div className="flex flex-col">
              <label htmlFor="residenceType" className="mb-2">Residence Type</label>
              <select id="residenceType" className="border p-2" defaultValue="Home" name="residenceType" disabled>
                <option value={application.present_residence_type}>{application.present_residence_type}</option>
              </select>

              <label htmlFor="ownershipType" className="mb-2">Buy or Rent?</label>
              <select id="ownershipType" className="border p-2" defaultValue="Own" name="ownershipType" disabled>
                <option value={application.present_ownership_type}>{application.present_ownership_type}</option>
              </select>

              <label htmlFor="howLong" className="mb-2">How Long?</label>
              <input type="text" id="howLong" name="howLong" className="border-2 p-2" value={application.present_inhabitance_period} readOnly />

              <label htmlFor="maritalStatus" className="mb-2">Marital Status:</label>
              <input type="text" id="maritalStatus" name="maritalStatus" className="border-2 p-2" value={application.marital_status} readOnly />

              <label htmlFor="presentRental" className="mb-2">Present Rental ($):</label>
              <input type="text" id="presentRental" name="presentRental" className="border-2 p-2" value={application.present_rental_amount} readOnly />

              <label htmlFor="occupants" className="mb-2">Number of Persons to Occupy Unit:</label>
              <input type="number" id="occupants" name="occupants" className="border-2 p-2" value={application.number_of_occupants} readOnly />

              <label htmlFor="unitNumber" className="mb-2">The Application for Townhouse/Apartment #:</label>
              <input type="text" id="unitNumber" name="unitNumber" className="border-2 p-2" value={application.application_unit_number} readOnly />

              <label htmlFor="occupancyDate" className="mb-2">Approx. Date of Occupancy:</label>
              <input type="date" id="occupancyDate" name="occupancyDate" className="border-2 p-2" value={formatDate(new Date(application.approximate_occupancy_date))} readOnly />
            </div>
          </fieldset>

          <p className="flex flex mb-4 font-bold ml-12">Only persons listed on this application will be permitted to occupy the premises.</p>
          <fieldset id="fieldset-2" className="flex flex-row mb-4 ml-12">
            <div className="flex flex-col">
              <div className="flex flex-row mr-4">
                <label htmlFor="brokenLease" className="mb-2 pr-2 flex items-center">Have you ever broken a lease?</label>
                <input type="text" id="brokenLease" name="brokenLease" className="border-2 p-2" value={application.broken_lease ? "Yes" : "No"} readOnly />

                <label htmlFor="brokenLeaseReason" className="mb-2 px-2 flex items-center">If so, what was the reason?</label>
                <input type="text" id="brokenLeaseReason" name="brokenLeaseReason" className="border-2 p-2" value={application.broken_lease_reason} readOnly />
              </div>
              <div className="flex flex-row">
                <label htmlFor="refusedToPayRent" className="mb-2 pr-2 flex items-center">Have you ever refused to pay rent for any reason?</label>
                <input type="text" id="refusedToPayRent" name="refusedToPayRent" className="border-2 p-2" value={application.refused_pay_rent ? "Yes" : "No"} readOnly />

                <label htmlFor="filedForBankruptcy" className="mb-2 px-2 flex items-center">Have you ever filed for bankruptcy?</label>
                <input type="text" id="filedForBankruptcy" name="filedForBankruptcy" className="border-2 p-2" value={application.filled_bankruptcy ? "Yes" : "No"} readOnly />
              </div>
            </div>
          </fieldset>
          <fieldset id="fieldset-3" className="flex flex-row mb-4 ml-12">
            <div className="grid grid-cols-4 gap-4">
              <div>
                <h2 className="mb-2">Names (Tenants to occupy the unit)</h2>
                <input type="text" id="tenant1Name" name="tenant1Name" className="border-2 p-2" value={application.occupant_1_name} readOnly />
                <input type="text" id="tenant2Name" name="tenant2Name" className="border-2 p-2" value={application.occupant_2_name} readOnly />
                <input type="text" id="tenant3Name" name="tenant3Name" className="border-2 p-2" value={application.occupant_3_name} readOnly />
                <input type="text" id="tenant4Name" name="tenant4Name" className="border-2 p-2" value={application.occupant_4_name} readOnly />
                <input type="text" id="tenant5Name" name="tenant5Name" className="border-2 p-2" value={application.occupant_5_name} readOnly />
              </div>
              <div>
                <h2 className="mb-2">Relationship</h2>
                <input type="text" id="tenant1Relationship" name="tenant1Relationship" className="border-2 p-2" value={application.occupant_1_relationship} readOnly />
                <input type="text" id="tenant2Relationship" name="tenant2Relationship" className="border-2 p-2" value={application.occupant_2_relationship} readOnly />
                <input type="text" id="tenant3Relationship" name="tenant3Relationship" className="border-2 p-2" value={application.occupant_3_relationship} readOnly />
                <input type="text" id="tenant4Relationship" name="tenant4Relationship" className="border-2 p-2" value={application.occupant_4_relationship} readOnly />
                <input type="text" id="tenant5Relationship" name="tenant5Relationship" className="border-2 p-2" value={application.occupant_5_relationship} readOnly />
              </div>
              <div>
                <h2 className="mb-2">Age</h2>
                <input type="number" id="tenant1Age" name="tenant1Age" className="border-2 p-2" value={application.occupant_1_age} readOnly />
                <input type="number" id="tenant2Age" name="tenant2Age" className="border-2 p-2" value={application.occupant_2_age} readOnly />
                <input type="number" id="tenant3Age" name="tenant3Age" className="border-2 p-2" value={application.occupant_3_age} readOnly />
                <input type="number" id="tenant4Age" name="tenant4Age" className="border-2 p-2" value={application.occupant_4_age} readOnly />
                <input type="number" id="tenant5Age" name="tenant5Age" className="border-2 p-2" value={application.occupant_5_age} readOnly />
              </div>
              <div>
                <h2 className="mb-2">Email address</h2>
                <input type="email" id="tenant1Email" name="tenant1Email" className="border-2 p-2" value={application.occupant_1_email} readOnly />
                <input type="email" id="tenant2Email" name="tenant2Email" className="border-2 p-2" value={application.occupant_2_email} readOnly />
                <input type="email" id="tenant3Email" name="tenant3Email" className="border-2 p-2" value={application.occupant_3_email} readOnly />
                <input type="email" id="tenant4Email" name="tenant4Email" className="border-2 p-2" value={application.occupant_4_email} readOnly />
                <input type="email" id="tenant5Email" name="tenant5Email" className="border-2 p-2" value={application.occupant_5_email} readOnly />
              </div>
            </div>
          </fieldset>

          <fieldset id="fieldset-4" className="flex flex-row mb-4 ml-12">
            <label htmlFor="firstChoice" className="flex items-center mb-2 mr-2">Apartment/Townhouse 1st Choice:</label>
            <input type="text" id="firstChoice" name="firstChoice" className="border-2 p-2" value={application.first_choice_unit} readOnly />

            <label htmlFor="secondChoice" className="flex items-center mb-2 mx-2">2nd Choice:</label>
            <input type="text" id="secondChoice" name="secondChoice" className="border-2 p-2" value={application.second_choice_unit} readOnly />

            <label htmlFor="monthlyRental" className="flex items-center mx-2">Monthly Rental:</label>
            <input type="text" id="monthlyRental" name="monthlyRental" className="border-2 p-2" value={application.monthly_rental} readOnly />
          </fieldset>

          <fieldset id="fieldset-5" className="flex flex-row mb-4 ml-12">
            <div className="flex flex-col">
              <div className="flex flex-row">
                <label htmlFor="vehicle1" className="mb-2 mr-2">Vehicle #1:</label>
                <input type="text" id="vehicle1" name="vehicle1" className="border-2 p-2" value={application.vehicle_1} readOnly />
              </div>

              <div className="flex flex-row">
                <label htmlFor="vehicle2" className="mb-2 mr-2">Vehicle #2:</label>
                <input type="text" id="vehicle2" name="vehicle2" className="border-2 p-2" value={application.vehicle_2} readOnly />
              </div>

              <div className="flex flex-row">
                <label htmlFor="vehicle3" className="mb-2 mr-2">Vehicle #3:</label>
                <input type="text" id="vehicle3" name="vehicle3" className="border-2 p-2" value={application.vehicle_3} readOnly />
              </div>
            </div>
          </fieldset>
          <fieldset id="fieldset-6" className="flex flex-row mb-4 ml-12">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h2 className="mb-2">Tenant 1</h2>
                <div className="flex items-center justify-center gap-x-2">
                  <label htmlFor="tenant1Occupation" className="flex flex-col mb-2">Occupation:</label>
                  <input type="text" id="tenant1Occupation" name="tenant1Occupation" className="flex flex-col border-2 p-2" value={application.tenant_1_occupation} readOnly />
                </div>
                <div className="flex items-center justify-center gap-x-2">
                  <label htmlFor="tenant1EmploymentType" className="mb-2">Full or Part Time:</label>
                  <input type="text" id="tenant1EmploymentType" name="tenant1EmploymentType" className="border-2 p-2" value={application.tenant_1_full_or_part_time} readOnly />
                </div>
                <div className="flex items-center justify-center gap-x-2">
                  <label htmlFor="tenant1Employer" className="mb-2">Employed by:</label>
                  <input type="text" id="tenant1Employer" name="tenant1Employer" className="border-2 p-2" value={application.tenant_1_employer} readOnly />
                </div>
                <div className="flex items-center justify-center gap-x-2">
                  <label htmlFor="tenant1EmployerAddress" className="mb-2">Address:</label>
                  <input type="text" id="tenant1EmployerAddress" name="tenant1EmployerAddress" className="border-2 p-2" value={application.tenant_1_address} readOnly />
                </div>
                <div className="flex items-center justify-center gap-x-2">
                  <label htmlFor="tenant1EmploymentDuration" className="mb-2">How Long?</label>
                  <input type="text" id="tenant1EmploymentDuration" name="tenant1EmploymentDuration" className="border-2 p-2" value={application.tenant_1_employment_term} readOnly />
                </div>
                <div className="flex items-center justify-center gap-x-2">
                  <label htmlFor="tenant1AnnualIncome" className="mb-2">Annual Income?</label>
                  <input type="text" id="tenant1AnnualIncome" name="tenant1AnnualIncome" className="border-2 p-2" value={application.tenant_1_annual_income} readOnly />
                </div>
                <div className="flex items-center justify-center gap-x-2">
                  <label htmlFor="tenant1BusinessTelephone" className="mb-2">Business Telephone:</label>
                  <input type="tel" id="tenant1BusinessTelephone" name="tenant1BusinessTelephone" className="border-2 p-2" value={application.tenant_1_business_telephone} readOnly />
                </div>
                <div className="flex items-center justify-center gap-x-2">
                  <label htmlFor="tenant1Bank" className="mb-2">Bank:</label>
                  <input type="text" id="tenant1Bank" name="tenant1Bank" className="border-2 p-2" value={application.tenant_1_bank} readOnly />
                </div>
                <div className="flex items-center justify-center gap-x-2">
                  <label htmlFor="tenant1BankBranch" className="mb-2">Branch:</label>
                  <input type="text" id="tenant1BankBranch" name="tenant1BankBranch" className="border-2 p-2" value={application.tenant_1_branch} readOnly />
                </div>
              </div>
              <div className="grid grid-rows-8">
                <h2 className="mb-2">Tenant 2</h2>
                <div className="flex items-center justify-center gap-x-2">
                  <label htmlFor="tenant2Occupation" className="flex flex-col mb-2">Occupation:</label>
                  <input type="text" id="tenant2Occupation" name="tenant2Occupation" className="flex flex-col border-2 p-2" value={application.tenant_2_occupation} readOnly />
                </div>
                <div className="flex items-center justify-center gap-x-2">
                  <label htmlFor="tenant2EmploymentType" className="mb-2">Full or Part Time:</label>
                  <input type="text" id="tenant2EmploymentType" name="tenant2EmploymentType" className="border-2 p-2" value={application.tenant_2_full_or_part_time} readOnly />
                </div>
                <div className="flex items-center justify-center gap-x-2">
                  <label htmlFor="tenant2Employer" className="mb-2">Employed by:</label>
                  <input type="text" id="tenant2Employer" name="tenant2Employer" className="border-2 p-2" value={application.tenant_2_employed_by} readOnly />
                </div>
                <div className="flex items-center justify-center gap-x-2">
                  <label htmlFor="tenant2EmployerAddress" className="mb-2">Address:</label>
                  <input type="text" id="tenant2EmployerAddress" name="tenant2EmployerAddress" className="border-2 p-2" value={application.tenant_2_address} readOnly />
                </div>
                <div className="flex items-center justify-center gap-x-2">
                  <label htmlFor="tenant2EmploymentDuration" className="mb-2">How Long?</label>
                  <input type="text" id="tenant2EmploymentDuration" name="tenant2EmploymentDuration" className="border-2 p-2" value={application.tenant_2_how_long} readOnly />
                </div>
                <div className="flex items-center justify-center gap-x-2">
                  <label htmlFor="tenant2AnnualIncome" className="mb-2">Annual Income?</label>
                  <input type="text" id="tenant2AnnualIncome" name="tenant2AnnualIncome" className="border-2 p-2" value={application.tenant_2_annual_income} readOnly />
                </div>
                <div className="flex items-center justify-center gap-x-2">
                  <label htmlFor="tenant2BusinessTelephone" className="mb-2">Business Telephone:</label>
                  <input type="tel" id="tenant2BusinessTelephone" name="tenant2BusinessTelephone" className="border-2 p-2" value={application.tenant_2_business_telephone} readOnly />
                </div>
                <div className="flex items-center justify-center gap-x-2">
                  <label htmlFor="tenant2Bank" className="mb-2">Bank:</label>
                  <input type="text" id="tenant2Bank" name="tenant2Bank" className="border-2 p-2" value={application.tenant_2_bank} readOnly />
                </div>
                <div className="flex items-center justify-center gap-x-2">
                  <label htmlFor="tenant2BankBranch" className="mb-2">Branch:</label>
                  <input type="text" id="tenant2BankBranch" name="tenant2BankBranch" className="border-2 p-2" value={application.tenant_2_branch} readOnly />
                </div>
              </div>
            </div>
          </fieldset>
          <fieldset id="fieldset-7" className="flex flex-row mb-4 ml-12">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <h2 className="mb-2">Personal Reference</h2>
                <div className="flex items-center justify-center gap-x-2">
                  <label htmlFor="personalRef1Name" className="flex flex-col mb-2">Name:</label>
                  <input type="text" id="personalRef1Name" name="personalRef1Name" className="flex flex-col border-2 p-2" value={application.personal_ref_name} readOnly />
                </div>
                <div className="flex items-center justify-center gap-x-2">
                  <label htmlFor="personalRef1Address" className="mb-2">Address:</label>
                  <input type="text" id="personalRef1Address" name="personalRef1Address" className="border-2 p-2" value={application.personal_ref_address} readOnly />
                </div>
                <div className="flex items-center justify-center gap-x-2">
                  <label htmlFor="personalRef1Telephone" className="mb-2">Telephone:</label>
                  <input type="text" id="personalRef1Telephone" name="personalRef1Telephone" className="border-2 p-2" value={application.personal_ref_telephone} readOnly />
                </div>
                <div className="flex items-center justify-center gap-x-2">
                  <label htmlFor="personalRef1Relationship" className="mb-2">Relationship:</label>
                  <input type="text" id="personalRef1Relationship" name="personalRef1Relationship" className="border-2 p-2" value={application.personal_ref_relationship} readOnly />
                </div>
                <div className="flex items-center justify-center gap-x-2">
                  <label htmlFor="personalRef1HowLong" className="mb-2">How Long?</label>
                  <input type="text" id="personalRef1HowLong" name="personalRef1HowLong" className="border-2 p-2" value={application.personal_ref_how_long} readOnly />
                </div>
              </div>
              <div>
                <h2 className="mb-2">Professional (e.g. attorney, doctor)</h2>
                <div className="flex items-center justify-center gap-x-2">
                  <label htmlFor="personalRef2Name" className="flex flex-col mb-2">Name:</label>
                  <input type="text" id="personalRef2Name" name="personalRef2Name" className="flex flex-col border-2 p-2" value={application.professional_ref_name} readOnly />
                </div>
                <div className="flex items-center justify-center gap-x-2">
                  <label htmlFor="personalRef2Address" className="mb-2">Address:</label>
                  <input type="text" id="personalRef2Address" name="personalRef2Address" className="border-2 p-2" value={application.professional_ref_address} readOnly />
                </div>
                <div className="flex items-center justify-center gap-x-2">
                  <label htmlFor="personalRef2Telephone" className="mb-2">Telephone:</label>
                  <input type="text" id="personalRef2Telephone" name="personalRef2Telephone" className="border-2 p-2" value={application.professional_ref_telephone} readOnly />
                </div>
                <div className="flex items-center justify-center gap-x-2">
                  <label htmlFor="personalRef2Relationship" className="mb-2">Relationship:</label>
                  <input type="text" id="personalRef2Relationship" name="personalRef2Relationship" className="border-2 p-2" value={application.professional_ref_relationship} readOnly />
                </div>
                <div className="flex items-center justify-center gap-x-2">
                  <label htmlFor="personalRef2HowLong" className="mb-2">How Long?</label>
                  <input type="text" id="personalRef2HowLong" name="personalRef2HowLong" className="border-2 p-2" value={application.professional_ref_how_long} readOnly />
                </div>
              </div>

              <div>
                <h2 className="mb-2">Current Landlord/Superintendent/Owner/Mortgage Company</h2>
                <div className="flex items-center justify-center gap-x-2">
                  <label htmlFor="personalRef3Name" className="flex flex-col mb-2">Name:</label>
                  <input type="text" id="personalRef3Name" name="personalRef3Name" className="flex flex-col border-2 p-2" value={application.landlord_name} readOnly />
                </div>
                <div className="flex items-center justify-center gap-x-2">
                  <label htmlFor="personalRef3Address" className="mb-2">Address:</label>
                  <input type="text" id="personalRef3Address" name="personalRef3Address" className="border-2 p-2" value={application.landlord_address} readOnly />
                </div>
                <div className="flex items-center justify-center gap-x-2">
                  <label htmlFor="personalRef3Telephone" className="mb-2">Telephone:</label>
                  <input type="text" id="personalRef3Telephone" name="personalRef3Telephone" className="border-2 p-2" value={application.landlord_telephone} readOnly />
                </div>
              </div>
            </div>
          </fieldset>
          <fieldset id="fieldset-8" className="flex flex-row mb-4 ml-12">
            <div className="flex flex-col">
              <label htmlFor="emergencyContactName" className="mb-2">Emergency Contact Name:</label>
              <input type="text" id="emergencyContactName" name="emergencyContactName" className="border-2 p-2" value={application.emergency_contact_name} readOnly />

              <label htmlFor="emergencyContactAddress" className="mb-2">Address:</label>
              <input type="text" id="emergencyContactAddress" name="emergencyContactAddress" className="border-2 p-2" value={application.emergency_contact_address} readOnly />

              <label htmlFor="emergencyContactTelephone" className="mb-2">Phone number:</label>
              <input type="text" id="emergencyContactTelephone" name="emergencyContactTelephone" className="border-2 p-2" value={application.emergency_contact_phone} readOnly />
            </div>
          </fieldset>
          <fieldset id="fieldset-9" className="flex flex-row mb-4 ml-12">
            <div className="flex flex-col gap-y-4">
              <div className="flex">
                <p className="text-left">Do you give management permission to contact the personal or professional references listed above, both now and in the
                  future for rental consideration or for collection purposes should they be deemed necessary?</p>

                <input type="text" placeholder="Yes or No" id="permissionContactReferences" name="permissionContactReferences" className="border-2 p-2" value={application.permission_contact_references ? 'Yes' : 'No'} readOnly />
              </div>

              <div className="flex">
                <p className="text-left">Thank you for completing an application to rent from us. Please sign below. Also note that a completed application requires
                  submission of the following documents which will be copied and attached to this application.</p>
              </div>

              <div className="grid grid-rows-3">
                <div className="flex items-start items-center gap-x-2">
                  <label htmlFor="driversLicenseOrSin">Driver’s License or Social Insurance Number:</label>
                  <input type="checkbox" name="driversLicenseOrSin" checked readOnly />

                  <a className="underline" target="blank" href={`/file?filename=${encodeURIComponent(application.drivers_license_sin)}&userID=${encodeURIComponent(application.user_id)}`}>View File {application.drivers_license_sin}</a>
                  {/* <input name="driversLicenseOrSinUpload" type="file" value={application.drivers_license_sin} readOnly /> */}
                </div>

                <div className="flex items-start items-center gap-x-2">
                  <label htmlFor="payStubs">Two weeks of the most current pay stubs of each income source listed:</label>
                  <input type="checkbox" name="payStubs" checked readOnly />

                  <a className="underline" target="blank" href={`/file?filename=${encodeURIComponent(application.pay_stubs)}&userID=${encodeURIComponent(application.user_id)}`}>View File {application.pay_stubs}</a>
                  {/* <input name="payStubsUpload" type="file" value={application.pay_stubs} readOnly /> */}
                </div>
                <div className="flex items-start items-center gap-x-2">
                  <label htmlFor="taxReturn">If self-employed, most current tax return as proof of income.</label>
                  <input type="checkbox" name="taxReturn" checked readOnly />

                  <a className="underline" target="blank" href={`/file?filename=${encodeURIComponent(application.tax_return)}&userID=${encodeURIComponent(application.user_id)}`}>View File {application.tax_return}</a>
                  {/* <input name="taxReturnUpload" type="file" value={application.tax_return} readOnly /> */}
                </div>
              </div>
            </div>
          </fieldset>
          <fieldset id="fieldset-10" className="flex flex-row mb-4 ml-12">
            <p className="text-left">The applicant offers to lease the said townhouse and hereby agrees to pay the sum of $ <input type="number" name="holdingFee" className="border-2" value={application.holding_fee} readOnly /> as a holding fee on the
              understanding that if the offer is accepted the fee shall be retained by the landlord or his agent as a Security Deposit during
              the tenancy of the premises and will be refunded at termination of the tenancy pursuant to the Residential Tenancies Act
              provided all the covenants of the Lease Agreement have been complied with and that the premises are left in a proper state of
              cleanliness and repair, reasonable wear and tear excepted, AND, if the offer is not accepted, the full deposit will be refunded,
              PROVIDED HOWEVER, that if on notification of the offer the Tenant fails to execute the lease the said fee shall forthwith be
              forfeited and retained by the Landlord or his agent.</p>
          </fieldset>
          <fieldset id="fieldset-11" className="flex flex-row mb-4 items-center gap-x-2 ml-12">
            <label htmlFor="applicantSignature" className="mb-2">Signature:</label>
            <input type="text" id="applicantSignature" name="applicantSignature" className="border-2 p-2" value={application.applicant_signature} readOnly />
          </fieldset>
        </>
      )}

    </>
  );
}