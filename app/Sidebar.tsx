'use client';

import { usePathname } from "next/navigation";
import { Poppins } from "next/font/google";
import Image from "next/image";

const p500 = Poppins({ subsets: ["latin"], weight: "500" });
const p200 = Poppins({ subsets: ["latin"], weight: "200" });

export const Sidebar = () => {
    const pathname = usePathname();
    const pathName = pathname.split("/")[1];
    const noSidebarPaths = ["/admin", "/"];
    const formatedPath = pathName.charAt(0).toUpperCase() + pathName.slice(1);

    return (
        <>{!noSidebarPaths.includes(pathname) && (
            < aside className="hidden md:block w-64 bg-gray-800 text-white p-4" >
                <nav>
                    <h1 className={"text-lg " + p500.className}>Welcome</h1>
                    <h2 className={"text-md " + p200.className}>{(formatedPath ? formatedPath : "Home") + " Page"}</h2>
                    <ul>
                        <li className="py-2"><a href="/">Home</a></li>
                        <li className="py-2"><a href="https://thearborvictorianliving.ca/">About</a></li>
                        <li className="py-2"><a href="/apply">Apply</a></li>
                        <li className="py-2"><a href="/issues">Issues</a></li>
                        <li className="py-2"><a href="/maintenance">Maintenance</a></li>
                    </ul>

                    {/* <Image height={75} width={125} src={"/nav-logo-removebg-preview.png"} alt="test" /> */}
                </nav >
            </aside >
        )}</>
    )
}