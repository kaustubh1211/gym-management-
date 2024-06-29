import React, { useState } from "react";

import { db } from "../firbase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firbase";
import { useEffect } from "react";
import io from "socket.io-client";
import { LazyLoadImage } from "react-lazy-load-image-component";

const socket = io("https://gym-management-rho.vercel.app", {
  withCredentials: true
});

const CheckIn = () => {
  const [user] = useAuthState(auth);
  const [loading, setLoading] = useState(false);

  //update
  const [gymTraffic, setGymTraffic] = useState(0);

  useEffect(() => { 
    socket.on("gymTrafficUpdate", (count) => {
      setGymTraffic(count);
    });
    socket.emit('requestInitialData');
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
    <section className="h-screen items-center justify-center bg-gradient-to-r from-gray-700 to-black " >
      
      <div className="flex flex-col md:flex-row lg:gap-96 items-center justify-center text-white pt-24  ">
        <div className="text-center lg:text-left">
          <p className="">Are you in/leave gym</p>
          <div className="mt-3 flex flex-col lg:flex-row gap-4">
            <button
              onClick={handleCheckIn}
              disabled={loading}
              className="inline-block text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
            >
              {loading ? "Checking In..." : "Check In"}
            </button>
            <button
              onClick={handleCheckOut}
              disabled={loading}
              className="inline-block text-white bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 shadow-lg shadow-red-500/50 dark:shadow-lg dark:shadow-red-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
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
          <LazyLoadImage
            src="/GymTraffic/gym-management-app.jpg"
            alt="Gym-traffic"
            className="w-full max-w-xl h-auto lg:w-96 lg:h-72"
            
          />  
        </div>
      </div>
    </section>
  );
};

export default CheckIn;
