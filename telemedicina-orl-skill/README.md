# telemedicina-orl Skill

Claude Code skill for the Telemedicina ORL project - a production-ready medical consultation platform.

## What This Skill Covers

This skill provides comprehensive reference material for:
- 📋 **Project Setup** — Installation and development environment
- 🧪 **Testing Infrastructure** — 47 tests, Jest configuration, mocking strategies
- 🏗️ **Architecture** — Database schema, API routes, component structure
- ✅ **Validation** — Pydantic schemas, email/date validation
- 🚀 **Deployment** — GitHub Actions, Vercel, Docker
- 📚 **Documentation** — Development workflows, troubleshooting, best practices

## Usage in Claude Code

### Search the Skill
```
/telemedicina-orl [query]
```

### Example Queries
- `/telemedicina-orl testing setup`
- `/telemedicina-orl api routes`
- `/telemedicina-orl deployment workflow`
- `/telemedicina-orl booking flow`
- `/telemedicina-orl troubleshooting`

## Key Sections

1. **Overview** — Quick start, stack, and status
2. **Architecture** — Database, validation, testing layers
3. **Features** — Booking system, components, API routes
4. **Testing** — Test structure, mocks, coverage metrics
5. **CI/CD** — GitHub Actions workflows
6. **Development** — Feature workflow, troubleshooting
7. **Deployment** — Vercel, Docker, manual options

## Quick Reference

**Setup:**
```bash
npm install
npm run prisma:migrate
npm run dev
```

**Test:**
```bash
npm test              # Run all 47 tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

**Deploy:**
```bash
npm run build     # Production build
npm start         # Start server
```

## Project Stats

- **Tests:** 47 test cases (74% coverage)
- **Technology:** Next.js 14, TypeScript, SQLite, Prisma
- **Status:** Production ready ✅
- **Commits:** 4 (with CI/CD configured)
- **GitHub:** https://github.com/Yonatanvicentecobos/telemedicina-orl

## Related Skills

This skill complements:
- `book-to-skill` — Converting documentation to skills
- `claude-code` — Building projects with Claude
- `github-actions` — CI/CD workflows

## Questions?

Reference the full documentation:
- **SKILL.md** — Complete skill content
- **GitHub Repo** — https://github.com/Yonatanvicentecobos/telemedicina-orl
- **TESTING_PLAN.md** — Testing strategy
- **PROGRESS.md** — Milestone summary

---

**Version:** 0.1.0 | **License:** MIT | **Author:** Yonatán Vicente Cobos
