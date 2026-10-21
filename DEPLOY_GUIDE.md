# Deployment Guide: RCB Fan Hub (GitHub -> MongoDB Atlas -> Render -> Vercel)

Order matters: **Atlas first, then GitHub, then Render (backend), then Vercel (frontend), then one CORS fix.**
Keep a notepad open: you will collect 3 links (GitHub, Render, Vercel) and 1 connection string.

You need: Node.js 18+ (nodejs.org), Git (git-scm.com), and free accounts on GitHub, MongoDB Atlas, Render, Vercel
(sign up on Render and Vercel using "Continue with GitHub", it makes everything easier).

---------------------------------------------------------------------

## STEP 1 - MongoDB Atlas (online database)

1. Go to mongodb.com/atlas and sign up / log in.
2. Create a project (any name) -> **Create a cluster** -> choose **M0 Free**. Provider AWS, region **Mumbai (ap-south-1)** is closest. Click Create.
3. **Database Access** (left menu) -> **Add New Database User**
   - Authentication: Password. Username e.g. `rcbuser`, password e.g. `Rcb2026Pass` (use ONLY letters and numbers; symbols like `@ : / ?` break the connection string).
   - Privileges: "Read and write to any database". Add user.
4. **Network Access** -> **Add IP Address** -> **Allow Access From Anywhere** (`0.0.0.0/0`) -> Confirm. (Render's IP changes, so this is needed.)
5. **Database** -> your cluster -> **Connect** -> **Drivers** -> copy the string. It looks like:
   `mongodb+srv://rcbuser:<password>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority`
6. Edit it: replace `<password>` with your password and add the database name before the `?`:
   `mongodb+srv://rcbuser:Rcb2026Pass@cluster0.abcde.mongodb.net/rcbfanhub?retryWrites=true&w=majority`
   This final string is your **MONGODB_URI**. Save it in your notepad.

## STEP 2 - Run it locally once (proves the DB connection works)

```bash
cd rcb-fan-hub/backend
copy .env.example .env        # Windows   (Mac/Linux: cp .env.example .env)
```
Open `backend/.env` and paste your string into `MONGODB_URI=`. Then:
```bash
npm install
npm start
```
You should see `MongoDB Atlas connected`, `Seeded starter squad`, `API running on port 5000`.
Open http://localhost:5000/api/players in the browser: you see the squad as JSON.

New terminal:
```bash
cd rcb-fan-hub/frontend
copy .env.example .env.local
npm install
npm run dev
```
Open http://localhost:3000. Add a player, edit one, delete one, post on the fan wall.

Run `npm run build` inside `frontend` once and screenshot the route-size table (shows bundle optimization).

**Screenshot A:** Atlas -> Database -> **Browse Collections** -> `rcbfanhub` -> `players` (shows your data).

## STEP 3 - Upload to GitHub

1. github.com -> **New repository** -> name `rcb-fan-hub` -> **Public** -> do NOT tick README/.gitignore/license -> Create.
2. In a terminal inside the `rcb-fan-hub` folder (the one containing `backend` and `frontend`):
```bash
git init
git add .
git commit -m "RCB Fan Hub - AWT practical 13"
git branch -M main
git remote add origin https://github.com/<your-username>/rcb-fan-hub.git
git push -u origin main
```
3. A browser window asks you to sign in to GitHub; approve it. (If it asks for a password, use a Personal Access Token: GitHub -> Settings -> Developer settings -> Tokens (classic) -> tick `repo`.)
4. Refresh the repo page. Check that **`.env` is NOT visible** (only `.env.example`). If you see `.env`, delete it from GitHub and change your Atlas password.

**GitHub link:** `https://github.com/<your-username>/rcb-fan-hub`  **Screenshot B:** the repo page showing `backend` and `frontend` folders.

## STEP 4 - Deploy the BACKEND on Render

1. render.com -> **New +** -> **Web Service** -> connect GitHub -> select `rcb-fan-hub`.
2. Fill the form:
   - Name: `rcb-fan-hub-api`
   - Region: Singapore (closest)
   - Branch: `main`
   - **Root Directory: `backend`**
   - Runtime: Node
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Instance Type: **Free**
3. **Environment Variables** -> add:
   - `MONGODB_URI` = your Atlas string from Step 1
   - `CLIENT_URL` = `http://localhost:3000` (temporary, we change it in Step 6)
4. **Create Web Service**. Wait for the log to say `Your service is live`.
5. Copy the URL at the top (e.g. `https://rcb-fan-hub-api.onrender.com`).
6. Test: open `https://<your-service>.onrender.com/` -> you see `{"status":"ok",...}`, and `/api/players` -> JSON squad.

**Render link:** your `.onrender.com` URL.  **Screenshot C:** Render dashboard showing "Live".  **Screenshot D:** browser showing `/api/players` JSON on the Render URL.

> Free Render services sleep after ~15 minutes idle; the first request then takes 30-60 seconds. Open the URL once before taking screenshots / showing your teacher.

## STEP 5 - Deploy the FRONTEND on Vercel

1. vercel.com -> **Add New...** -> **Project** -> import `rcb-fan-hub`.
2. **Root Directory** -> click Edit -> choose `frontend`. Framework Preset should auto-show **Next.js**.
3. **Environment Variables** -> add:
   - Key `NEXT_PUBLIC_API_URL`  Value = your Render URL, **no trailing slash** (e.g. `https://rcb-fan-hub-api.onrender.com`)
4. **Deploy**. When confetti appears, click the preview to open it. Copy the URL (e.g. `https://rcb-fan-hub.vercel.app`).

**Vercel link:** your `.vercel.app` URL.  **Screenshot E:** Vercel project dashboard (Ready).

> Changed `NEXT_PUBLIC_API_URL` later? You must **Redeploy** on Vercel, because it is baked into the build.

## STEP 6 - Connect them (CORS fix)

Right now the browser blocks the frontend from calling the backend. Fix:
1. Render -> your service -> **Environment** -> edit `CLIENT_URL` = your Vercel URL, **no trailing slash** (`https://rcb-fan-hub.vercel.app`). Save. Render redeploys automatically (about 1-2 minutes).
2. Open your Vercel URL. Squad loads, add/edit/delete works, fan wall works.

**Screenshot F:** the live Vercel site showing the squad with data loaded.

## STEP 7 - Fill the journal

Paste the 3 links into section G of the journal, and screenshots A-F into the boxes (Figure 1 = B, Figure 2 = A, Figure 3 = C, Figure 4 = D, Figure 5 = E, Figure 6 = F).

---------------------------------------------------------------------

## If your teacher wants the frontend on Render too (instead of Vercel)

Render -> New + -> **Web Service** -> same repo:
- Root Directory `frontend`, Build `npm install && npm run build`, Start `npm start`
- Env var `NEXT_PUBLIC_API_URL` = backend Render URL (add it BEFORE the first deploy)
- Then set `CLIENT_URL` on the backend to this new frontend URL.

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Render log: `MONGODB_URI is not set` | Add the variable in Render -> Environment, save |
| `bad auth` / `authentication failed` | Wrong user/password in the string; recreate the Atlas user with a letters-and-numbers password |
| `ECONNREFUSED` / `Could not connect ... IP` | Atlas -> Network Access must contain `0.0.0.0/0` |
| Site shows "Cannot reach the backend" | Render is waking up; wait 60 s and refresh. Else check `NEXT_PUBLIC_API_URL` has no trailing slash and you redeployed after setting it |
| Browser console: CORS error | `CLIENT_URL` on Render must exactly equal your Vercel URL (https, no trailing slash); wait for Render to finish redeploying |
| Render: `Cannot find module` / no package.json | Root Directory is not `backend` |
| Vercel build fails: no Next.js | Root Directory is not `frontend` |
| Pushed `.env` by mistake | Remove it, add to `.gitignore`, and rotate the Atlas password |
