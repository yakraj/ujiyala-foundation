import { useState, useEffect } from "react";
import api from "../api/axios";

export default function Members() {
  const [list, setList] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    membershipFee: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    try {
      const { data } = await api.get("/members");
      if (data.ok) setList(data.members);
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    }
  }
  useEffect(() => {
    load();
  }, []);

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
          email: "",
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

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Members</h1>
      <form onSubmit={onSubmit} className="card space-y-3">
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
            <label className="label">Email</label>
            <input
              className="input"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
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
            <label className="label">Membership Fee</label>
            <input
              type="number"
              className="input"
              value={form.membershipFee}
              onChange={(e) =>
                setForm({ ...form, membershipFee: e.target.value })
              }
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
          {loading ? "Saving..." : "Add Member & Generate Receipt"}
        </button>
      </form>

      <div className="grid gap-3">
        {list.map((m) => (
          <div
            key={m._id}
            className="card flex items-start justify-between gap-3"
          >
            <div>
              <div className="font-medium">{m.name}</div>
              <div className="text-sm text-slate-500">
                {m.email} • {m.phone}
              </div>
              <div className="text-sm">Membership Fee: ₹{m.membershipFee}</div>
            </div>
            {m.receiptPdfPath && (
              <a
                className="text-sky-600 text-sm underline"
                href={m.receiptPdfPath}
                target="_blank"
              >
                Receipt PDF
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
