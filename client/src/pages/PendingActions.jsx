import { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function PendingActions() {
  const [donations, setDonations] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDonations, setSelectedDonations] = useState(new Set());
  const [selectedRequests, setSelectedRequests] = useState(new Set());
  const [processingRequests, setProcessingRequests] = useState(new Set());
  const navigate = useNavigate();
  const role = localStorage.getItem("role") || "";

  async function load() {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/donations/pending");
      if (data.ok) setDonations(data.donations);
      // load member requests too
      const { data: reqData } = await api.post("/members/requests/filter", {
        role,
      });
      if (reqData.ok) setRequests(reqData.requests);
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function verify(id) {
    try {
      await api.post(`/donations/${id}/verify`);
      load();
    } catch (e) {
      alert(e.response?.data?.message || e.message);
    }
  }

  function toggleDonation(id) {
    const s = new Set(selectedDonations);
    if (s.has(id)) s.delete(id);
    else s.add(id);
    setSelectedDonations(s);
  }

  function toggleRequest(id) {
    const s = new Set(selectedRequests);
    if (s.has(id)) s.delete(id);
    else s.add(id);
    setSelectedRequests(s);
  }

  async function bulkVerify() {
    if (!selectedDonations.size) return alert("No donations selected");
    try {
      const ids = Array.from(selectedDonations);
      await api.post("/donations/verify-bulk", { ids });
      setSelectedDonations(new Set());
      load();
    } catch (e) {
      alert(e.response?.data?.message || e.message);
    }
  }

  async function bulkApproveRequests() {
    if (!selectedRequests.size) return alert("No requests selected");
    try {
      const ids = Array.from(selectedRequests);
      if (role === "president" || role === "secretary") {
        await api.post("/members/requests/approve-bulk", { ids });
      } else if (role === "accountant") {
        await api.post("/members/requests/confirm-bulk", { ids });
      }
      setSelectedRequests(new Set());
      load();
    } catch (e) {
      alert(e.response?.data?.message || e.message);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Pending Actions</h1>
        <button className="btn" onClick={() => navigate("/")}>
          Back
        </button>
      </div>

      {role === "accountant" && (
        <div className="card">
          <h2 className="font-medium mb-3">Pending Donations</h2>
          {loading && <div>Loading...</div>}
          {error && <div className="text-red-600">{error}</div>}
          {!loading && !donations.length && (
            <div className="text-sm text-slate-500">
              No pending donations found.
            </div>
          )}
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              {/* <input
                type="checkbox"
                onChange={(e) => {
                  if (e.target.checked)
                    setSelectedDonations(new Set(donations.map((x) => x._id)));
                  else setSelectedDonations(new Set());
                }}
              /> */}
              {/* <button className="btn" onClick={bulkVerify}>Bulk Verify</button> */}
            </div>
            {donations.map((d) => (
              <div
                key={d._id}
                className="card flex items-center justify-between"
              >
                <div>
                  <div className="font-medium">
                    {d.donorName}  {d.amount}
                  </div>
                  <div className="text-sm text-slate-500">
                    Added By: {d.addedByName || d.addedBy || "N/A"}
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                  {/* <input
                    type="checkbox"
                    checked={selectedDonations.has(d._id)}
                    onChange={() => toggleDonation(d._id)}
                  /> */}
                  <button className="btn" onClick={() => verify(d._id)}>
                    Verify
                  </button>
                  {/* Receipt PDFs disabled */}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <h2 className="font-medium mb-3">Pending Member Requests</h2>
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-2">
            {/* <input
              type="checkbox"
              onChange={(e) => {
                if (e.target.checked)
                  setSelectedRequests(new Set(requests.map((x) => x._id)));
                else setSelectedRequests(new Set());
              }}
            /> */}
            {/* <button className="btn" onClick={bulkApproveRequests}>
              {role === "accountant" ? "Bulk Confirm Payments" : "Bulk Approve"}
            </button> */}
          </div>
          {requests.map((r) => (
            <div key={r._id} className="card flex items-center justify-between">
              <div>
                <div className="font-medium">
                  {r.name} • ₹{r.membershipFee}
                </div>
                <div className="text-sm text-slate-500">
                  Requested By: {r.createdByName || r.createdBy}
                </div>
                <div className="text-sm text-slate-500">Status: {r.status}</div>
              </div>
              <div className="flex gap-2 items-center">
                {/* <input
                  type="checkbox"
                  checked={selectedRequests.has(r._id)}
                  onChange={() => toggleRequest(r._id)}
                /> */}
                {(role === "president" || role === "secretary") && (
                  <button
                    className="btn"
                    disabled={processingRequests.has(r._id)}
                    onClick={async () => {
                      if (processingRequests.has(r._id)) return;
                      const s = new Set(processingRequests);
                      s.add(r._id);
                      setProcessingRequests(s);
                      try {
                        await api.post(`/members/requests/${r._id}/approve`);
                        // remove the request locally so it disappears after approval
                        setRequests((prev) =>
                          prev.filter((x) => x._id !== r._id)
                        );
                      } catch (e) {
                        alert(e.response?.data?.message || e.message);
                      } finally {
                        const s2 = new Set(processingRequests);
                        s2.delete(r._id);
                        setProcessingRequests(s2);
                        load();
                      }
                    }}
                  >
                    {processingRequests.has(r._id)
                      ? "Processing..."
                      : "Approve"}
                  </button>
                )}
                {role === "accountant" && (
                  <button
                    className="btn"
                    disabled={processingRequests.has(r._id)}
                    onClick={async () => {
                      if (processingRequests.has(r._id)) return;
                      const s = new Set(processingRequests);
                      s.add(r._id);
                      setProcessingRequests(s);
                      try {
                        await api.post(
                          `/members/requests/${r._id}/confirm-payment`
                        );
                        setRequests((prev) =>
                          prev.filter((x) => x._id !== r._id)
                        );
                      } catch (e) {
                        alert(e.response?.data?.message || e.message);
                      } finally {
                        const s2 = new Set(processingRequests);
                        s2.delete(r._id);
                        setProcessingRequests(s2);
                      }
                    }}
                  >
                    {processingRequests.has(r._id)
                      ? "Processing..."
                      : "Confirm Payment"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
