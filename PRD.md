# RoundZero: Product Requirements Document

**Tagline:** Your resume gets you considered. Your answers help you stand out.
**Status:** Draft v1, in progress
**Owner:** Uma Devi

## 1. Problem

Students and freshers get shortlisted on their resume, then lose the interview. Existing mock-interview tools ask generic questions and give vague feedback, so candidates don't know what went wrong or how to fix it.

## 2. Target user

B.Tech students and fresh graduates preparing for campus placements and entry-level tech and PM interviews.

## 3. Goal

Give a student a realistic voice interview based on their own resume, and a scorecard that explains every score and says exactly what to change.

## 4. Core features

### 4.1 Resume-based questions
The system reads the resume and finds gaps: vague claims, missing numbers, projects with no explanation of the candidate's role. Questions target those gaps.

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
Every question is traceable: **resume gap → question → candidate's answer → fix**. The candidate can see why they were asked each question.

### 4.5 Reasoned scores
Every score includes a **one-line reason**. No score appears without one.

## 5. User flow

1. Upload resume.
2. Review the detected gaps (optional).
3. Start the interview and answer 3 questions by voice.
4. See the scorecard from both agents with reasons and fixes.

## 6. Out of scope for v1

- Video or facial analysis
- Multiple interviewer personas
- Company-specific question banks
- Accounts and saved history

## 7. Success criteria

- A user finishes a 3-question session without help.
- Every score shows a one-line reason.
- Every question is linked to a specific resume gap.
- A user can say what they would change in their next answer.

## 8. Open questions

- Tech stack and model providers are not decided yet.
- Resume formats to support (PDF only, or PDF and DOCX).
- How to score voice delivery, if at all, versus content only.
