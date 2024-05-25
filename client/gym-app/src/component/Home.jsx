import React, { useState } from "react";

import { db } from "../firbase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firbase";

const CheckIn = () => {
  const [user] = useAuthState(auth);
  const [loading, setLoading] = useState(false);
  const [machineId, setMachineId]=useState('')
 
  const handleCheckIn = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await addDoc(collection(db, "checkIns"), {
        userId: user.uid,
        timestamp: serverTimestamp(),
      });
      alert("Check-in successful");
    } catch (error) {
      console.error("Error checking in:", error);
      alert("Check-in failed");
    } finally {
      setLoading(false);
    }
  };

  //machine check
  const handleMachineUsage = async () => {
    if (!user || !machineId) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'machineUsage'), {
        userId: user.uid,
        machineId,
        timestamp: serverTimestamp()
      });
      alert('Machine usage recorded');
    } catch (error) {
      console.error('Error recording machine usage:', error);
      alert('Recording machine usage failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className=" g-6 flex h-full flex-col items-center justify-center ">
      <div className="flex mt-12">

      <button
        onClick={handleCheckIn}
        disabled={loading}
        className="inline-block rounded bg-primary px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] dark:shadow-[0_4px_9px_-4px_rgba(59,113,202,0.5)] dark:hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)]"
        >
        {loading ? "Checking In..." : "Check In"}
      </button>
  
        </div>

  <div className="flex mt-9">

      <input
        type="text"
        placeholder="Enter Machine ID"
        value={machineId}
        onChange={(e) => setMachineId(e.target.value)}
        />
      <button onClick={handleMachineUsage} disabled={loading}>
        {loading ? 'Recording...' : 'Use Machine'}
      </button>
        </div>
    </div>


    
  );
};

export default CheckIn;
