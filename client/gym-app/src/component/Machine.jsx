import React, { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firbase";
import io from "socket.io-client";
import { LazyLoadImage } from "react-lazy-load-image-component";                                                                                                    

const socket = io("http://localhost:5001");

export default function Machine() {
  const [user] = useAuthState(auth);
  const [loading, setLoading] = useState(false);
  const [machineUsage, setMachineUsage] = useState({});

  useEffect(() => {
    socket.on("machineTrafficUpdate", (usageData) => {
      setMachineUsage(usageData);
    });

    return () => {
      socket.off("machineTrafficUpdate");
    };
  }, []);

  // Function to handle machine usage
  const handleMachineUsage = async (machineId) => {
    if (!user) return;
    
    try {socket.emit("machineUsage", {
        machineId,
        userId: user.uid,
      });
    }
    finally{
      setLoading(false);
    }
    
  };


  const handleDeleteMachine =(machineId)=>{
        if(!user) return;
        socket.emit("deleteMachineUsage",{
          machineId,
          userId: user.uid,
        })
  }

  // Fixed array of machines
  const machines = [
    { id: 1, name: "Cable machine", img:" ./gym-machine/man-training-gym.jpg" },
    { id: 2, name: "Smith machine",img:"./gym-machine/download-copy.png" },
    { id: 3, name: "lat pull down", img:"./gym-machine/images.jpg"},
    { id: 4, name: "Leg press",img:"./gym-machine/GLPH1100-LEG-PRESS_HACK-SQUAT-MACHINE.jpg" },
    { id: 5, name: "Squat rack",img:"./gym-machine/bharat-fitness-squat-rack-gym-equipment-machine-for-legs-chest-work-out.jpg   " },
    {id :6 ,name:"treadmill",img:"./gym-machine/download (1).jpg" }
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-white bg-gradient-to-r from-gray-700 to-black">
    <div className="flex flex-col mt-9">
      <h1 className="text-4xl font-bold mb-10 text-center">Choose Machine</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {machines.map((machine) => (
          <div
            key={machine.id}
            className="bg-gray-800 p-6 rounded-lg shadow-lg transform transition duration-500 hover:scale-105"
          >
            <LazyLoadImage
              src={machine.img} 
              alt={machine.name}
              className="w-full h-40 object-cover mb-4 rounded-t-lg"
              
            />
            <h3 className="text-2xl font-semibold mb-4">{machine.name}</h3>
            <div className="flex flex-col gap-4">
              <button
                onClick={() => handleMachineUsage(machine.id)}
                disabled={loading}
                className={`px-4 py-2 rounded-full ${
                  loading ? "bg-gray-500" :" text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center "
                } text-white font-medium transition-colors duration-300`}
              >
                {loading ? "Recording..." : "Use Machine"}
              </button>

              <button
                onClick={() => handleDeleteMachine(machine.id)}
                disabled={loading}
                className={`px-4 py-2 rounded-full ${
                  loading ? "bg-gray-500" : "text-white bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 shadow-lg shadow-red-500/50 dark:shadow-lg dark:shadow-red-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
                } text-white font-medium transition-colors duration-300`}
              >
                {loading ? "Deleting..." : "Delete Usage"}
              </button>
            </div>
            <div className="mt-4 text-lg">Usage: {machineUsage[machine.id] || 0}</div>
          </div>
        ))}
      </div>
    </div>
  </div>
  );
}
