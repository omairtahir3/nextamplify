"""Tests for the NextAmplify public homepage."""
import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


class TestHomePage:
    """Test suite for the public landing page."""

    # TC-01: Verify homepage loads successfully
    def test_homepage_loads(self, driver, base_url):
        """Verify that the homepage loads and contains 'Amplify' in the page."""
        driver.get(base_url)
        assert "Amplify" in driver.title or "Amplify" in driver.page_source

    # TC-02: Verify navbar contains the brand name
    def test_navbar_brand(self, driver, base_url):
        """Verify the navbar displays the 'Amplify' brand name."""
        driver.get(base_url)
        navbar = driver.find_element(By.CSS_SELECTOR, "nav.navbar")
        assert navbar is not None
        h1 = navbar.find_element(By.TAG_NAME, "h1")
        assert "Amplify" in h1.text

    # TC-03: Verify Sign In and Sign Up buttons exist
    def test_auth_buttons_present(self, driver, base_url):
        """Verify that 'Sign In' and 'Sign Up' buttons are visible on the homepage."""
        driver.get(base_url)
        sign_in = driver.find_element(By.CSS_SELECTOR, "a.sign-in")
        sign_up = driver.find_element(By.CSS_SELECTOR, "a.sign-up")
        assert sign_in.is_displayed()
        assert sign_up.is_displayed()

    # TC-04: Verify hero section content
    def test_hero_section(self, driver, base_url):
        """Verify the hero section contains the 'Discover' heading."""
        driver.get(base_url)
        hero = driver.find_element(By.CSS_SELECTOR, "section.hero")
        h2 = hero.find_element(By.TAG_NAME, "h2")
        assert "Discover" in h2.text or "Favorite" in h2.text

    # TC-05: Verify trending songs section exists with cards
    def test_trending_songs_section(self, driver, base_url):
        """Verify that the homepage has content sections with at least 5 cards."""
        driver.get(base_url)
        sections = driver.find_elements(By.CSS_SELECTOR, "section.section")
        assert len(sections) >= 1, "Expected at least one content section"
        cards = driver.find_elements(By.CSS_SELECTOR, ".card")
        assert len(cards) >= 5, f"Expected at least 5 cards, found {len(cards)}"
