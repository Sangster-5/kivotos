'use client';
import { useState } from "react";

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

        fetch("/api/maintenance/submit", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        })
            .then((res) => res.json())
            .then((data) => {
                setSubmitted(true);
            })
            .catch((error) => {
                console.log(error);
            });
    }

    return (
        <div className="m-12">
            <h1 className="flex flex-row text-2xl font-bold">Maintenance Request</h1>

            {!submitted && (
                <form action={handleMaintenanceRequestSubmition} className="w-1/2">
                    <div className="flex flex-row gap-x-8">
                        <div className="flex flex-col w-1/2">
                            <label className="" htmlFor="name">Name</label>
                            <input type="text" required name="name" className="border-2" />
                        </div>
                        <div className="flex flex-col w-1/2">
                            <label className="" htmlFor="unit">Unit</label>
                            <input type="text" required name="unit" className="border-2" />
                        </div>
                    </div>
                    <label className="flex flex-row" htmlFor="description">Description</label>
                    <textarea rows={10} name="description" required className="border-2 flex flex-row w-full" />

                    <div className="flex flex-row mt-4 gap-x-4">
                        <div className="flex flex-col w-1/2">
                            <label className="flex flex-row" htmlFor="dateAndTime">Day/Time Frame</label>
                            <input type="datetime-local" name="dateAndTime" className="flex flex-row border-2" />
                            <label className="flex flex-row mt-4" htmlFor="property">Property</label>
                            <select required name="property" className="border-2 flex flex-row">
                                <option value="theArborVictorianLiving">The Arbor Victorian Living</option>
                                <option value="theVitaliaCourtyard">The Vitalia Courtyard</option>
                            </select>
                        </div>
                        <div className="flex flex-col w-1/2">
                            <div className="flex flex-row justify-end">
                                <label htmlFor="permission">Permission to Enter</label>
                                <input type="checkbox" required name="permission" className="border-2 ml-2" />
                            </div>
                        </div>
                    </div>

                    <button type="submit" className="border-2 px-4 py-1 rounded-md mt-4">Submit</button>
                </form>)}
            {submitted && (
                <>
                    <div className="flex flex-row my-4">
                        <p className="text-lg">Thank you for your request. We will get back to you shortly.</p>

                    </div>
                    <a href="/" className="border-2 px-4 py-2">Go Home</a>
                </>
            )}
        </div>
    );
};

export default MaintenancePage;
