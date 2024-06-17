import "./App.css";
import Home from "./component/Home";
import Login from "./component/Login";
import Signin from "./component/Signin";
import { BrowserRouter as Router ,useLocation} from "react-router-dom";
import { Routes, Route } from "react-router-dom";
import Navbar from "./component/Navbar";
import Machine from "./component/Machine";

function App() {
  return (
    <Router>
      <Main />
    </Router>
  );
}


function Main() {
  const location =useLocation();
  const showNavbar =location.pathname !== '/' && location.pathname !=='/Signin';
  return (

      <div>
        { showNavbar && <Navbar />}
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signin />} />
          <Route path="/gymtraffic" element={<Home />} />
          <Route path="/machinetraffic" element={<Machine />} />
        </Routes>
      </div>
 
  );
}

export default App;
