import { useEffect, useState } from "react";
import api from "../api/axios";

function ImagePreview({ file, onRemove }) {
  const [preview, setPreview] = useState("");

  useEffect(() => {
    if (!file) {
      setPreview("");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  if (!file || !preview) return null;

  return (
    <div className="relative inline-block">
      <img
        src={preview}
        alt="Receipt preview"
        className="h-32 w-auto object-contain rounded-lg"
      />
      <button
        type="button"
        onClick={onRemove}
        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
      >
        ×
      </button>
    </div>
  );
}

function PayMoreModal({ expense, onClose, onSuccess }) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const remaining = expense.totalAmount - expense.amount;

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await api.put(`/expenses/${expense._id}/pay`, {
        amount: Number(amount),
        date: new Date(),
        by: "Accountant",
      });
      if (data.ok) {
        onSuccess();
        onClose();
      }
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl">
        <h2 className="text-lg font-bold mb-4">Pay More</h2>
        <div className="mb-4 bg-gray-50 p-3 rounded">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Total Bill:</span> <span>₹{expense.totalAmount}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Paid So Far:</span> <span>₹{expense.amount}</span>
          </div>
          <div className="flex justify-between text-sm font-bold text-red-600 mt-1 border-t pt-1">
            <span>Remaining:</span> <span>₹{remaining}</span>
          </div>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="label">Amount to Pay</label>
            <div className="flex gap-2">
              <input
                type="number"
                className="input flex-1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                max={remaining}
                required
              />
              <button
                type="button"
                onClick={() => setAmount(remaining)}
                className="px-3 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 text-sm font-medium"
              >
                Full
              </button>
            </div>
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn bg-gray-200 text-gray-800 hover:bg-gray-300"
            >
              Cancel
            </button>
            <button type="submit" className="btn" disabled={loading}>
              {loading ? "Paying..." : "Pay & Settle"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Expenses() {
  const [list, setList] = useState([]);
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    by: "",
    amount: "",
    totalAmount: "",
    paymentType: "complete",
    category: "",
    note: "",
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [payModalExpense, setPayModalExpense] = useState(null);
  const role = localStorage.getItem("role") || "";

  async function load() {
    try {
      const { data } = await api.get("/expenses");
      if (data.ok) setList(data.expenses);
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
      const fd = new FormData();
      fd.append("date", form.date);
      fd.append("by", form.by);
      fd.append("amount", String(Number(form.amount)));
      fd.append("paymentType", form.paymentType);
      if (form.paymentType === "partial") {
        fd.append("totalAmount", String(Number(form.totalAmount)));
      }
      fd.append("category", form.category);
      fd.append("note", form.note);
      if (file) fd.append("receipt", file);

      const { data } = await api.post("/expenses", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (data.ok) {
        setForm({
          date: new Date().toISOString().slice(0, 10),
          by: "",
          amount: "",
          totalAmount: "",
          paymentType: "complete",
          category: "",
          note: "",
        });
        setFile(null);
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
      <h1 className="text-xl font-semibold">Expenses</h1>
      {role === "accountant" ? (
        <form onSubmit={onSubmit} className="card space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label">Date</label>
              <input
                type="date"
                className="input"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>
            <div>
              <label className="label">By</label>
              <input
                className="input"
                value={form.by}
                onChange={(e) => setForm({ ...form, by: e.target.value })}
              />
            </div>

            <div>
              <label className="label">Payment Type</label>
              <select
                className="input"
                value={form.paymentType}
                onChange={(e) =>
                  setForm({ ...form, paymentType: e.target.value })
                }
              >
                <option value="complete">Complete</option>
                <option value="partial">Partial</option>
              </select>
            </div>

            {form.paymentType === "partial" ? (
              <>
                <div>
                  <label className="label">Full Payment Amount</label>
                  <input
                    type="number"
                    className="input"
                    value={form.totalAmount}
                    onChange={(e) =>
                      setForm({ ...form, totalAmount: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="label">Now Paying Amount</label>
                  <input
                    type="number"
                    className="input"
                    value={form.amount}
                    onChange={(e) =>
                      setForm({ ...form, amount: e.target.value })
                    }
                    required
                  />
                </div>
              </>
            ) : (
              <div>
                <label className="label">Amount</label>
                <input
                  type="number"
                  className="input"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  required
                />
              </div>
            )}

            <div>
              <label className="label">Category</label>
              <input
                className="input"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Description</label>
              <input
                className="input"
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Receipt Image</label>
              <div className="mt-1 flex flex-col items-center">
                {file ? (
                  <ImagePreview file={file} onRemove={() => setFile(null)} />
                ) : (
                  <label className="w-full cursor-pointer bg-white px-4 py-6 border-2 border-gray-300 border-dashed rounded-lg hover:bg-gray-50 transition-colors duration-200">
                    <div className="space-y-1 text-center">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                        aria-hidden="true"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="text-sm text-gray-600">
                        <span className="font-medium text-indigo-600 hover:text-indigo-500">
                          Upload a receipt
                        </span>{" "}
                        or drag and drop
                      </div>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, JPEG up to 10MB
                      </p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => setFile(e.target.files?.[0])}
                    />
                  </label>
                )}
              </div>
            </div>
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <button className="btn w-full" disabled={loading}>
            {loading ? "Saving..." : "Add Expense"}
          </button>
        </form>
      ) : (
        <div className="card p-4 text-sm text-slate-600">
          Only the accountant can add expenses. If you need to submit an
          expense, please contact the accountant.
        </div>
      )}

      <div className="grid gap-3">
        {list.map((x) => (
          <div
            key={x._id}
            className="card flex items-start gap-3 border-l-4 border-red-500"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <div className="font-medium">
                  {x.by} • ₹{x.amount}
                </div>
                {x.status === "partial" && (
                  <span className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full font-medium">
                    Partial
                  </span>
                )}
              </div>
              <div className="text-sm text-slate-500">
                {new Date(x.date).toLocaleDateString()} • {x.category}
              </div>
              {x.note && <div className="text-sm mt-1">{x.note}</div>}

              {x.status === "partial" && (
                <div className="mt-2 bg-orange-50 p-2 rounded border border-orange-100">
                  <div className="text-xs text-gray-600 flex gap-4">
                    <span>
                      Total Bill:{" "}
                      <span className="font-medium">₹{x.totalAmount}</span>
                    </span>
                    <span>
                      Paid: <span className="font-medium">₹{x.amount}</span>
                    </span>
                    <span className="text-red-600 font-medium">
                      Remaining: ₹{x.totalAmount - x.amount}
                    </span>
                  </div>
                  {role === "accountant" && (
                    <button
                      onClick={() => setPayModalExpense(x)}
                      className="mt-2 text-xs bg-indigo-600 text-white px-3 py-1.5 rounded hover:bg-indigo-700 transition-colors"
                    >
                      Pay More / Settle
                    </button>
                  )}
                </div>
              )}
            </div>
            {x.receiptImagePath && (
              <a
                className="text-sky-600 text-sm underline"
                href={x.receiptImagePath}
                target="_blank"
              >
                Receipt
              </a>
            )}
          </div>
        ))}
      </div>

      {payModalExpense && (
        <PayMoreModal
          expense={payModalExpense}
          onClose={() => setPayModalExpense(null)}
          onSuccess={load}
        />
      )}
    </div>
  );
}
