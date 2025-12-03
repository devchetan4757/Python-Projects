from urllib.parse import urlparse
import tldextract
import socket
import ssl
import requests
import platform
import time
import psutil
from bs4 import BeautifulSoup

# -----------------------------
# CONFIG
# -----------------------------
MAX_URL_LENGTH = 70
REQUEST_TIMEOUT = 4


# -----------------------------
# HELPER FUNCTIONS
# -----------------------------
def normalize_chars(s):
    substitutions = {
        "0": "o",
        "1": "l",
        "3": "e",
        "5": "s",
        "7": "t",
        "@": "a",
        "$": "s"
    }
    for key, val in substitutions.items():
        s = s.replace(key, val)
    return s


def flag_error(msg, results, score):
    results.append("ERROR: " + msg)
    score += 2
    return results, score


# -----------------------------
# ENVIRONMENT CHECK
# -----------------------------
def check_env_is_safe():
    warnings = []
    try:
        vm_keywords = ["virtualbox", "vmware", "qemu", "kvm", "hyperv"]
        sys_info = platform.platform().lower()
        if any(k in sys_info for k in vm_keywords):
            warnings.append("Environment appears to be running in a virtual machine.")
    except:
        warnings.append("VM check failed (suspicious).")

    try:
        import sys
        if hasattr(sys, "gettrace") and sys.gettrace():
            warnings.append("Debugger detected.")
    except:
        warnings.append("Debugger detection failed.")

    try:
        uptime = time.time() - psutil.boot_time()
        if uptime < 120:
            warnings.append("System uptime extremely low.")
    except:
        warnings.append("Uptime check failed.")

    return warnings


# -----------------------------
# NETWORK / DOMAIN SAFETY
# -----------------------------
def check_url_safety(url):
    results = []
    score = 0
    parsed = urlparse(url)

    # DNS check
    try:
        socket.gethostbyname(parsed.netloc)
    except:
        results, score = flag_error("DNS resolution failed.", results, score)

    # HTTP request + redirects
    try:
        resp = requests.get(url, timeout=REQUEST_TIMEOUT, allow_redirects=True)
        if len(resp.history) > 2:
            results.append(f"URL redirects {len(resp.history)} times.")
            score += 1
    except:
        results, score = flag_error("HTTP request failed.", results, score)
        return score, results, None

    return score, results, resp


# -----------------------------
# FAKE LOGIN PAGE / PHISH SCAN
# -----------------------------
def detect_phishing_forms(response, url):
    reasons = []
    score = 0

    try:
        soup = BeautifulSoup(response.text, "lxml")
    except:
        return 2, ["HTML parsing failed (suspicious)."]

    parsed_main = urlparse(url)
    main_domain = parsed_main.netloc

    forms = soup.find_all("form")
    if not forms:
        return 0, []  

    for form in forms:
        inputs = form.find_all("input")
        input_types = [i.get("type", "").lower() for i in inputs]
        input_names = [i.get("name", "").lower() for i in inputs]

        sensitive = ["password", "pass", "email", "user", "username", "credential"]

        if any(s in t for t in input_types + input_names):
            score += 2
            reasons.append("Form contains credential fields.")

        action = form.get("action", "")
        if action:
            parsed_action = urlparse(action)
            action_domain = parsed_action.netloc

            if action_domain and action_domain != main_domain:
                score += 3
                reasons.append(
                    f"Form sends data to DIFFERENT DOMAIN: '{action_domain}'."
                )

        hidden_inputs = [i for i in inputs if i.get("type") == "hidden"]
        if len(hidden_inputs) >= 3:
            score += 1
            reasons.append("Multiple hidden fields present.")

    js = response.text.lower()
    suspicious_js_signals = ["fetch(", "xmlhttprequest", "onsubmit", "document.forms[0].submit", "new image().src"]

    if any(sig in js for sig in suspicious_js_signals):
        score += 2
        reasons.append("Suspicious JavaScript behavior detected.")

    return score, reasons


# -----------------------------
# URL HEURISTIC ANALYSIS
# -----------------------------
class URLAnalyzer:
    @staticmethod
    def analyze(url):
        score = 0
        reasons = []

        parsed = urlparse(url)
        ext = tldextract.extract(url)
        domain = ext.domain.lower()

        if parsed.netloc.replace(".", "").isdigit():
            score += 3
            reasons.append("URL uses raw IP (high risk).")

        if domain != normalize_chars(domain):
            score += 1
            reasons.append("Obfuscated characters in domain.")

        if len(url) > MAX_URL_LENGTH:
            score += 2
            reasons.append("URL is excessively long.")

        if '@' in url:
            score += 2
            reasons.append("URL contains '@' (phishing redirection trick).")

        suspicious_words = ["login", "verify", "secure", "account", "auth"]
        path_lower = (parsed.path + parsed.query).lower()
        if any(w in path_lower for w in suspicious_words):
            score += 1
            reasons.append("Suspicious keyword found in URL path.")

        return score, reasons


# -----------------------------
# FINAL VERDICT
# -----------------------------
def verdict(score):
    if score >= 7:
        return "🚨 HIGH RISK — Likely phishing"
    elif score >= 4:
        return "⚠️ Moderate Risk — Suspicious"
    else:
        return "🟢 Low Risk — Likely Safe"


# -----------------------------
# MAIN ANALYSIS FUNCTION
# -----------------------------
def analyze_url(url: str):
    base_score, base_reasons = URLAnalyzer.analyze(url)
    net_score, net_reasons, response = check_url_safety(url)
    env_warnings = check_env_is_safe()

    form_score, form_reasons = (0, [])
    if response is not None:
        form_score, form_reasons = detect_phishing_forms(response, url)

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


# -----------------------------
# OPTIONAL: CLI USAGE
# -----------------------------
if __name__ == "__main__":
    while True:
        u = input("\nEnter a URL to scan (or 'exit'): ").strip()
        if u.lower() == "exit":
            break
        result = analyze_url(u)
        print(result)
