# RoundZero: Product Requirements Document

**Tagline:** Your resume gets you considered. Your answers help you stand out.
**Status:** Draft v1, in progress
**Owner:** Uma Devi

## 1. Problem

Students and freshers get shortlisted on their resume, then lose the interview. Existing mock-interview tools ask generic questions and give vague feedback, so candidates don't know what went wrong or how to fix it.

## 2. Target user

B.Tech students and fresh graduates preparing for campus placements and entry-level tech and PM interviews.

## 3. Goal

Give a student a realistic voice interview based on their own resume **and the job description they are applying to**, and a scorecard that explains every score and says exactly what to change.

## 4. Core features

### 4.1 Resume + job description input
The candidate uploads their resume and pastes the job description (JD) for the role they want. The system compares the two and finds gaps: JD requirements the resume doesn't prove, vague claims, missing numbers, projects with no explanation of the candidate's role. Questions target those gaps, so each interview is tailored to one specific role.

### 4.2 Voice-to-voice interview
- The candidate speaks, the AI interviewer replies by voice.
- The interviewer is an AI-generated cartoon avatar. Voice only, no video.
- Default length for the demo: **3 questions**.

### 4.3 Dual-agent scorecard
| Agent | Role |
|---|---|
| Hiring Manager | Judges whether the answer would pass a real interview |
| HR Coach | Explains how to improve the answer |

### 4.4 Evidence chain
Every question is traceable: **resume vs JD gap → question → candidate's answer → fix**. The candidate can see why they were asked each question.

### 4.5 Reasoned scores
Every score includes a **one-line reason**. No score appears without one.

## 5. User flow

1. Upload resume and paste the job description.
2. Review the detected gaps (optional).
3. Start the interview and answer 3 questions by voice.
4. See the scorecard from both agents with reasons and fixes.

## 6. Out of scope for v1

- Video or facial analysis
- Multiple interviewer personas
- Pre-built company-specific question banks (questions come from the JD you paste, not a fixed bank)
- Accounts and saved history

## 7. Success criteria

- A user finishes a 3-question session without help.
- Questions clearly reflect the pasted JD, not generic interview questions.
- Every score shows a one-line reason.
- Every question is linked to a specific resume gap.
- A user can say what they would change in their next answer.

## 8. Decisions for v1

- **Resume format:** PDF only.
- **JD input:** pasted text only.
- **Scoring:** content only. Voice delivery (tone, pace) is a v2 idea.
- **Frontend:** React, Vite, Tailwind CSS.
- **Backend:** Python (FastAPI).
- **Voice:** browser Web Speech API for speech in and out.
- **LLM:** Gemini Flash via Google AI Studio, called through one small function so the provider can be swapped.
