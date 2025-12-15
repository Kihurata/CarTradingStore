import os
import pytest
from dotenv import load_dotenv
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager

load_dotenv()

@pytest.fixture(scope="session")
def base_url():
    return os.getenv("BASE_URL", "http://localhost:3000")

@pytest.fixture(scope="session")
def creds():
    return {
        "email": os.getenv("TEST_EMAIL", ""),
        "password": os.getenv("TEST_PASSWORD", "")
    }

@pytest.fixture
def driver():
    opts = Options()
    # local muốn nhìn UI thì comment dòng headless
    # opts.add_argument("--headless=new")
    opts.add_argument("--window-size=1440,900")
    opts.add_argument("--no-sandbox")
    opts.add_argument("--disable-dev-shm-usage")

    d = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=opts)
    d.implicitly_wait(2)
    yield d
    d.quit()
