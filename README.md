# RoundZero

**Your resume gets you considered. Your answers help you stand out.**

> Status: In progress. This repo currently holds the idea and PRD. No working demo yet.

## The problem

Freshers get rejected in the interview room, not on the resume. Most mock-interview tools give generic questions and vague feedback like "be more confident". Students never learn *what* to fix or *why*.

## The idea

RoundZero is a voice-to-voice AI mock interview built around **your own resume**.

- An AI interviewer (a cartoon avatar, voice only, no video) asks questions based on the gaps in your resume.
- Two agents score your answers:
  - **Hiring Manager agent:** judges whether the answer would pass a real interview.
  - **HR Coach agent:** tells you how to fix it.
- Every score comes with a **one-line reason**.
- Every question follows an **evidence chain**: resume gap → question → your answer → fix.

## How a session works

1. Upload your resume.
2. RoundZero finds gaps (vague claims, missing metrics, unexplained projects).
3. You answer 3 questions by voice (default for the demo).
4. You get a scorecard from both agents, each score with a one-line reason and a concrete fix.

## Roadmap

- [x] Idea and PRD
- [ ] Resume parsing and gap detection
- [ ] Voice in and out
- [ ] Dual-agent scorecard
- [ ] Avatar interviewer
- [ ] Public demo

## Docs

See [PRD.md](PRD.md) for the full product spec.

## Author

Uma Devi, B.Tech CSE, Hyderabad
