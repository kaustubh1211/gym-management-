import React from "react";
import { useState } from "react";
import { TERipple, TEInput } from "tw-elements-react";
import { auth, signInWithGoogle } from "../firbase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
export default function Signin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const Handlesignin = async (e) => {
    e.preventDefault();
    await createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in
        const user = userCredential.user;
        console.log(user);
        navigate("/");
        // ...
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode, errorMessage);
        //   setErrorHandle(errorCode, errorMessage);
        // ..
      });
  };
  const logGoogleUser = async () => {
    try {
      const result = await signInWithGoogle();
      // Handle the result here (e.g., user info, token)
      console.log(result);
      navigate("/gymtraffic");
    } catch (error) {
      console.error("Error signing in with Google", error);
    }
  };

  return (
    <section className="h-screen">
      <div className="h-full">
        {/* <!-- Left column container with background--> */}
        <div className="g-6 flex h-full flex-wrap items-center justify-centern flex-col">
          {/* <!-- Right column container --> */}
          <div className="mb-12 md:mb-0 md:w-8/12 lg:w-5/12 xl:w-5/12 items-centers justify-center mt-44">
            <form onSubmit={Handlesignin}>
              {/* <!--Sign in section--> */}
              <div className="flex flex-row items-center justify-center lg:justify-start">
              

                {/* <!-- Facebook button--> */}
                <TERipple rippleColor="light">
                  <button
                    type="button"
                    className="align-middle select-none font-sans font-bold text-center uppercase transition-all disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none text-sm py-3.5 px-7 rounded-lg border border-blue-gray-500 text-blue-gray-500 hover:opacity-75 focus:ring focus:ring-blue-gray-200 active:opacity-[0.85] flex items-center gap-3"
                    onClick={logGoogleUser}
                  >
                    <img
                      src="https://docs.material-tailwind.com/icons/google.svg"
                      alt="metamask"
                      class="w-6 h-6"
                    />
                    Continue with Google
                    {/* <!-- Facebook --> */}
                  </button>
                </TERipple>
              </div>

              {/* <!-- Separator between social media sign in and email/password sign in --> */}
              <div className="my-4 flex items-center before:mt-0.5 before:flex-1 before:border-t before:border-neutral-300 after:mt-0.5 after:flex-1 after:border-t after:border-neutral-300">
                <p className="mx-4 mb-0 text-center font-semibold dark:text-white">
                  Or
                </p>
              </div>

              {/* <!-- Email input --> */}
              <TEInput
                type="email"
                label="Email address"
                size="lg"
                className="mb-6"
                required
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
              ></TEInput>

              {/* <!--Password input--> */}
              <TEInput
                type="password"
                label="Password"
                className="mb-6"
                size="lg"
                required
                onChange={(e) => {
                  setPassword(e.target.value);
                }}
              ></TEInput>

              {/* <!-- Login button --> */}
              <div className="text-center lg:text-left">
                <TERipple rippleColor="light">
                  <button
                    type="submit"
                    className="inline-block rounded bg-primary px-7 pb-2.5 pt-3 text-sm font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] dark:shadow-[0_4px_9px_-4px_rgba(59,113,202,0.5)] dark:hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)]"
                  >
                    Signin
                  </button>
                </TERipple>

                {/* <!-- Register link --> */}
                <p className="mb-0 mt-2 pt-1 text-sm font-semibold">
                  alreday have an account?{" "}
                  <Link
                    to="/"
                    className="text-danger transition duration-150 ease-in-out hover:text-danger-600 focus:text-danger-600 active:text-danger-700"
                  >
                    Login
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
