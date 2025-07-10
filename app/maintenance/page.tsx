'use client';
import { useState } from "react";
import { Raleway } from "next/font/google";
import { postRequest } from "@/lib/fetch";
import { cookies } from "next/headers";
const r600 = Raleway({ subsets: ["latin"], weight: "600" });

const MaintenancePage = () => {
    const [submitted, setSubmitted] = useState(false);

    const handleMaintenanceRequestSubmition = (FormData: FormData) => {
        const data = {
            name: FormData.get("name"),
            unit: FormData.get("unit"),
            description: FormData.get("description"),
            dateAndTime: FormData.get("dateAndTime"),
            permission: FormData.get("permission"),
            property: FormData.get("property")
        }

        postRequest("/api/maintenance/submit", data)
            .then((data) => {
                if (data.error) return console.warn(data.error);
                setSubmitted(true);
            })
    }

    return (
        <div>
            <div className="bg-custom-gradient-1 md:h-full h-screen flex justify-center py-0 md:py-8">
                {!submitted && (
                    <form action={handleMaintenanceRequestSubmition} className="w-full md:w-[55%] min-h-[90%] py-8 flex flex-col bg-[#A09D8F] px-8 md:px-10 rounded-md gap-y-4 text-white">
                        <h1 className={"flex flex-row text-3xl font-bold text-white " + r600.className} > Maintenance Requests</h1>

                        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                            <div className="grid col-span-2 md:col-span-1 grid-rows-2">
                                <label htmlFor="name">Name</label>
                                <input type="text" name="name" required className="bg-[#868374] rounded-md h-8" />
                            </div>

                            <div className="grid col-span-2 md:col-span-1 grid-rows-2">
                                <label htmlFor="unit">Unit</label>
                                <input type="text" name="unit" className="bg-[#868374] rounded-md h-8" />
                            </div>
                            <div className="grid col-span-2">
                                <label htmlFor="description">Description</label>
                                <textarea rows={10} name="description" required className="bg-[#868374] p-2 w-full rounded-md" />
                            </div>
                            <div className="col-span-2 md:col-span-1 md:block">
                                <label htmlFor="dateAndTime">Day/Time Frame</label>
                                <input type="datetime-local" name="dateAndTime" id="dateAndTime" className="bg-[#868374] rounded-md h-8 w-full p-2 border-white" />
                            </div>
                            <div className="col-span-2 md:col-span-1 md:block">
                                <label htmlFor="property">Property</label>
                                <select required name="property" className="bg-[#868374] h-8 rounded-md w-full">
                                    <option value="theArborVictorianLiving">The Arbor Victorian Living</option>
                                    <option value="theVitaliaCourtyard">The Vitalia Courtyard</option>
                                </select>
                            </div>
                            <div className="flex flex-row mt-2 justify-start items-center">
                                <button type="submit" className="bg-[#868374] px-4 py-1 w-32 h-8 rounded-md">Submit</button>
                            </div>
                            <div className="flex flex-row items-center justify-end">
                                <input type="checkbox" required name="permission" className="mr-2" />
                                <label className="" htmlFor="permission">Permission to Enter</label>
                            </div>
                        </div>
                    </form >
                )}
                {submitted && (
                    <div className="grid grid-rows-2 gap-y-4 text-white">
                        <p className="text-lg">Thank you for your request. We will get back to you shortly.</p>
                        <a href="/" className="border-2 px-4 py-2 rounded-md">Go Home</a>
                    </div>
                )}
            </div >
        </div >
    );
};

export default MaintenancePage;
