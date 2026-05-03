"""Tests for the Premium and Forgot Password pages (public pages)."""
import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


class TestPremiumPage:
    """Test suite for the Premium subscription page."""

    # TC-14: Verify premium page loads with plans
    def test_premium_page_loads(self, driver, base_url):
        """Verify the Premium page loads and displays pricing information."""
        driver.get(f"{base_url}/premium")
        heading = driver.find_element(By.CSS_SELECTOR, "h1.hero-title")
        assert "Premium" in heading.text or "PKR" in heading.text


class TestForgotPasswordPage:
    """Test suite for the Forgot Password page."""

    # TC-15: Verify forgot password page loads and has email field
    def test_forgot_password_page(self, driver, base_url):
        """Verify the Forgot Password page has a heading, email input, and submit button."""
        driver.get(f"{base_url}/forgot-password")
        heading = driver.find_element(By.TAG_NAME, "h2")
        assert "Forgot" in heading.text or "password" in heading.text.lower()

        email_input = driver.find_element(By.ID, "email")
        assert email_input.is_displayed()

        submit_btn = driver.find_element(By.CSS_SELECTOR, "button.reset-btn")
        assert submit_btn.is_displayed()
