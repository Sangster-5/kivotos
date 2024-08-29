'use client';

import { postRequest } from "@/lib/fetch";
import { Poppins, Raleway } from "next/font/google";
import Image from "next/image";

const p300 = Poppins({ subsets: ['latin'], weight: "300" });
const p400 = Poppins({ subsets: ['latin'], weight: "400" });
const r400 = Raleway({ subsets: ['latin'], weight: "400" });
const r300 = Raleway({ subsets: ['latin'], weight: "300" });

const LoginPage = () => {

  const redirectApply = () => {
    window.location.href = "/apply"
  }

  return (
    <div id="landing-bg">
      {/* shadow-[rgba(0,0,0,0.2)_3rem_3rem_30px_0px] */}
      <form action={validateLogin} className="relative h-auto w-[55%] mx-auto shadow-[rgba(0,0,0,0.2)_3rem_3rem_30px_0px]">
        <div className="aspect-w-16 aspect-h-9">
          <Image layout="fill" src="/login-logo.png" alt="Description" className="object-cover w-full h-full" />
        </div>
        <div className="absolute inset-0 flex flex-row">
          <div className="flex flex-col w-[45%] p-8">
            <h1 className={"flex flex-row text-white text-2xl " + p400.className}>Welcome Back!</h1>
            <p className={"flex flex-row text-white text-xs mt-4 " + p300.className} >We&apos;re happy to have you here. Please log in to continue.</p>

            <div className="flex flex-row mt-6">
              <div className="w-full">
                <div className="flex flex-row bg-[#101D26] rounded-t-md items-center px-2 h-12">
                  <div className="flex flex-col w-1/5 p-2">
                    <Image layout="fill" className="w-[1.5rem] h-auto" src="/icons/Mail.png" alt="" />
                  </div>
                  <div className="flex flex-col justify-center w-4/5">
                    <label htmlFor="username" className={"text-white text-xs " + r400.className}>Email Address</label>
                    <input className={"w-full bg-[#101D26] text-white text-xs underline decoration-slate-500 " + r300.className} type="text" name="username" placeholder="Your email address..." />
                  </div>
                </div>
                <div className="flex flex-row bg-white rounded-b-md items-center px-2 h-12">
                  <div className="flex flex-col w-1/5 p-2">
                    <Image layout="fill" className="w-[1.5rem] h-auto" src="/icons/Lock.png" alt="" />
                  </div>
                  <div className="flex flex-col justify-center w-4/5">
                    <label htmlFor="password" className={"text-[#101D26] text-xs " + r400.className}>Password</label>
                    <input className={"w-full text-[#101D26] text-xs underline decoration-slate-500 " + r300.className} type="password" name="password" placeholder="Your password..." />
                  </div>
                </div>
              </div>
            </div>
            <div className={"flex flex-row items-center text-white text-sm mt-4 " + r400.className} >
              <div className="flex items-center">
                <input readOnly checked className="accent-white" type="checkbox" name="remember" id="remember" />
                <label htmlFor="remember" className="ml-2 text-xs">You&apos;re Remembered</label>
              </div>
              <a href="#" className="ml-auto text-xs">Forgot Password?</a>
            </div>
            <div className={"flex flex-row gap-x-4 mt-6 text-white text-xs items-center  " + r400.className}>
              <button className={"bg-[#73ACC9] text-[#101D26] text-xs w-24 h-8 rounded-sm " + r300.className} type="submit">Login</button>
              or
              <a href="/apply" className={"flex bg-[#101D26] text-white text-xs w-24 h-8 rounded-sm text-center items-center justify-center " + r300.className}>Apply</a>
            </div>
          </div>
          <div className="flex flex-col w-[55%]"></div>
        </div>
      </form>

      {/* <Login />
      <button onClick={redirectApply}>Otherwise, Submit Rental Application</button>
      */}
    </div >
  );
}

export default LoginPage;

const validateLogin = (FormData: FormData) => {
  const data = {
    username: FormData.get("username"),
    password: FormData.get("password"),
    validateCookie: false
  }
  if (!data.username || !data.password) {
    alert("Please fill in all fields");
    // document.getElementById("errorMSG")?.classList.remove("hidden");
    // setTimeout(() => {
    //   document.getElementById("errorMSG")?.classList.add("hidden");
    // }, 2000);
    return 0;
  }

  postRequest("/api/auth", data)
    .then((data) => {
      // const errorMSG = document.getElementById("errorMSG");
      if (data.error) {
        alert(data.error);
        // errorMSG.classList.remove("hidden");
        // errorMSG.innerText = data.error;
        // setTimeout(() => {
        //   document.getElementById("errorMSG")?.classList.add("hidden");
        // }, 2000);
      }
      if (data.message === "Session Created") {
        document.location.href = "/";
      }
    })
}

{/*

            <div className="flex flex-row">
              <div className="w-full">
                <div className="flex flex-row bg-[#101D26] rounded-t-md">
                  <div className="flex flex-col w-1/5 p-2">
                    <img className="w-6 h-auto" src="/icons/Mail.png" alt="" />
                  </div>
                  <div className="flex flex-col justify-center w-4/5">
                    <label htmlFor="username" className={"text-white text-xs " + r400.className}>Email Address</label>
                    <input className={"w-full bg-[#101D26] text-white text-xs underline decoration-slate-500 " + r300.className} type="text" name="username" placeholder="Your email address..." />
                  </div>
                </div>
                <div className="flex flex-row bg-white rounded-b-md">
                  <div className="flex flex-col w-1/5 p-2">
                    <img className="w-6 h-auto" src="/icons/Lock.png" alt="" />
                  </div>
                  <div className="flex flex-col justify-center w-4/5">
                    <label htmlFor="password" className={"text-[#101D26] text-xs " + r400.className}>Password</label>
                    <input className={"w-full text-[#101D26] text-xs underline decoration-slate-500 " + r300.className} type="password" name="password" placeholder="Your password..." />
                  </div>
                </div>
              </div>*/}