import os
import pytest
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service

BASE_URL = os.environ.get("TEST_BASE_URL", "http://app-ci:8081")


@pytest.fixture(scope="session")
def base_url():
    """Return the base URL for the application under test."""
    return BASE_URL


@pytest.fixture(scope="function")
def driver():
    """Create a headless Chrome WebDriver for each test."""
    chrome_options = Options()
    chrome_options.add_argument("--headless=new")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--window-size=1920,1080")
    chrome_options.add_argument("--remote-allow-origins=*")

    driver = webdriver.Chrome(options=chrome_options)
    driver.implicitly_wait(10)
    yield driver
    driver.quit()
