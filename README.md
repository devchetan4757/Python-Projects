 🛡️  URL Security Scanner  🛡️

   
  Intelligent URL Reputation, Phishing.  
  Detection & Risk Scoring Engine  

 
    A professional-grade **URL threat analysis    
    tool** built using Python.  

    This project performs **multi-layered       
  security checks**, detects suspicious    
  patterns, identifies phishing attempts, and    
  assigns a **risk score (0–5)** to indicate  
  the safety level of any URL.



   This tool is designed with cybersecurity.      
  principles inspired by OWASP, Google   
  Safe Browsing, and VirusTotal-style
  heuristics — but built fully in (pure 
  Python)




🚀 Key Highlight 

#⭐ 0–5 Risk Score System
The scanner assigns a clean and easy-to-understand rating:

 Score = 0                         |
 Meaning = Safe 🟢
 Description = Legit, clean, no red flags 
 
 Score = 1-2
 Meaning = LOW RISK  🟡
 Description  = Minor irregularities, caution advised 
 


 score = 3
 meaning  = Suspicious 🟠
 description = Multiple indicators of phishing/malware 



 score = 4-5 
 meaning = Dangerous 🔴
 description = Strong phishing or malware signs   
 detected 



   *  🔍 What the Scanner Actually Check *

  The URL is measured against real threat   
  indicators. used in cybersecurity:



 ✔ 1. URL Structure Heuristics
- Unusually long URL  
- Double slashes (`//`) abuse  
- Encoded characters (`%20`, `%3D`, `%00`)  
- Use of  @ ,  ?  , =,  &  in abnormal patterns  
- Excessive subdomains (example: login.verify.payment.secure.paypal.com.fake.co)




 ✔ **2. Domain Legitimacy Analysis**
- Detects look-alike domains (Typosquatting)  
  Example:  
  - go0gle.com  
  - instagrarn.com  
  - paypai-security.net  
- Flags non-standard TLDs often used in scams:
  `.xyz`, `.top`, `.click`, `.loan`, `.cyou`, `.cfd`, etc.

---

 ✔ **3. SSL / HTTPS Verification**
- Warns if URL does not use HTTPS  
- Detects mixed content  
- Basic certificate pattern checks

---

 ✔ **4. Phishing Keyword Detection**
The scanner checks for high-risk words commonly used in phishing:

`login`, `verify`, `reset`, `secure-update`, `banking`, `account`, `reward`,  
`bonus`, `payment`, `claim-now`, `offer`, `activation`, etc.

---

 ✔ **5. Reputation Logic (Heuristic)**
Uses internal threat rules to detect:
- Shortened URLs (bit.ly, tinyurl, etc.)  
- Redirect chains  
- IP-based URLs (e.g., `http://192.168.1.1/login`)  
- Suspicious combinations of keywords + patterns  
- Fake login pages

---

🧠 How the Scoring Engine Works

Each suspicious flag contributes **+1 point**.  
Maximum score = **5**.  

Example breakdown:

|Indicator.             Score Impact 

 Missing HTTPS              +1 
 Suspicious Keywords.       +1 
 Look-alike domain          +1 
 URL too long               +1 
 Suspicious TLD             +1 

   Final score = sum of all triggered 
   indicators  
 

  → Categorized into Safe / Suspicious / 
    Dangerous

