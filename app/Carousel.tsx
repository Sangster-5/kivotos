"use client";

import React from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CarouselItem {
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

interface CarouselProps {
    items: CarouselItem[];
    taskSelectCallback: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}

const Carousel: React.FC<CarouselProps> = ({ items, taskSelectCallback }) => {
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });

    const scrollPrev = () => emblaApi && emblaApi.scrollPrev();
    const scrollNext = () => emblaApi && emblaApi.scrollNext();

    return (
        <>{items.length != 0 ? (
            <div className="relative w-full max-w-full mx-auto">
                <div className="overflow-hidden" ref={emblaRef}>
                    <div className="flex gap-x-4">
                        {items.map((item) => (
                            <div id={item.id.toString()} key={item.id} className="relative flex-shrink-0 p-2 w-full md:w-1/3 bg-white rounded-md">
                                <h1 className="font-bold text-lg">{item.title}</h1>
                                <p>{item.description}</p>
                                <p>{item.category}</p>
                                <p>{item.assigned_employees}</p>

                                <select className='w-full mt-2 drop-shadow-xl border-b-2 py-1 rounded-md' onChange={taskSelectCallback} name="taskStatusSelect" defaultValue={item.status}>
                                    <option value="todo">Todo</option>
                                    <option value="in-progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>
                        ))}
                    </div>
                </div>
                <button
                    onClick={scrollPrev}
                    className="absolute left-[-6rem] top-1/2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full"
                >
                    <ChevronLeft />
                </button>
                <button
                    onClick={scrollNext}
                    className="absolute right-[-6rem] top-1/2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full"
                >
                    <ChevronRight />
                </button>
            </div >
        ) : <></>}
        </>
    );
};

export default Carousel;
