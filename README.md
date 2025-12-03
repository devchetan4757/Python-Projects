# 🔍 Advanced Phishing URL Analyzer  
A powerful Python-based phishing detection tool that analyzes URLs using multiple layers of security checks such as heuristics, DNS validation, redirect scanning, HTML inspection, and fake login page detection.

---

## 🚀 Features

### ✅ **1. URL Heuristic Analysis**
- Detects misleading or obfuscated characters  
- Flags suspicious keywords (`login`, `verify`, `secure`)  
- Detects @ redirect tricks  
- Flags excessively long URLs  
- Warns if the URL is an IP address  

---

### 🔐 **2. Network & Domain Safety Checks**
- DNS resolution validation  
- HTTP request + redirection depth analysis  
- Auto-identifies unstable or unreachable domains  

---

### 🧪 **3. Fake Login Page / Form Detection**
- Extracts and analyzes HTML forms  
- Flags credential fields (`
