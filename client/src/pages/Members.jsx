import { useState, useEffect } from "react";
import api from "../api/axios";

export default function Members() {
  const [list, setList] = useState([]);
  const [form, setForm] = useState({
    name: "",
    // memberType added to distinguish Honorary vs General members
    memberType: "general",
    phone: "",
    address: "",
    // set default fee according to member type: general=1000, honorary=2000
    membershipFee: 1000,
  });
  const role = localStorage.getItem('role') || '';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [processingRequests, setProcessingRequests] = useState(new Set());

  async function load() {
    try {
      const { data } = await api.get("/members");
      if (data.ok) setList(data.members);
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    }
  }

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const payload = {
        ...form,
        membershipFee: Number(form.membershipFee || 0),
      };
  const { data } = await api.post("/members", payload);
      if (data.ok) {
        setForm({
          name: "",
          memberType: "general",
          phone: "",
          address: "",
          membershipFee: "",
        });
        load();
      }
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  }

  // create a request instead of direct create
  async function onRequest(e) {
    e.preventDefault();
    setLoading(true); setError('')
    try {
      const payload = { ...form, membershipFee: Number(form.membershipFee || 0) }
      const { data } = await api.post('/members/requests', payload)
      if (data.ok) { setForm({ name:'', memberType:'general', phone:'', address:'', membershipFee:1000 }); load(); }
    } catch (e) { setError(e.response?.data?.message || e.message) }
    finally { setLoading(false) }
  }

  async function loadRequests() {
    try {
      const { data } = await api.post('/members/requests/filter', { role })
      if (data.ok) setList(data.requests)
    } catch (e) { setError(e.response?.data?.message || e.message) }
  }

  // Accountant should only see requests that are fully approved by president & secretary
  async function loadApprovedRequests() {
    try {
      const { data } = await api.post('/members/requests/filter', { role })
      if (data.ok) {
        setList(data.requests || [])
      }
    } catch (e) { setError(e.response?.data?.message || e.message) }
  }

  useEffect(()=>{
    // president and secretary see all requests; accountant sees only approved requests
    if (role === 'president' || role === 'secretary') loadRequests()
    else if (role === 'accountant') loadApprovedRequests()
    else load()
  },[])

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Members</h1>
  <form onSubmit={role === 'president' || role === 'secretary' ? onSubmit : onRequest} className="card space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="label">Name</label>
            <input
              className="input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Phone</label>
            <input
              className="input"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Member Type</label>
            <select
              className="input"
              value={form.memberType}
              onChange={(e) => {
                const type = e.target.value
                const fee = type === 'honorary' ? 2000 : 1000
                setForm({ ...form, memberType: type, membershipFee: fee })
              }}
            >
              <option value="honorary">Honorary Member</option>
              <option value="general">General Member</option>
            </select>
          </div>
          <div>
            <label className="label">Membership Fee</label>
            <input
              type="number"
              className="input"
              value={form.membershipFee}
              readOnly
            />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Address</label>
            <input
              className="input"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </div>
        </div>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button className="btn w-full" disabled={loading}>
          {loading ? "Saving..." : (role === 'president' || role === 'secretary' ? 'Add Member' : 'Request Membership')}
        </button>
      </form>
      <div className="grid gap-3">
        {list.map((m) => (
          <div key={m._id} className="card flex items-start justify-between gap-3">
            <div>
              <div className="font-medium">{m.name} {m.memberType === 'honorary' ? <span className="text-sm font-normal text-slate-500">(Honorary)</span> : null}</div>
              <div className="text-sm text-slate-500">{m.phone}</div>
              <div className="text-sm">Membership Fee: ₹{m.membershipFee}</div>
            </div>
            <div className="flex flex-col gap-2">
              {/* If this is a request object, show actions based on role */}
              {m.status && role && (role === 'president' || role === 'secretary') && (
                <button className="btn" onClick={async()=>{ await api.post(`/members/requests/${m._id}/approve`); loadRequests(); }}>Approve</button>
              )}
              {m.status && role === 'accountant' && (
                <button
                  className="btn"
                  disabled={processingRequests.has(m._id)}
                  onClick={async()=>{
                    if (processingRequests.has(m._id)) return;
                    const s = new Set(processingRequests);
                    s.add(m._id);
                    setProcessingRequests(s);
                    try{
                      await api.post(`/members/requests/${m._id}/confirm-payment`);
                      // remove the request from list so it disappears after confirmation
                      setList(prev => prev.filter(x => x._id !== m._id));
                    }catch(e){ setError(e.response?.data?.message || e.message) }
                    finally{
                      const s2 = new Set(processingRequests);
                      s2.delete(m._id);
                      setProcessingRequests(s2);
                    }
                  }}
                >
                  {processingRequests.has(m._id) ? 'Processing...' : 'Confirm Payment'}
                </button>
              )}
              {/* Receipt PDFs disabled */}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
