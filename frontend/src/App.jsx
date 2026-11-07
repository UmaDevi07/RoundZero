import { useState, useEffect } from 'react'

export default function App() {
  const [resume, setResume] = useState(null)
  const [jd, setJd] = useState('')
  const [backend, setBackend] = useState('checking...')
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('http://localhost:8000/health')
      .then((res) => res.json())
      .then((data) => setBackend(data.status === 'ok' ? 'connected' : 'error'))
      .catch(() => setBackend('offline'))
  }, [])

  async function handleStart() {
    setLoading(true)
    setText('')
    try {
      const form = new FormData()
      form.append('resume', resume)
      const res = await fetch('http://localhost:8000/extract', {
        method: 'POST',
        body: form,
      })
      const data = await res.json()
      setText(data.text || 'No text found. This PDF may be a scanned image.')
    } catch {
      setText('Could not read the PDF. Is the backend running?')
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
          {loading ? 'Reading resume...' : 'Start interview'}
        </button>

        {text && (
          <div>
            <h2 className="font-medium mb-1">Extracted resume text</h2>
            <pre className="whitespace-pre-wrap text-sm bg-gray-100 rounded-lg p-3 max-h-64 overflow-auto">
              {text}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}