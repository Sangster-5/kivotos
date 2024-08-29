'use client';

import { usePathname } from "next/navigation";
import { Poppins } from "next/font/google";

const p500 = Poppins({ subsets: ["latin"], weight: "500" });
const p200 = Poppins({ subsets: ["latin"], weight: "200" });

export const Sidebar = () => {
    const pathname = usePathname();
    const tenantSideBarPaths = ["/apply", "/issues"];
    const adminSideBarPaths = ["/admin"];
    const fullSideBarPaths = tenantSideBarPaths.concat(adminSideBarPaths);

    return (
        <>{fullSideBarPaths.includes(pathname) && (
            < aside className="w-64 bg-gray-800 text-white p-4" >
                {tenantSideBarPaths.includes(pathname) ? (
                    <nav>
                        <h1 className={"text-lg " + p500.className}>Welcome</h1>
                        <h2 className={"text-md " + p200.className}>Dashboard</h2>
                        <ul>
                            <li className="py-2"><a href="#">Home</a></li>
                            <li className="py-2"><a href="#">About</a></li>
                            <li className="py-2"><a href="#">Services</a></li>
                            <li className="py-2"><a href="#">Contact</a></li>
                        </ul>
                    </nav >
                ) : (
                    <nav>
                        <h1 className={"text-lg " + p500.className}>Welcome</h1>
                        <h2 className={"text-md " + p200.className}>Dashboard</h2>
                        <ul>
                            <li className="py-2"><a href="#">Maintenance Requests</a></li>
                            <li className="py-2"><a href="#">Issues</a></li>
                            <li className="py-2"><a href="#">Applications</a></li>
                            <li className="py-2"><a href="#">Leases</a></li>
                            <li className="py-2"><a href="#">Tasks</a></li>
                        </ul>
                    </nav >
                )}
            </aside >
        )}</>
    )
}