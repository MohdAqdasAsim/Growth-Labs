# Backend Test Suite

Comprehensive pytest test suite for the backend API covering all endpoints and workflows.

## Test Structure

```
tests/
├── __init__.py
├── conftest.py                      # Fixtures and test configuration
├── test_01_auth.py                  # Authentication (register, login, JWT)
├── test_02_onboarding.py            # Phase 1 onboarding (5 fields)
├── test_03_profile.py               # Phase 2 profile management (11 fields)
├── test_04_campaigns_create.py      # Campaign creation & onboarding wizard
├── test_05_campaigns_retrieve.py    # Campaign GET endpoints (fixed model mismatch)
├── test_06_campaigns_execute.py     # Campaign execution & tracking
├── test_07_agent_toggles.py         # Agent configuration toggles
├── test_08_campaign_insights.py     # Learning from previous campaigns
├── test_09_campaign_completion.py   # Campaign completion & outcome
├── test_10_workflow_e2e.py          # End-to-end complete workflows
└── README.md                        # This file
```

## Quick Start

### Install Dependencies

```bash
cd "/home/umar/Super Engine Lab"
pip install pytest pytest-cov httpx
```

### Run All Tests (Fast - Skip Slow Tests)

```bash
pytest backend/tests/ -m "not slow" -v
```

### Run All Tests (Including Slow Tests with API Calls)

```bash
pytest backend/tests/ -v
```

## Test Commands

### Run Specific Test Files

```bash
# Authentication tests only
pytest backend/tests/test_01_auth.py -v

# Onboarding tests only
pytest backend/tests/test_02_onboarding.py -v

# Campaign creation tests only
pytest backend/tests/test_04_campaigns_create.py -v

# End-to-end workflow tests only
pytest backend/tests/test_10_workflow_e2e.py -v
```

### Run by Test Markers

```bash
# Run only unit tests (fast)
pytest backend/tests/ -m unit -v

# Run only integration tests
pytest backend/tests/ -m integration -v

# Run only e2e tests
pytest backend/tests/ -m e2e -v

# Run smoke tests (critical paths)
pytest backend/tests/ -m smoke -v

# Skip slow tests (recommended for development)
pytest backend/tests/ -m "not slow" -v
```

### Run Specific Test Class

```bash
pytest backend/tests/test_01_auth.py::TestAuth -v
pytest backend/tests/test_04_campaigns_create.py::TestCampaignCreation -v
```

### Run Specific Test Function

```bash
pytest backend/tests/test_01_auth.py::TestAuth::test_register_success -v
pytest backend/tests/test_10_workflow_e2e.py::TestCompleteUserJourney::test_complete_user_journey_fast -v
```

### Run with Coverage Report

```bash
# Terminal report
pytest backend/tests/ --cov=backend --cov-report=term-missing -v

# HTML report (opens in browser)
pytest backend/tests/ --cov=backend --cov-report=html
open htmlcov/index.html  # macOS
xdg-open htmlcov/index.html  # Linux
```

### Run with Output (see print statements)

```bash
pytest backend/tests/ -s -v
```

### Stop on First Failure

```bash
pytest backend/tests/ -x -v
```

### Run Failed Tests from Last Run

```bash
pytest backend/tests/ --lf -v
```

## Test Coverage

### ✅ Authentication (test_01_auth.py)
- User registration
- Duplicate email handling
- Login with valid/invalid credentials
- JWT token generation
- Protected endpoints with/without auth

### ✅ Phase 1 Onboarding (test_02_onboarding.py)
- Submit 5-field onboarding
- Context Analyzer execution
- Profile retrieval
- Completion status tracking

### ✅ Phase 2 Profile (test_03_profile.py)
- Update 11 profile fields
- Partial updates
- Completion percentage calculation
- Phase 1 → Phase 2 flow

### ✅ Campaign Creation (test_04_campaigns_create.py)
- Create campaign (requires Phase 1)
- 4-step onboarding wizard
- Update campaign onboarding
- Complete onboarding (ready → start)
- Multiple campaigns per user

### ✅ Campaign Retrieval (test_05_campaigns_retrieve.py)
- GET single campaign (fixed model mismatch bug)
- GET campaign list
- GET campaign schedule
- Authorization checks
- Empty states

### ✅ Campaign Execution (test_06_campaigns_execute.py)
- Start campaign (agent execution)
- Execution status validation
- Daily content confirmation
- Cannot start twice
- Tracking execution progress

### ✅ Agent Toggles (test_07_agent_toggles.py)
- Enable/disable individual agents
- Image generation toggle
- SEO optimization toggle
- Minimal agent configurations
- Required agents validation

### ✅ Campaign Insights (test_08_campaign_insights.py)
- Learning from previous campaigns
- Lessons learned retrieval
- Approve/modify lessons
- Campaign history tracking

### ✅ Campaign Completion (test_09_campaign_completion.py)
- Complete campaign with metrics
- Outcome Agent execution
- Campaign report generation
- Edit before start
- Delete before start
- Cannot edit/delete after start

### ✅ End-to-End Workflows (test_10_workflow_e2e.py)
- Complete user journey (register → campaign execution)
- Multiple campaigns workflow
- Fast version (no API calls)
- Slow version (with API calls)

## Test Markers

Tests are organized with pytest markers:

- **`@pytest.mark.unit`** - Fast, isolated unit tests
- **`@pytest.mark.integration`** - Tests requiring multiple components
- **`@pytest.mark.e2e`** - Complete end-to-end workflows
- **`@pytest.mark.slow`** - Tests making real API calls (Gemini, YouTube, etc.)
- **`@pytest.mark.smoke`** - Critical path smoke tests

## Slow Tests Warning

Tests marked with `@pytest.mark.slow` make real API calls to:
- **Gemini API** (for agent execution)
- **YouTube Data API** (for forensics)
- **Imagen API** (for image generation)

These tests:
- Take longer to run (30s - 2min each)
- Consume API quota
- May incur costs
- Require valid API keys in `.env`

**Skip slow tests during development:**
```bash
pytest backend/tests/ -m "not slow" -v
```

## Environment Setup

### Required for All Tests
- Python 3.10+
- FastAPI dependencies
- Valid JWT_SECRET_KEY in `.env`

### Required for Slow Tests Only
- `GEMINI_API_KEY` in `.env`
- `YOUTUBE_API_KEY` in `.env`
- `NANO_BANANA_API_KEY` in `.env` (for image generation)

### Example `.env`
```bash
GEMINI_API_KEY=your_gemini_key
YOUTUBE_API_KEY=your_youtube_key
NANO_BANANA_API_KEY=your_imagen_key
JWT_SECRET_KEY=your_secret_key
```

## Expected Output

### Successful Run (Fast Tests Only)

```bash
$ pytest backend/tests/ -m "not slow" -v

============================= test session starts ==============================
collected 75 items / 10 deselected / 65 selected

tests/test_01_auth.py::TestAuth::test_register_success PASSED           [  1%]
tests/test_01_auth.py::TestAuth::test_register_duplicate_email PASSED   [  3%]
tests/test_01_auth.py::TestAuth::test_login_success PASSED              [  4%]
...
tests/test_10_workflow_e2e.py::TestCompleteUserJourney::test_complete_user_journey_fast PASSED [100%]

======================== 65 passed, 10 deselected in 5.23s =====================
```

### With Coverage

```bash
$ pytest backend/tests/ -m "not slow" --cov=backend --cov-report=term-missing

----------- coverage: platform linux, python 3.10.12 -----------
Name                                  Stmts   Miss  Cover   Missing
-------------------------------------------------------------------
backend/__init__.py                       0      0   100%
backend/api/auth.py                      45      2    96%   78-79
backend/api/campaigns.py                220     15    93%   ...
backend/api/onboarding.py                67      3    96%   ...
backend/api/profile.py                   52      4    92%   ...
backend/models/campaign.py              156      0   100%
backend/models/user.py                   89      0   100%
backend/services/agent_orchestrator.py  185     25    86%   ...
-------------------------------------------------------------------
TOTAL                                  1842    127    93%

======================== 65 passed in 5.45s ================================
```

## Troubleshooting

### Import Errors

Make sure to run pytest from the workspace root:

```bash
cd "/home/umar/Super Engine Lab"
pytest backend/tests/ -v
```

### Module Not Found

Install test dependencies:

```bash
pip install pytest pytest-cov httpx
```

### API Key Errors (Slow Tests)

Set API keys in `.env` file:

```bash
cd backend
echo "GEMINI_API_KEY=your_key" >> .env
```

### Memory Store State Issues

Tests automatically reset MemoryStore between runs via the `client` fixture in `conftest.py`.

### Test Failures

Run with verbose output to see details:

```bash
pytest backend/tests/ -vv --tb=long
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Backend Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.10'
      
      - name: Install dependencies
        run: |
          pip install -r backend/requirements.txt
          pip install pytest pytest-cov httpx
      
      - name: Run fast tests
        run: pytest backend/tests/ -m "not slow" --cov=backend
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

## Best Practices

1. **Run fast tests frequently** during development
2. **Run slow tests** before committing/merging
3. **Check coverage** to ensure new features are tested
4. **Use markers** to organize test runs
5. **Keep tests isolated** - each test should be independent
6. **Use fixtures** to reduce code duplication
7. **Test edge cases** - not just happy paths

## Contributing

When adding new features:

1. Add corresponding test file(s)
2. Use appropriate markers (`@pytest.mark.unit`, etc.)
3. Update this README if adding new test categories
4. Ensure tests pass before committing
5. Aim for >90% coverage

## Support

For issues or questions about tests:
- Check test output with `-vv --tb=long`
- Review fixture setup in `conftest.py`
- Verify API keys for slow tests
- Ensure FastAPI server dependencies are installed
