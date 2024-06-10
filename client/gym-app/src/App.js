import "./App.css";
import Home from "./component/Home";
import Login from "./component/Login";
import Signin from "./component/Signin";
import { BrowserRouter as Router } from "react-router-dom";
import { Routes, Route } from "react-router-dom";
import Navbar from "./component/Navbar";
import Machine from "./component/Machine";

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signin />} />
          {/* <Route path="/Home" element={<Home/>} />   */}

        <Route path="/gymtraffic" element={<Home />} />
        <Route path="/machinetraffic" element={<Machine />} />
        </Routes>
        <Navbar />
      </div>
    </Router>
  );
}

export default App;
