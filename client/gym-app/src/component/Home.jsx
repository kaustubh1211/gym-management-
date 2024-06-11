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
    <div className=" g-6 flex h-full flex-col items-center justify-center bg-gradient-to-r from-gray-700 to-black text-white ">
      <p className="flex-col">Are you in/leave gym</p>
      <div className="flex mt-12">
        <button
          onClick={handleCheckIn}
          disabled={loading}
          className="inline-block rounded bg-primary px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] dark:shadow-[0_4px_9px_-4px_rgba(59,113,202,0.5)] dark:hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)]"
        >
          {loading ? "Checking In..." : "Check In"}
        </button>

        <button
          onClick={handleCheckOut}
          disabled={loading}
          className="inline-block rounded bg-primary px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] dark:shadow-[0_4px_9px_-4px_rgba(59,113,202,0.5)] dark:hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)]"
        >
          {loading ? "Checking Out..." : "Check Out"}
        </button>
      </div>

      <div className="GymApp flex flex-col ">
        <h1>Gym Management</h1>
        <h2 className=" bg-slate-400">
          Current Gym Traffic: {loading ? "......." : gymTraffic}
        </h2>
      </div>
    </div>
  );
};

export default CheckIn;
