import React, { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firbase";
import io from "socket.io-client";                                                                                                        

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
    <div className="flex flex-col items-center justify-center h-full text-white bg-gradient-to-r from-gray-700 to-black">
      {/* <p className="flex-col">Are you in/leave gym</p> */}

      <div className="flex flex-col mt-9">
        <h1 className="text-3xl font-bold mb-4 text-center">Chosse machine </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {machines.map((machine) => (
            <div
              key={machine.id}
              className="bbg-gray-800 p-9  rounded-lg shadow-md text-center w-full max-w-xs mx-auto"
            >
              <img
                src={machine.img}
                alt={machine.name}
                className="w-full h-32 object-cover mb-4 rounded"
              />
              <h3 className="text-xl font-semibold mb-2">{machine.name}</h3>
             <div className=" gap-4">

              <button
                onClick={() => handleMachineUsage(machine.id)}
                disabled={loading}
                className={`px-1 py-2 rounded ${
                  loading ? "bg-gray-500" : "bg-blue-500 hover:bg-blue-700"
                  } text-white mb2`}
                  >
                {loading ? "Recording..." : "Use Machine"}
              </button>

              <button
                onClick={() => handleDeleteMachine(machine.id)}
                disabled={loading}
                className={`px-4 py-2 rounded ${
                  loading ? "bg-gray-500" : "bg-blue-500 hover:bg-blue-700"
                  } text-white mb-2`}
                  >
                {loading ? "Deleting..." : "Delete usage"}
              </button>
                </div>
              <div className="">Usage: {machineUsage[machine.id] || 0}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
