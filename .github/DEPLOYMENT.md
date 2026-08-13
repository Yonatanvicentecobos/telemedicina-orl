# Deployment Guide

## GitHub Actions Setup

This project includes automated CI/CD workflows using GitHub Actions.

### Workflows Included

1. **test.yml** — Run tests and build on every push
   - Runs on Node.js 18.x and 20.x
   - Executes linting, tests, and build
   - Uploads coverage to Codecov
   - Triggered on: push to main/develop, pull requests

2. **deploy.yml** — Deploy to Vercel (optional)
   - Deploys production build to Vercel
   - Adds preview comments to pull requests
   - Triggered on: successful test workflow on main

3. **codeql.yml** — Security analysis
   - Scans code for vulnerabilities
   - Runs weekly and on every push
   - Creates security alerts in GitHub

### Required Secrets

To enable deployment workflows, add these secrets to your GitHub repository:

**For Vercel Deployment (optional):**
1. `VERCEL_TOKEN` — Personal access token from Vercel
2. `VERCEL_ORG_ID` — Your Vercel organization ID
3. `VERCEL_PROJECT_ID` — Your Vercel project ID

**To add secrets:**
1. Go to: Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add each secret with its value

### Setup Instructions

#### 1. First Time Setup

```bash
# Verify workflows are detected
git status

# Push to trigger workflows
git push origin main
```

#### 2. View Workflow Status

- Go to: https://github.com/Yonatanvicentecobos/telemedicina-orl/actions
- See real-time status of all workflows
- View logs for any failed steps

#### 3. Setup Vercel Deployment (Optional)

```bash
# 1. Create Vercel account at vercel.com
# 2. Create project for this repository
# 3. Get tokens:
#    - VERCEL_TOKEN: https://vercel.com/account/tokens
#    - VERCEL_ORG_ID & VERCEL_PROJECT_ID: Project settings

# 4. Add to GitHub secrets
# 5. Workflows will deploy automatically on main branch push
```

### Workflow Status Badge

Add this to your README.md to show workflow status:

```markdown
[![Tests & Build](https://github.com/Yonatanvicentecobos/telemedicina-orl/actions/workflows/test.yml/badge.svg)](https://github.com/Yonatanvicentecobos/telemedicina-orl/actions)
```

### Local Testing Before Push

Test locally before pushing:

```bash
# Run all tests
npm test

# Generate coverage report
npm run test:coverage

# Run linter
npm run lint

# Build production
npm run build

# Start production server
npm start
```

### Troubleshooting Workflows

**Tests failing in GitHub Actions?**
- Check logs: Actions → Workflow run → Step details
- Compare local test results: `npm test`
- Verify Node.js version matches matrix

**Deploy failing?**
- Verify Vercel secrets are set correctly
- Check Vercel project is linked to repository
- Review deploy.yml workflow file

**Coverage not uploading?**
- Verify codecov.io token (if needed)
- Check coverage directory is generated
- Ensure coverage files exist

### Deployment Flow

```
Developer Push
    ↓
GitHub Actions Triggers
    ├─ Install dependencies
    ├─ Run linting
    ├─ Run tests (47 tests)
    ├─ Generate coverage
    └─ Build application
    ↓
Build Successful?
    ├─ YES → Deploy to Vercel (main branch)
    └─ NO → Notify developer with error details
    ↓
Production Live
    ↓
Monitor & Update
```

### Environment Variables

Production environment variables should be set in:

1. **Vercel Dashboard:**
   - Project Settings → Environment Variables
   - Add: `DATABASE_URL`, `NEXT_PUBLIC_DAILY_API_KEY`, etc.

2. **Or in GitHub Actions:**
   - Settings → Environments → Production
   - Add secrets specific to environment

### Performance Monitoring

After deployment:

1. **Vercel Analytics:** https://vercel.com/dashboard
2. **GitHub Actions:** Actions tab shows execution times
3. **Codecov:** Coverage trends at codecov.io
4. **CodeQL:** Security analysis at Security tab

### Rollback

If deployment fails:

```bash
# Revert last commit
git revert HEAD

# Push to trigger new workflow
git push origin main
```

Or manually rollback in Vercel dashboard.

### Next Steps

1. ✅ GitHub Actions configured
2. ⏳ Add Vercel deployment (optional)
3. ⏳ Setup monitoring/alerts
4. ⏳ Add status badges to README
5. ⏳ Configure branch protection rules

---

**More Info:**
- [GitHub Actions Docs](https://docs.github.com/actions)
- [Vercel Deployment](https://vercel.com/docs)
- [CodeQL Documentation](https://codeql.github.com/docs/)
