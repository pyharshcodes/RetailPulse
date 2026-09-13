"""
Customer base generator for Vertex Retail Group.
Generates 15,000+ realistic customer profiles across Retail B2C, Contractors, and Commercial accounts.
"""

import random
from datetime import datetime, timedelta

FIRST_NAMES = [
    "Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Reyansh", "Muhammad", "Sai", "Ayaan", "Krishna",
    "Ishaan", "Shaurya", "Atharva", "Advik", "Pranav", "Advaith", "Aaryan", "Dhruv", "Kabir", "Ritvik",
    "Ananya", "Diya", "Saanvi", "Aadhya", "Pari", "Kiara", "Myra", "Riya", "Aarohi", "Anushka",
    "Avani", "Fatima", "Navya", "Ishita", "Meera", "Sara", "Kavya", "Prisha", "Tanvi", "Siya",
    "Rajesh", "Suresh", "Amit", "Vikram", "Ramesh", "Deepak", "Manoj", "Sanjay", "Sunil", "Pankaj",
    "Pooja", "Sunita", "Rekha", "Geeta", "Anita", "Kavita", "Neeta", "Seema", "Shweta", "Priyanka"
]

LAST_NAMES = [
    "Sharma", "Verma", "Gupta", "Malhotra", "Bhatia", "Saxena", "Mehta", "Chopra", "Singhal", "Agarwal",
    "Patel", "Shah", "Joshi", "Deshmukh", "Kulkarni", "Jadhav", "More", "Pawar", "Shinde", "Bansal",
    "Reddy", "Rao", "Nair", "Menon", "Pillai", "Iyer", "Iyengar", "Mukherjee", "Banerjee", "Chatterjee",
    "Das", "Ghosh", "Bose", "Sengupta", "Choudhury", "Mishra", "Tiwari", "Pandey", "Dubey", "Shukla"
]

CONTRACTOR_PREFIXES = ["Sri", "Shree", "Om", "Jai", "Balaji", "Royal", "National", "Elite", "Prime", "Universal"]
CONTRACTOR_SUFFIXES = ["Electrical Works", "Power Solutions", "Electric & Hardware", "Wiring Services", "Electrotech"]

B2B_COMPANIES = [
    "Apex Builders & Infra", "Horizon Reality Developers", "Vertex Commercial Spaces", "Skyline Constructions",
    "Zenith Facility Managers", "Blue Diamond Hospitality", "Nova Tech Park Estates", "Silverline Engineering",
    "Golden Arc Commercials", "Pioneer Industrial Logistics", "Grand Heritage Resorts", "Sterling Corporate Suites"
]

CITY_STATE_PAIRS = [
    ("Delhi", "Delhi"), ("Gurugram", "Haryana"), ("Noida", "Uttar Pradesh"),
    ("Lucknow", "Uttar Pradesh"), ("Kanpur", "Uttar Pradesh"), ("Agra", "Uttar Pradesh"),
    ("Jaipur", "Rajasthan"), ("Chandigarh", "Punjab"), ("Dehradun", "Uttarakhand"),
    ("Varanasi", "Uttar Pradesh"), ("Prayagraj", "Uttar Pradesh"), ("Mumbai", "Maharashtra"),
    ("Pune", "Maharashtra"), ("Ahmedabad", "Gujarat"), ("Bengaluru", "Karnataka"),
    ("Hyderabad", "Telangana"), ("Bhopal", "Madhya Pradesh"), ("Indore", "Madhya Pradesh"),
    ("Kolkata", "West Bengal"), ("Patna", "Bihar")
]

def generate_customers(count=15500):
    customers = []
    start_signup = datetime(2024, 6, 1)
    end_signup = datetime(2026, 12, 1)
    total_days = (end_signup - start_signup).days
    
    for i in range(1, count + 1):
        cust_id = f"CUST-{i:05d}"
        city, state = random.choice(CITY_STATE_PAIRS)
        
        # Determine customer segment:
        # 65% Retail B2C, 25% Contractor/Electrician, 10% Commercial/B2B
        p = random.random()
        if p < 0.65:
            customer_type = "Retail B2C"
            name = f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}"
        elif p < 0.90:
            customer_type = "Contractor/Electrician"
            name = f"{random.choice(CONTRACTOR_PREFIXES)} {random.choice(LAST_NAMES)} {random.choice(CONTRACTOR_SUFFIXES)}"
        else:
            customer_type = "Commercial/B2B"
            name = f"{random.choice(B2B_COMPANIES)} ({city})"
            
        # Stagger signup date (bias towards earlier dates for mature cohorts)
        days_offset = int(random.triangular(0, total_days, total_days * 0.35))
        signup_dt = start_signup + timedelta(days=days_offset)
        signup_str = signup_dt.strftime("%Y-%m-%d")
        
        phone = f"+91 {random.randint(6, 9)}{random.randint(100000000, 999999999)}"
        email_clean = name.lower().replace(" ", "").replace("&", "").replace("(", "").replace(")", "")[:12]
        email = f"{email_clean}{random.randint(10, 99)}@gmail.com" if customer_type == "Retail B2C" else f"procurement@{email_clean}.in"
        
        customers.append({
            "customer_id": cust_id,
            "customer_name": name,
            "customer_type": customer_type,
            "phone": phone,
            "email": email,
            "city": city,
            "state": state,
            "signup_date": signup_str
        })
        
    return customers
