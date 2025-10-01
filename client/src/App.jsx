import { Routes, Route, Navigate, Link, useNavigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Expenses from "./pages/Expenses";
import Members from "./pages/Members";
import Donations from "./pages/Donations";
import Activity from "./pages/Activity";
import PendingActions from "./pages/PendingActions";
import Login from "./pages/Login";
import BottomNav from "./components/BottomNav";
import logo from '../assets/ujiyala_logo.png';

function Nav() {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const role = localStorage.getItem('role') || '';
  return (
    <div className="sticky top-0 z-10 bg-white border-b">
      <div className="max-w-4xl mx-auto flex items-center justify-between p-3">
        <img
          src={logo}
          alt="Ujiyala Foundation"
          className="w-20 h-20"
        />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <Link to="/" className="font-bold text-sky-800">
            <b className="foundation-firstname">उजियाला </b>
            <b className="foundation-lastname"> फाउंडेशन</b>
          </Link>
          <p className="app-tag">Account and finance app</p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          {/* {role && <div className="text-sm text-slate-600">Role: <span className="font-medium">{role}</span></div>} */}
          {token ? (
            <button
              className="btn"
              onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("role");
                navigate("/login");
              }}
            >
              Logout
            </button>
          ) : (
            <Link to="/login" className="btn">
              Login
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function Protected({ children }) {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const token = localStorage.getItem("token");

  return (
    <div className="min-h-screen flex flex-col">
      <Nav />
      <div className="max-w-4xl w-full mx-auto p-4 flex-1 pb-20">
        <Routes>
          <Route
            path="/"
            element={
              <Protected>
                <Dashboard />
              </Protected>
            }
          />
          <Route
            path="/expenses"
            element={
              <Protected>
                <Expenses />
              </Protected>
            }
          />
          <Route
            path="/members"
            element={
              <Protected>
                <Members />
              </Protected>
            }
          />
          <Route
            path="/donations"
            element={
              <Protected>
                <Donations />
              </Protected>
            }
          />
          <Route
            path="/activity"
            element={
              <Protected>
                <Activity />
              </Protected>
            }
          />
          <Route
            path="/pending-actions"
            element={
              <Protected>
                <PendingActions />
              </Protected>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
      {token && <BottomNav />}
    </div>
  );
}
