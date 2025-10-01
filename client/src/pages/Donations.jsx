import { useEffect, useState } from 'react'
import api from '../api/axios'

export default function Donations() {
  const [list, setList] = useState([])
  // donationType added to categorize donations as per NGO requirements
  const [form, setForm] = useState({ donorName:'', phone:'', amount:'', donationType:'general', method:'cash', date:new Date().toISOString().slice(0,10), note:'' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    try {
      const { data } = await api.get('/donations')
      if (data.ok) setList(data.donations)
    } catch (e) { setError(e.response?.data?.message || e.message) }
  }
  useEffect(() => { load() }, [])

  async function onSubmit(e) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
  const payload = { ...form, amount: Number(form.amount || 0) }
      const { data } = await api.post('/donations', payload)
  if (data.ok) { setForm({ donorName:'', phone:'', amount:'', donationType:'general', method:'cash', date:new Date().toISOString().slice(0,10), note:'' }); load() }
    } catch (e) { setError(e.response?.data?.message || e.message) }
    finally { setLoading(false) }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Donations</h1>
      <form onSubmit={onSubmit} className="card space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div><label className="label">Donor Name</label><input className="input" value={form.donorName} onChange={e=>setForm({...form, donorName:e.target.value})} /></div>
          <div><label className="label">Amount</label><input type="number" className="input" value={form.amount} onChange={e=>setForm({...form, amount:e.target.value})} /></div>
          <div><label className="label">Phone</label><input className="input" value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})} /></div>
          <div>
            <label className="label">Donation Type</label>
            <select className="input" value={form.donationType} onChange={e=>setForm({...form, donationType:e.target.value})}>
              <option value="general">General</option>
              <option value="education">Education</option>
              <option value="health">Health</option>
              <option value="relief">Relief</option>
              <option value="infrastructure">Infrastructure</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div><label className="label">Method</label>
            <select className="input" value={form.method} onChange={e=>setForm({...form, method:e.target.value})}>
              <option>cash</option><option>upi</option><option>bank</option><option>card</option><option>other</option>
            </select>
          </div>
          <div><label className="label">Date</label><input type="date" className="input" value={form.date} onChange={e=>setForm({...form, date:e.target.value})} /></div>
          <div className="sm:col-span-2"><label className="label">Note</label><input className="input" value={form.note} onChange={e=>setForm({...form, note:e.target.value})} /></div>
        </div>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button className="btn w-full" disabled={loading}>{loading ? 'Saving...' : 'Add Donation & Generate Receipt'}</button>
      </form>

      <div className="grid gap-3">
        {list.map(d => (
          <div key={d._id} className="card flex items-start justify-between gap-3">
            <div>
              <div className="font-medium">{d.donorName} • ₹{d.amount}</div>
              <div className="text-sm text-slate-500">{new Date(d.date).toLocaleDateString()} • {d.method} • {d.donationType || d.type || 'general'}</div>
              {d.note && <div className="text-sm mt-1">{d.note}</div>}
            </div>
            {d.receiptPdfPath && <a className="text-sky-600 text-sm underline" href={d.receiptPdfPath} target="_blank">Receipt PDF</a>}
          </div>
        ))}
      </div>
    </div>
  )
}
