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
        if (data.message === "Invalid Cookie") return location.replace("/login");
        userDetails = data.user;
        setLoggedIn(true);
      })
      .catch((error) => {
        console.log(error)
      });
  });

  return (
    <div>
      {loggedIn && userDetails ? (
        <div className="ml-12 mt-12">
          <h1 className="flex flex-row text-2xl font-bold mb-2">Welcome, {userDetails.name}</h1>

          <div className="flex flex-row gap-x-2">
            <a href="/maintenance" className="border-2 px-4 py-1">Maintenance Request</a>
            <a href="/maintenance" className="border-2 px-4 py-1">Complaint</a>
          </div>

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
  }, [applicationID]);


  return (
    <>
      {application && (
        <>
          <div className="flex flex-row mt-10">
            <div>
              <h1 className="text-2xl font-bold mb-2">Rental Application Form</h1>
              <p>Submitted on {new Date(application.timestamp).toLocaleDateString()}</p>
              <p className="mb-4">Incomplete Applications will not be processed.</p>
              <p className="mb-4">Application Status: {application.rejected ? "Rejected" : (application.approved ? "Approved" : "In Progress")}</p>
            </div>
          </div>
          <fieldset id="fieldset-1" className="flex flex-row mb-4">
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

              <label htmlFor="property">Select Property</label>
              <select name="property" id="property" className="border-2 p-2" defaultValue={application.property} disabled>
                <option value="theArborVictorianLiving">The Arbor Victorian Living</option>
                <option value="arborVitaliaCourtyard">Arbor Vitalia Courtyard</option>
              </select>
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

          <p className="flex flex mb-4 font-bold">Only persons listed on this application will be permitted to occupy the premises.</p>
          <fieldset id="fieldset-2" className="flex flex-row mb-4">
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
          <fieldset id="fieldset-3" className="flex flex-row mb-4">
            <div className="grid grid-cols-4 gap-4">
              <div>
                <h2 className="mb-2">Names (Tenants to occupy the unit)</h2>
                {application.occupants.map((occupant: Occupant, index) => {
                  return (<input key={index} type="text" id={`tenant${index + 1}Name`} name={`tenant${index + 1}Name`} className="border-2 p-2" value={occupant.tenantName} readOnly />)
                })}
              </div>
              <div>
                <h2 className="mb-2">Relationship</h2>
                {application.occupants.map((occupant: Occupant, index) => {
                  return (<input key={index} type="text" id={`tenant${index + 1}Relationship`} name={`tenant${index + 1}Relationship`} className="border-2 p-2" value={occupant.tenantRelationship} readOnly />)
                })}
              </div>
              <div>
                <h2 className="mb-2">Age</h2>
                {application.occupants.map((occupant: Occupant, index) => {
                  return (<input key={index} type="text" id={`tenant${index + 1}Age`} name={`tenant${index + 1}Age`} className="border-2 p-2" value={occupant.tenantAge} readOnly />)
                })}
              </div>
              <div>
                <h2 className="mb-2">Email Address</h2>
                {application.occupants.map((occupant: Occupant, index) => {
                  return (<input key={index} type="text" id={`tenant${index + 1}Email`} name={`tenant${index + 1}Email`} className="border-2 p-2" value={occupant.tenantEmail} readOnly />)
                })}
              </div>
            </div>
          </fieldset>

          <fieldset id="fieldset-4" className="flex flex-row mb-4">
            <label htmlFor="firstChoice" className="flex items-center mb-2 mr-2">Apartment/Townhouse 1st Choice:</label>
            <input type="text" id="firstChoice" name="firstChoice" className="border-2 p-2" value={application.first_choice_unit} readOnly />

            <label htmlFor="secondChoice" className="flex items-center mb-2 mx-2">2nd Choice:</label>
            <input type="text" id="secondChoice" name="secondChoice" className="border-2 p-2" value={application.second_choice_unit} readOnly />

            <label htmlFor="monthlyRental" className="flex items-center mx-2">Monthly Rental:</label>
            <input type="text" id="monthlyRental" name="monthlyRental" className="border-2 p-2" value={application.monthly_rental} readOnly />
          </fieldset>

          <fieldset id="fieldset-5" className="flex flex-row mb-4">
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
          <fieldset id="fieldset-6" className="flex flex-row mb-4">
            <div className="grid grid-cols-2 gap-4">
              {application.tenants.map((tenant: Tenant, index) => {
                return (
                  <div key={index}>
                    <h2 className="mb-2">Tenant {index + 1}</h2>
                    <div className="flex items-center justify-center gap-x-2">
                      <label htmlFor={`tenant${index + 1}Fullname`} className="flex flex-col mb-2">Full Name:</label>
                      <input type="text" id={`tenant${index + 1}Fullname`} name={`tenant${index + 1}Fullname`} className="flex flex-col border-2 p-2" value={tenant.tenantFullname} readOnly />
                    </div>
                    <div className="flex items-center justify-center gap-x-2">
                      <label htmlFor={`tenant${index + 1}Occupation`} className="flex flex-col mb-2">Occupation:</label>
                      <input type="text" id={`tenant${index + 1}Occupation`} name={`tenant${index + 1}Occupation`} className="flex flex-col border-2 p-2" value={tenant.tenantOccupation} readOnly />
                    </div>
                    <div className="flex items-center justify-center gap-x-2">
                      <label htmlFor={`tenant${index + 1}EmploymentType`} className="mb-2">Full or Part Time:</label>
                      <input type="text" id={`tenant${index + 1}EmploymentType`} name={`tenant${index + 1}EmploymentType`} className="border-2 p-2" value={tenant.tenantEmploymentType} readOnly />
                    </div>
                    <div className="flex items-center justify-center gap-x-2">
                      <label htmlFor={`tenant${index + 1}Employer`} className="mb-2">Employed by:</label>
                      <input type="text" id={`tenant${index + 1}Employer`} name={`tenant${index + 1}Employer`} className="border-2 p-2" value={tenant.tenantEmployer} readOnly />
                    </div>
                    <div className="flex items-center justify-center gap-x-2">
                      <label htmlFor={`tenant${index + 1}EmployerAddress`} className="mb-2">Address:</label>
                      <input type="text" id={`tenant${index + 1}EmployerAddress`} name={`tenant${index + 1}EmployerAddress`} className="border-2 p-2" value={tenant.tenantEmployerAddress} readOnly />
                    </div>
                    <div className="flex items-center justify-center gap-x-2">
                      <label htmlFor={`tenant${index + 1}EmploymentDuration`} className="mb-2">How Long?</label>
                      <input type="text" id={`tenant${index + 1}EmploymentDuration`} name={`tenant${index + 1}EmploymentDuration`} className="border-2 p-2" value={tenant.tenantEmploymentDuration} readOnly />
                    </div>
                    <div className="flex items-center justify-center gap-x-2">
                      <label htmlFor={`tenant${index + 1}AnnualIncome`} className="mb-2">Annual Income?</label>
                      <input type="text" id={`tenant${index + 1}AnnualIncome`} name={`tenant${index + 1}AnnualIncome`} className="border-2 p-2" value={tenant.tenantAnnualIncome} readOnly />
                    </div>
                    <div className="flex items-center justify-center gap-x-2">
                      <label htmlFor={`tenant${index + 1}BusinessTelephone`} className="mb-2">Business Telephone:</label>
                      <input type="tel" id={`tenant${index + 1}BusinessTelephone`} name={`tenant${index + 1}BusinessTelephone`} className="border-2 p-2" value={tenant.tenantBusinessTelephone} readOnly />
                    </div>
                    <div className="flex items-center justify-center gap-x-2">
                      <label htmlFor={`tenant${index + 1}Bank`} className="mb-2">Bank:</label>
                      <input type="text" id={`tenant${index + 1}Bank`} name={`tenant${index + 1}Bank`} className="border-2 p-2" value={tenant.tenantBank} readOnly />
                    </div>
                    <div className="flex items-center justify-center gap-x-2">
                      <label htmlFor={`tenant${index + 1}BankBranch`} className="mb-2">Branch:</label>
                      <input type="text" id={`tenant${index + 1}BankBranch`} name={`tenant${index + 1}BankBranch`} className="border-2 p-2" value={tenant.tenantBankBranch} readOnly />
                    </div>
                  </div>)
              })}
            </div>
          </fieldset>
          <fieldset id="fieldset-7" className="flex flex-row mb-4">
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
          <fieldset id="fieldset-8" className="flex flex-row mb-4">
            <div className="flex flex-col">
              <label htmlFor="emergencyContactName" className="mb-2">Emergency Contact Name:</label>
              <input type="text" id="emergencyContactName" name="emergencyContactName" className="border-2 p-2" value={application.emergency_contact_name} readOnly />

              <label htmlFor="emergencyContactAddress" className="mb-2">Address:</label>
              <input type="text" id="emergencyContactAddress" name="emergencyContactAddress" className="border-2 p-2" value={application.emergency_contact_address} readOnly />

              <label htmlFor="emergencyContactTelephone" className="mb-2">Phone number:</label>
              <input type="text" id="emergencyContactTelephone" name="emergencyContactTelephone" className="border-2 p-2" value={application.emergency_contact_phone} readOnly />
            </div>
          </fieldset>
          <fieldset id="fieldset-9" className="flex flex-row mb-4">
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

                  <a className="underline" target="blank" href={`/file?type=applicant&filename=${encodeURIComponent(application.drivers_license_sin)}`}>View File {application.drivers_license_sin}</a>
                  {/* <input name="driversLicenseOrSinUpload" type="file" value={application.drivers_license_sin} readOnly /> */}
                </div>

                <div className="flex items-start items-center gap-x-2">
                  <label htmlFor="payStubs">Two weeks of the most current pay stubs of each income source listed:</label>
                  <input type="checkbox" name="payStubs" checked readOnly />

                  <a className="underline" target="blank" href={`/file?type=applicant&filename=${encodeURIComponent(application.pay_stubs)}`}>View File {application.pay_stubs}</a>
                  {/* <input name="payStubsUpload" type="file" value={application.pay_stubs} readOnly /> */}
                </div>
                <div className="flex items-start items-center gap-x-2">
                  <label htmlFor="taxReturn">If self-employed, most current tax return as proof of income.</label>
                  <input type="checkbox" name="taxReturn" checked readOnly />

                  <a className="underline" target="blank" href={`/file?type=applicant&filename=${encodeURIComponent(application.tax_return)}`}>View File {application.tax_return}</a>
                  {/* <input name="taxReturnUpload" type="file" value={application.tax_return} readOnly /> */}
                </div>
              </div>
            </div>
          </fieldset>
          <fieldset id="fieldset-10" className="flex flex-row mb-4">
            <p className="text-left">The applicant offers to lease the said townhouse and hereby agrees to pay the sum of $ <input type="number" name="holdingFee" className="border-2" value={application.holding_fee} readOnly /> as a holding fee on the
              understanding that if the offer is accepted the fee shall be retained by the landlord or his agent as a Security Deposit during
              the tenancy of the premises and will be refunded at termination of the tenancy pursuant to the Residential Tenancies Act
              provided all the covenants of the Lease Agreement have been complied with and that the premises are left in a proper state of
              cleanliness and repair, reasonable wear and tear excepted, AND, if the offer is not accepted, the full deposit will be refunded,
              PROVIDED HOWEVER, that if on notification of the offer the Tenant fails to execute the lease the said fee shall forthwith be
              forfeited and retained by the Landlord or his agent.</p>
          </fieldset>
          <fieldset id="fieldset-11" className="flex flex-row mb-4 items-center gap-x-2">
            <label htmlFor="applicantSignature" className="mb-2">Signature:</label>
            <input type="text" id="applicantSignature" name="applicantSignature" className="border-2 p-2" value={application.applicant_signature} readOnly />
          </fieldset>
        </>
      )}

    </>
  );
}