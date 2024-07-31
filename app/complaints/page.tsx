'use client';

import { FormEvent, useState } from 'react';

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
                setSubmitted(true);
            })
            .catch((error) => {
                console.log(error);
            });

    }

    return (
        <>
            {submitted ? (
                <div className='m-12'>
                    <h1 className='font-bold text-2xl mb-4'>Submitted, we will review your complaint</h1>
                    <a href='/' className='border-2 px-4 py-1'>Go Home</a>
                </div>
            ) : (
                < form onSubmit={handleSubmit} method="POST" encType="multipart/form-data" className="m-12" >
                    <h1 className="flex flex-row text-2xl font-bold">Complaints</h1>

                    <label htmlFor="complaintType" className="flex flex-row mt-6">Complaint Type</label>
                    <select name="complaintType" id="complaintType" className="flex flex-row border-2 px-2 py-1">
                        <option value="noise">Noise Complaint</option>
                        <option value="parking">Unathorized Parking</option>
                        <option value="pet">Pet Complaint</option>
                        <option value="other">Other</option>
                    </select>

                    <label className="flex flex-row mt-4" htmlFor="proof">Proof</label>
                    <input className="flex flex-row" type="file" name="proof" id="proff" />

                    <label htmlFor="additionalDetails" className="flex flex-row mt-4">Additional Details</label>
                    <textarea name="additionalDetails" id="Additional Details" rows={10} className="flex flex-row w-1/2 border-2 px-2 py-1" placeholder="Important Details or Parking Numbers"></textarea>

                    <button type="submit" className="mt-4 border-2 px-4 py-1">Submit</button>
                </form >
            )}
        </>
    )
}

export default ComplaintsPage;