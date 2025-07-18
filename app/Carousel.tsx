"use client";

import React from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type CarouselTaskItem = {
    id: number,
    status: string,
    title: string,
    description: string,
    assigned_employees: number[],
    created_by: number,
    created_timestamp: Date,
    finished_timestamp: Date | null,
    category: string
}

type CarouselRequestItem = {
    created_timestamp: Date;
    date_time: Date;
    description: string,
    id: number;
    permission: boolean;
    status: string;
    tenant_name: string;
    unit: string;
    is_task: boolean;
    property: string;
}

type CarouselComplaintItem = {
    id: number;
    type: string;
    details: string;
    timestamp: Date;
    status: string;
    action_timestamp: Date;
}

type CarouselLeaseItem = {
    created_by: number;
    created_timestamp: Date;
    effective_date: Date;
    id: number;
    property: string;
    rental_amount: number;
    termination_date: Date;
    unit: number;
    user: number
    signed: boolean;
}

interface CarouselProps {
    tasks?: CarouselTaskItem[];
    requests?: CarouselRequestItem[];
    complaints?: CarouselComplaintItem[];
    leases?: CarouselLeaseItem[];
    handleMaintenanceRequestToTask?: (event: React.MouseEvent<HTMLButtonElement>) => void;
    taskSelectCallback?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
    nonAdmin?: boolean;
}

const Carousel: React.FC<CarouselProps> = ({ tasks, taskSelectCallback, requests, handleMaintenanceRequestToTask, complaints, leases, nonAdmin }) => {
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });

    const scrollPrev = () => emblaApi && emblaApi.scrollPrev();
    const scrollNext = () => emblaApi && emblaApi.scrollNext();

    const buttonsPositionLeft = nonAdmin ? "absolute left-[-4rem] top-1/2 transform -translate-y-1/2 " : "absolute left-[-6rem] top-1/2 transform -translate-y-1/2 ";
    const buttonsPositionRight = nonAdmin ? "absolute right-[-4rem] top-1/2 transform -translate-y-1/2 " : "absolute right-[-6rem] top-1/2 transform -translate-y-1/2 ";

    return (
        <>
            {tasks && tasks.length != 0 && (
                <div className="relative w-full max-w-full mx-auto">
                    <div className="overflow-hidden w-[85vw] md:w-full" ref={emblaRef}>
                        <div className="flex">
                            {tasks.map((item) => (
                                <div
                                    id={item.id.toString()}
                                    key={item.id}
                                    className="flex-[0_0_100%] md:flex-[0_0_33.3333%] max-w-full md:max-w-[33.3333%] p-2 box-border"
                                >
                                    <div className="h-full w-full flex flex-col justify-between bg-[#234154] text-white rounded-md p-3">
                                        <h1 className="font-bold text-lg">{item.title}</h1>
                                        <p>{item.description}</p>
                                        <p>{item.category}</p>

                                        {!nonAdmin && (
                                            <>
                                                <p>{item.assigned_employees}</p>

                                                <div className="flex grow items-end">
                                                    <select className='w-full h-8 mt-2 drop-shadow-xl border-b-2 py-1 px-1 rounded-md text-black' onChange={taskSelectCallback} name="taskStatusSelect" defaultValue={item.status}>
                                                        <option value="todo">Todo</option>
                                                        <option value="in-progress">In Progress</option>
                                                        <option value="completed">Completed</option>
                                                    </select>
                                                </div>
                                            </>
                                        )}

                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <button
                        onClick={scrollPrev}
                        className="hidden md:block absolute left-[-6rem] top-1/2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full"
                    >
                        <ChevronLeft />
                    </button>
                    <button
                        onClick={scrollNext}
                        className="hidden md:block absolute right-[-6rem] top-1/2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full"
                    >
                        <ChevronRight />
                    </button>
                </div >
            )}
            {requests && requests.length != 0 && (
                <div className="relative w-full max-w-full mx-auto">
                    <div className="overflow-hidden w-[85vw] md:w-full" ref={emblaRef}>
                        <div className="flex">
                            {requests.map((item) => (
                                <div
                                    id={item.id.toString()}
                                    key={item.id}
                                    className="flex-[0_0_100%] md:flex-[0_0_33.3333%] max-w-full md:max-w-[33.3333%] p-2 box-border"
                                >
                                    <div className="h-full w-full flex flex-col justify-between bg-[#234154] text-white rounded-md p-3">
                                        <h1 id="tenant-name" className="font-bold text-lg">
                                            {item.tenant_name}
                                        </h1>
                                        <h1 id="unit">Unit: {item.unit}</h1>
                                        <p id="description">{item.description}</p>
                                        <p id="property">
                                            {item.property === "theArborVictorianLiving"
                                                ? "Arbor Victorian Living"
                                                : "Vitalia Courtyard"}
                                        </p>
                                        <h1 id="date">{new Date(item.date_time).toLocaleString()}</h1>

                                        {!nonAdmin && (
                                            <div className="flex-grow flex flex-col justify-end p-1 gap-y-2 mt-2">
                                                {!item.is_task && (
                                                    <button
                                                        className="bg-[#192F3D] w-full h-8 text-white font-medium rounded-md"
                                                        id={item.id.toString()}
                                                        onClick={handleMaintenanceRequestToTask}
                                                    >
                                                        Create Task
                                                    </button>
                                                )}
                                                <select
                                                    className="w-full drop-shadow-xl border-b-2 py-1 text-center rounded-md text-black"
                                                    onChange={taskSelectCallback}
                                                    defaultValue={item.status}
                                                >
                                                    <option value="todo">Todo</option>
                                                    <option value="in-progress">In Progress</option>
                                                    <option value="completed">Completed</option>
                                                </select>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <button
                        onClick={scrollPrev}
                        className={`${buttonsPositionLeft} hidden md:block bg-gray-800 text-white p-2 rounded-full`}
                    >
                        <ChevronLeft />
                    </button>
                    <button
                        onClick={scrollNext}
                        className={`${buttonsPositionRight} hidden md:block bg-gray-800 text-white p-2 rounded-full`}
                    >
                        <ChevronRight />
                    </button>
                </div>
            )}
            {complaints && complaints.length != 0 && (
                <><div className="relative w-full max-w-full mx-auto">
                    <div className="overflow-hidden w-[85vw] md:w-full" ref={emblaRef}>
                        <div className="flex gap-x-4">
                            {complaints.map((item) => (
                                <div
                                    id={item.id.toString()}
                                    key={item.id}
                                    className="flex-[0_0_100%] md:flex-[0_0_33.3333%] max-w-full md:max-w-[33.3333%] p-2 box-border"
                                >
                                    <div className="h-full w-full flex flex-col justify-between bg-[#234154] text-white rounded-md p-3">
                                        <h1 className="text-lg font-medium">{item.details}</h1>
                                        <p className="mt-1">{new Date(item.timestamp).toLocaleString()}</p>

                                        <a href={"/api/files?type=complaint&filename=" + item.id} className="underline">View Proof</a>

                                        {!nonAdmin && (
                                            <div className="flex-grow flex flex-col justify-end mt-4">
                                                <select id={item.id.toString()} className='w-full drop-shadow-xl border-b-2 py-1 text-center rounded-md text-black' onChange={taskSelectCallback} defaultValue={item.status}>
                                                    <option value="pending">Pending</option>
                                                    <option value="reviewed">Reviewed</option>
                                                    <option value="completed">Completed</option>
                                                </select>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <button
                        onClick={scrollPrev}
                        className={buttonsPositionLeft + "hidden md:block bg-gray-800 text-white p-2 rounded-full"}
                    >
                        <ChevronLeft />
                    </button>
                    <button
                        onClick={scrollNext}
                        className={buttonsPositionRight + "hidden md:block bg-gray-800 text-white p-2 rounded-full"}
                    >
                        <ChevronRight />
                    </button>
                </div >
                </>
            )}
            {leases && leases.length != 0 && (
                leases.map(lease => (
                    <div key={lease.id.toString()} id={lease.id.toString()} className="flex flex-row flex-wrap items-center gap-x-4 p-3 w-full rounded-md bg-[#234154] text-white">
                        <h1 className="font-medium text-lg">Unit: {lease.unit}</h1>
                        <h1>{lease.property == "theArborVictorianLiving" ? "The Arbor Victorian Living" : "Vitalia Courtyard"}</h1>
                        <h1>${lease.rental_amount}</h1>
                        <h1>Effective: {new Date(lease.effective_date).toLocaleDateString()}</h1>
                        <h1>Termination: {new Date(lease.termination_date).toLocaleDateString()}</h1>
                        <a download={lease.id} href={`/api/files?type=lease&filename=${lease.id}.xlsx`} className="flex flex-col underline">Download Lease</a>
                        {/* {!lease.signed && <button onClick={handleLeaseConfirmation} className='px-4 py-1 border-2 bg-white'>Confirm Lease</button>} */}
                    </div>
                ))
            )}
            {leases && leases.length == 0 && (
                <h1 className="text-white italic font-light">No upcoming leases for given period.</h1>
            )}
        </>
    );
};

export default Carousel;
