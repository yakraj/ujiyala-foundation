import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showAddPopup, setShowAddPopup] = useState(false);

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleAddOption = (type) => {
    setShowAddPopup(false);
    switch (type) {
      case "expense":
        navigate("/expenses");
        break;
      case "member":
        navigate("/members");
        break;
      case "donation":
        navigate("/donations");
        break;
      default:
        break;
    }
  };

  return (
    <>
      {/* Add Popup Modal */}
      {showAddPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-3xl p-6 animate-slide-up">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
            </div>
            <h2 className="text-xl font-semibold text-center mb-6">Add New</h2>
            <div className="space-y-4">
              <button
                onClick={() => handleAddOption("expense")}
                className="w-full p-4 bg-red-50 border border-red-200 rounded-2xl hover:bg-red-100 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                      />
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-gray-900">Expense</div>
                    <div className="text-sm text-gray-500">
                      Record a new expense
                    </div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleAddOption("member")}
                className="w-full p-4 bg-blue-50 border border-blue-200 rounded-2xl hover:bg-blue-100 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                      />
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-gray-900">Member</div>
                    <div className="text-sm text-gray-500">
                      Register a new member
                    </div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleAddOption("donation")}
                className="w-full p-4 bg-green-50 border border-green-200 rounded-2xl hover:bg-green-100 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-gray-900">Donation</div>
                    <div className="text-sm text-gray-500">
                      Record a new donation
                    </div>
                  </div>
                </div>
              </button>
            </div>
            <button
              onClick={() => setShowAddPopup(false)}
              className="w-full mt-6 py-3 text-gray-500 font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <div className="max-w-4xl mx-auto flex items-center justify-around py-2">
          {/* Home Button */}
          <button
            onClick={() => navigate("/")}
            className={`flex flex-col items-center py-2 px-4 rounded-xl transition-colors ${
              isActive("/") ? "text-sky-600" : "text-gray-500"
            }`}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            <span className="text-xs mt-1">Home</span>
          </button>

          {/* Add Button */}
          <button
            onClick={() => setShowAddPopup(true)}
            className="flex items-center justify-center w-14 h-14 bg-sky-600 rounded-full shadow-lg hover:bg-sky-700 transition-colors"
          >
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          </button>

          {/* Activity Button (Three Bars) */}
          <button
            onClick={() => navigate("/activity")}
            className={`flex flex-col items-center py-2 px-4 rounded-xl transition-colors ${
              isActive("/activity") ? "text-sky-600" : "text-gray-500"
            }`}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
            <span className="text-xs mt-1">Activity</span>
          </button>
        </div>
      </div>
    </>
  );
}
