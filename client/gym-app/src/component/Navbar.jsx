import React from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <section>
      <div className="w-screen flex felx-col">
        <Link to="/gymtraffic">
          <button>GymTraffic</button>
        </Link>
        <Link to="/machinetraffic">
          <button>machinetraffic</button>
        </Link>
      </div>
    </section>
  );
}
