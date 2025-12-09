from urllib.parse import urlparse
import tldextract
import socket
import requests
import platform
import time
import psutil
from bs4 import BeautifulSoup
import sys, json

MAX_URL_LENGTH = 70
REQUEST_TIMEOUT = 10  # Increased timeout to reduce false failures

def normalize_chars(s):
    subs = {"0": "o", "1": "l", "3": "e", "5": "s", "7": "t", "@": "a", "$": "s"}
    for k, v in subs.items():
        s = s.replace(k, v)
    return s

def flag_error(msg, results, score, add_points=2):
    results.append("ERROR: " + msg)
    return results, score + add_points

def check_env_is_safe():
    warnings = []
    try:
        if any(k in platform.platform().lower() for k in ["virtualbox", "vmware", "qemu", "kvm", "hyperv"]):
            warnings.append("Environment appears virtualized.")
    except:
        warnings.append("VM check failed.")
    try:
        import sys
        if hasattr(sys, "gettrace") and sys.gettrace():
            warnings.append("Debugger detected.")
    except:
        warnings.append("Debugger detection failed.")
    try:
        if time.time() - psutil.boot_time() < 120:
            warnings.append("System uptime extremely low.")
    except:
        warnings.append("Uptime check failed.")
    return warnings

def ensure_scheme(url):
    """Add https:// if the URL has no scheme."""
    if not urlparse(url).scheme:
        return "https://" + url
    return url

def check_url_safety(url):
    results = []
    score = 0
    parsed = urlparse(url)
    resp = None
    try:
        socket.gethostbyname(parsed.netloc)
    except Exception as e:
        results, score = flag_error(f"DNS resolution failed: {e}", results, score)
        return score, results, resp
    try:
        resp = requests.get(url, timeout=REQUEST_TIMEOUT, allow_redirects=True)
        if len(resp.history) > 2:
            results.append(f"URL redirects {len(resp.history)} times.")
            score += 1
    except Exception as e:
        results, score = flag_error(f"HTTP request failed: {e}", results, score)
    return score, results, resp

def detect_phishing_forms(response, url):
    reasons = []
    score = 0
    try:
        soup = BeautifulSoup(response.text, "lxml")
    except Exception as e:
        return 2, [f"HTML parsing failed: {e}"]
    main_domain = urlparse(url).netloc
    forms = soup.find_all("form")
    if not forms:
        return 0, []
    sensitive = ["password", "pass", "email", "user", "username", "credential"]
    for form in forms:
        inputs = form.find_all("input")
        input_types = [i.get("type", "").lower() for i in inputs]
        input_names = [i.get("name", "").lower() for i in inputs]
        if any(s in f for f in (input_types + input_names) for s in sensitive):
            score += 2
            reasons.append("Form contains credential fields.")
        action = form.get("action", "")
        if action:
            act_domain = urlparse(action).netloc
            if act_domain and act_domain != main_domain:
                score += 3
                reasons.append(f"Form submits to different domain: {act_domain}.")
        hidden = [i for i in inputs if i.get("type") == "hidden"]
        if len(hidden) >= 3:
            score += 1
            reasons.append("Multiple hidden fields detected.")
    js = response.text.lower()
    if any(sig in js for sig in ["fetch(", "xmlhttprequest", "onsubmit", "document.forms[0].submit", "new image().src"]):
        score += 2
        reasons.append("Suspicious JavaScript detected.")
    return score, reasons

class URLAnalyzer:
    @staticmethod
    def analyze(url):
        score = 0
        reasons = []
        parsed = urlparse(url)
        domain = tldextract.extract(url).domain.lower()
        if parsed.netloc.replace(".", "").isdigit():
            score += 3
            reasons.append("URL uses raw IP.")
        if domain != normalize_chars(domain):
            score += 1
            reasons.append("Obfuscated characters in domain.")
        if len(url) > MAX_URL_LENGTH:
            score += 2
            reasons.append("URL too long.")
        if "@" in url:
            score += 2
            reasons.append("URL contains '@'.")
        if any(w in (parsed.path + parsed.query).lower() for w in ["login", "verify", "secure", "account", "auth"]):
            score += 1
            reasons.append("Suspicious keyword in URL path.")
        return score, reasons

def verdict(score):
    if score >= 7:
        return "HIGH RISK"
    if score >= 4:
        return "MODERATE RISK"
    return "LOW RISK"

def analyze_url(url):
    url = ensure_scheme(url)  # <-- automatically add https:// if missing
    base_score, base_reasons = URLAnalyzer.analyze(url)
    net_score, net_reasons, resp = check_url_safety(url)
    env_warnings = check_env_is_safe()
    form_score, form_reasons = (0, [])
    if resp is not None:
        form_score, form_reasons = detect_phishing_forms(resp, url)
    total = base_score + net_score + form_score
    return {
        "url": url,
        "score": total,
        "verdict": verdict(total),
        "url_reasons": base_reasons,
        "network_reasons": net_reasons,
        "fake_login_reasons": form_reasons,
        "environment_warnings": env_warnings
    }

if __name__ == "__main__":
    try:
        raw = sys.stdin.read().strip()
        data = json.loads(raw)
        result = analyze_url(data["url"])
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({
            "url": None,
            "score": 0,
            "verdict": "ERROR",
            "error": str(e)
        }))
