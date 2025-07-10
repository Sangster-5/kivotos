'use client';

import { useEffect, useState } from "react";
import { postRequest } from "@/lib/fetch";
import { Junge, Poppins, Raleway } from "next/font/google";
import Image from "next/image";
import Carousel from "./Carousel";

const j400 = Junge({ subsets: ["latin"], weight: "400" })
const p300 = Poppins({ subsets: ["latin"], weight: "300" })
const p400 = Poppins({ subsets: ["latin"], weight: "400" })
const r300 = Raleway({ subsets: ["latin"], weight: "300" })
const r400 = Raleway({ subsets: ["latin"], weight: "400" })
const r600 = Raleway({ subsets: ["latin"], weight: "600" })

type User = {
  email: string;
  tenant: boolean;
  applicationID: number;
  name: string;
  id: number;
};
let userDetails: User;

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

type Complaint = {
  id: number;
  type: string;
  details: string;
  timestamp: Date;
  status: string;
  action_timestamp: Date;
}

const Home = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [ranOnce, setRanOnce] = useState(false);


  useEffect(() => {
    const cookieStore = document.cookie;

    if (!cookieStore) return setRanOnce(true);
    const cookieData = { validateCookie: true };
    postRequest("/api/auth", cookieData)
      .then((cookieData) => {
        if (cookieData.error) return location.replace("/login");
        userDetails = cookieData.user;
        setLoggedIn(true);
        setRanOnce(true);
      });
  });

  return (
    <div className="bg-custom-gradient-1 min-h-full w-full flex items-center justify-center">
      {ranOnce ? (loggedIn && userDetails ? (
        <div className="p-8 md:px-20 md:py-14 md:mt-10 w-screen md:w-4/5 h-screen md:h-full bg-[#192F3D] rounded-md">
          <h1 className="flex flex-row text-2xl font-bold mb-2 text-white">Welcome, {userDetails.name}</h1>

          <div className="flex flex-row flex-wrap gap-x-2 gap-y-2">
            <a href="/maintenance" className="bg-[#234154] text-white rounded-md px-4 py-1">Maintenance Request</a>
            <a href="/issues" className="bg-[#234154] text-white rounded-md px-4 py-1">Issues</a>
            {userDetails.applicationID && (
              <>
                <a href={"/application?id=" + userDetails.applicationID} className="text-white bg-[#234154] px-4 py-1 rounded-md">View Application</a>
              </>
            )}
          </div>
          <h1 className="flex flex-row text-white font-bold text-2xl my-4">Active Submissions</h1>
          <div className="flex flex-row"><ActiveSubmissions /></div>

        </div>
      ) : <VisitorLandingPage />) : (<h1 className={"text-white w-full h-full font-light text-2xl flex items-center justify-center"}>Loading...</h1>)}
    </div >
  );
}

export default Home;

const ActiveSubmissions: React.FC = () => {
  const [ranOnce, setRanOnce] = useState(false);
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);

  if (!ranOnce) {
    postRequest("/api/maintenance/get", { source: "user", id: userDetails.id })
      .then((data) => {
        if (data.error) return console.warn(data.error);
        setMaintenanceRequests(data.data);
        postRequest("/api/complaints/get", { source: "user", id: userDetails.id })
          .then((data) => {
            if (data.error) return console.warn(data.error);
            setComplaints(data.data);
            setRanOnce(true);
          })
      })
  }


  return (
    <div className="grid w-full gap-y-4">
      {(maintenanceRequests.length == 0 && complaints.length == 0) && <h1 className="text-white text-lg">You currently have no active submissions.</h1>}

      <div className="flex flex-row">
        <Carousel requests={maintenanceRequests.filter((task) => task.status !== "completed")} nonAdmin={true} />
      </div>

      <div className="flex flex-row">
        <Carousel complaints={complaints.filter((task) => task.status !== "completed")} nonAdmin={true} />
      </div>
    </div>
  )
}

const VisitorLandingPage: React.FC = () => {
  return (
    <div className="w-full flex flex-col justify-center gap-y-4">
      <h1 className={"text-white text-center text-2xl md:text-6xl pb-0 pt-5 md:py-5 " + j400.className}>Welcome To The Arbor Group</h1>
      <div className="relative h-[225px] md:h-[55vh] w-4/5 mx-auto">
        <Image fill objectFit="contain" src="/landing-logo.png" alt="" />
      </div>
      <div className="flex flex-row justify-center gap-x-10">
        <a href="/login" className={"bg-[#23323B] px-6 py-2 rounded-full w-32 text-white text-xs text-center " + p400.className}>Login</a>
        <a href="/apply" className={"bg-[#E1CD9D] px-6 py-2 rounded-full w-32 text-white text-xs text-center " + p400.className}>Apply</a>
      </div>
    </div >
  );
}