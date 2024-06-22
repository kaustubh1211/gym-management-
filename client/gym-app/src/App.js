import "./App.css";
import Home from "./component/Home";
import Login from "./component/Login";
import Signin from "./component/Signin";
import { BrowserRouter as Router , useLocation,   Navigate } from "react-router-dom";
import { Routes, Route } from "react-router-dom";
import Navbar from "./component/Navbar";
import Machine from "./component/Machine";
import { useState } from "react";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  return (
    <Router>
      <Main isLoggedIn={isLoggedIn} onLoginSuccess={() => setIsLoggedIn(true)} />
    </Router>
  );
}

function Main({ isLoggedIn, onLoginSuccess }) {
  const location =useLocation();
  const showNavbar =location.pathname !== '/' && location.pathname !=='/signup';
  return (

      <div>
        { showNavbar && <Navbar />}
        <Routes>
          <Route path="/"  element={<Login onLoginSuccess={onLoginSuccess} />}/>
          <Route path="/signup"  element= {<Signin/>} />
          <Route path="/gymtraffic"  element={isLoggedIn ? <Home /> : <Navigate to="/" />} />
          <Route path="/machinetraffic" element={isLoggedIn ? <Machine /> : <Navigate to="/" />} />
        </Routes>
      </div>
 
  );
}

export default App;
