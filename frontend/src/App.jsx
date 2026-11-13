import { useState, useEffect, useRef } from 'react'

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition

function pickVoice() {
  const voices = window.speechSynthesis.getVoices()
  const preferred = ['Neerja', 'Natural', 'Aria', 'Jenny', 'Google UK English Female', 'Zira', 'Heera']
  for (const name of preferred) {
    const match = voices.find((v) => v.name.includes(name))
    if (match) return match
  }
  return voices.find((v) => v.lang.startsWith('en')) || null
}

function speak(text) {
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  const voice = pickVoice()
  if (voice) utterance.voice = voice
  utterance.rate = 1
  window.speechSynthesis.speak(utterance)
}

export default function App() {
  const [resume, setResume] = useState(null)
  const [jd, setJd] = useState('')
  const [backend, setBackend] = useState('checking...')
  const [gaps, setGaps] = useState([])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [phase, setPhase] = useState('input')
  const [index, setIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const [answers, setAnswers] = useState([])
  const [listening, setListening] = useState(false)
  const recognitionRef = useRef(null)
  const baseRef = useRef('')

  const questions = gaps.slice(0, 3)

  useEffect(() => {
    fetch('http://localhost:8000/health')
      .then((res) => res.json())
      .then((data) => setBackend(data.status === 'ok' ? 'connected' : 'error'))
      .catch(() => setBackend('offline'))
  }, [])

  useEffect(() => {
    if (phase === 'interview' && questions[index]) {
      speak(questions[index].question)
    }
    return () => {
      window.speechSynthesis.cancel()
      stopListening()
    }
  }, [phase, index, gaps])

  function startListening() {
    if (!SpeechRecognition) {
      setMessage('Voice input works in Chrome or Edge.')
      return
    }
    window.speechSynthesis.cancel()
    const rec = new SpeechRecognition()
    rec.lang = 'en-IN'
    rec.continuous = true
    rec.interimResults = true
    baseRef.current = answer
    rec.onresult = (e) => {
      let text = ''
      for (let i = 0; i < e.results.length; i++) {
        text += e.results[i][0].transcript
      }
      setAnswer((baseRef.current ? baseRef.current + ' ' : '') + text)
    }
    rec.onend = () => setListening(false)
    rec.onerror = () => setListening(false)
    rec.start()
    recognitionRef.current = rec
    setListening(true)
    setMessage('')
  }

  function stopListening() {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
    setListening(false)
  }

  async function handleStart() {
    setLoading(true)
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
      if (data.gaps && data.gaps.length > 0) {
        setGaps(data.gaps)
        setAnswers([])
        setAnswer('')
        setIndex(0)
        setPhase('interview')
      } else if (!data.error) {
        setMessage('No gaps found. Try a different job description.')
      }
    } catch {
      setMessage('Something went wrong. Is the backend running?')
    }
    setLoading(false)
  }

  function handleNext() {
    stopListening()
    const updated = [...answers, { question: questions[index].question, answer }]
    setAnswers(updated)
    setAnswer('')
    if (index + 1 < questions.length) {
      setIndex(index + 1)
    } else {
      setPhase('done')
    }
  }

  function handleRestart() {
    stopListening()
    setPhase('input')
    setGaps([])
    setAnswers([])
    setAnswer('')
    setIndex(0)
    setMessage('')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow p-6 space-y-5">
        <h1 className="text-3xl font-bold text-blue-600">RoundZero</h1>

        {phase === 'input' && (
          <>
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
          </>
        )}

        {phase === 'interview' && (
          <>
            <p className="text-sm text-gray-500">
              Question {index + 1} of {questions.length}
            </p>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-lg font-medium text-blue-900">{questions[index].question}</p>
            </div>
            <button
              onClick={() => speak(questions[index].question)}
              className="text-sm text-blue-600 underline"
            >
              Replay question
            </button>
            <p className="text-xs text-gray-500">
              Why we ask: {questions[index].gap}
            </p>

            <button
              onClick={listening ? stopListening : startListening}
              className={
                'w-full rounded-lg py-2 font-medium text-white ' +
                (listening ? 'bg-red-600' : 'bg-green-600')
              }
            >
              {listening ? 'Stop listening' : 'Speak your answer'}
            </button>
            {listening && <p className="text-sm text-red-600">Listening...</p>}
            {message && <p className="text-sm text-red-600">{message}</p>}

            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={6}
              placeholder="Your answer appears here. You can also type."
              className="w-full border rounded-lg p-3 text-sm"
            />
            <button
              onClick={handleNext}
              disabled={!answer.trim()}
              className="w-full bg-blue-600 text-white rounded-lg py-2 font-medium disabled:opacity-40"
            >
              {index + 1 < questions.length ? 'Next question' : 'Finish'}
            </button>
          </>
        )}

        {phase === 'done' && (
          <>
            <h2 className="text-xl font-semibold">Interview complete</h2>
            <div className="space-y-3">
              {answers.map((a, i) => (
                <div key={i} className="border rounded-lg p-3 text-sm space-y-1">
                  <p className="font-medium">Q{i + 1}: {a.question}</p>
                  <p className="text-gray-700">{a.answer}</p>
                </div>
              ))}
            </div>
            <button
              onClick={handleRestart}
              className="w-full bg-gray-800 text-white rounded-lg py-2 font-medium"
            >
              Start over
            </button>
          </>
        )}
      </div>
    </div>
  )
}