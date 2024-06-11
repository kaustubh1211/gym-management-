import React, { useState } from "react";

import { db } from "../firbase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firbase";
import { useEffect } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:5001");
export default function Machine() {
    const [user] = useAuthState(auth);
    const [loading, setLoading] = useState(false);
    const [machineId, setMachineId] = useState("");

    const [machineUsage, setMachineUsage] = useState({});

    useEffect(() => {
    
        socket.on("machineUsageUpdate", (usageData) => {
          setMachineUsage(usageData);
        });
    
        return () => {
          socket.off("machineUsageUpdate");
        };
      }, []);


    //   machine use function 
    const handleMachineUsage = async () => {
        if (!user || !machineId) return;
    
        socket.emit("machineUsage", {
          machineId,
          userId: user.uid,
        });
      };
  return (

    <div className=" g-6 flex h-full flex-col items-center text-white justify-center bg-gradient-to-r from-gray-700 to-black ">
        <p className="flex-col">Are you in/leave gym</p>
     

      <div className="flex mt-9  ">
        <input
          type="number"
          placeholder="Enter Machine ID"
          value={machineId}
          onChange={(e) => setMachineId(e.target.value)}
          className=" text-black"
        />
        <button onClick={handleMachineUsage} disabled={loading}>
          {loading ? "Recording..." : "Use Machine"}
        </button>
      </div>

      <div className="GymApp flex flex-col ">
        <h1>Gym Management</h1>
     
        <div>
          {Object.keys(machineUsage).map((machine) => (
            <div key={machine}>
              {machine}: {machineUsage[machine]}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
