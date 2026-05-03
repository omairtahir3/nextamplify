"""Tests for navigation and page routing."""
import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


class TestNavigation:
    """Test suite for navigation between pages."""

    # TC-11: Clicking "Sign In" button navigates to /signin
    def test_navigate_to_signin(self, driver, base_url):
        """Verify clicking 'Sign In' from homepage navigates to /signin."""
        driver.get(base_url)
        sign_in_link = driver.find_element(By.CSS_SELECTOR, "a.sign-in")
        sign_in_link.click()
        WebDriverWait(driver, 10).until(EC.url_contains("/signin"))
        assert "/signin" in driver.current_url

    # TC-12: Clicking "Sign Up" button navigates to /signup
    def test_navigate_to_signup(self, driver, base_url):
        """Verify clicking 'Sign Up' from homepage navigates to /signup."""
        driver.get(base_url)
        sign_up_link = driver.find_element(By.CSS_SELECTOR, "a.sign-up")
        sign_up_link.click()
        WebDriverWait(driver, 10).until(EC.url_contains("/signup"))
        assert "/signup" in driver.current_url

    # TC-13: Verify unauthenticated access to /dashboard redirects to /signin
    def test_dashboard_redirect_unauthenticated(self, driver, base_url):
        """Verify accessing /dashboard without login redirects to /signin."""
        driver.get(f"{base_url}/dashboard")
        WebDriverWait(driver, 10).until(EC.url_contains("/signin"))
        assert "/signin" in driver.current_url
