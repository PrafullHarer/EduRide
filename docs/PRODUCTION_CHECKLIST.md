# EduRide Production Readiness Checklist

Quick reference for deploying to Vercel with optimal performance.

---

## Environment Variables (Vercel Dashboard)

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | ✅ | MongoDB Atlas connection string (use `mongodb+srv://`) |
| `JWT_SECRET` | ✅ | Strong random secret (min 32 chars, **not** the default!) |
| `FRONTEND_URL` | ✅ | Your Vercel deployment URL (e.g., `https://eduride.vercel.app`) |
| `NODE_ENV` | ✅ | Set to `production` |

---

## MongoDB Atlas Configuration

- [ ] **Region Match**: Cluster region matches Vercel deployment region
  - Vercel default: `iad1` (US East)
  - Check: Atlas → Cluster → Configuration
  - Check: Vercel → Project → Settings → Functions → Region
  
- [ ] **Network Access**: Allow Vercel IPs
  - For serverless: `0.0.0.0/0` (allow all) or configure Vercel's IP ranges
  
- [ ] **Connection String**: Uses `mongodb+srv://` format

- [ ] **Database User**: Has read/write permissions

---

## Warm Start Strategy (Prevent Cold Starts)

Vercel free tier doesn't include cron jobs. Set up external pinging:

### Option 1: cron-job.org (Free)
1. Create account at [cron-job.org](https://cron-job.org)
2. Add new cron job:
   - URL: `https://your-app.vercel.app/api/health`
   - Schedule: Every 5 minutes
   - Method: GET

### Option 2: UptimeRobot (Free)
1. Create account at [uptimerobot.com](https://uptimerobot.com)
2. Add new monitor:
   - Type: HTTP(s)
   - URL: `https://your-app.vercel.app/api/health`
   - Interval: 5 minutes

### Option 3: GitHub Actions
Create `.github/workflows/warmup.yml`:
```yaml
name: Warm Start
on:
  schedule:
    - cron: '*/5 * * * *'
jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - run: curl -s https://your-app.vercel.app/api/health
```

---

## Pre-Deployment Checklist

- [ ] All environment variables configured in Vercel Dashboard
- [ ] MongoDB Atlas cluster is in optimal region
- [ ] Network access configured for Vercel
- [ ] JWT_SECRET is unique and secure (not default)
- [ ] Build passes locally: `npm run build`
- [ ] No TypeScript errors: `npm run lint`

---

## Post-Deployment Verification

1. **Health Check Test**
   ```bash
   curl -w "Time: %{time_total}s\n" https://your-app.vercel.app/api/health
   ```
   - Expected: `{"status":"ok"}` in <1s

2. **Cold Start Test**
   - Wait 30+ minutes
   - Access app
   - Expected: Page loads in <2s

3. **Warm Start Test**
   - Access app immediately after first load
   - Expected: Page loads in <1s

---

## Performance Monitoring

- [ ] Enable Vercel Analytics (Dashboard → Analytics)
- [ ] Set up MongoDB Atlas alerts for slow queries
- [ ] Monitor function invocation times in Vercel logs
