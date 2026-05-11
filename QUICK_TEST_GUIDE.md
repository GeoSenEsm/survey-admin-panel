# Quick Test Commands

## Run All Tests (Interactive - Watch Mode)
```bash
npm test
```
or
```bash
ng test
```

## Run Tests Once (No Watch)
```bash
npm test -- --watch=false
```

## Run Tests in Headless Chrome (No Browser Window)
```bash
ng test --watch=false --browsers=ChromeHeadless
```

## Run Tests with Code Coverage
```bash
ng test --code-coverage
```

## View Coverage Report
After running with coverage, open:
```
coverage/index.html
```

---

## What Tests Are Available?

Your project has 8 unit test suites:

### ✅ Utility Tests
- `guid.spec.ts` - GUID generation tests
- `coords.spec.ts` - Coordinate utilities
- `parsers.spec.ts` - Data parsing functions
- `time-functions.spec.ts` - Time manipulation utilities
- `asjust-date-range.spec.ts` - Date range adjustments

### ✅ Service Tests
- `token-handler.spec.ts` - JWT token handling

### ✅ Mapper Tests
- `survey-details-mapper.spec.ts` - Survey data transformation (largest test suite)

### ✅ Model Tests
- `respondent-info.spec.ts` - Data model tests

---

## Test Output Example

```
✔ Browser application bundle generation complete.
15 01 2026 10:23:45.678:INFO [karma-server]: Karma v6.4.0 server started
15 01 2026 10:23:45.679:INFO [launcher]: Launching browsers ChromeHeadless
15 01 2026 10:23:48.123:INFO [Chrome Headless]: Connected

Chrome Headless 120.0.0.0 (Windows 10): Executed 15 of 15 SUCCESS (0.234 secs / 0.189 secs)
TOTAL: 15 SUCCESS
```

---

## Troubleshooting

### Chrome Not Found?
Install Chrome or use headless mode:
```bash
ng test --browsers=ChromeHeadless
```

### Port Already in Use?
Stop other Karma instances or specify a different port:
```bash
ng test --port 9877
```

### Tests Running in Watch Mode?
Press `Ctrl + C` to stop, or use:
```bash
ng test --watch=false
```

---

**Quick Start:** Just run `npm test` and tests will start automatically! 🚀
