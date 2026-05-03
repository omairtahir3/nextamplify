"""Tests for API endpoints using requests library."""
import pytest
import requests
import os

BASE_URL = os.environ.get("TEST_BASE_URL", "http://app-ci:8081")


class TestAPIEndpoints:
    """Test suite for backend API endpoints."""

    # TC-16: Verify /api/artists returns 200 with JSON array
    def test_artists_api(self):
        """Verify the artists API returns a 200 status code with a JSON list."""
        resp = requests.get(f"{BASE_URL}/api/artists", timeout=10)
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)

    # TC-17: Verify /api/albums returns 200 with JSON array
    def test_albums_api(self):
        """Verify the albums API returns a 200 status code with a JSON list."""
        resp = requests.get(f"{BASE_URL}/api/albums", timeout=10)
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)

    # TC-18: Verify /api/signin rejects GET method
    def test_signin_api_rejects_get(self):
        """Verify the signin API rejects GET requests (only POST allowed)."""
        resp = requests.get(f"{BASE_URL}/api/signin", timeout=10)
        # Next.js API routes return 405 for unsupported methods
        assert resp.status_code == 405 or resp.status_code == 404
