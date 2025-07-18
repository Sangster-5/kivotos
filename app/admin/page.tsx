'use client';

import { ChangeEvent, useEffect, useState, useRef } from 'react';
import { postRequest, getRequest } from '@/lib/fetch';
import { Raleway, Poppins } from 'next/font/google';
import '@/app/globals.css';
import Carousel from '../Carousel';
import Image from 'next/image';

const r700 = Raleway({ subsets: ['latin'], weight: "700" });
const r600 = Raleway({ subsets: ['latin'], weight: "600" });
const p400 = Poppins({ subsets: ['latin'], weight: "400" });
const p300 = Poppins({ subsets: ['latin'], weight: "300" });
const r300 = Raleway({ subsets: ['latin'], weight: "300" });
const r400 = Raleway({ subsets: ['latin'], weight: "400" });
const r500 = Raleway({ subsets: ['latin'], weight: "500" });

interface User {
    id: number;
    username: string;
    name: string;
    approve_applications: boolean;
    create_leases: boolean;
    tasks_admin: boolean;
}

type Task = {
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


type TaskEmployee = {
    id: string,
    name: string | null
}

const AdminLoginForm = () => {
    //Session and View States
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [initialRender, setInitialRender] = useState(false);
    const [tabView, setTabView] = useState("tasks-tab");

    //States
    const [tasks, setTasks] = useState<Task[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [assignedEmployees, setAssignedEmployees] = useState<TaskEmployee[]>([]);
    const [relevantEmployees, setRelevantEmployees] = useState<TaskEmployee[]>([]);
    const [ranOnce, setRanOnce] = useState(false);
    const [createTaskView, setCreateTaskView] = useState(false);
    const [applicationProgressFilter, setApplicationProgressFilter] = useState("In Progress");
    const [applicantSearchFilter, setApplicantSearchFilter] = useState("");
    const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([]);
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [leases, setLeases] = useState<Lease[]>([]);
    const [unitPropertyFilter, setUnitPropertyFilter] = useState("all");
    const [reportTypes, setReportTypes] = useState<string[]>([]);


    //Effects
    const fetchCategories = () => {
        getRequest("/api/tasks/category/get")
            .then((data) => {
                if (data.error) return console.warn(data);
                setCategories(data);
            })
    }

    const fetchTasks = (taskUser: User) => {
        //Run backend check to ensure
        if (!taskUser) return;
        if (taskUser.tasks_admin) {
            getRequest("/api/tasks/get")
                .then((data) => {
                    if (data.error) return console.warn(data);
                    setTasks(data.tasks);
                })
        } else {
            getRequest("/api/tasks/user/get")
                .then((data) => {
                    if (data.error) return console.warn(data);
                    setTasks(data.tasks);
                });
        }
    }

    const fetchMaintenanceRequests = () => {
        getRequest("/api/maintenance/get")
            .then((data) => {
                if (data.error) return console.warn(data);
                setMaintenanceRequests(data.data);
            })
    }

    const fetchComplaints = () => {
        getRequest("/api/complaints/get")
            .then((data) => {
                if (data.error) return console.warn(data);
                setComplaints(data.data);
            })
    }

    const fetchLeases = () => {
        getRequest("/api/lease/get")
            .then((data) => {
                if (data.error) return console.warn(data);
                setLeases(data.data);
            })
    }

    const fetchUpdates = (type: String = "both") => {
        if (!user) return;
        if (ranOnce) return;

        switch (type) {
            case "tasks":
                fetchTasks(user);
                break;

            case "categories":
                fetchCategories();
                break;

            default:
                fetchCategories();
                fetchTasks(user);
                break;
        }
        setRanOnce(true);
    }

    useEffect(fetchUpdates, [user, ranOnce]);

    //Filter States

    // Handlers
    const handleLoginSubmit = (formData: FormData) => {
        let data = {
            username: formData.get("username"),
            password: formData.get("password"),
            validateCookie: false
        }

        if (!data.username && !data.password) {
            data = {
                username: formData.get("usernameM"),
                password: formData.get("passwordM"),
                validateCookie: false
            }
        }

        if (!data.username || !data.password) {
            document.getElementById("errorMSG")?.classList.remove("hidden");
            setTimeout(() => {
                document.getElementById("errorMSG")?.classList.add("hidden");
            }, 2000);
        }

        postRequest("/api/auth/admin", data)
            .then((data) => {
                if (data.message === "Admin Session Created") {
                    setUser(data.user);
                    setIsLoggedIn(true);
                } else {
                    document.getElementById("errorMSG")?.classList.remove("hidden");
                    setTimeout(() => {
                        document.getElementById("errorMSG")?.classList.add("hidden");
                    }, 2000);
                }
            })
            .catch((error) => {
                console.log(error);
            });
    }

    const redirectLogin = () => {
        window.location.href = "/login";
    }

    const handleTabBtnClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        if (event.currentTarget.id !== tabView) setTabView(event.currentTarget.id);
    }

    const handleSelectChange = (event: ChangeEvent<HTMLSelectElement>) => {
        const value = event.currentTarget.value;

        switch (tabView) {
            case "tasks-tab":
                if (event.currentTarget.parentElement) {
                    const taskID = event.currentTarget.parentElement?.parentElement?.parentElement?.id;
                    console.log(taskID)

                    const category = event.currentTarget.parentElement.previousSibling?.previousSibling?.textContent
                    postRequest("/api/tasks/update", { taskID, value, type: "status", source: "task", category: category })
                        .then((data) => {
                            if (data.error) return console.warn(data);
                            if (!user) return;
                            fetchTasks(user);
                        })
                }
                break;

            case "requests-tab":
                if (event.currentTarget.parentElement?.parentElement?.parentElement) {
                    const requestID = event.currentTarget.parentElement.parentElement.parentElement.id;
                    const previousSibling = event.currentTarget.previousSibling as HTMLButtonElement;
                    const data = { taskID: requestID, value, type: "status", source: "maintenance", isAlsoTask: false };

                    if (!previousSibling) data.isAlsoTask = true;
                    postRequest("/api/tasks/update", data)
                        .then((data) => {
                            if (data.error) return console.warn(data);
                            if (!user) return;
                            fetchMaintenanceRequests();
                            fetchTasks(user);
                        })
                }
                break;

            default:
                break;
        }

    }

    const handleSubmitTask = (FormData: FormData) => {
        const isMaintenanceRequest = FormData.get("isMaintenanceRequest") == "on" ? true : false;
        let maintenanceRequestsID = null;
        if (isMaintenanceRequest) maintenanceRequestsID = FormData.get("maintenanceRequestID");

        const data = {
            title: FormData.get("title"),
            description: FormData.get("description"),
            category: FormData.get("categorySelect"),
            employees: assignedEmployees,
            fromMaintenanceRequest: isMaintenanceRequest,
            maintenanceRequestsID: maintenanceRequestsID
        }

        postRequest("/api/tasks/create", data)
            .then((data) => {
                if (data.error) return console.warn(data);
                if (!user) return;
                fetchTasks(user);
                setTabView("tasks-tab");
                setCreateTaskView(false);
            })
    }

    const handleEmployeeSearch = (event: ChangeEvent<HTMLInputElement>) => {
        const data = { name: event.target.value };
        postRequest("/api/employee/name", data)
            .then((data) => {
                if (data.error) return console.warn(data);
                setRelevantEmployees(data);
            })
    }

    const handleEmployeeAssignation = (event: React.MouseEvent<HTMLDivElement>) => {
        const id = event.currentTarget.id;
        const name = event.currentTarget.children[0].textContent;

        setAssignedEmployees((prevAssignedEmployees) => {
            if (prevAssignedEmployees.some(employee => employee.id === id)) return prevAssignedEmployees;

            return [...prevAssignedEmployees, { id: id, name: name }];
        });
    }

    const handleCreateTaskClick = () => {
        setCreateTaskView(true);
    }

    const handleApplicantStatusFilterChange = (event: ChangeEvent<HTMLSelectElement>) => {
        setApplicationProgressFilter(event.target.value);
    }

    const handleApplicantNameSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
        setApplicantSearchFilter(event.target.value);
    }

    const unitPropertySelectorChange = (event: ChangeEvent<HTMLSelectElement>) => {
        setUnitPropertyFilter(event.target.value);
    }

    const generateReport = (event: React.MouseEvent<HTMLButtonElement>) => {
        const report = (event.currentTarget.previousSibling as HTMLSelectElement)?.value;
        postRequest("/api/reports/generate", { report, property: unitPropertyFilter })
            .then((data) => {
                if (data.error) return console.warn(data);
                alert("Report Generated");
            })
    }

    //End Handlers

    useEffect(() => {
        if (document.cookie.includes("adminUsername") && document.cookie.includes("adminPassword") && !isLoggedIn) {

            postRequest("/api/auth/admin", { validateCookie: true })
                .then((data) => {
                    if (data.error) return console.warn(data);
                    if (data.message === "Admin Cookie Validated") {

                        setUser(data.user);
                        setIsLoggedIn(true);
                    }
                    setInitialRender(true);
                })
        } else {
            setInitialRender(true);
        }

        if (tabView == "unit-tab" && reportTypes.length == 0) {
            getRequest("/api/reports/types")
                .then((data) => {
                    if (data.error) return console.warn(data);
                    setReportTypes(data.columns);
                })
        }
    }, [isLoggedIn, tabView, reportTypes.length, setInitialRender]);


    return (
        <div className={((initialRender && !isLoggedIn) ? "bg-[#1c2932] md:bg-custom-gradient-1 h-full flex justify-center" : "min-h-[90vh] md:min-h-[85vh] bg-custom-gradient-1 md:px-20 px-0 flex flex-col items-center md:items-start md:justify-center")}>
            {!initialRender && <h1 className='text-white w-full h-[85vh] text-lg grid items-center justify-center italic'>Loading...</h1>}
            {
                (initialRender && !isLoggedIn) && (
                    <>
                        <form action={handleLoginSubmit} className="relative h-1/2 md:h-auto w-2/3 md:w-[55%] md:mx-auto mt-8 md:mt-0 grid items-center">
                            <div id="aspect" className="hidden md:block aspect-w-16 aspect-h-9 md:shadow-[rgba(0,0,0,0.2)_3rem_3rem_30px_0px]">
                                <Image id="login-logo" objectFit="cover" layout="fill" className="w-full h-full" src="/login-logo.png" alt="Description" />
                            </div>
                            <div className="md:absolute inset-0 flex flex-row">
                                <div className="flex flex-col justify-center md:hidden">
                                    <h1 className={"flex flex-row text-white text-2xl " + p400.className}>Welcome Back!</h1>
                                    <p className={"flex flex-row text-white text-xs mt-4 " + p300.className} >Please enter your admin credentials to access the console.</p>

                                    <div className="flex flex-row mt-6">
                                        <div className="w-full">
                                            <div className="flex flex-row bg-[#101D26] rounded-t-md items-center px-2 h-12">
                                                <div className="flex flex-col w-1/5 p-2">
                                                    <Image height={24} width={24} src="/icons/Mail.png" alt="" />
                                                </div>
                                                <div className="flex flex-col justify-center">
                                                    <label htmlFor="username" className={"text-white text-xs " + r400.className}>Username</label>
                                                    <input className={"w-full bg-[#101D26] text-white text-xs underline decoration-slate-500 " + r300.className} type="text" name="usernameM" placeholder="Your admin username..." />
                                                </div>
                                            </div>
                                            <div className="flex flex-row bg-white rounded-b-md items-center px-2 h-12">
                                                <div className="flex flex-col w-1/5 p-2">
                                                    <Image width={24} height={24} className="h-auto" src="/icons/Lock.png" alt="" />

                                                </div>
                                                <div className="flex flex-col justify-cente">
                                                    <label htmlFor="password" className={"text-[#101D26] text-xs " + r400.className}>Password</label>
                                                    <input className={"w-full text-[#101D26] text-xs underline decoration-slate-500 " + r300.className} type="password" name="passwordM" placeholder="Your password..." />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <p id="error-msg" className="flex flex-row hidden text-red-500 mt-2"></p>
                                    <div className={"flex flex-row w-full items-center text-white text-sm mt-4 " + r400.className} >
                                        <div className="flex items-center">
                                            <input readOnly checked className="accent-white" type="checkbox" name="remember" id="remember" />
                                            <label htmlFor="remember" className="ml-2 text-xs">You&apos;re Remembered</label>
                                        </div>
                                    </div>
                                    <div className={"flex flex-row gap-x-4 mt-6 text-white text-xs items-center  " + r400.className}>
                                        <button className={"bg-[#73ACC9] text-[#101D26] text-xs w-32 h-8 rounded-sm " + r300.className} type="submit">Login</button>
                                    </div>
                                </div>
                                <div className="hidden md:flex flex-col w-[45%] justify-center p-8">
                                    <h1 className={"flex flex-row text-white text-2xl " + p400.className}>Welcome Back!</h1>
                                    <p className={"flex flex-row text-white text-xs mt-4 " + p300.className} >Please enter your admin credentials to access the console.</p>

                                    <div className="flex flex-row mt-6">
                                        <div className="w-full">
                                            <div className="flex flex-row bg-[#101D26] rounded-t-md items-center px-2 h-12">
                                                <div className="flex flex-col w-1/5 p-2">
                                                    <Image height={24} width={24} src="/icons/Mail.png" alt="" />
                                                </div>
                                                <div className="flex flex-col justify-center">
                                                    <label htmlFor="username" className={"text-white text-xs " + r400.className}>Username</label>
                                                    <input className={"w-full bg-[#101D26] text-white text-xs underline decoration-slate-500 " + r300.className} type="text" name="username" placeholder="Your admin username..." />
                                                </div>
                                            </div>
                                            <div className="flex flex-row bg-white rounded-b-md items-center px-2 h-12">
                                                <div className="flex flex-col w-1/5 p-2">
                                                    <Image width={24} height={24} className="h-auto" src="/icons/Lock.png" alt="" />

                                                </div>
                                                <div className="flex flex-col justify-cente">
                                                    <label htmlFor="password" className={"text-[#101D26] text-xs " + r400.className}>Password</label>
                                                    <input className={"w-full text-[#101D26] text-xs underline decoration-slate-500 " + r300.className} type="password" name="password" placeholder="Your password..." />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <p id="errorMSG" className="hidden my-2 text-white text-sm">Invalid Credentials</p>
                                    <div className={"flex flex-row w-full items-center text-white text-sm mt-4 " + r400.className} >
                                        <div className="flex items-center">
                                            <input readOnly checked className="accent-white" type="checkbox" name="remember" id="remember" />
                                            <label htmlFor="remember" className="ml-2 text-xs">You&apos;re Remembered</label>
                                        </div>
                                        <a href="#" className="ml-auto text-xs">Forgot Password?</a>
                                    </div>
                                    <div className={"flex flex-row gap-x-4 mt-6 text-white text-xs items-center  " + r400.className}>
                                        <button className={"bg-[#73ACC9] text-[#101D26] text-xs w-24 h-8 rounded-sm " + r300.className} type="submit">Login</button>
                                    </div>
                                </div>
                                <div className="hidden md:flex flex-col w-[55%]"></div>
                            </div>
                        </form >
                    </>
                )
            }
            {
                (initialRender && isLoggedIn && user) && (
                    <>
                        <h1 className={'hidden md:block px-20 text-3xl font-bold py-8 text-white ' + r700.className}>Welcome, {user.name}</h1>

                        <div className='flex flex-col w-screen md:w-full justify-center md:px-20 md:pb-8 gap-y-2'>
                            <div className="flex flex-row flex-wrap gap-x-2 gap-y-2 md:p-0 p-2">
                                <button id="tasks-tab" onClick={handleTabBtnClick} className='bg-[#192F3D] text-white rounded-md h-8 px-4'>Tasks</button>
                                {user.approve_applications && <button id="applications-tab" onClick={handleTabBtnClick} className='bg-[#192F3D] text-white rounded-md h-8 px-4'>Applications</button>}
                                {user.tasks_admin && <button id="complaints-tab" onClick={handleTabBtnClick} className='bg-[#192F3D] text-white rounded-md h-8 px-4'>Issues</button>}
                                {user.create_leases && <button id="leases-tab" onClick={handleTabBtnClick} className='bg-[#192F3D] text-white rounded-md h-8 px-4'>Leases</button>}
                                {user.tasks_admin && <button id="requests-tab" onClick={handleTabBtnClick} className='bg-[#192F3D] text-white rounded-md h-8 px-4'>Incoming Requests</button>}
                                {user.create_leases && <button id="unit-tab" onClick={handleTabBtnClick} className='bg-[#192F3D] text-white rounded-md h-8 px-4'>Units</button>}
                            </div>
                            <div className="flex flex-row">
                                {tabView == "tasks-tab" && (
                                    <section className='w-full min-h-[80vh] md:min-h-auto'>
                                        <div className="bg-[#192F3D] h-full p-8 flex flex-col rounded-md">
                                            <div className="flex flex-row">
                                                <h1 className={"text-2xl text-white font-bold mb-6"}>Tasks</h1>
                                            </div>
                                            <Tasks tasks={tasks} categories={categories} fetchCategories={fetchCategories} handleSelectChange={handleSelectChange} handleSubmitTask={handleSubmitTask} handleEmployeeSearch={handleEmployeeSearch} relevantEmployees={relevantEmployees} handleEmployeeAssignation={handleEmployeeAssignation} assignedEmployees={assignedEmployees} handleCreateTaskClick={handleCreateTaskClick} createTaskView={createTaskView} />
                                        </div>
                                    </section>
                                )}
                                {(tabView == "applications-tab" && user.approve_applications) && (
                                    <section className='w-full min-h-[80vh] md:min-h-auto'>
                                        <div className='bg-[#192F3D] h-full p-8 flex flex-col rounded-md'>
                                            <div className="flex flex-row">
                                                <h1 className={"text-2xl text-white font-bold mb-6"}>Applications</h1>
                                            </div>
                                            <div className='flex gap-x-2'>
                                                <select onChange={handleApplicantStatusFilterChange} defaultValue="In Progress" className='h-8 px-2 rounded-md' name="filter-applicant-status" id="filter-applicant-status">
                                                    <option value="In Progress">In Progress</option>
                                                    <option value="Accepted">Accepted</option>
                                                    <option value="Rejected">Rejected</option>
                                                </select>
                                                <input onChange={handleApplicantNameSearchChange} className='h-8 px-2 rounded-md' type="text" name='search-applicant-name' id='search-applicant-name' placeholder='Search Applicant' />
                                            </div>
                                            <div className="flex flex-row mt-2">
                                                <RentalApplications statusFilter={applicationProgressFilter} nameFilter={applicantSearchFilter} user={user} />
                                            </div>
                                        </div>
                                    </section>
                                )}
                                {(tabView == "requests-tab" && user.tasks_admin) && (
                                    <section className='w-full min-h-[80vh] md:min-h-auto'>
                                        <div className='bg-[#192F3D] h-full p-8 flex flex-col rounded-md'>
                                            <div className="flex flex-row">
                                                <h1 className={"text-2xl text-white font-bold mb-6"}>Incoming Requests</h1>
                                            </div>
                                            <MaintenanceRequests maintenanceRequests={maintenanceRequests} fetchMaintenanceRequests={fetchMaintenanceRequests} user={user} categories={categories} handleEmployeeSearch={handleEmployeeSearch} relevantEmployees={relevantEmployees} handleEmployeeAssignation={handleEmployeeAssignation} assignedEmployees={assignedEmployees} handleSubmitTask={handleSubmitTask} handleSelectChange={handleSelectChange} />
                                        </div>
                                    </section>
                                )}
                                {(tabView == "complaints-tab" && user.tasks_admin) && (
                                    <section className='w-full min-h-[80vh] md:min-h-auto'>
                                        <div className="bg-[#192F3D] h-full p-8 flex flex-col rounded-md">
                                            <div className="flex flex-row">
                                                <h1 className={"text-2xl text-white font-bold mb-6"}>Incoming Issues</h1>
                                            </div>
                                            <Complaints complaints={complaints} fetchComplaints={fetchComplaints} />
                                        </div>
                                    </section>
                                )}
                                {(tabView == "leases-tab" && user.create_leases) && (
                                    <section className='w-full min-h-[80vh] md:min-h-auto'>
                                        <div className="bg-[#192F3D] h-full p-8 flex flex-col rounded-md">
                                            <div className="flex flex-row">
                                                <h1 className={"text-2xl text-white font-bold mb-6"}>Leases</h1>
                                            </div>
                                            <Leases fetchLeases={fetchLeases} leases={leases} />
                                        </div>
                                    </section>
                                )}
                                {(tabView == "unit-tab" && user.tasks_admin) && (
                                    <section className='w-full min-h-[80vh] md:min-h-auto'>
                                        <div className="bg-[#192F3D] h-full p-8 flex flex-col rounded-md gap-y-4">
                                            <div className="flex flex-row">
                                                <h1 className={"text-2xl text-white font-bold mb-6"}>Units</h1>
                                            </div>
                                            <div className="flex flex-row gap-x-2">
                                                <select onChange={unitPropertySelectorChange} name="propertySelector" id="propertySelector" className='flex flex-col w-2/5 px-2 py-1 rounded-md'>
                                                    <option value="all">All</option>
                                                    <option value="theArborVictorianLiving">The Arbor Victorian Living</option>
                                                    <option value="arborVitaliaCourtyard">Arbor Vitalia Courtyard</option>
                                                </select>
                                                <select name="generateReportSelector" id="generateReportSelector" className='w-1/5 px-2 py-1 rounded-md'>
                                                    <option value="rent-roll">Rent Roll</option>
                                                    {reportTypes.map((reportType, index) => {
                                                        return (
                                                            <option key={index} value={reportType}>
                                                                {reportType.replaceAll("_", " ")}
                                                            </option>
                                                        )
                                                    })}
                                                </select>
                                                <button onClick={generateReport} className='bg-white rounded-md px-4 py-1'>Generate</button>
                                            </div>
                                            <Units unitPropertyFilter={unitPropertyFilter} />
                                        </div>
                                    </section>
                                )}
                            </div>
                        </div>
                    </>
                )
            }
        </div >
    );
};

export default AdminLoginForm;

interface TasksProps {
    categories: string[];
    handleSelectChange: (event: ChangeEvent<HTMLSelectElement>) => void;
    handleSubmitTask: (FormData: FormData) => void;
    handleEmployeeSearch: (event: ChangeEvent<HTMLInputElement>) => void;
    relevantEmployees: TaskEmployee[];
    handleEmployeeAssignation: (event: React.MouseEvent<HTMLDivElement>) => void;
    assignedEmployees: TaskEmployee[];
    tasks: Task[];
    fetchCategories: () => void;
    handleCreateTaskClick: () => void;
    createTaskView: boolean;
}

const Tasks: React.FC<TasksProps> = ({ tasks, categories, fetchCategories, handleSelectChange, handleSubmitTask, handleEmployeeSearch, relevantEmployees, handleEmployeeAssignation, assignedEmployees, handleCreateTaskClick, createTaskView }) => {
    //States
    const [categoryFilter, setCategoriesFilter] = useState("all");
    const addCategoryInputRef = useRef<HTMLInputElement>(null);

    //Effects

    //Handlers
    const handleAddCategory = async (FormData: FormData) => {
        const category = FormData.get("createCategory");

        if (!category) return console.log("No Category Provided");
        if (categories.includes(category as string)) return console.log("Category Already Exists");

        // Traditional Method:
        // const data = await postRequest("/api/tasks/category/add", { category: category })
        // if (data.error) return console.warn(data);
        // console.log(data);

        postRequest("/api/tasks/category/add", { category: category })
            .then(data => {
                if (data.error) return console.warn(data);
                fetchCategories();
                if (addCategoryInputRef.current) {
                    addCategoryInputRef.current.value = "";
                }
            })
    }

    const handleCategorySelectChange = (event: ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value;
        setCategoriesFilter(value);
    }

    //End Handlers

    return (
        <>
            <div className="flex flex-row gap-x-2 mb-4 flex-wrap gap-y-2">
                <button onClick={handleCreateTaskClick} className={'bg-[#00AF5B] text-sm text-white w-32 h-8 rounded-md shadow-md ' + r600.className}>Create Task</button>
                {/* <button>New Worker</button> */}
                <form action={handleAddCategory} className="relative">
                    <input ref={addCategoryInputRef} type="text" name="createCategory" placeholder="New Category" className="bg-white h-8 w-64 px-8 rounded-lg shadow-md"></input>
                    <button className="absolute hover:cursor-pointer top-[15%] left-0 flex items-center pl-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                    </button>
                </form>
                <select onChange={handleCategorySelectChange} className='bg-white flex items-center h-8 w-48 px-4 rounded-lg shadow-md' name="categorySelect" id="categorySelect">
                    <option value="all">All Categories</option>
                    {categories.map((category, index) => (
                        <option key={index} value={category}>
                            {category}
                        </option>
                    ))}
                </select>
            </div>
            {!createTaskView && (
                <>
                    <h1 className='text-lg text-white'>Todo</h1>
                    <div className='grid mt-1'>
                        <Carousel tasks={tasks.filter((task) => task.status === "todo")} taskSelectCallback={handleSelectChange} />
                    </div>

                    <h1 className='mt-4 text-lg text-white'>In Progress</h1>
                    <div className='grid mt-1'>
                        <Carousel tasks={tasks.filter((task) => task.status === "in-progress")} taskSelectCallback={handleSelectChange} />
                    </div>

                    <h1 className='mt-4 text-lg text-white'>Completed</h1>
                    <div>
                        <Carousel tasks={tasks.filter((task) => task.status === "completed")} taskSelectCallback={handleSelectChange} />
                    </div>
                </>
            )
            }
            {createTaskView && (
                <form action={handleSubmitTask} className='text-white'>
                    <div className="flex flex-row gap-x-2">
                        <div className="flex flex-col w-1/2">
                            <label htmlFor="title" className={r500.className}>Task Title</label>
                            <input name="title" type="text" className='rounded-sm p-1 text-black' placeholder='Enter title' />
                        </div>
                        <div className="flex flex-col w-1/2">
                            <label htmlFor="categorySelect" className={r500.className}>Select Category</label>
                            <select name="categorySelect" className='h-full text-black rounded-sm' id="categorySelect">
                                {categories.map((category, index) => (
                                    <option key={index} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="flex flex-row w-full mt-4 text-black">
                        <textarea name="description" id="description" placeholder='Write task description here' className='w-full p-2 rounded-sm' rows={10}></textarea>
                    </div>
                    <div className="flex flex-row mt-4 gap-x-4">
                        <div className="flex flex-col w-1/2">
                            <label htmlFor="employeeSearch" className={r500.className}>Assign Employees</label>
                            <input type="text" name='employeeSearch' placeholder='Search Employees' className='p-2 rounded-sm text-black' onChange={handleEmployeeSearch} />

                            <div id='employeeRender' className='mt-4'>
                                {relevantEmployees.length == 0 && (
                                    <h1>No Results</h1>
                                )}
                                {relevantEmployees.length > 0 && relevantEmployees.map((employee: TaskEmployee, index) => {
                                    return (
                                        <div className='bg-white border-2 border-gray-100 px-4 py-2 rounded-sm flex flex-row text-black' id={employee.id} key={index} onClick={handleEmployeeAssignation}>
                                            <p id='employee-name' className='flex flex-col w-1/2'>{employee.name}</p>
                                            <p className='border-2 rounded-md flex flex-col w-1/2 text-center hover:cursor-pointer'>Assign</p>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                        <div className="flex flex-col w-1/2">
                            <h1 className={r500.className}>Assigned Employees</h1>
                            {assignedEmployees.length > 0 && (
                                assignedEmployees.map((employee: TaskEmployee, index) => {
                                    return <h1 key={index}>{employee.name} - {employee.id}</h1>
                                })
                            )}
                        </div>
                    </div>
                    <div className="flex flex-row">
                        <button type="submit" className='border-2 px-4 py-2 mt-4 rounded-md'>Submit Task</button>
                    </div>
                </form>
            )}
        </>
    )
}

type Tenant = {
    tenantFullname: string | null;
    tenantOccupation: string | null;
    tenantEmploymentType: string | null;
    tenantEmployer: string | null;
    tenantEmployerAddress: string | null;
    tenantEmploymentDuration: string | null;
    tenantAnnualIncome: number;
    tenantBusinessTelephone: string | null;
    tenantBank: string | null;
    tenantBankBranch: string | null;
};

type Occupant = {
    tenantName: string | null;
    tenantRelationship: string | null;
    tenantAge: number | null;
    tenantEmail: string | null;
};

type Unit = {
    id: number;
    leases: number[];
    email: string;
    phone: string;
    unit: string;
    property: string;
    active_lease: number;
    occupants: Occupant[];
    tenants: Tenant[];
    maintenance_requests: number[];
    active_lease_start: Date;
    active_lease_end: Date;
    current_rent: number;
    past_rent: number[];
}

interface UnitsProps {
    unitPropertyFilter: string;
}

const Units: React.FC<UnitsProps> = ({ unitPropertyFilter }) => {
    const [units, setUnits] = useState([]);
    const [ranOnce, setRanOnce] = useState(false);

    const fetchUnits = () => {
        if (ranOnce) return;
        getRequest("/api/units")
            .then((data) => {
                setUnits(data.units);
                setRanOnce(true);
            })
            .catch((error) => {
                console.log(error);
            });
    }

    useEffect(fetchUnits);

    const vacateUnit = (event: React.MouseEvent<HTMLButtonElement>) => {
        const unitData = event.currentTarget.id.split("-");
        const unitID = parseInt(unitData[0]);
        const rent = parseFloat(unitData[1]);
        postRequest("/api/units/vacate", { unitID, rent })
            .then((data) => {
                if (data.error) return console.warn(data);
                setRanOnce(false);
            })
    }

    return (
        <>
            {units.map((unit: Unit, index) => {
                if (unitPropertyFilter == "" || unit.property == unitPropertyFilter || unitPropertyFilter == "all")
                    return (
                        <div key={index} className="flex flex-row flex-wrap gap-x-2 w-full rounded-md p-4 text-white bg-[#234154]">
                            <div className='w-full flex flex-col gap-y-2 rounded-md p-2'>
                                <div className="flex flex-row w-full">
                                    <div className="flex flex-col w-1/3">
                                        <h1>{unit.unit} - {unit.property == "theArborVictorianLiving" ? "Arbor Victorian Living" : "Vitalia Courtyard"}</h1>
                                    </div>
                                    {unit.active_lease ? (
                                        <div className="flex flex-col text-end w-2/3">
                                            <h1>{unit.tenants.map(tenant => tenant.tenantFullname + " ")}</h1>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col text-end w-2/3">
                                            <h1>No Current Tenants</h1>
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-row">
                                    <h1 className='flex flex-col w-1/5 rounded-md text-white'>Rent: ${unit.current_rent}</h1>
                                    <h1 className='flex flex-col w-4/5 text-end'>Lease Term: {new Date(unit.active_lease_start).toLocaleDateString()} - {new Date(unit.active_lease_end).toLocaleDateString()}</h1>
                                </div>
                                <div className="flex flex-row flex-wrap">
                                    <div className="flex flex-col w-1/2" >
                                        <h1>
                                            <a href={`tel:+${unit.phone}`}>{unit.phone}</a> - <a href={`mailto:${unit.email}`}>{unit.email}</a>
                                        </h1>
                                    </div>

                                    <div className='w-full md:justify-end items-end flex flex-row flex-wrap gap-x-2 mt-4 md:mt-0'>
                                        {unit.active_lease && (
                                            <>
                                                <a className="flex justify-center items-center rounded-md bg-[#192f3d] w-full md:w-40 h-8 font-medium" download={unit.active_lease} href={`/api/files?type=lease&filename=${unit.active_lease}.xlsx`}>Download Lease</a>
                                                <button id={unit.id.toString() + "-" + unit.current_rent} onClick={vacateUnit} className='flex items-center justify-center bg-[#FF5858] h-8 rounded-md font-medium w-full md:w-40'>Vacate Unit</button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                        </div>
                    );
            })
            }
        </>

    )
}

type Complaint = {
    id: number;
    type: string;
    details: string;
    timestamp: Date;
    status: string;
    action_timestamp: Date;
}

interface ComplaintsProps {
    complaints: Complaint[];
    fetchComplaints: () => void;
}

//Consider converting to tasks?
const Complaints: React.FC<ComplaintsProps> = ({ complaints, fetchComplaints }) => {
    const [ranOnce, setRanOnce] = useState(false);

    useEffect(() => {
        if (ranOnce) return;
        fetchComplaints();
        setRanOnce(true);
    }, [setRanOnce, fetchComplaints, ranOnce]);

    const [typeFilter, setTypeFilter] = useState("all");
    const handleTypeChange = (event: ChangeEvent<HTMLSelectElement>) => {
        const value = event.currentTarget.value;
        setTypeFilter(value);
    }

    const handleSelectChange = (event: ChangeEvent<HTMLSelectElement>) => {
        const value = event.currentTarget.value;
        const complaintID = event.currentTarget.id;
        postRequest("/api/complaints/update", { id: complaintID, status: value })
            .then((data) => {
                if (data.error) return console.warn(data);
                fetchComplaints();
            })
    }

    return (
        <>
            <div className="flex flex-row">
                <select onChange={handleTypeChange} name="selectType" id="selectType" className='rounded-md px-2 py-1 mb-2'>
                    <option value="all">All</option>
                    <option value="noise">Noise Complaints</option>
                    <option value="pet">Pet Complaints</option>
                    <option value="parking">Unauthorized Parking</option>
                </select>
            </div>
            <>
                <h1 className='text-lg text-white'>Pending</h1>
                <div className='grid  mt-1'>
                    <Carousel taskSelectCallback={handleSelectChange} complaints={complaints.filter((task) => task.status === "pending").filter((complaint) => (complaint.type === typeFilter || typeFilter === "all"))} />
                </div>

                <h1 className='mt-4 text-lg text-white'>Reviewed</h1>
                <div className='grid'>
                    <Carousel taskSelectCallback={handleSelectChange} complaints={complaints.filter((task) => task.status === "reviewed").filter((complaint) => (complaint.type === typeFilter || typeFilter === "all"))} />
                </div>

                <h1 className='mt-4 text-lg text-white'>Completed</h1>
                <div>
                    <Carousel taskSelectCallback={handleSelectChange} complaints={complaints.filter((task) => task.status === "completed").filter((complaint) => (complaint.type === typeFilter || typeFilter === "all"))} />
                </div>
            </>
        </>
    )
}

type MaintenanceRequest = {
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

interface MaintenanceRequestProps {
    user: User;
    categories: string[];
    handleEmployeeSearch: (event: ChangeEvent<HTMLInputElement>) => void;
    relevantEmployees: TaskEmployee[];
    handleEmployeeAssignation: (event: React.MouseEvent<HTMLDivElement>) => void;
    assignedEmployees: TaskEmployee[];
    handleSubmitTask: (FormData: FormData) => void;
    handleSelectChange: (event: ChangeEvent<HTMLSelectElement>) => void;
    fetchMaintenanceRequests: () => void;
    maintenanceRequests: MaintenanceRequest[];
}

const MaintenanceRequests: React.FC<MaintenanceRequestProps> = ({ maintenanceRequests, user, categories, handleEmployeeSearch, relevantEmployees, handleEmployeeAssignation, assignedEmployees, handleSubmitTask, handleSelectChange, fetchMaintenanceRequests }) => {
    const [ranOnce, setRanOnce] = useState(false);

    useEffect(() => {
        if (ranOnce) return;
        fetchMaintenanceRequests();
        setRanOnce(true);
    }, [setRanOnce, fetchMaintenanceRequests, ranOnce]);

    const [requestToTaskForm, setRequestToTaskForm] = useState(false);
    const [taskData, setTaskData] = useState<Task | null>(null);
    const handleMaintenanceRequestToTask = (event: React.MouseEvent<HTMLButtonElement>) => {
        const id = event.currentTarget.id;
        const request = event.currentTarget.parentElement?.parentElement;
        const dateText = request?.children[4].textContent ?? "";
        const property = (request?.children[3].textContent ?? "") == "theArborVictorianLiving" ? "The Abor Victorian Living" : "Vitalia Courtyard Properties";
        const date = new Date(dateText);
        const newAssignedEmployees = assignedEmployees.map(employee => parseInt(employee.id));
        const taskData: Task = {
            id: parseInt(id),
            status: "todo",
            title: `${request?.children[0].textContent || ""} - ${request?.children[1].textContent || ""}`,
            description: `-${property}-\n${request?.children[2].textContent || ""}`,
            assigned_employees: newAssignedEmployees,
            created_by: user.id,
            created_timestamp: date,
            finished_timestamp: null,
            category: "Maintenance"
        }
        setTaskData(taskData);
        setRequestToTaskForm(true);
    }

    return (<div>
        {requestToTaskForm && (
            <form action={handleSubmitTask} className='text-white'>
                <input className="hidden" type="checkbox" name='isMaintenanceRequest' readOnly checked />
                {taskData && <input type="number" name='maintenanceRequestID' className='hidden' readOnly defaultValue={taskData.id} />}
                <div className="flex flex-row gap-x-2">
                    <div className="flex flex-col w-1/2">
                        <label htmlFor="title" className={r500.className}>Task Title</label>
                        <input name="title" type="text" className='rounded-sm text-black p-1' placeholder='Enter title' defaultValue={taskData?.title} />
                    </div>
                    <div className="flex flex-col w-1/2">
                        <label htmlFor="categorySelect" className={r500.className}>Select Category</label>
                        {<select name="categorySelect" defaultValue={taskData?.category} className='h-full rounded-sm text-black' id="categorySelect">
                            {categories.map((category, index) => (
                                <option key={index} value={category}>
                                    {category}
                                </option>
                            ))}
                        </select>}
                    </div>
                </div>
                <div className="flex flex-row w-full mt-4">
                    <textarea name="description" id="description" placeholder='Write task description here' defaultValue={taskData?.description} className='w-full text-black p-2 rounded-sm' rows={10}></textarea>
                </div>
                <div className="flex flex-row mt-4 gap-x-4">
                    <div className="flex flex-col w-1/2">
                        <label htmlFor="employeeSearch" className={r500.className}>Assign Employees</label>
                        <input type="text" name='employeeSearch' className='p-2 rounded-sm' placeholder='Search Employee' onChange={handleEmployeeSearch} />

                        <div id='employeeRender' className='mt-4'>
                            {relevantEmployees.length == 0 && (
                                <h1>No Results</h1>
                            )}
                            {relevantEmployees.length > 0 && relevantEmployees.map((employee: any, index) => {
                                return (
                                    <div className='bg-white border-2 border-gray-100 px-4 py-2 rounded-sm flex flex-row' id={employee.id} key={index} onClick={handleEmployeeAssignation}>
                                        <p id='employee-name' className='flex flex-col w-1/2'>{employee.name}</p>
                                        <p className='border-2 rounded-md flex flex-col w-1/2 text-center hover:cursor-pointer'>Assign</p>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                    <div className="flex flex-col w-1/2">
                        <h1>Assigned Employees</h1>
                        {assignedEmployees.length > 0 && (
                            assignedEmployees.map((employee: TaskEmployee, index) => {
                                return <h1 key={index}>{employee.name} - {employee.id}</h1>
                            })
                        )}
                    </div>
                </div>
                <div className="flex flex-row">
                    <button type="submit" className='border-2 px-4 py-2 mt-4 rounded-md text-white'>Submit Task</button>
                </div>
            </form>
        )
        }
        {!requestToTaskForm && <>
            <h1 className='text-lg text-white'>Todo</h1>
            <div className='grid mt-1'>
                <Carousel requests={maintenanceRequests.filter((request) => request.status === "todo")} handleMaintenanceRequestToTask={handleMaintenanceRequestToTask} taskSelectCallback={handleSelectChange} />
            </div>

            <h1 className='mt-4 text-lg text-white'>In Progress</h1>
            <div className='grid'>
                <Carousel requests={maintenanceRequests.filter((request) => request.status === "in-progress")} handleMaintenanceRequestToTask={handleMaintenanceRequestToTask} taskSelectCallback={handleSelectChange} />
            </div>

            <h1 className='mt-4 text-lg text-white'>Completed</h1>
            <div>
                <Carousel requests={maintenanceRequests.filter((request) => request.status === "completed")} handleMaintenanceRequestToTask={handleMaintenanceRequestToTask} taskSelectCallback={handleSelectChange} />
            </div>
        </>
        }
    </div >)
}

type Lease = {
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

interface LeasesProps {
    leases: Lease[];
    fetchLeases: (refresh?: boolean) => void;
}

const Leases: React.FC<LeasesProps> = ({ leases, fetchLeases }) => {
    const [ranOnce, setRanOnce] = useState(false);

    useEffect(() => {
        if (ranOnce) return;
        fetchLeases();
        setRanOnce(true);
    }, [setRanOnce, fetchLeases, ranOnce])

    const handleLeaseConfirmation = (event: React.MouseEvent<HTMLButtonElement>) => {
        const id = event.currentTarget.parentElement?.id;
        if (!id) return;

        postRequest("/api/lease/confirm", { id: id })
            .then((data) => {
                if (data.error) return console.warn(data);
                fetchLeases(true);
            })
    }

    return (
        <>
            <div className="flex flex-row gap-x-2">
                <select name="leaseTimeFrame" id="leaseTimeFrame" defaultValue="ongoing" className='mb-4 px-4 py-1 rounded-md'>
                    <option value="all">All</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="expired">Expired</option>
                </select>
                <select name="leaseConfirmationType" id="leaseConfirmationType" defaultValue="all" className='mb-4 px-4 py-1 rounded-md'>
                    <option value="all">All</option>
                    <option value="signed">Signed</option>
                    <option value="unsigned">Unsigned</option>
                </select>
            </div >
            <h1 className='text-lg text-white my-2'>&lt;1 Month</h1>
            <div>
                <Carousel leases={leases.filter(lease => {
                    const diffTime = new Date().getTime() - new Date(lease.effective_date).getTime();
                    const diffMonths = diffTime / (1000 * 60 * 60 * 24 * 30);

                    if (diffMonths <= 1 && diffMonths > 0) return true;
                })} />
            </div >
            <h1 className='text-lg text-white my-2'>&lt;3 Month</h1>
            <div>
                <Carousel leases={leases.filter(lease => {
                    const diffTime = new Date().getTime() - new Date(lease.effective_date).getTime();
                    const diffMonths = diffTime / (1000 * 60 * 60 * 24 * 30);

                    if (diffMonths < 3 && diffMonths > 1) return true;
                })} />
            </div>
            <h1 className='text-lg text-white my-2'>&lt;6 Months</h1>
            <div>
                <Carousel leases={leases.filter(lease => {
                    const diffTime = new Date().getTime() - new Date(lease.effective_date).getTime();
                    const diffMonths = diffTime / (1000 * 60 * 60 * 24 * 30);

                    if (diffMonths < 6 && diffMonths > 3) return true;
                })} />
            </div>
            <div>
            </div>
        </>
    )
}

interface RentalApplicationProps {
    statusFilter: string;
    nameFilter: string;
    user: User | null;
}

type RentalApplication = {
    name: string
    birth_date: Date,
    drivers_license_number: string,
    telephone_number: string,
    present_address: string,
    email_address: string,
    intended_rental_duration: string,
    present_residence_type: string,
    present_ownership_type: string,
    present_inhabitance_period: string,
    marital_status: string,
    present_rental_amount: number,
    number_of_occupants: number,
    application_unit_number: string,
    approximate_occupancy_date: Date,
    broken_lease: boolean,
    broken_lease_reason: string,
    refused_pay_rent: boolean,
    filled_bankruptcy: boolean,
    occupant_1_name: string,
    occupant_1_relationship: string,
    occupant_1_age: number,
    occupant_1_email: string,
    occupant_2_name: string,
    occupant_2_relationship: string,
    occupant_2_age: number,
    occupant_2_email: string,
    occupant_3_name: string,
    occupant_3_relationship: string,
    occupant_3_age: number,
    occupant_3_email: string,
    occupant_4_name: string,
    occupant_4_relationship: string,
    occupant_4_age: number,
    occupant_4_email: string,
    occupant_5_name: string,
    occupant_5_relationship: string,
    occupant_5_age: number,
    occupant_5_email: string,
    first_choice_unit: string,
    second_choice_unit: string,
    monthly_rental: number,
    vehicle_1: string,
    vehicle_2: string,
    vehicle_3: string,
    tenant_1_occupation: string,
    tenant_1_full_or_part_time: string,
    tenant_1_employer: string,
    tenant_1_address: string,
    tenant_1_employment_term: string,
    tenant_1_annual_income: number,
    tenant_1_business_telephone: string,
    tenant_1_bank: string,
    tenant_1_branch: string,
    tenant_2_occupation: string,
    tenant_2_full_or_part_time: string,
    tenant_2_employed_by: string,
    tenant_2_address: string,
    tenant_2_how_long: string,
    tenant_2_annual_income: string,
    tenant_2_business_telephone: string,
    tenant_2_bank: string,
    tenant_2_branch: string,
    personal_ref_name: string,
    personal_ref_address: string,
    personal_ref_telephone: string,
    personal_ref_relationship: string,
    personal_ref_how_long: string,
    professional_ref_name: string,
    professional_ref_address: string,
    professional_ref_telephone: string,
    professional_ref_relationship: string,
    professional_ref_how_long: string,
    landlord_name: string,
    landlord_address: string,
    landlord_telephone: string,
    emergency_contact_name: string,
    emergency_contact_address: string,
    emergency_contact_phone: string,
    permission_contact_references: boolean,
    drivers_license_sin: string,
    pay_stubs: string,
    tax_return: string,
    holding_fee: number,
    applicant_signature: string,
    user_id: string,
    id: string,
    timestamp: Date,
    approved: boolean,
    rejected: boolean,
    approved_timestamp: Date | null,
    approved_admin: Date | null,
    lease_created: boolean,
}

const RentalApplications: React.FC<RentalApplicationProps> = ({ statusFilter, nameFilter, user }) => {
    const [applications, setApplications] = useState<RentalApplication[]>([]);
    const [previousFilters, setPreviousFilters] = useState({ nameFilter: "_", statusFilter: "" });
    const [createLease, setCreateLease] = useState(false);
    const [leaseForm, setLeaseForm] = useState(0);

    if (previousFilters.statusFilter !== statusFilter || previousFilters.nameFilter !== nameFilter) {
        setPreviousFilters({ nameFilter, statusFilter });
        postRequest("api/application/filter", { statusFilter, nameFilter })
            .then((data) => {
                if (data.error) return console.warn(data.error);
                setApplications(data.applications);
            })
    }

    const handleApproval = (event: React.MouseEvent<HTMLButtonElement>) => {
        const applicationId = event.currentTarget.id;

        postRequest("api/application/approve", { applicationId })
            .then((data) => {
                if (data.error) return console.warn(data.error);
                setPreviousFilters({ nameFilter, statusFilter });
                postRequest("api/application/filter", { statusFilter, nameFilter })
                    .then((data) => {
                        if (data.error) return console.warn(data.error);
                        setApplications(data.applications);
                    });
            })
    };

    const handleDeny = (event: React.MouseEvent<HTMLButtonElement>) => {
        const applicationId = event.currentTarget.id;

        postRequest("api/application/deny", { applicationId })
            .then((data) => {
                if (data.error) return console.warn(data.error);
                postRequest("api/application/filter", { statusFilter, nameFilter })
                    .then((data) => {
                        if (data.error) return console.warn(data.error);
                        setApplications(data.applications);
                    });
            })
    };

    const handleCreateLeaseClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setLeaseForm(parseInt(event.currentTarget.id));
        setCreateLease(true);
    };

    const findUserIDByApplicationId = (applicationID: string) => {
        const application = applications.find((app: RentalApplication) => app.id === applicationID);
        return application ? application.user_id : null
    };

    const handleCreateLeaseSubmit = (FormData: FormData) => {
        const data = {
            property: FormData.get("propertySelector"),
            unitNumber: FormData.get("unitNumber"),
            endingDate: FormData.get("endingDate"),
            initialMonth: FormData.get("initialMonth"),
            rentPrice: FormData.get("rentPrice"),
            applicationId: leaseForm,
        }

        postRequest("api/lease/create", data)
            .then((data) => {
                if (data.error) return console.warn(data.error);
                setCreateLease(false);
                postRequest("api/application/filter", { statusFilter, nameFilter })
                    .then((data) => {
                        if (data.error) return console.warn(data.error);
                        setApplications(data.applications);
                    });
                //Refetch leases?
            })
    }

    return (
        <div className='w-full mt-2'>
            {applications.length == 0 && (<h1 className='text-white font-medium'>No Applications</h1>)}
            {(applications.length > 0 && !createLease) && applications.map((application: RentalApplication, index) => {
                return (
                    <div className='flex flex-row flex-wrap gap-x-2 rounded-md w-full p-3 items-center bg-[#234154] text-white' key={index}>
                        <p className='flex flex-col font-bold'>{application.name}</p>
                        <p className='flex flex-col'>{application.email_address}</p>
                        <p className='flex flex-col'>{application.telephone_number}</p>
                        <p className='flex flex-col'>{new Date(application.timestamp).toDateString()}</p>


                        <div className='flex flex-row grow gap-x-2 justify-end'>
                            {(user?.create_leases && application.approved && !application.lease_created) && (<button id={application.id} onClick={handleCreateLeaseClick} className="grid text-center bg-[#00AF5B] text-white font-medium rounded-md w-32 p-1">Create Lease</button>)}
                            {!application.approved && <button id={application.id} onClick={handleApproval} className="grid text-center font-medium bg-[#192F3D] rounded-md text-white p-1 w-24">Approve</button>}
                            {!application.rejected && !application.lease_created && <button id={application.id} onClick={handleDeny} className="grid text-center font-medium bg-red-500 rounded-md text-white p-1 w-24">Deny</button>}
                            {user?.create_leases && application.lease_created && (
                                <>
                                    <a download={application.id} href={`/api/files?type=lease&filename=${application.id}.xlsx`} className="underline mr-4">Download Lease</a>
                                </>
                            )}
                        </div>
                    </div >
                )
            })}
            {(createLease && leaseForm != 0) && (
                <div className="bg-gray-100 p-8">
                    <h1 className="text-2xl font-bold mb-8">Lease Agreement Form</h1>
                    <form id='leaseCreatorForm' action={handleCreateLeaseSubmit} className="bg-white p-6 rounded-lg shadow-md">
                        <select className='flex flex-row mb-4 bg-gray-100 py-1 px-2 rounded-md' name="propertySelector" id="propertySelector">
                            <option value="theArborVictorianLiving">The Arbor Victorian Living LTD</option>
                            <option value="arborVitaliaCourtyardProperties">The Arbor Vitalia Courtyard Properties LTD</option>
                        </select>

                        <div className="flex flex-row gap-x-8">
                            <div className="flex flex-col mb-4">
                                <label className='flex flex-row' htmlFor="unitNumber">Apartment/Townhouse Number (Optional)</label>
                                <input name="unitNumber" className='border-2 flex flex-row mb-4' type="text" />

                                <label htmlFor="endingDate">Ending on the date of</label>
                                <input className='border-2 px-2' type="date" name="endingDate" id="endingDate" />
                            </div>

                            <div className="flex flex-col">
                                <label htmlFor="initialMonth">Lease Beginning on 1st of</label>
                                <input name="initialMonth" className='border-2 px-2 mb-4' type="month" />

                                <label htmlFor="rentPrice">Tenant Will Pay Rent of</label>
                                <input placeholder='$0' type="number" className='border-2 px-2' name="rentPrice" id="rentPrice" />
                            </div>
                        </div>
                        <input className='hover:cursor-pointer' type="submit" />
                    </form>
                </div>
            )}
        </div >
    )
}