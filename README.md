# femfit (name pending, current name conflicts with an existing trademark)

## The problem

Sports science research on training load and injury risk has been built almost entirely on male athletes, then applied to female athletes without adjustment. Two specific gaps stand out: menstrual cycle phase affects ligament laxity and injury susceptibility, and youth athletes at different stages of physical maturation carry different injury risk at the same chronological age and the same training load. Existing tools either ignore both factors entirely, generic ACWR trackers, or require wearable hardware and per-athlete subscriptions that put them out of reach for school and youth teams, FitrWoman and similar cycle-syncing apps. This project targets the coach of an under-resourced girls' team who has neither.

## How it works

A coach logs a session per player: duration, RPE (rate of perceived exertion, 0 to 10), and optionally whether the player is currently menstruating and two height measurements six months apart. The backend computes session load using the Foster et al. session-RPE method (duration times RPE), rolls it into 7-day acute and 28-day chronic averages, and divides one by the other to get the acute:chronic workload ratio, the standard Gabbett-style load monitoring metric. Two optional modifiers sit on top of that base ratio, one for cycle phase and one for growth rate, both currently neutral placeholders, see below.

## What's validated and what isn't

The base ACWR calculation and the session-RPE input method are both established, peer-reviewed sports science, not this project's contribution. The two modifiers are the actual contribution, and they are explicitly unvalidated. This tool does not predict injuries. ACWR alone is not a reliable injury predictor for any athlete, male or female, according to the sports medicine literature, and this project does not claim otherwise anywhere in its output. What it does claim is narrower: that cycle phase and growth-rate context are plausible, underexplored inputs to workload monitoring for female youth athletes, worth testing, not yet proven. That framing follows research by Bruinvels and Pedlar at St Mary's University, whose prospective study found injury risk clustering at certain cycle points in female footballers, while noting their own sample size was too small to generalize. This project's cycle and maturation modifiers currently return a neutral value of 1.0 regardless of input, by design, an honest placeholder rather than an invented multiplier, until real validation work can inform actual values.

## Architecture

The backend is FastAPI with one endpoint, POST /sessions, which logs a session and returns that player's current risk assessment. Scoring lives in four small, independently tested pure functions, acute:chronic ratio, cycle modifier, maturation modifier, and the composite that combines them, each swappable without touching the others. The frontend is a plain React and TypeScript app, a session entry form and a roster of risk cards, calling that one endpoint.

## Limitations

Session history is stored in memory on the backend process, not a database, so a server restart clears all logged sessions. This is a known, deliberate limitation for the current build stage, not an oversight, and is the first thing to change before any real deployment. Scores computed from fewer than 28 days of history are explicitly flagged as lower-confidence in the API response itself, since the acute:chronic ratio is mechanically less meaningful without a full rolling baseline.

## Roadmap to production

Persistent storage, a real database instead of an in-memory dict, so history survives restarts and scales past one coach's laptop. Authentication and per-team data isolation, since right now anyone who can reach the API can read or write any player's data, which is not acceptable for health-adjacent information about minors. A consent and data-retention flow for cycle and growth data specifically, with a clear opt-out that doesn't degrade the rest of the tool. An outcomes feedback loop, a way to record whether a flagged player was later actually injured, which is the only path to eventually validating or discarding the cycle and maturation modifiers instead of leaving them as permanent placeholders. Until that feedback loop exists and has run for at least a season, this stays a research prototype, not a clinical or commercial claim.

## Running locally

Backend: `pip install -r requirements.txt`, then `uvicorn backend.main:app --reload`.
Frontend: `cd frontend && npm install && npm run dev`.