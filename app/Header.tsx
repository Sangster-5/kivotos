'use client';

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Cormorant_Garamond, Poppins } from "next/font/google";
import Image from "next/image";

const cg400 = Cormorant_Garamond({ subsets: ["latin"], weight: "400" });
const p400 = Poppins({ subsets: ["latin"], weight: "400" });
const p600 = Poppins({ subsets: ["latin"], weight: "600" });

export const Header = () => {
    const pathname = usePathname();
    const dontShowHeader: string[] = [];

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const handleDropdownClick = () => {
        const dropdown = document.getElementById("dropdown");

        if (dropdown) {
            if (isDropdownOpen) {
                dropdown.classList.add("hidden");
                dropdown.classList.remove("flex");
                setIsDropdownOpen(false);
            } else {
                dropdown.classList.remove("hidden");
                dropdown.classList.add("flex");
                setIsDropdownOpen(true);
            }
        }
    }

    return (
        <>{!dontShowHeader.includes(pathname) && (
            <header className="sm:px-20 min-h-[10vh] xl:min-h-[15vh] w-screen flex flex-col justify-center items-center">
                <nav className="flex flex-row w-full">
                    <div className="flex flex-col w-full md:w-1/2">
                        <div className="flex flex-row gap-x-4">
                            <div className="flex w-4/5 md:w-full">
                                <Image priority src="/nav-logo.png" width={64} height={64} alt="The Arbor Group" />
                                <h1 className={"flex items-center text-xl " + cg400.className}>The Arbor Group</h1>
                            </div>

                            <div className="flex flex-col w-1/5 justify-center items-center">
                                <button onClick={handleDropdownClick} id="dropdownDefaultButton" data-dropdown-toggle="dropdown" className="text-white font-medium rounded-lg text-sm text-center inline-flex md:hidden" type="button">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-16 6h16" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="hidden md:flex flex-col items-end justify-center w-1/2">
                        <ul className={"flex flex-row gap-x-8 " + p400.className}>
                            <li><a href="/" className={p600.className}>Home</a></li>
                            <li><a href="https://thearborvictorianliving.ca/">About</a></li>
                            <li><a href="/apply">Application</a></li>
                            <li><a href="https://thearborvictorianliving.ca/">Vacancies</a></li>
                            <li><a href="/login"><Image src="/icons/Profile.png" height={20} width={20} alt="Profile" /></a></li>
                        </ul>
                    </div>
                </nav>
                <ul id="dropdown" className="flex-row justify-center items-center hidden bg-white w-full gap-x-2 py-2" aria-labelledby="dropdownDefaultButton">
                    <li><a href="/" className={p600.className}>Home</a></li>
                    <li><a href="https://thearborvictorianliving.ca/">About</a></li>
                    <li><a href="/apply">Application</a></li>
                    <li><a href="https://thearborvictorianliving.ca/">Vacancies</a></li>
                    <li><a href="/login" className="flex flex-row gap-x-2"><h1>Login</h1> <Image src="/icons/Profile.png" height={10} width={20} alt="Profile" /></a></li>
                </ul>
            </header >
        )}
        </>
    )
}

