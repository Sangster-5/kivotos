'use client';

const LoginPage = () => {

  const redirectApply = () => {
    window.location.href = "/apply"
  }

  return (
    <div>
      <Login />
      <button onClick={redirectApply}>Otherwise, Submit Rental Application</button>
      <p id="errorMSG" className="hidden">Invalid Credentials</p>
    </div>
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
    document.getElementById("errorMSG")?.classList.remove("hidden");
    setTimeout(() => {
      document.getElementById("errorMSG")?.classList.add("hidden");
    }, 2000);
    return 0;
  }

  fetch("/api/auth", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.message === "Session Created") {
        document.location.href = "/";
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

const Login: React.FC = () => {
  return (
    <>
      <h1>Already a Tenant?</h1>
      <form action={validateLogin}>
        <input className="border-2" type="text" name="username" id="" placeholder="Username" />
        <input className="border-2" type="password" name="password" id="" placeholder="Passsord" />

        <input className="hover:cursor-pointer border-2" type="submit" value="Login" />
      </form></>

  );
}