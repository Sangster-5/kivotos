'use client';

import { FormEvent, useState } from 'react';
import { Poppins, Raleway } from 'next/font/google';
const p300 = Poppins({ subsets: ['latin'], weight: "300" });
const p400 = Poppins({ subsets: ['latin'], weight: "400" });
const r600 = Raleway({ subsets: ['latin'], weight: "600" });
const r500 = Raleway({ subsets: ['latin'], weight: "500" });

const ComplaintsPage = () => {
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);

        fetch('/api/complaints/submit', {
            method: 'POST',
            credentials: "include",
            body: formData
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.error) {
                    console.warn(data.error)
                } else {
                    setSubmitted(true);
                }
            })
            .catch((error) => {
                console.log(error);
            });

    }

    return (
        <div className='bg-custom-gradient md:h-full w-full h-screen flex items-center justify-center'>
            {submitted ? (
                <div className='m-12'>
                    <h1 className='font-bold text-white text-2xl mb-4'>Submitted, we will review your submission</h1>
                    <a href='/' className='grid border-2 px-4 py-1 text-white w-full'>Go Home</a>
                </div>
            ) : (
                <form onSubmit={handleSubmit} method="POST" encType="multipart/form-data" className={"grid px-6 md:px-20 py-10 bg-[#A09D8F] w-full md:w-3/5 gap-y-4 text-white rounded-md " + p300.className}>
                    <h1 className={"flex flex-row text-3xl font-bold text-white " + r600.className}>Submit an Issue</h1>

                    <div className="grid grid-cols-2 gap-x-2 gap-y-2">
                        <div className='col-span-2 md:col-span-1'>
                            <label htmlFor="complaintType" className="flex flex-row">Issue Type</label>
                            <select name="complaintType" id="complaintType" className={"flex flex-row bg-[#868374] w-full text-white rounded-md h-8 px-2 " + r500.className}>
                                <option value="noise">Noise Issue</option>
                                <option value="parking">Unathorized Parking</option>
                                <option value="pet">Pet Issue</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div className='col-span-2 md:col-span-1'>
                            <label className="flex flex-row" htmlFor="proof">Proof</label>
                            <input className={"flex flex-row file:bg-[#868374] file:border-none file:text-white file:rounded-md file:h-8 file:px-2 text-white w-full " + r500.className} type="file" name="proof" id="proff" />
                        </div>
                    </div>

                    <label htmlFor="additionalDetails" className="flex flex-row">Additional Details</label>
                    <textarea name="additionalDetails" id="Additional Details" rows={10} className={"flex flex-row w-full bg-[#868374] px-2 py-1 rounded-md text-white placeholder-white " + r500.className} placeholder="Important Details or Parking Numbers"></textarea>

                    <button type="submit" className="px-4 bg-[#868374] h-8 rounded-md text-white">Submit</button>
                </form >
            )}
        </div>
    )
}

export default ComplaintsPage;