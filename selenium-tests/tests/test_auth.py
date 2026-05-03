"""Tests for authentication pages (Sign In / Sign Up)."""
import pytest
import time
import uuid
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


class TestSignInPage:
    """Test suite for the Sign In page."""

    # TC-06: Verify sign-in page loads
    def test_signin_page_loads(self, driver, base_url):
        """Verify the Sign In page loads with 'Log in' heading."""
        driver.get(f"{base_url}/signin")
        heading = driver.find_element(By.TAG_NAME, "h2")
        assert "Log in" in heading.text or "Sign In" in heading.text

    # TC-07: Verify sign-in form has email and password fields
    def test_signin_form_fields(self, driver, base_url):
        """Verify the sign-in form contains email and password input fields."""
        driver.get(f"{base_url}/signin")
        email_input = driver.find_element(By.ID, "email")
        password_input = driver.find_element(By.ID, "password")
        assert email_input.is_displayed()
        assert password_input.is_displayed()

    # TC-08: Verify login with invalid credentials shows error
    def test_signin_invalid_credentials(self, driver, base_url):
        """Verify that submitting invalid credentials displays an error message."""
        driver.get(f"{base_url}/signin")
        email_input = driver.find_element(By.ID, "email")
        password_input = driver.find_element(By.ID, "password")
        submit_btn = driver.find_element(By.CSS_SELECTOR, "button.signin-btn")

        email_input.send_keys("fake@nonexistent.com")
        password_input.send_keys("wrongpassword123")
        submit_btn.click()

        # Wait for error to appear
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, ".alert-error"))
        )
        error = driver.find_element(By.CSS_SELECTOR, ".alert-error")
        assert error.is_displayed()

    # TC-09: Verify "Forgot your password?" link exists
    def test_forgot_password_link(self, driver, base_url):
        """Verify the 'Forgot your password?' link is present and points to /forgot-password."""
        driver.get(f"{base_url}/signin")
        link = driver.find_element(By.LINK_TEXT, "Forgot your password?")
        assert link.get_attribute("href").endswith("/forgot-password")


class TestSignUpPage:
    """Test suite for the Sign Up page."""

    # TC-10: Verify sign-up page loads with all form fields
    def test_signup_page_loads(self, driver, base_url):
        """Verify the Sign Up page has email, username, password, and confirm password fields."""
        driver.get(f"{base_url}/signup")
        heading = driver.find_element(By.TAG_NAME, "h2")
        assert "Sign Up" in heading.text

        email = driver.find_element(By.ID, "email")
        username = driver.find_element(By.ID, "username")
        password = driver.find_element(By.ID, "password")
        confirm = driver.find_element(By.ID, "confirmPassword")

        assert email.is_displayed()
        assert username.is_displayed()
        assert password.is_displayed()
        assert confirm.is_displayed()
