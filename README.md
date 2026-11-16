# CampusMate Demo

A responsive, interactive prototype for a campus errands marketplace, built with React + Vite + TypeScript.

## What's included

- Discover and search open campus tasks
- Filter by task category
- Switch between tasker and requester views
- Post a new task
- Express interest in a task
- Sample requester workflow and simulated checkout
- Simulate successful, failed, or cancelled payment
- Task activity and completion state
- In-app demo chat
- Browser localStorage persistence
- Responsive desktop and mobile layouts

## Important demo limitations

This is a front-end prototype. It does **not** include real accounts, a backend database, institutional verification, real-time multi-user chat, Paystack, bank transfers, escrow, refunds, or dispute resolution. Data is stored only in the current browser. The checkout is explicitly simulated and moves no money.

## Run locally

1. Install Node.js (LTS).
2. Extract this folder and open it in VS Code.
3. Open the VS Code terminal in this folder.
4. Run:

   ```bash
   npm install
   npm run dev
   ```

5. Open the local URL printed in the terminal (usually http://localhost:5173).

## Build

```bash
npm run build
npm run preview
```

## Deploy to Vercel

1. Create a GitHub repository and push this project.
2. In Vercel, choose **Add New → Project** and import the repository.
3. Framework preset: **Vite** (Vercel should detect this automatically).
4. Build command: `npm run build`
5. Output directory: `dist`
6. Deploy.

No environment variables are required for this demo.

## Suggested demo walkthrough

1. Browse and filter tasks.
2. Switch to **I need help** and post a new task.
3. Switch back to **I want to earn** and express interest in a task.
4. Open **My activity** to see your activity.
5. Open **Messages** and send a message.
6. Use the requester workflow on a task to open the simulated checkout.
7. Try successful, failed, and cancelled payment outcomes.

## Reset demo data

Open browser DevTools → Application/Storage → Local Storage and delete:
- `cm_tasks_v1`
- `cm_messages_v1`

Refresh the page to restore the sample data.
