import React from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const handlenavigate = (path) => {
    navigate(path);
  };
  return (
    <section>
      <div className=" flex felx-col gap-4 justify-center bg-gradient-to-r from-gray-700 to-black">
        <div className="mt-8 flex gap-9">
          <Link to="/gymtraffic">
            <button className="align-middle bg-slate-200 select-none font-sans font-bold text-center uppercase transition-all disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none text-sm py-3.5 px-7 rounded-lg border border-blue-gray-500 text-blue-gray-500 hover:opacity-75 focus:ring focus:ring-blue-gray-200  active:opacity-[0.85]  flex items-center gap-3">
              GymTraffic
            </button>
          </Link>
          <Link to="/machinetraffic">
            <button className="align-middle bg-slate-200 select-none font-sans font-bold text-center uppercase transition-all disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none text-sm py-3.5 px-7 rounded-lg border border-blue-gray-500 text-blue-gray-500 hover:opacity-75 focus:ring focus:ring-blue-gray-200 active:opacity-[0.85] flex items-center gap-3">
              machinetraffic
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
