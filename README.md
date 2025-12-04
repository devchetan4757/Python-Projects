🔎 Phishing URL Analyzer

A standalone Python tool that analyzes URLs for phishing indicators using multiple layers of detection:

✅ URL structure analysis

✅ Network checks (DNS, redirects, HTTP response)

✅ HTML & JavaScript analysis (fake login page detection)

✅ Environment anti–evasion checks (VM/debugger detection)

✅ Weighted scoring system & clear risk verdict

🚀 Usage

1. Install Dependencies

pip install requests beautifulsoup4 lxml tldextract psutil


---

2. Run the Script

python analyzer.py

Replace "analyzer.py" with your script file name.


---

3. Example Usage in Python

from analyzer import run_url_analysis

result = run_url_analysis("https://example.com/login")
print(result)

