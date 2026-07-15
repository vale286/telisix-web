from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import phonenumbers
from phonenumbers import geocoder, carrier
from urllib.parse import urlparse

app = FastAPI(
    title="TELISIX CTI & OSINT Platform API",
    description="Lightweight REST API for Cyber Threat Intelligence (CTI) and OSINT MVP platform.",
    version="1.0.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all origins for dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------
# Models
# ---------------------------------------------------------
class PhoneScanRequest(BaseModel):
    phone_number: str

class UrlScanRequest(BaseModel):
    url_string: str

# ---------------------------------------------------------
# Endpoint 1: Phone Number OSINT & HLR Simulation
# ---------------------------------------------------------
@app.post("/api/backend/scan-phone")
async def scan_phone(request: PhoneScanRequest):
    """
    Simulates Home Location Register (HLR) lookups and OSINT scraping (e.g., PhoneInfoga).
    Analyzes the phone number and checks it against a mock threat intelligence database.
    """
    phone_str = request.phone_number

    # Logic 1 (Validation): Use the phonenumbers library to parse and validate
    try:
        parsed_number = phonenumbers.parse(phone_str, None)
        if not phonenumbers.is_valid_number(parsed_number):
            raise ValueError("Invalid number")
    except Exception as e:
        raise HTTPException(status_code=400, detail="Invalid phone number format.")

    # Extract Region/Country and Carrier
    country = geocoder.description_for_number(parsed_number, "en")
    extracted_carrier = carrier.name_for_number(parsed_number, "en")
    
    # Format the number to E.164 for consistency in our mock DB
    formatted_number = phonenumbers.format_number(parsed_number, phonenumbers.PhoneNumberFormat.E164)

    # Logic 2 & Conditional Rules (Mock HLR & OSINT)
    # Check against our mock threat intel database
    if formatted_number in ["+628111111111", "+85599999999"]:
        return {
            "phone_number": formatted_number,
            "threat_level": "HIGH",
            "score": 92,
            "osint_data": {
                "carrier": "VoIP/Virtual Operator",
                "location": "Known Fraud Hub" if formatted_number == "+85599999999" else country,
                "flags": ["Found in Telegram Fraud Groups", "BEC Scam Reports"],
                "details": "High confidence of malicious activity. Number associated with organized fraud rings."
            }
        }
    
    # If input is a standard/normal number
    return {
        "phone_number": formatted_number,
        "threat_level": "CLEAN",
        "score": 10,
        "osint_data": {
            "carrier": extracted_carrier or "Standard Carrier",
            "location": country or "Unknown",
            "flags": ["No negative OSINT footprint found"],
            "details": "Number appears legitimate with normal registration patterns."
        }
    }


# ---------------------------------------------------------
# Endpoint 2: Phishing Link & Domain Scanner
# ---------------------------------------------------------
@app.post("/api/backend/scan-url")
async def scan_url(request: UrlScanRequest):
    """
    Simulates WHOIS lookup for domain age to detect newly registered phishing domains,
    and checks against SafeBrowsing databases.
    """
    url = request.url_string

    # Add scheme if missing so urlparse can parse the netloc correctly
    if not url.startswith(("http://", "https://")):
        url = "http://" + url

    # Logic 1 (Validation): Parse the URL to extract the domain
    parsed_url = urlparse(url)
    domain = parsed_url.netloc

    if not domain:
        raise HTTPException(status_code=400, detail="Invalid URL format.")

    # Logic 2 & Conditional Rules (Mock WHOIS & Threat Intel)
    url_lower = url.lower()
    
    # Rule 1: High Threat (Phishing indicators)
    if any(keyword in url_lower for keyword in ["free-prize", "update-bank", "bit.ly/fake"]):
        return {
            "domain": domain,
            "threat_level": "HIGH",
            "score": 95,
            "threat_intel": {
                "domain_age": "2 days old",
                "flags": ["Phishing", "Credential Harvesting"],
                "ssl_status": "Invalid/Self-Signed",
                "details": "Simulating WHOIS lookup for domain age to detect newly registered phishing domains. Domain exhibits strong credential harvesting characteristics."
            }
        }
    
    # Rule 2: Clean/Trusted
    if any(trusted in domain.lower() for trusted in ["google.com", "github.com"]):
        return {
            "domain": domain,
            "threat_level": "CLEAN",
            "score": 5,
            "threat_intel": {
                "domain_age": "15+ years",
                "flags": ["0 malicious flags"],
                "ssl_status": "Valid/Trusted",
                "details": "Domain is highly reputable and well-established."
            }
        }

    # Rule 3: Monitoring (Catch-all)
    return {
        "domain": domain,
        "threat_level": "LOW / MONITORING",
        "score": 35,
        "threat_intel": {
            "domain_age": "3 years",
            "flags": ["No active threats detected"],
            "ssl_status": "Valid",
            "details": "Domain has average reputation. No current malicious activity, but ongoing monitoring advised."
        }
    }

if __name__ == "__main__":
    import uvicorn
    # Run the server on port 8000
    uvicorn.run(app, host="0.0.0.0", port=8000)
