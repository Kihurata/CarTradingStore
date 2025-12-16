import os
import pytest
from dotenv import load_dotenv
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service

load_dotenv()


@pytest.fixture(scope="session")
def base_url():
    # Trong CI: thường set BASE_URL=http://localhost:3000
    return os.getenv("BASE_URL", "http://localhost:3000")


@pytest.fixture(scope="session")
def creds():
    return {
        "email": os.getenv("TEST_EMAIL", ""),
        "password": os.getenv("TEST_PASSWORD", "")
    }


@pytest.fixture(scope="session")
def artifacts_dir():
    d = os.getenv("ARTIFACTS_DIR", "artifacts")
    os.makedirs(d, exist_ok=True)
    return d


@pytest.fixture
def driver(request, artifacts_dir):
    opts = Options()

    # Mặc định headless cho CI
    headless = os.getenv("HEADLESS", "1") == "1"
    if headless:
        opts.add_argument("--headless=new")

    opts.add_argument("--window-size=1440,900")
    opts.add_argument("--no-sandbox")
    opts.add_argument("--disable-dev-shm-usage")
    opts.add_argument("--disable-gpu")
    opts.add_argument("--remote-allow-origins=*")


    # Chromedriver path (CI runner có sẵn)
    chromedriver_path = os.getenv("CHROMEDRIVER_PATH", "")
    service = Service(executable_path=chromedriver_path) if chromedriver_path else Service()

    d = webdriver.Chrome(service=service, options=opts)
    d.implicitly_wait(2)

    yield d

    # Nếu fail thì dump screenshot + html để debug trên Actions
    if request.node.rep_call.failed:
        name = request.node.name.replace("/", "_").replace(" ", "_")
        png = os.path.join(artifacts_dir, f"{name}.png")
        html = os.path.join(artifacts_dir, f"{name}.html")
        try:
            d.save_screenshot(png)
        except Exception:
            pass
        try:
            with open(html, "w", encoding="utf-8") as f:
                f.write(d.page_source)
        except Exception:
            pass

    d.quit()


# Hook để biết test pass/fail trong fixture driver()
@pytest.hookimpl(tryfirst=True, hookwrapper=True)
def pytest_runtest_makereport(item, call):
    outcome = yield
    rep = outcome.get_result()
    setattr(item, "rep_" + rep.when, rep)
