import re
from typing import List


URL_REGEX = re.compile(
    r"https?://"             # http:// or https://
    r"(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)"  # domain labels
    r"+[A-Z]{2,6}"           # TLD
    r"(?::\d+)?"             # optional port
    r"(?:/[^\s]*)?",         # optional path
    re.IGNORECASE
)


def extract_urls(text: str) -> List[str]:
    """Extract all URLs from a block of text (email body, message, etc.)."""
    return list(set(URL_REGEX.findall(text)))


def is_valid_url(url: str) -> bool:
    """Basic sanity check on a URL before sending to scan APIs."""
    return url.startswith(("http://", "https://")) and "." in url
