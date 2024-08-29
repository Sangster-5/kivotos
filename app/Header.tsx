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
    const showFullHeaderPath = ["/", "/apply", "/login", "/admin", "/issues", "/maintenance"];
    const showShortHeaderPath = ["/example"];
    const showHeaderPaths = showFullHeaderPath.concat(showShortHeaderPath);
    const [cookieExists, setCookieExists] = useState(false);

    useEffect(() => {
        const cookieStore = document.cookie;

        setCookieExists(cookieStore ? true : false);
    }, [setCookieExists]);

    return (
        <>{showHeaderPaths.includes(pathname) && (
            <header className="px-20 h-[15vh] flex items-center">
                {showFullHeaderPath.includes(pathname) && (
                    // Shown only on root when logged in
                    <nav className="flex flex-row w-full">
                        <div className="flex flex-col w-1/2">
                            <div className="flex flex-row gap-x-4">
                                <Image src="/nav-logo.png" width={64} height={64} alt="The Arbor Group" />
                                <h1 className={"flex items-center text-xl " + cg400.className}>The Arbor Group</h1>
                            </div>
                        </div>
                        <div className="flex flex-col items-end justify-center w-1/2">
                            <ul className={"flex flex-row gap-x-8 " + p400.className}>
                                <li><a href="/" className={p600.className}>Home</a></li>
                                <li><a href="/about">About</a></li>
                                <li><a href="/apply">Application</a></li>
                                <li><a href="/vacancies">Vacancies</a></li>
                                <li><a href="/login"><Image src="/icons/Profile.png" height={20} width={20} alt="Profile" /></a></li>
                            </ul>
                        </div>
                    </nav>
                )}

                {showShortHeaderPath.includes(pathname) && (
                    <h1>Test</h1>
                )}
            </header>
        )}
        </>
    )
}

