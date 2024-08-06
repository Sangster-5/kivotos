'use client';

import { ChangeEvent, MouseEventHandler, useEffect, useState } from 'react';

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
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState<User | null>(null);

    const [tabView, setTabView] = useState("tasks-tab");

    const [applicationProgressFilter, setApplicationProgressFilter] = useState("In Progress");
    const [applicantSearchFilter, setApplicantSearchFilter] = useState("");

    const handleApplicantStatusFilterChange = (event: ChangeEvent<HTMLSelectElement>) => {
        setApplicationProgressFilter(event.target.value);
    }

    const handleApplicantNameSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
        setApplicantSearchFilter(event.target.value);
    }

    useEffect(() => {
        if (document.cookie.includes("adminUsername") && document.cookie.includes("adminPassword") && !isLoggedIn) {
            fetch("/api/auth/admin", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ validateCookie: true })
            })
                .then((res) => res.json())
                .then((data) => {
                    if (data.message === "Admin Cookie Validated") {

                        setUser(data.user);
                        setIsLoggedIn(true);
                    }
                })
                .catch((error) => {
                    console.log(error);
                });
        }
    });


    const handleLoginSubmit = (FormData: FormData) => {
        const data = {
            username: FormData.get("username"),
            password: FormData.get("password"),
            validateCookie: false
        }

        if (!data.username || !data.password) {
            document.getElementById("errorMSG")?.classList.remove("hidden");
            setTimeout(() => {
                document.getElementById("errorMSG")?.classList.add("hidden");
            }, 2000);
            return 0;
        }

        fetch("/api/auth/admin", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        })
            .then((res) => res.json())
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

    const [createTaskView, setCreateTaskView] = useState(false);
    const handleCreateTaskClick = () => {
        setCreateTaskView(true);
    }

    const [relevantEmployees, setRelevantEmployees] = useState<TaskEmployee[]>([]);
    const handleEmployeeSearch = (event: ChangeEvent<HTMLInputElement>) => {
        const data = { name: event.target.value };
        fetch("/api/employee/name", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        })
            .then((res) => res.json())
            .then((data) => {
                setRelevantEmployees(data);
            })
            .catch((error) => {
                console.log(error);
            });
    }
    const [assignedEmployees, setAssignedEmployees] = useState<TaskEmployee[]>([]);
    const handleEmployeeAssignation = (event: React.MouseEvent<HTMLDivElement>) => {
        const id = event.currentTarget.id;
        const name = event.currentTarget.children[0].textContent;

        setAssignedEmployees((prevAssignedEmployees) => {
            if (prevAssignedEmployees.some(employee => employee.id === id)) return prevAssignedEmployees;

            return [...prevAssignedEmployees, { id: id, name: name }];
        });
    }

    const [ranOnce, setRanOnce] = useState(false);
    const [categories, setCategories] = useState<string[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);

    const fetchUpdates = (type: String = "both", run: Boolean = false) => {
        const fetchCategories = () => {
            fetch("/api/tasks/category/get", {
                method: "GET",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                }
            })
                .then((res) => res.json())
                .then((data) => {
                    setCategories(data);
                })
                .catch((error) => {
                    console.log(error);
                });
        }
        const fetchTasks = () => {
            fetch("/api/tasks/get", {
                method: "GET",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                }
            })
                .then((res) => res.json())
                .then((data) => {
                    const tasks = data.tasks;
                    setTasks(tasks);
                })
                .catch((error) => {
                    console.log(error);
                });
        }

        if (run || !ranOnce) {
            switch (type) {
                case "tasks":
                    fetchTasks()
                    break;

                case "categories":
                    fetchCategories();
                    break;

                default:
                    fetchCategories()
                    fetchTasks()
                    break;
            }
            setRanOnce(true);
        }
    }

    useEffect(fetchUpdates, [ranOnce, categories, setCategories, tasks, setTasks]);

    const handleAddCategory = (FormData: FormData) => {
        const category = FormData.get("createCategory");

        if (!category) return console.log("No Category Provided");
        if (categories.includes(category as string)) return console.log("Category Already Exists");

        fetch("/api/tasks/category/add", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ category: category })
        })
            .then((res) => res.json())
            .then((data) => {
                fetchUpdates("categories", true);
            })
            .catch((error) => {
                console.log(error);
            });
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

        fetch("/api/tasks/create", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        })
            .then((res) => res.json())
            .then((data) => {
                fetchUpdates("tasks", true);
                setTabView("tasks-tab");
            })
            .catch((error) => {
                console.log(error);
            });
    }

    const handleSelectChange = (event: ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value;
        if (event.target.parentElement && event.target.parentElement.parentElement) {
            const taskID = event.target.parentElement.parentElement.id;
            const category = event.target.parentElement.children[3].textContent || "";

            fetch("/api/tasks/update", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ taskID, value, type: "status", category: category })
            })
                .then((res) => res.json())
                .then((data) => {
                    fetchUpdates("tasks", true);
                })
                .catch((error) => {
                    console.log(error);
                });

            fetchUpdates("tasks", true);
        }
    }

    const [categoryFilter, setCategoriesFilter] = useState("all");
    const handleCategorySelectChange = (event: ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value;
        setCategoriesFilter(value);
    }

    return (
        <>
            {/* Admin Login */}
            {!isLoggedIn && (
                <>
                    <form action={handleLoginSubmit}>
                        <div>
                            <label htmlFor="username">Username:</label>
                            <input
                                type="text"
                                id="username"
                                className='border-2'
                                name='username'
                            />
                        </div>
                        <div>
                            <label htmlFor="password">Password:</label>
                            <input
                                type="password"
                                id="password"
                                className='border-2'
                                name='password'
                            />
                        </div>
                        <button type="submit" className='border-2 px-4 mt-4'>Login</button>
                    </form>
                    <p id="errorMSG" className="hidden mb-2">Invalid Credentials</p>
                    <button onClick={redirectLogin}>Here by Accident?, Click for Tenant Login</button>
                </>
            )}

            {/* Admin Panel */}
            {(isLoggedIn && user) && (
                <>
                    <h1 className='px-20 text-2xl font-bold mt-4'>Welcome, {user.name}</h1>

                    <div className='flex flex-col w-full justify-center px-20 py-8 gap-y-2'>
                        <div className="flex flex-row gap-x-2">
                            {/* Specify which admins can see what */}
                            <button id="tasks-tab" onClick={handleTabBtnClick} className='border-2 px-2'>Tasks</button>
                            {user.approve_applications && <button id="applications-tab" onClick={handleTabBtnClick} className='border-2 px-2'>Applications</button>}
                            {user.tasks_admin && <button id="requests-tab" onClick={handleTabBtnClick} className='border-2 px-2'>Incoming Requests</button>}
                            {user.tasks_admin && <button id="complaints-tab" onClick={handleTabBtnClick} className='border-2 px-2'>Complaints</button>}
                            {user.tasks_admin && <button id="leases-tab" onClick={handleTabBtnClick} className='border-2 px-2'>Leases</button>}
                            {user.tasks_admin && <button id="unit-tab" onClick={handleTabBtnClick} className='border-2 px-2'>Units</button>}
                        </div>
                        <div className="flex flex-row">
                            {/* Make it so other employees only see thier own tasks but tasks admins see all */}
                            {tabView == "tasks-tab" && (
                                <section className='w-full'>
                                    <div className="bg-gray-100 p-8 flex flex-col">
                                        <div className="flex flex-row">
                                            <h1 className="text-2xl font-bold mb-8">Tasks</h1>
                                        </div>
                                        <div className="flex flex-row gap-x-2 mb-4">
                                            <button className='bg-white px-4 py-2 rounded-lg shadow-md' onClick={handleCreateTaskClick}>Create Task</button>
                                            <form action={handleAddCategory} className="relative">
                                                <input type="text" name="createCategory" placeholder="New Category" className="bg-white px-10 py-2 rounded-lg shadow-md"></input>
                                                <button className="absolute hover:cursor-pointer inset-y-0 left-0 flex items-center pl-3">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                                                    </svg>
                                                </button>
                                            </form>
                                            <select onChange={handleCategorySelectChange} className='bg-white px-4 py-2 rounded-lg shadow-md' name="categorySelect" id="categorySelect">
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
                                                <div className="flex flex-row">
                                                    <div className="flex flex-col w-1/3">
                                                        <h1 className="flex flex-row font-bold">Todo</h1>
                                                        <div className="row" id='todo-tasks'></div>
                                                    </div>
                                                    <div className="flex flex-col w-1/3">
                                                        <h1 className="flex flex-row font-bold">In-Progress</h1>
                                                        <div className="row" id='in-progress-tasks'></div>
                                                    </div>
                                                    <div className="flex flex-col w-1/3">
                                                        <h1 className="flex flex-row font-bold">Complete</h1>
                                                        <div className="row" id='complete-tasks'></div>
                                                    </div>
                                                </div>
                                                <div className="flex flex-row">
                                                    <div className="flex flex-col w-1/3">
                                                        {tasks.map((task, index) => {
                                                            if (task.status != "todo") return;
                                                            if (categoryFilter != "all" && task.category != categoryFilter) return;
                                                            return (
                                                                <div key={index} id={task.id.toString()} className='flex flex-row'>
                                                                    <div className="flex flex-col">
                                                                        <h1 className='flex flex-row'>{task.title}</h1>
                                                                        <p className='flex flex-row'>{task.description}</p>
                                                                        <p className='flex flex-row'>{task.assigned_employees}</p>
                                                                        <p className='flex flex-row'>{task.category}</p>
                                                                        <p className='flex flex-row'>{new Date(task.created_timestamp).toLocaleDateString()}</p>
                                                                        <select onChange={handleSelectChange} name="statusSelector" defaultValue="todo" className='rounded-md flex flex-row'>
                                                                            <option value="todo">Todo</option>
                                                                            <option value="in-progress">In Progress</option>
                                                                            <option value="completed">Completed</option>
                                                                        </select>
                                                                    </div>
                                                                </div>)
                                                        })}
                                                    </div>
                                                    <div className="flex flex-col w-1/3">
                                                        {tasks.map((task, index) => {
                                                            if (task.status != "in-progress") return;
                                                            if (categoryFilter != "all" && task.category != categoryFilter) return;
                                                            return (
                                                                <div key={index} id={task.id.toString()} className='flex flex-row'>
                                                                    <div className="flex flex-col">
                                                                        <h1 className='flex flex-row'>{task.title}</h1>
                                                                        <p className='flex flex-row'>{task.description}</p>
                                                                        <p className='flex flex-row'>{task.assigned_employees}</p>
                                                                        <p className='flex flex-row'>{task.category}</p>
                                                                        <p className='flex flex-row'>{new Date(task.created_timestamp).toLocaleDateString()}</p>
                                                                        <select onChange={handleSelectChange} name="statusSelector" defaultValue="in-progress" className='rounded-md'>
                                                                            <option value="in-progress">In Progress</option>
                                                                            <option value="completed">Completed</option>
                                                                            <option value="todo">Todo</option>
                                                                        </select>
                                                                    </div>
                                                                </div>
                                                            )
                                                        })}
                                                    </div>
                                                    <div className="flex flex-col w-1/3">
                                                        {tasks.map((task, index) => {
                                                            if (task.status != "completed") return;
                                                            if (categoryFilter != "all" && task.category != categoryFilter) return;
                                                            return (
                                                                <div key={index} id={task.id.toString()} className='flex flex-row'>
                                                                    <div className="flex flex-col">
                                                                        <h1 className='flex flex-row'>{task.title}</h1>
                                                                        <p className='flex flex-row'>{task.description}</p>
                                                                        <p className='flex flex-row'>{task.assigned_employees}</p>
                                                                        <p className='flex flex-row'>{task.category}</p>
                                                                        <p className='flex flex-row'>{new Date(task.created_timestamp).toLocaleDateString()}</p>
                                                                        <select onChange={handleSelectChange} name="statusSelector" defaultValue="completed" className='rounded-md'>
                                                                            <option value="completed">Completed</option>
                                                                            <option value="todo">Todo</option>
                                                                            <option value="in-progress">In Progress</option>
                                                                        </select>
                                                                    </div>
                                                                </div>
                                                            )
                                                        })}
                                                    </div>

                                                </div>
                                            </>
                                        )}
                                        {createTaskView && (
                                            <form action={handleSubmitTask}>
                                                <div className="flex flex-row gap-x-2">
                                                    <div className="flex flex-col w-1/2">
                                                        <label htmlFor="title">Task Title</label>
                                                        <input name="title" type="text" />
                                                    </div>
                                                    <div className="flex flex-col w-1/2">
                                                        <label htmlFor="categorySelect">Select Category</label>
                                                        <select name="categorySelect" className='h-full' id="categorySelect">
                                                            {categories.map((category, index) => (
                                                                <option key={index} value={category}>
                                                                    {category}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="flex flex-row w-full mt-4">
                                                    <textarea name="description" id="description" className='w-full' rows={10}></textarea>
                                                </div>
                                                <div className="flex flex-row mt-4 gap-x-4">
                                                    <div className="flex flex-col w-1/2">
                                                        <label htmlFor="employeeSearch">Assign Employees</label>
                                                        <input type="text" name='employeeSearch' className='px-4 py-2' onChange={handleEmployeeSearch} />

                                                        <div id='employeeRender' className='mt-4'>
                                                            {relevantEmployees.length == 0 && (
                                                                <h1>No Results</h1>
                                                            )}
                                                            {relevantEmployees.length > 0 && relevantEmployees.map((employee: TaskEmployee, index) => {
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
                                                    <button type="submit" className='border-2 px-4 py-2 mt-4'>Submit Task</button>
                                                </div>
                                            </form>
                                        )}
                                    </div>
                                </section>
                            )}
                            {(tabView == "applications-tab" && user.approve_applications) && (
                                <section className='flex flex-col'>
                                    <div className='flex flex-row gap-x-2'>
                                        <select onChange={handleApplicantStatusFilterChange} defaultValue="In Progress" className='border-2 px-2' name="filter-applicant-status" id="filter-applicant-status">
                                            <option value="In Progress">In Progress</option>
                                            <option value="Accepted">Accepted</option>
                                            <option value="Rejected">Rejected</option>
                                        </select>
                                        <input onChange={handleApplicantNameSearchChange} className='border-2 px-2' type="text" name='search-applicant-name' id='search-applicant-name' placeholder='Search Applicant' />
                                    </div>
                                    <div className="flex flex-row mt-2">
                                        <RentalApplications statusFilter={applicationProgressFilter} nameFilter={applicantSearchFilter} user={user} />
                                    </div>
                                </section>
                            )}
                            {(tabView == "requests-tab" && user.tasks_admin) && (
                                <section className='w-full'>
                                    <div className="bg-gray-100 p-8 flex flex-col">
                                        <div className="flex flex-row">
                                            <h1 className="text-2xl font-bold mb-8">Incoming Requests</h1>
                                        </div>
                                        <MaintenanceRequests user={user} categories={categories} handleEmployeeSearch={handleEmployeeSearch} relevantEmployees={relevantEmployees} handleEmployeeAssignation={handleEmployeeAssignation} assignedEmployees={assignedEmployees} handleSubmitTask={handleSubmitTask} fetchUpdates={fetchUpdates} />
                                    </div>
                                </section>
                            )}
                            {(tabView == "complaints-tab" && user.tasks_admin) && (
                                <section className='w-full'>
                                    <div className="bg-gray-100 p-8 flex flex-col">
                                        <div className="flex flex-row">
                                            <h1 className="text-2xl font-bold mb-8">Incoming Complaints</h1>
                                        </div>
                                        <Complaints />
                                    </div>
                                </section>
                            )}
                            {(tabView == "leases-tab" && user.tasks_admin) && (
                                <section className='w-full'>
                                    <div className="bg-gray-100 p-8 flex flex-col">
                                        <div className="flex flex-row">
                                            <h1 className="text-2xl font-bold mb-8">Leases</h1>
                                        </div>
                                        <Leases />
                                    </div>
                                </section>
                            )}
                            {(tabView == "unit-tab" && user.tasks_admin) && (
                                <section className='w-full'>
                                    <div className="bg-gray-100 p-8 flex flex-col">
                                        <div className="flex flex-row">
                                            <h1 className="text-2xl font-bold mb-8">Units</h1>
                                        </div>
                                        <Units />
                                    </div>
                                </section>
                            )}
                        </div>
                    </div>
                </>
            )
            }

            {/* Check if user is allowed to approve applications, create leases. Then task panel / create task */}
        </>
    );
};

export default AdminLoginForm;

const Units: React.FC = () => {
    return (
        <h1>Units</h1>
    )
}

// Convert to tasks
type Complaint = {
    id: number;
    type: string;
    details: string;
    timestamp: Date;
    status: string;
    action_timestamp: Date;
}

//Consider converting to tasks?
const Complaints: React.FC = () => {
    const [ranOnce, setRanOnce] = useState(false);
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const fetchMaintenanceRequests = (runAnyways: boolean = false) => {
        if (ranOnce) return;
        fetch("/api/complaints/get", {
            method: "GET",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            }
        })
            .then((res) => res.json())
            .then((data) => {
                setComplaints(data.data);
                setRanOnce(true);
            })
            .catch((error) => {
                console.log(error);
            });
    }

    useEffect(fetchMaintenanceRequests, [ranOnce, complaints, setComplaints]);

    const [typeFilter, setTypeFilter] = useState("all");
    const handleTypeChange = (event: ChangeEvent<HTMLSelectElement>) => {
        const value = event.currentTarget.value;
        setTypeFilter(value);
    }

    return (
        <>
            <div className="flex flex-row">
                <select onChange={handleTypeChange} name="selectType" id="selectType" className='px-2 py-1 mb-2'>
                    <option value="all">All</option>
                    <option value="noise">Noise Complaints</option>
                    <option value="pet">Pet Complaints</option>
                    <option value="parking">Unauthorized Parking</option>
                </select>
            </div>
            <div className="flex flex-row gap-x-2">
                <div className="flex flex-col w-1/3">
                    <h1 className="flex flex-row font-bold mb-4">Pending</h1>
                    {complaints.length > 0 && complaints.map((complaint: Complaint, index) => {
                        if (complaint.status == "pending" && (typeFilter == "all" ? true : complaint.type == typeFilter)) {
                            return (
                                <div className="flex flex-row gap-x-2" key={index}>
                                    <div className="flex flex-col">
                                        <h1>{complaint.details}</h1>
                                        <h1>{new Date(complaint.timestamp).toLocaleString()}</h1>
                                        {typeFilter == "all" && <h1>{complaint.type.charAt(0).toUpperCase() + complaint.type.slice(1)}</h1>}
                                    </div>
                                </div>
                            )
                        }
                    })}
                </div>
                <div className="flex flex-col w-1/3">
                    <h1 className="flex flex-row font-bold mb-4">Reviewed</h1>
                    {complaints.length > 0 && complaints.map((complaint: Complaint, index) => {
                        if (complaint.status == "reviewed" && (typeFilter == "all" ? true : complaint.type == typeFilter)) {
                            return (
                                <div className="flex flex-row gap-x-2" key={index}>
                                    <div className="flex flex-col">
                                        <h1>{complaint.details}</h1>
                                        <h1>{new Date(complaint.timestamp).toLocaleString()}</h1>
                                        {typeFilter == "all" && <h1>{complaint.type}</h1>}
                                    </div>
                                </div>
                            )
                        }
                    })}
                </div>
                <div className="flex flex-col w-1/3">
                    <h1 className="flex flex-row font-bold mb-4">Completed</h1>
                    {complaints.length > 0 && complaints.map((complaint: Complaint, index) => {
                        if (complaint.status == "resolved" && (typeFilter == "all" ? true : complaint.type == typeFilter)) {
                            return (
                                <div className="flex flex-row gap-x-2" key={index}>
                                    <div className="flex flex-col">
                                        <h1>{complaint.details}</h1>
                                        <h1>{new Date(complaint.timestamp).toLocaleString()}</h1>
                                        {typeFilter == "all" && <h1>{complaint.type}</h1>}
                                    </div>
                                </div>
                            )
                        }
                    })}
                </div>
            </div>
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
    fetchUpdates: (type: String, run: Boolean) => void;
}

const MaintenanceRequests: React.FC<MaintenanceRequestProps> = ({ user, categories, handleEmployeeSearch, relevantEmployees, handleEmployeeAssignation, assignedEmployees, handleSubmitTask, fetchUpdates }) => {
    const [ranOnce, setRanOnce] = useState(false);
    const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([]);

    const fetchMaintenanceRequests = (runAnyways: Boolean = false) => {
        if (ranOnce && (ranOnce && !runAnyways)) return;
        fetch("/api/maintenance/get", {
            method: "GET",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            }
        })
            .then((res) => res.json())
            .then((data) => {
                setMaintenanceRequests(data.data);
                setRanOnce(true);
            })
            .catch((error) => {
                console.log(error);
            });
    }

    useEffect(fetchMaintenanceRequests, [ranOnce, maintenanceRequests, setMaintenanceRequests]);

    const [requestToTaskForm, setRequestToTaskForm] = useState(false);
    const [taskData, setTaskData] = useState<Task | null>(null);
    const handleMaintenanceRequestToTask = (event: React.MouseEvent<HTMLButtonElement>) => {
        const id = event.currentTarget.id;
        const request = event.currentTarget.parentElement;
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

    const handleSelectChange = (event: ChangeEvent<HTMLSelectElement>) => {
        const value = event.currentTarget.value;

        if (event.currentTarget.parentElement) {
            const requestID = event.currentTarget.parentElement.id;
            fetch("/api/tasks/update", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ taskID: requestID, value, type: "status", source: "maintenance" })
            })
                .then((res) => res.json())
                .then((data) => {
                    fetchMaintenanceRequests(true);
                    fetchUpdates("tasks", true);
                })
                .catch((error) => {
                    console.log(error);
                });
        }
    }

    return (<div className="flex flex-row gap-x-2">
        {requestToTaskForm && (
            <form action={handleSubmitTask}>
                <input className="hidden" type="checkbox" name='isMaintenanceRequest' readOnly checked />
                {taskData && <input type="number" name='maintenanceRequestID' className='hidden' readOnly defaultValue={taskData.id} />}
                <div className="flex flex-row gap-x-2">
                    <div className="flex flex-col w-1/2">
                        <label htmlFor="title">Task Title</label>
                        <input name="title" type="text" defaultValue={taskData?.title} />
                    </div>
                    <div className="flex flex-col w-1/2">
                        <label htmlFor="categorySelect">Select Category</label>
                        {<select name="categorySelect" defaultValue={taskData?.category} className='h-full' id="categorySelect">
                            {categories.map((category, index) => (
                                <option key={index} value={category}>
                                    {category}
                                </option>
                            ))}
                        </select>}
                    </div>
                </div>
                <div className="flex flex-row w-full mt-4">
                    <textarea name="description" id="description" defaultValue={taskData?.description} className='w-full' rows={10}></textarea>
                </div>
                <div className="flex flex-row mt-4 gap-x-4">
                    <div className="flex flex-col w-1/2">
                        <label htmlFor="employeeSearch">Assign Employees</label>
                        <input type="text" name='employeeSearch' className='px-4 py-2' onChange={handleEmployeeSearch} />

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
                    <button type="submit" className='border-2 px-4 py-2 mt-4'>Submit Task</button>
                </div>
            </form>
        )
        }
        {
            !requestToTaskForm && <>
                <div className="flex flex-col w-1/3">
                    <h1 className="flex flex-row font-bold mb-4">Todo</h1>
                    {maintenanceRequests.length > 0 && maintenanceRequests.map((request: MaintenanceRequest, index) => {
                        if (request.status == "todo") {
                            return (
                                <div className="flex flex-row gap-x-2" key={index}>
                                    <div id={request.id.toString()} className="flex flex-col">
                                        <h1 id='tenant-name'>{request.tenant_name}</h1>
                                        <h1 id='unit'>{request.unit}</h1>
                                        <p id='description'>{request.description}</p>
                                        <p id='property'>{request.property}</p>
                                        <h1 id='date'>{new Date(request.date_time).toLocaleString()}</h1>
                                        {!request.is_task && <button className='border-2 px-4 py-2' id={request.id.toString()} onClick={handleMaintenanceRequestToTask}>Create Task</button>}
                                        <select onChange={handleSelectChange} name="statusSelector" defaultValue="todo" className='rounded-md flex flex-row'>
                                            <option value="todo">Todo</option>
                                            <option value="in-progress">In Progress</option>
                                            <option value="completed">Completed</option>
                                        </select>
                                    </div>
                                </div>
                            )
                        }
                    })}
                </div>
                <div className="flex flex-col w-1/3">
                    <h1 className="flex flex-row font-bold mb-4">In Progress</h1>
                    {maintenanceRequests.length > 0 && maintenanceRequests.map((request: MaintenanceRequest, index) => {
                        if (request.status == "in-progress") {
                            return (
                                <div className="flex flex-row gap-x-2" key={index}>
                                    <div id={request.id.toString()} className="flex flex-col">
                                        <h1 id='tenant-name'>{request.tenant_name}</h1>
                                        <h1 id='unit'>{request.unit}</h1>
                                        <p id='description'>{request.description}</p>
                                        <h1 id='date'>{new Date(request.date_time).toLocaleString()}</h1>
                                        {!request.is_task && <button className='border-2 px-4 py-2' id={request.id.toString()} onClick={handleMaintenanceRequestToTask}>Create Task</button>}
                                        <select onChange={handleSelectChange} name="statusSelector" defaultValue="in-progress" className='rounded-md flex flex-row'>
                                            <option value="todo">Todo</option>
                                            <option value="in-progress">In Progress</option>
                                            <option value="completed">Completed</option>
                                        </select>
                                    </div>
                                </div>
                            )
                        }
                    })}
                </div>
                <div className="flex flex-col w-1/3">
                    <h1 className="flex flex-row font-bold mb-4">Completed</h1>
                    {maintenanceRequests.length > 0 && maintenanceRequests.map((request: MaintenanceRequest, index) => {
                        if (request.status == "completed") {
                            return (
                                <div className="flex flex-row gap-x-2" key={index}>
                                    <div id={request.id.toString()} className="flex flex-col">
                                        <h1 id='tenant-name'>{request.tenant_name}</h1>
                                        <h1 id='unit'>{request.unit}</h1>
                                        <p id='description'>{request.description}</p>
                                        <h1 id='date'>{new Date(request.date_time).toLocaleString()}</h1>
                                        {!request.is_task && <button className='border-2 px-4 py-2' id={request.id.toString()} onClick={handleMaintenanceRequestToTask}>Create Task</button>}
                                        <select onChange={handleSelectChange} name="statusSelector" defaultValue="completed" className='rounded-md flex flex-row'>
                                            <option value="todo">Todo</option>
                                            <option value="in-progress">In Progress</option>
                                            <option value="completed">Completed</option>
                                        </select>
                                    </div>
                                </div>
                            )
                        }
                    })}
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
}

const Leases: React.FC = () => {
    const [leases, setLeases] = useState<Lease[]>([]);
    const [ranOnce, setRanOnce] = useState(false);

    useEffect(() => {
        if (ranOnce) return;
        fetch("/api/lease/get", {
            method: "GET",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            }
        })
            .then((res) => res.json())
            .then((data) => {
                setLeases(data.data);
                setRanOnce(true);
            })
            .catch((error) => {
                console.log(error);
            });
    }, [ranOnce, leases, setLeases])

    return (
        <>
            {leases.length > 0 && leases.map((lease: Lease, index) => {
                return (
                    // Seperate by timeframe until expiration for ongoing leases (3months, 1month maybe 6?)
                    <>
                        <div key={index} className="flex flex-row">
                            <select name="leaseTimeFrame" id="leaseTimeFrame" defaultValue="ongoing" className='mb-4 px-4 py-1 rounded-md'>
                                <option value="all">All</option>
                                <option value="ongoing">Ongoing</option>
                                <option value="expired">Expired</option>
                            </select>
                        </div >
                        <div className="flex flex-row gap-x-2">
                            <h1>{lease.unit}</h1>
                            <h1>{lease.property == "theArborVictorianLiving" ? "The Arbor Victorian Living" : "Vitalia Courtyard"}</h1>
                            <h1>{lease.rental_amount}</h1>
                            <h1>Effective: {new Date(lease.effective_date).toLocaleDateString()}</h1>
                            <h1>Termination: {new Date(lease.termination_date).toLocaleDateString()}</h1>
                            {/* Make button to set lease as signed, attach to unit in table
                                * Add download lease button here as well, copy from applications
                                * Have tenants in unit table, lease, rent amount, (maybe maintenance requests), (less maybe complaints)
                                * Store application ID (maybe)
                                * Sort by how closre to expiration, maybe filter by property
                            */}
                        </div>
                    </>
                )
            })}
        </>)
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
        fetch("/api/application/filter", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ statusFilter, nameFilter })
        })
            .then((res) => res.json())
            .then((data) => {
                setApplications(data.applications);
            })
            .catch((error) => {
                console.log(error);
            });
    }

    const handleApproval = (event: React.MouseEvent<HTMLButtonElement>) => {
        const applicationId = event.currentTarget.id;

        fetch("/api/application/approve", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ applicationId })
        })
            .then((res) => res.json())
            .then((data) => {
                setPreviousFilters({ nameFilter, statusFilter });
                fetch("/api/application/filter", {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ statusFilter, nameFilter })
                })
                    .then((res) => res.json())
                    .then((data) => {
                        setApplications(data.applications);
                    })
                    .catch((error) => {
                        console.log(error);
                    });
            })
            .catch((error) => {
                console.log(error);
            });
    };

    const handleDeny = (event: React.MouseEvent<HTMLButtonElement>) => {
        const applicationId = event.currentTarget.id;

        fetch("/api/application/deny", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ applicationId })
        })
            .then((res) => res.json())
            .then((data) => {
                //Handle Approval Denial
            })
            .catch((error) => {
                console.log(error);
            });
    };

    const handleCreateLeaseClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setLeaseForm(parseInt(event.currentTarget.id));
        setCreateLease(true);
    };

    // const findUserIDByApplicationId = (applicationID: string) => {
    //     const application = applications.find((app: RentalApplication) => app.id === applicationID);
    //     return application ? application.user_id : null
    // };

    const handleCreateLeaseSubmit = (FormData: FormData) => {
        const data = {
            property: FormData.get("propertySelector"),
            unitNumber: FormData.get("unitNumber"),
            endingDate: FormData.get("endingDate"),
            initialMonth: FormData.get("initialMonth"),
            rentPrice: FormData.get("rentPrice"),
            applicationId: leaseForm,
        }

        fetch("/api/lease/create", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        })
            .then((res) => res.json())
            .then((data) => {
                location.reload();
                //Handle Lease Created
            })
            .catch((error) => {
                console.log(error);
            });
    }

    return (
        <div>
            {(applications.length > 0 && !createLease) && applications.map((application: RentalApplication, index) => {
                return <>
                    {application &&
                        <div className='flex flex-row gap-x-2' key={index}>
                            <p className='flex flex-col'>{application.name}</p>
                            <p className='flex flex-col'>{application.email_address}</p>
                            <p className='flex flex-col'>{application.telephone_number}</p>
                            <p className='flex flex-col'>{new Date(application.timestamp).toDateString()}</p>
                            {(user?.create_leases && application.approved && !application.lease_created) && (<button id={application.id} onClick={handleCreateLeaseClick} className="flex flex-col border-2 px-2">Create Lease</button>)}
                            {user?.create_leases && application.lease_created && (
                                <>
                                    <a download={application.id} href={`/api/files?type=lease&filename=${application.id}.xlsx`} className="flex flex-col underline">Download Lease</a>
                                </>
                            )}
                            {(user?.approve_applications && !application.lease_created) && (
                                <>
                                    <button id={application.id} onClick={handleApproval} className="flex flex-col border-2 px-2">Approve</button>
                                    <button id={application.id} onClick={handleDeny} className="flex flex-col border-2 px-2">Deny</button>
                                </>
                            )}
                        </div >
                    }
                </>
            })}
            {
                (createLease && leaseForm != 0) && (
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
                )
            }
            {/* Show yet to be reviewed ones (filtered by dropdown), search by name of user. */}
        </div >
    )
}