import { useState, useEffect } from 'react'

export default function App() {
  const [resume, setResume] = useState(null)
  const [jd, setJd] = useState('')
  const [backend, setBackend] = useState('checking...')
  const [gaps, setGaps] = useState([])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('http://localhost:8000/health')
      .then((res) => res.json())
      .then((data) => setBackend(data.status === 'ok' ? 'connected' : 'error'))
      .catch(() => setBackend('offline'))
  }, [])

  async function handleStart() {
    setLoading(true)
    setGaps([])
    setMessage('')
    try {
      const form = new FormData()
      form.append('resume', resume)
      form.append('jd', jd)
      const res = await fetch('http://localhost:8000/gaps', {
        method: 'POST',
        body: form,
      })
      const data = await res.json()
      if (data.error) setMessage(data.error)
      setGaps(data.gaps || [])
    } catch {
      setMessage('Something went wrong. Is the backend running?')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow p-6 space-y-5">
        <h1 className="text-3xl font-bold text-blue-600">RoundZero</h1>
        <p className="text-gray-600">
          Upload your resume and paste the job description. We'll interview you on the gaps.
        </p>
        <p className="text-sm text-gray-500">Backend: {backend}</p>

        <div>
          <label className="block font-medium mb-1">Resume (PDF)</label>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setResume(e.target.files[0])}
            className="block w-full text-sm"
          />
          {resume && <p className="text-sm text-green-600 mt-1">{resume.name}</p>}
        </div>

        <div>
          <label className="block font-medium mb-1">Job description</label>
          <textarea
            value={jd}
            onChange={(e) => setJd(e.target.value)}
            rows={8}
            placeholder="Paste the job description here"
            className="w-full border rounded-lg p-3 text-sm"
          />
        </div>

        <button
          onClick={handleStart}
          disabled={!resume || !jd.trim() || loading}
          className="w-full bg-blue-600 text-white rounded-lg py-2 font-medium disabled:opacity-40"
        >
          {loading ? 'Analyzing...' : 'Start interview'}
        </button>

        {message && <p className="text-sm text-red-600">{message}</p>}

        {gaps.length > 0 && (
          <div className="space-y-3">
            <h2 className="font-medium">Gaps found</h2>
            {gaps.map((g, i) => (
              <div key={i} className="border rounded-lg p-3 text-sm space-y-1">
                <p><b>Job asks:</b> {g.requirement}</p>
                <p><b>Resume shows:</b> {g.evidence}</p>
                <p><b>Gap:</b> {g.gap}</p>
                <p className="text-blue-700"><b>Question:</b> {g.question}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}