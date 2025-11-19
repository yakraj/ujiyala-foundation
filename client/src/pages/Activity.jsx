import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Activity() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        // Fetch recent activities from all endpoints
        const [donationsRes, membersRes, expensesRes] = await Promise.all([
          api.get("/donations"),
          api.get("/members"),
          api.get("/expenses"),
        ]);

        const allActivities = [];

        // Process donations
        if (donationsRes.data.ok && donationsRes.data.donations) {
          donationsRes.data.donations.forEach((donation) => {
            allActivities.push({
              id: `donation-${donation._id}`,
              type: "donation",
              title: "New Donation",
              description: `₹${donation.amount} from ${donation.donorName}`,
              date: new Date(donation.createdAt),
              amount: donation.amount,
              color: "green",
            });
          });
        }

        // Process members
        if (membersRes.data.ok && membersRes.data.members) {
          membersRes.data.members.forEach((member) => {
            allActivities.push({
              id: `member-${member._id}`,
              type: "member",
              title: "New Member",
              description: `${member.name} joined`,
              date: new Date(member.createdAt),
              amount: member.membershipAmount,
              color: "blue",
            });
          });
        }

        // Process expenses
        if (expensesRes.data.ok && expensesRes.data.expenses) {
          expensesRes.data.expenses.forEach((expense) => {
            allActivities.push({
              id: `expense-${expense._id}`,
              type: "expense",
              title: "Expense Recorded",
              description: expense.note,
              date: new Date(expense.createdAt),
              amount: expense.amount,
              color: "red",
            });
          });
        }

        // Sort by date (newest first)
        allActivities.sort((a, b) => b.date - a.date);
        setActivities(allActivities.slice(0, 20)); // Show last 20 activities
      } catch (e) {
        setError(e.response?.data?.message || e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const getActivityIcon = (type) => {
    switch (type) {
      case "donation":
        return (
          <svg
            className="w-5 h-5"
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
        );
      case "member":
        return (
          <svg
            className="w-5 h-5"
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
        );
      case "expense":
        return (
          <svg
            className="w-5 h-5"
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
        );
      default:
        return null;
    }
  };

  const formatDate = (date) => {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else if (days < 7) {
      return `${days}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Recent Activity</h1>

      {loading && <div className="card">Loading activities...</div>}
      {error && <div className="card text-red-600">{error}</div>}

      {activities.length === 0 && !loading && !error && (
        <div className="card text-center py-8">
          <div className="text-gray-500">No activities found</div>
        </div>
      )}

      <div className="space-y-3">
        {activities.map((activity) => (
          <div key={activity.id} className="card">
            <div className="flex items-start space-x-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  activity.color === "green"
                    ? "bg-green-100 text-green-600"
                    : activity.color === "blue"
                    ? "bg-blue-100 text-blue-600"
                    : "bg-red-100 text-red-600"
                }`}
              >
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">
                    {activity.title}
                  </h3>
                  <span className="text-sm text-gray-500">
                    {formatDate(activity.date)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {activity.description}
                </p>
                {activity.amount && (
                  <div
                    className={`text-sm font-medium mt-1 ${
                      activity.type === "expense"
                        ? "text-red-600"
                        : "text-green-600"
                    }`}
                  >
                    {activity.type === "expense" ? "-" : "+"}₹
                    {activity.amount.toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
