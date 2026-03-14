"""
BreachBuddy - Quick API tests
Run with: pytest tests/ -v
"""
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_root():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "BreachBuddy API is running"


@pytest.mark.asyncio
async def test_breach_check_invalid_format():
    """Should return 200 even with a valid email (may be empty breaches without real API key)"""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post("/api/breach/check", json={"email": "test@example.com"})
    # Without real API key this will error at HIBP, but the endpoint exists
    assert response.status_code in (200, 502)


@pytest.mark.asyncio
async def test_link_scan_invalid_url():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post("/api/scan/link", json={"url": "not-a-url"})
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_link_scan_valid_url_structure():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post("/api/scan/link", json={"url": "https://example.com"})
    assert response.status_code in (200, 502)  # 502 without real API keys


@pytest.mark.asyncio
async def test_email_analysis_structure():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post("/api/analyze/email", json={
            "content": "Congratulations! You won $1,000,000. Click here: http://scam.example.com",
            "sender": "winner@totally-real-lottery.com",
            "subject": "You are a winner!!!"
        })
    assert response.status_code in (200, 502)


@pytest.mark.asyncio
async def test_url_extractor():
    from app.utils.url_extractor import extract_urls
    text = "Visit https://google.com or http://evil-site.ru/phish for details"
    urls = extract_urls(text)
    assert "https://google.com" in urls
    assert "http://evil-site.ru/phish" in urls
    assert len(urls) == 2
