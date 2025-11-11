import { useState } from 'react'
import api from '../api/axios'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function onSubmit(e) {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const { data } = await api.post('/auth/login', { email, password })
      if (data.ok) {
        localStorage.setItem('token', data.token)
        if (data.user?.role) localStorage.setItem('role', data.user.role)
        navigate('/')
      } else setError(data.message || 'Login failed')
    } catch (err) {
      setError(err.response?.data?.message || err.message)
    } finally { setLoading(false) }
  }

  return (
    <div className="max-w-sm mx-auto mt-10 card">
      <h1 className="text-xl font-semibold mb-4">Management Team</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="label">Email</label>
          <input className="input" value={email} onChange={e=>setEmail(e.target.value)} />
        </div>
        <div>
          <label className="label">Password</label>
          <input type="password" className="input" value={password} onChange={e=>setPassword(e.target.value)} />
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button disabled={loading} className="btn w-full">{loading ? 'Please wait...' : 'Login'}</button>
      </form>
    </div>
  )
}
