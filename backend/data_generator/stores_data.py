"""
Store definitions for Vertex Retail Group.
20 realistic stores across 5 regions of India with realistic tiers and targets.
"""

STORES = [
    # North Region
    {
        "store_id": "STR-DEL-01",
        "store_name": "Vertex Delhi Connaught Place",
        "city": "Delhi",
        "state": "Delhi",
        "region": "North",
        "tier": "Tier 1 Flagship",
        "square_feet": 6500,
        "monthly_target": 7500000.0,
        "target_margin_percent": 24.5
    },
    {
        "store_id": "STR-GUR-02",
        "store_name": "Vertex Gurugram Cyber Hub",
        "city": "Gurugram",
        "state": "Haryana",
        "region": "North",
        "tier": "Tier 1",
        "square_feet": 5200,
        "monthly_target": 6800000.0,
        "target_margin_percent": 25.0
    },
    {
        "store_id": "STR-NOI-03",
        "store_name": "Vertex Noida Sector 18",
        "city": "Noida",
        "state": "Uttar Pradesh",
        "region": "North",
        "tier": "Tier 1",
        "square_feet": 4800,
        "monthly_target": 5600000.0,
        "target_margin_percent": 24.0
    },
    {
        "store_id": "STR-LKO-04",
        "store_name": "Vertex Lucknow Gomti Nagar",
        "city": "Lucknow",
        "state": "Uttar Pradesh",
        "region": "North",
        "tier": "Tier 2",
        "square_feet": 4200,
        "monthly_target": 4600000.0,
        "target_margin_percent": 25.5
    },
    {
        "store_id": "STR-KAN-05",
        "store_name": "Vertex Kanpur Mall Road",
        "city": "Kanpur",
        "state": "Uttar Pradesh",
        "region": "North",
        "tier": "Tier 2",
        "square_feet": 3800,
        "monthly_target": 3800000.0,
        "target_margin_percent": 26.0
    },
    {
        "store_id": "STR-AGR-06",
        "store_name": "Vertex Agra Sanjay Place",
        "city": "Agra",
        "state": "Uttar Pradesh",
        "region": "North",
        "tier": "Tier 2 Underperformer",
        "square_feet": 3400,
        "monthly_target": 3500000.0,
        "target_margin_percent": 23.0
    },
    {
        "store_id": "STR-JAI-07",
        "store_name": "Vertex Jaipur MI Road",
        "city": "Jaipur",
        "state": "Rajasthan",
        "region": "North",
        "tier": "Tier 2",
        "square_feet": 4500,
        "monthly_target": 4900000.0,
        "target_margin_percent": 25.0
    },
    {
        "store_id": "STR-CHD-08",
        "store_name": "Vertex Chandigarh Sector 17",
        "city": "Chandigarh",
        "state": "Punjab",
        "region": "North",
        "tier": "Tier 2",
        "square_feet": 4100,
        "monthly_target": 4400000.0,
        "target_margin_percent": 26.0
    },
    {
        "store_id": "STR-DDN-09",
        "store_name": "Vertex Dehradun Rajpur Road",
        "city": "Dehradun",
        "state": "Uttarakhand",
        "region": "North",
        "tier": "Tier 2",
        "square_feet": 3200,
        "monthly_target": 3100000.0,
        "target_margin_percent": 26.5
    },
    {
        "store_id": "STR-VAR-10",
        "store_name": "Vertex Varanasi Sigra",
        "city": "Varanasi",
        "state": "Uttar Pradesh",
        "region": "North",
        "tier": "Tier 2",
        "square_feet": 3600,
        "monthly_target": 3400000.0,
        "target_margin_percent": 25.5
    },
    {
        "store_id": "STR-PRY-11",
        "store_name": "Vertex Prayagraj Civil Lines",
        "city": "Prayagraj",
        "state": "Uttar Pradesh",
        "region": "North",
        "tier": "Tier 2",
        "square_feet": 3300,
        "monthly_target": 3000000.0,
        "target_margin_percent": 25.0
    },

    # West Region
    {
        "store_id": "STR-MUM-12",
        "store_name": "Vertex Mumbai Andheri West",
        "city": "Mumbai",
        "state": "Maharashtra",
        "region": "West",
        "tier": "Tier 1 Flagship",
        "square_feet": 7000,
        "monthly_target": 8200000.0,
        "target_margin_percent": 24.0
    },
    {
        "store_id": "STR-PUN-13",
        "store_name": "Vertex Pune Viman Nagar",
        "city": "Pune",
        "state": "Maharashtra",
        "region": "West",
        "tier": "Tier 1",
        "square_feet": 5000,
        "monthly_target": 6200000.0,
        "target_margin_percent": 25.0
    },
    {
        "store_id": "STR-AHM-14",
        "store_name": "Vertex Ahmedabad SG Highway",
        "city": "Ahmedabad",
        "state": "Gujarat",
        "region": "West",
        "tier": "Tier 1",
        "square_feet": 5400,
        "monthly_target": 6000000.0,
        "target_margin_percent": 24.5
    },

    # South Region
    {
        "store_id": "STR-BLR-15",
        "store_name": "Vertex Bengaluru Indiranagar",
        "city": "Bengaluru",
        "state": "Karnataka",
        "region": "South",
        "tier": "Tier 1 Flagship",
        "square_feet": 6800,
        "monthly_target": 8000000.0,
        "target_margin_percent": 25.0
    },
    {
        "store_id": "STR-HYD-16",
        "store_name": "Vertex Hyderabad Jubilee Hills",
        "city": "Hyderabad",
        "state": "Telangana",
        "region": "South",
        "tier": "Tier 1",
        "square_feet": 5800,
        "monthly_target": 7100000.0,
        "target_margin_percent": 24.5
    },

    # Central Region
    {
        "store_id": "STR-BHO-17",
        "store_name": "Vertex Bhopal MP Nagar",
        "city": "Bhopal",
        "state": "Madhya Pradesh",
        "region": "Central",
        "tier": "Tier 2",
        "square_feet": 3700,
        "monthly_target": 3600000.0,
        "target_margin_percent": 25.5
    },
    {
        "store_id": "STR-IND-18",
        "store_name": "Vertex Indore Vijay Nagar",
        "city": "Indore",
        "state": "Madhya Pradesh",
        "region": "Central",
        "tier": "Tier 2",
        "square_feet": 4300,
        "monthly_target": 4500000.0,
        "target_margin_percent": 25.0
    },

    # East Region
    {
        "store_id": "STR-KOL-19",
        "store_name": "Vertex Kolkata Park Street",
        "city": "Kolkata",
        "state": "West Bengal",
        "region": "East",
        "tier": "Tier 1",
        "square_feet": 5600,
        "monthly_target": 6100000.0,
        "target_margin_percent": 24.0
    },
    {
        "store_id": "STR-PAT-20",
        "store_name": "Vertex Patna Boring Road",
        "city": "Patna",
        "state": "Bihar",
        "region": "East",
        "tier": "Tier 2 Underperformer",
        "square_feet": 3500,
        "monthly_target": 3300000.0,
        "target_margin_percent": 23.5
    },
]
