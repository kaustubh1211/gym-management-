import "./App.css";
import Login from "./component/Login";
import Signin from "./component/Signin";
import { BrowserRouter as Router } from "react-router-dom";
import { Routes, Route } from "react-router-dom";
function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signin />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
