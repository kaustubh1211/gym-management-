import React, { useState } from "react";

import { db } from "../firbase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firbase";
import { useEffect } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:5001");

const CheckIn = () => {
  const [user] = useAuthState(auth);
  const [loading, setLoading] = useState(false);

  //update
  const [gymTraffic, setGymTraffic] = useState(0);

  useEffect(() => {
    socket.on("gymTrafficUpdate", (count) => {
      setGymTraffic(count);
    });

    return () => {
      socket.off("gymTrafficUpdate");
    };
  }, []);
  const handleCheckIn = () => {
    if (!user) return;

    socket.emit("checkIn", { userId: user.uid });
  };

  // check out
  const handleCheckOut = () => {
    if (!user) return;

    socket.emit("checkOut", { userId: user.uid });
  };

  return (
    <section className="">
      <div className="flex flex-col md:flex-row lg:gap-96 items-center h-screen justify-center bg-gradient-to-r from-gray-700 to-black text-white  ">
        <div className="text-center lg:text-left">
          <p className="">Are you in/leave gym</p>
          <div className="mt-3 flex flex-col lg:flex-row gap-4">
            <button
              onClick={handleCheckIn}
              disabled={loading}
              className="inline-block rounded bg-primary px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow transition duration-150 ease-in-out hover:bg-primary-600 focus:bg-primary-600 focus:outline-none active:bg-primary-700 dark:shadow dark:hover:shadow dark:focus:shadow dark:active:shadow"
            >
              {loading ? "Checking In..." : "Check In"}
            </button>
            <button
              onClick={handleCheckOut}
              disabled={loading}
              className="inline-block rounded bg-primary px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow transition duration-150 ease-in-out hover:bg-primary-600 focus:bg-primary-600 focus:outline-none active:bg-primary-700 dark:shadow dark:hover:shadow dark:focus:shadow dark:active:shadow"
            >
              {loading ? "Checking Out..." : "Check Out"}
            </button>
          </div>
          <div className="GymApp mt-6">
            <h1 className="text-2xl font-bold">Gym Management</h1>
            <h2 className="bg-slate-400 p-2 rounded mt-2">
              Current Gym Traffic: {loading ? "......." : gymTraffic}
            </h2>
          </div>
        </div>
        <div className="mt-2 lg:mt-8">
          <img
            src="/GymTraffic/gym-management-app.jpg"
            alt="Gym-traffic"
            className="w-full max-w-xl h-auto lg:w-96 lg:h-72"
           loading="lazy"
          />
        </div>
      </div>
    </section>
  );
};

export default CheckIn;
