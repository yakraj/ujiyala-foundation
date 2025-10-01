import { Routes, Route, Navigate, Link, useNavigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Expenses from "./pages/Expenses";
import Members from "./pages/Members";
import Donations from "./pages/Donations";
import Activity from "./pages/Activity";
import Login from "./pages/Login";
import BottomNav from "./components/BottomNav";

function Nav() {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  return (
    <div className="sticky top-0 z-10 bg-white border-b">
      <div className="max-w-4xl mx-auto flex items-center justify-between p-3">
        <img
          src="../assets/ujiyala logo.png"
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
        <div className="flex gap-3 text-sm">
          {token ? (
            <button
              className="btn"
              onClick={() => {
                localStorage.removeItem("token");
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
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
      {token && <BottomNav />}
    </div>
  );
}
