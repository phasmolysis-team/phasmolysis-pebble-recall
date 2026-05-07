# Pebble Recall 🪨

> *A low-friction mental health tracking system for better psychiatric care.*

> [!NOTE]
> Project used the following project template <https://codeberg.org/uncomfyhalomacro/fullstack-fastapi-template/>
> licensed under [WTFPL](https://www.wtfpl.net/).

## Dedication

*This project is first of all dedicated to the Team Lead's partner, and to those who have forgotten but refuse to forget, and to those who keep on fighting.*

*This is for you. This is for us.*

## Demo

A `seed_credentials.json` file is included in the repo with over 1,000 pre-seeded accounts for testing purposes.

Live demo: https://pebble-recall.lyra-on.top

Just open seed_credentials.json and pick any account at random — each one has an email, password, and role (patient or professional). Log in and explore!

These are seeded test accounts. Do not use real personal information when exploring the app.

## Philosophy & Origin

This project was not born purely from technical curiosity, but from lived experience.

As the team lead — someone navigating life with ADHD and Bipolar I, and as a partner to someone living with ADHD and persistent depressive disorder — I know intimately what it feels like when the systems around you are not built for the way your mind works. Appointments are months apart. Words fail you in the moment you need them most. You sit across from your psychiatrist and are asked, *"How have you been?"* — and the honest answer is somewhere in the fog of the last ninety days, inaccessible.

Pebble Recall exists because that fog is not a personal failing. It is a structural one. And we believe structure can be redesigned.

## The Problem, and Why It's Personal

Mental health is recognized as a global priority under the United Nations Sustainable Development Goal 3 (Good Health and Well-Being), specifically through Target 3.4, which aims to promote mental health and well-being.[^un-sdg3][^un-mental-wellness] Despite this recognition, access to consistent, timely mental health support remains severely limited in many parts of the world — and in the Philippines, the gap is staggering. There is approximately one psychiatrist for every 180,000 to 200,000 Filipinos.[^who-ph-2021]

Let that number sit for a moment.

One psychiatrist. For every 180,000 people.

This is not a footnote. This is the architecture of a system that fails its patients before they even walk through the door. And it fails them not in one clean, obvious way — but in layers. In compounding, cascading ways that build on each other until the weight becomes unbearable.

It starts with the shortage. One psychiatrist for 180,000 people means that follow-up appointments — the ones that are supposed to monitor whether your medication is working, whether your mood is stabilizing, whether the treatment plan needs to change — get stretched. Months apart. Sometimes much longer.

The team lead knows this not from a research paper, but from living it.

After beginning antidepressant medication, the next follow-up appointment did not come in four weeks. Not in six. Not in three months. **It came after eight months.** Eight months of being on antidepressants with no clinical monitoring. Eight months of a brain quietly doing something the medication was making worse, not better. Because what no one caught — what the eight-month gap made impossible to catch in time — was that the diagnosis was wrong.

Not because the clinician was careless. But because the system gave them no tools to see what was happening in between.

This is a known and documented clinical risk: antidepressants administered to a patient with undiagnosed Bipolar disorder can trigger manic episodes. The medications that are supposed to lift the floor can, in the wrong neurological context, also blow out the ceiling. And that is exactly what happened. A manic episode. Eight months in. That is when the Bipolar I diagnosis came.

And then: the second layer of failure. Mental health literacy — or the lack of it. Despite the new diagnosis, despite the clinical evidence of what the antidepressants had done, the team lead continued taking them. Not out of stubbornness. But because the family did not understand. Because the infrastructure of education around mental illness in the Philippines is as sparse as the psychiatric workforce itself. Parents who love their child can still, out of pure ignorance of what these conditions actually are, enable harm without ever meaning to. And the patient — already destabilized, already navigating a diagnosis that rewrites your entire personal history — does not always have the capacity to fight both the illness *and* the people who are supposed to protect them.

And then, because the universe apparently has a sense of humor: a third layer. It was not just Bipolar I. It was also ADHD. Two disorders. One brain. A system that caught neither of them on time.

This is what "compounding failure" means in practice. It is not one thing going wrong. It is the shortage making monitoring impossible, which makes misdiagnosis likely, which makes harmful treatment invisible, which is then sustained by a family that doesn't have the education to intervene correctly, in a country that hasn't built the infrastructure to educate them, inside a global framework that calls mental health a priority while the numbers tell a different story.

**Pebble Recall is a direct response to this.** The side effects journal — one of the core features of this application — exists precisely because of what happened when eight months passed without anyone asking: *"Are you experiencing anything unusual? Anything that feels different, or wrong, or too much?"* Structured, timestamped, daily logging of medication side effects is not a nice-to-have feature. For patients on psychiatric medication without frequent clinical oversight, it is a safety net. It is the record that says: *something changed on this date. Something was not right. Here is the evidence.*

It will not replace a psychiatrist. Nothing in this application will. But it can be the thing that makes the next appointment — whenever it finally comes — count for more than one conversation pulled from a failing memory.

And the team lead? Still here. Carrying two diagnoses instead of one, in a world that was not built for either of them, laughing at the sheer absurdity of it all — because what is the alternative? To sulk in an absurd world is its own absurdity. To laugh at it, to stand back up, to turn the wreckage into something useful: that is the only move that makes any sense. That is Pebble Recall.

## A Personal Note

The following piece was written by the team lead and reflects the personal experiences that informed the development of this project.

&nbsp;&nbsp;&nbsp;&nbsp;A &nbsp;&nbsp;I am lost once again  
&nbsp;&nbsp;&nbsp;&nbsp;B &nbsp;&nbsp;in the forest that is my mind  
&nbsp;&nbsp;&nbsp;&nbsp;C &nbsp;&nbsp;where the kids are usually  
&nbsp;&nbsp;&nbsp;&nbsp;D &nbsp;&nbsp;lost once more  

&nbsp;&nbsp;&nbsp;&nbsp;B &nbsp;&nbsp;in the forest that is my mind  
&nbsp;&nbsp;&nbsp;&nbsp;E &nbsp;&nbsp;I am being scolded in the class  
&nbsp;&nbsp;&nbsp;&nbsp;D &nbsp;&nbsp;lost once more  
&nbsp;&nbsp;&nbsp;&nbsp;F &nbsp;&nbsp;because I'm not listening  

&nbsp;&nbsp;&nbsp;&nbsp;E &nbsp;&nbsp;I am being scolded in the class  
&nbsp;&nbsp;&nbsp;&nbsp;G &nbsp;&nbsp;like it's a sin to be lost  
&nbsp;&nbsp;&nbsp;&nbsp;F &nbsp;&nbsp;because I'm not listening  
&nbsp;&nbsp;&nbsp;&nbsp;H &nbsp;&nbsp;even though I try to follow the lesson  

&nbsp;&nbsp;&nbsp;&nbsp;G &nbsp;&nbsp;like it's a sin to be lost  
&nbsp;&nbsp;&nbsp;&nbsp;C &nbsp;&nbsp;where the kids are usually  
&nbsp;&nbsp;&nbsp;&nbsp;H &nbsp;&nbsp;trying hard to follow the lesson  
&nbsp;&nbsp;&nbsp;&nbsp;A &nbsp;&nbsp;I am lost once again  

This project is an attempt to turn that experience into something constructive — something that may help others take small steps forward, even on the difficult days.

For those living with ADHD, Bipolar disorder, persistent depression, and similar conditions:

> **We are not lazy. We are doing our best in systems that were not designed for us.**

This project itself is a testament to that.

## Inspiration

Pebble Recall is an extension of **Pebble** — a project originally conceived and presented at [Arduinnovathon 2026, organized by Arduino Day Philippines](https://www.facebook.com/share/p/1BDR9dw9Cx/), by **Team whitespace_negative**, a team solely comprised of **Lyra Phasma**.

Pebble began as a tangible, low-friction companion for people who struggle to engage with traditional productivity and wellness systems. Pebble Recall extends that ethos into the psychiatric care space — specifically addressing the painful gap between clinical appointments that so many patients in the Philippines are forced to navigate.

## What Pebble Recall Does

Pebble Recall is a day-to-day logging system designed specifically for psychiatric patients currently under clinical care. Rather than asking patients to recall months of symptoms from memory during a consultation, Pebble Recall captures:

- **Mood states** — logged at the moment they occur, using low-friction emoji-based categories
- **Medication compliance** — simple yes/no check-ins for each prescribed medication
- **Medication side effects** — structured, clickable logging to capture what often gets normalized or forgotten
- **Exportable summaries** — PDF exports for patients to bring to their appointments, giving clinicians a longitudinal, accurate picture of the patient's experience

The core design principle is **low friction**: most interactions are a single tap, not an essay. Because we know that on the hardest days, even small barriers become walls.

## Scope & Limitations

Pebble Recall is **not** a replacement for professional mental health care. It is a supplementary tool — a bridge between appointments, not a substitute for the clinician relationship.

In its current form, Pebble Recall may not be accessible to patients who face significant barriers interacting with technology, including those with certain disabilities or limited digital literacy. Future iterations aim to address these gaps and expand accessibility.

## What's Still on the Table

There are many features that remain to be built. This is a beginning, not a finished product. Features currently left on the table include:

- **Real-time clinician dashboards** — allowing psychiatrists and psychologists to monitor patient logs as they come in, rather than waiting for an export at the next appointment
- **SOS / crisis escalation feature** — a dedicated button for psychiatric emergencies that rapidly connects patients to crisis hotlines, emergency services, or trusted contacts
- **Patient-Clinician linked accounts** — a more robust, privacy-conscious system for clinicians to configure patient experiences and monitor progress
- **Patient-specific daily questions** — customized Likert-scale prompts configured by the clinician
- **Accessibility improvements** — making Pebble Recall usable for patients who struggle with current interfaces
- **Guided mood vocabulary** — in-app definitions and contextual help so patients are never left uncertain about what a mood label means
- **Longitudinal data visualization** — helping both patients and clinicians identify patterns across time

We built what we could. We know what remains. And we intend to keep going.

## About the Team

**Team Phasmolysis**

- **Lyra Phasma** — Team Lead
- **uncomfyhalomacro**
- **koi**
- **main character**

Built with care, imperfect by necessity, and dedicated to everyone who has ever sat in a waiting room trying to remember how they felt three months ago.

## A Note from the Team Lead

This project started as a dream — my dream — born out of pain I didn't fully know how to name yet. And my groupmates, without hesitation, showed up for it. For me.

**uncomfyhalomacro, koi, main character** — you didn't have to go along with my whimsy. You didn't have to take my half-formed ideas and sit with me in the mess of them. But you did. You showed up, you stayed, and you helped turn something deeply personal into something real and tangible and maybe, hopefully, useful to someone out there who is hurting the way I hurt.

I don't take that lightly. I don't think I ever will.

Thank you for making my dream come true. This one's ours. :3

And — congratulations. In advance, and also already.
 
Out of 140+ teams that joined this hackathon, we were the only ones who tried to tackle the invisible hurt. The kind of pain that doesn't show up on an X-ray, that gets dismissed in waiting rooms, that gets lost in the eight months between appointments. We saw it. We built for it. We showed up for the people that the system forgot to show up for.
 
Whether or not we take home the cash prize — we've already won something that can't be handed out at a ceremony. And you've won over my heart.
 
This one counts. :3

## Initial setup

Requires [direnv](https://direnv.net/) and [nix](https://nixos.org).

```bash
mkdir -p ~/.config/direnv
# Either copy or append the layout script
cat $PROJECT_PATH/.direnv.uv >> ~/.config/direnv/direnvrc
direnv allow
```

## Docker

```bash
cp backend/.env.example backend/.env
```

Adjust variables accordingly

```bash
docker compose --env-file=backend/.env up --build
```

### Environment variables

| Variable | Description | Default |
|---|---|---|
| `HOST` | Server host | `localhost` |
| `PORT` | Server port | `8080` |
| `PG_URL` | Full database connection string | |
| `ORIGINS` | CORS allowed origins (comma-separated) | |
| `API_ROOT` | Base path for API routes | `/api` |
| `AUTH__JWT_SECRET` | Fernet key for JWT signing | |
| `AUTH__COOKIE_SECRET` | Fernet key for cookie encryption | |

Generate Fernet keys with:
```bash
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

That's it

## For Non Nix Setups

**Fedora**

```bash
sudo dnf install -y postgresql postgresql-server postgresql-contrib uv nodejs just caddy
```

**Ubuntu/Debian**

```bash
sudo apt install -y postgresql uv nodejs just caddy
```

### Setup

Copy `Caddyfile.example`

```bash
cp ./Caddyfile.example ./Caddyfile
```

#### Backend

```bash
cd backend
cp .env.example .env
```

Inside the `backend` directory

```bash
uv sync
```

#### Frontend

```bash
cd frontend
```

Inside the `frontend` directory

```bash
npm install
```

### Running the app

Both

```bash
just default
```

Backend only

```bash
cd backend
just serve
```

Frontend only

```bash
cd frontend
npm run dev
```

## Setting up the database

```bash
cd backend
just start-db
```

Open a new terminal

```bash
just create-db
```

### Troubleshooting

permission denied on `/var/log/`

In `./pgdata/postgresql.conf`, set this var to `/tmp` or any writeable directory

```
unix_socket_directories = "/tmp"
```

---

*"Meet me where I am."*

[^un-sdg3]: United Nations Department of Economic and Social Affairs Sustainable Development Division for Sustainable Development Goals. *Sustainable Development Goal 3*. https://sdgs.un.org/goals/goal3#targets_and_indicators

[^un-mental-wellness]: United Nations Department of Economic and Social Affairs Division for Inclusive Social Development. *Mental wellness at the heart of the SDGs*. https://social.desa.un.org/sdn/mental-wellness-at-the-heart-of-the-sdgs. Accessed March 18, 2026.

[^who-ph-2021]: World Health Organization Regional Office for the Western Pacific. (2021). *Prevention and management of mental health conditions in the Philippines: The case for investment*. Accessed March 18, 2026.
