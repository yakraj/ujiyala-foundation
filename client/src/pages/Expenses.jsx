import { useEffect, useState } from 'react'
import api from '../api/axios'

export default function Expenses() {
  const [list, setList] = useState([])
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0,10), by: '', amount: '', category: '', note: '' })
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const role = localStorage.getItem('role') || '';

  async function load() {
    try {
      const { data } = await api.get('/expenses')
      if (data.ok) setList(data.expenses)
    } catch (e) { setError(e.response?.data?.message || e.message) }
  }
  useEffect(() => { load() }, [])

  async function onSubmit(e) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const fd = new FormData()
      for (const k of Object.keys(form)) fd.append(k, k==='amount' ? String(Number(form[k])) : form[k])
      if (file) fd.append('receipt', file)
      const { data } = await api.post('/expenses', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      if (data.ok) { setForm({ date: new Date().toISOString().slice(0,10), by: '', amount: '', category: '', note: '' }); setFile(null); load() }
    } catch (e) { setError(e.response?.data?.message || e.message) }
    finally { setLoading(false) }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Expenses</h1>
      {role === 'accountant' ? (
        <form onSubmit={onSubmit} className="card space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div><label className="label">Date</label><input type="date" className="input" value={form.date} onChange={e=>setForm({...form, date:e.target.value})} /></div>
          <div><label className="label">By</label><input className="input" value={form.by} onChange={e=>setForm({...form, by:e.target.value})} /></div>
          <div><label className="label">Amount</label><input type="number" className="input" value={form.amount} onChange={e=>setForm({...form, amount:e.target.value})} /></div>
          <div><label className="label">Category</label><input className="input" value={form.category} onChange={e=>setForm({...form, category:e.target.value})} /></div>
          <div className="sm:col-span-2"><label className="label">Note</label><input className="input" value={form.note} onChange={e=>setForm({...form, note:e.target.value})} /></div>
          <div className="sm:col-span-2"><label className="label">Receipt (image)</label><input type="file" onChange={e=>setFile(e.target.files?.[0])} /></div>
        </div>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button className="btn w-full" disabled={loading}>{loading ? 'Saving...' : 'Add Expense'}</button>
        </form>
      ) : (
        <div className="card p-4 text-sm text-slate-600">Only the accountant can add expenses. If you need to submit an expense, please contact the accountant.</div>
      )}

      <div className="grid gap-3">
        {list.map((x) => (
          <div key={x._id} className="card flex items-start gap-3">
            <div className="flex-1">
              <div className="font-medium">{x.by} • ₹{x.amount}</div>
              <div className="text-sm text-slate-500">{new Date(x.date).toLocaleDateString()} • {x.category}</div>
              {x.note && <div className="text-sm mt-1">{x.note}</div>}
            </div>
            {x.receiptImagePath && <a className="text-sky-600 text-sm underline" href={x.receiptImagePath} target="_blank">Receipt</a>}
          </div>
        ))}
      </div>
    </div>
  )
}
