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
    <div className="bg-[#1c2932] md:bg-custom-gradient h-full flex md:items-center">
      <form action={validateLogin} className="relative h-1/2 md:h-auto w-3/4 md:w-[55%] mx-auto md:shadow-[rgba(0,0,0,0.2)_3rem_3rem_30px_0px]">
        <div id="aspect" className="hidden md:block aspect-w-16 aspect-h-9">
          <Image id="login-logo" objectFit="cover" layout="fill" className="w-full h-full" src="/login-logo.png" alt="Description" />
        </div>
        <div id="kivotosAccountCreation" className="absolute inset-0 flex flex-row">
          {/* Mobile */}
          <div className="flex flex-col justify-center md:hidden">
            <h1 className={"flex flex-row text-white text-2xl " + p400.className}>Welcome Back!</h1>
            <p className={"flex flex-row text-white text-sm md:text-xs mt-4 " + p300.className} >We&apos;re happy to have you here. Please log in to continue.</p>

            <div className="flex flex-row mt-6">
              <div className="w-full">
                <div className="flex flex-row bg-[#101D26] rounded-t-md items-center px-2 h-12">
                  <div className="flex flex-col w-1/5 p-2">
                    <Image height={24} width={24} src="/icons/Mail.png" alt="" />
                  </div>
                  <div className="flex flex-col justify-center">
                    <label htmlFor="usernameM" className={"text-white text-xs " + r400.className}>Email Address</label>
                    <input className={"w-full bg-[#101D26] text-white text-xs underline decoration-slate-500 " + r300.className} type="text" name="usernameM" placeholder="Your email address..." />
                  </div>
                </div>
                <div className="flex flex-row bg-white rounded-b-md items-center px-2 h-12">
                  <div className="flex flex-col w-1/5 p-2">
                    <Image width={24} height={24} className="h-auto" src="/icons/Lock.png" alt="" />

                  </div>
                  <div className="flex flex-col justify-cente">
                    <label htmlFor="passwordM" className={"text-[#101D26] text-xs " + r400.className}>Password</label>
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
              or
              <a href="/apply" className={"flex bg-[#101D26] text-white text-xs w-32 h-8 rounded-sm text-center items-center justify-center " + r300.className}>Apply</a>
            </div>
          </div>
          {/* End mobile */}

          <div className="hidden md:flex flex-col w-[45%] p-8">
            <h1 className={"flex flex-row text-white text-2xl " + p400.className}>Welcome Back!</h1>
            <p className={"flex flex-row text-white text-xs mt-4 " + p300.className} >We&apos;re happy to have you here. Please log in to continue.</p>

            <div className="flex flex-row mt-6">
              <div className="w-full">
                <div className="flex flex-row bg-[#101D26] rounded-t-md items-center px-2 h-12">
                  <div className="flex flex-col w-1/5 p-2">
                    <Image height={24} width={24} src="/icons/Mail.png" alt="" />
                  </div>
                  <div className="flex flex-col justify-center">
                    <label htmlFor="username" className={"text-white text-xs " + r400.className}>Email Address</label>
                    <input className={"w-full bg-[#101D26] text-white text-xs underline decoration-slate-500 " + r300.className} type="text" name="username" placeholder="Your email address..." />
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
            <p id="error-msg" className="flex flex-row hidden text-red-500 mt-2"></p>
            <div className={"flex flex-row w-full items-center text-white text-sm mt-4 " + r400.className} >
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
          <div className="hidden md:flex flex-col w-[55%]"></div>
        </div>
      </form >
    </div >
  );
}

export default LoginPage;

const validateLogin = (formData: FormData) => {
  let data = {
    username: formData.get("username"),
    password: formData.get("password"),
    validateCookie: false
  }

  if (!data.username || !data.password) {
    data = {
      username: formData.get("usernameM"),
      password: formData.get("passwordM"),
      validateCookie: false
    }
  }

  if (!formData.get("usernameM") && !formData.get("passwordM") && !formData.get("username") && !formData.get("password")) {
    alert("Please fill in all fields");
    // document.getElementById("errorMSG")?.classList.remove("hidden");
    // setTimeout(() => {
    //   document.getElementById("errorMSG")?.classList.add("hidden");
    // }, 2000);
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