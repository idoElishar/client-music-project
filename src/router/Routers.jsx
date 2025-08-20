import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LogIn from "../components/pages/login/Login";
import SignUp from "../components/pages/signUp/SignUp";
import App from "../App";

function MyRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LogIn />} />
        <Route path="/signUp" element={<SignUp />} />
        <Route path="/grid" element={<App/>}/>
      </Routes>
    </Router>
  );
}
export default MyRouter;
