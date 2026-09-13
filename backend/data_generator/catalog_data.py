"""
Product catalog for Vertex Retail Group: 300+ realistic products across 11 categories.
Includes realistic unit costs, selling prices, target margin percentages, and reorder points.
"""

import random

CATEGORY_DEFINITIONS = [
    {
        "category": "Lighting",
        "subcategories": ["LED Bulbs", "Battens & Tubes", "Panel & Downlights", "Decorative & Chandeliers", "Flood & Outdoor Lights"],
        "brands": ["Philips", "Havells", "Syska", "Wipro", "Crompton"],
        "cost_range": (80, 2500),
        "markup_multiplier_range": (1.35, 1.65), # 26% to 39% gross margin
        "reorder_range": (30, 100),
        "target_margin": 32.0,
        "items": [
            ("9W Cool Day LED Bulb B22", "LED Bulbs", 65, 120),
            ("12W Glaze High-Lumen Bulb B22", "LED Bulbs", 90, 160),
            ("14W Crystal Inverter Emergency Bulb", "LED Bulbs", 210, 380),
            ("20W High Wattage T-Bulb E27", "LED Bulbs", 180, 320),
            ("20W Linear LED Batten 4ft", "Battens & Tubes", 160, 290),
            ("24W Slimline Prism Batten 4ft", "Battens & Tubes", 220, 390),
            ("36W Dual-Tone Commercial Batten", "Battens & Tubes", 340, 580),
            ("6W Slim Round Recessed Downlight", "Panel & Downlights", 140, 260),
            ("12W Surface COB Spotlight Warm White", "Panel & Downlights", 290, 520),
            ("15W Ultra Slim Edge-Lit Panel 6x6", "Panel & Downlights", 380, 680),
            ("18W Frameless 3-in-1 Color Shift Panel", "Panel & Downlights", 480, 850),
            ("Rustic Modern Geometric Pendant Light", "Decorative & Chandeliers", 850, 1650),
            ("Nordic 3-Ring Crystal LED Chandelier", "Decorative & Chandeliers", 2800, 5200),
            ("Vintage Edison Filament Wall Sconce", "Decorative & Chandeliers", 520, 990),
            ("30W IP66 Waterproof LED Flood Light", "Flood & Outdoor Lights", 650, 1150),
            ("50W Industrial Die-Cast Security Floodlight", "Flood & Outdoor Lights", 1100, 1950),
            ("100W Stadium Beam High-Bay Fixture", "Flood & Outdoor Lights", 2400, 4200),
        ]
    },
    {
        "category": "Wires & Cables",
        "subcategories": ["FR PVC Insulated Single Core", "FRLS Flame Retardant Cables", "Submersible Flat Cables", "Coaxial & CCTV Cables", "Multi-Core Flexible Cables"],
        "brands": ["Polycab", "Finolex", "Havells", "RR Kabel", "KEI"],
        "cost_range": (600, 9500),
        "markup_multiplier_range": (1.25, 1.45), # 20% to 31% gross margin
        "reorder_range": (20, 60),
        "target_margin": 25.0,
        "items": [
            ("0.75 sq mm Single Core FR Wire 90m", "FR PVC Insulated Single Core", 680, 920),
            ("1.0 sq mm Green Building FR Wire 90m", "FR PVC Insulated Single Core", 950, 1280),
            ("1.5 sq mm Flame Retardant Wire 90m Red", "FR PVC Insulated Single Core", 1380, 1850),
            ("2.5 sq mm High Temp FR Wire 90m Yellow", "FR PVC Insulated Single Core", 2200, 2950),
            ("4.0 sq mm Heavy Duty Cable 90m Blue", "FR PVC Insulated Single Core", 3400, 4500),
            ("6.0 sq mm Industrial Grade Wire 90m Black", "FR PVC Insulated Single Core", 5100, 6800),
            ("1.5 sq mm FRLS Low Smoke Cable 90m", "FRLS Flame Retardant Cables", 1600, 2150),
            ("2.5 sq mm FRLS Low Smoke Cable 90m", "FRLS Flame Retardant Cables", 2550, 3400),
            ("4.0 sq mm FRLS Low Smoke Cable 90m", "FRLS Flame Retardant Cables", 3900, 5200),
            ("3 Core 2.5 sq mm Flat Submersible Cable 100m", "Submersible Flat Cables", 4800, 6400),
            ("3 Core 4.0 sq mm Heavy Flat Submersible 100m", "Submersible Flat Cables", 7200, 9600),
            ("RG-6 High Frequency Coaxial Cable 100m", "Coaxial & CCTV Cables", 850, 1250),
            ("3+1 Shielded Copper CCTV Cable 90m", "Coaxial & CCTV Cables", 1100, 1600),
            ("4 Core 1.5 sq mm Flexible Industrial Cable 100m", "Multi-Core Flexible Cables", 3800, 5100),
            ("2 Core 2.5 sq mm Round Flexible Twin Cable 100m", "Multi-Core Flexible Cables", 3200, 4300),
        ]
    },
    {
        "category": "Switches & Sockets",
        "subcategories": ["Modular Switches", "Modular Sockets", "Combined Plates & Frames", "Dimmer & Fan Regulators", "USB Charging Sockets"],
        "brands": ["Legrand", "Anchor by Panasonic", "Schneider Electric", "Havells Crabtree", "Goldmedal"],
        "cost_range": (35, 1200),
        "markup_multiplier_range": (1.40, 1.85), # 28% to 46% gross margin
        "reorder_range": (50, 150),
        "target_margin": 35.0,
        "items": [
            ("10A 1-Way Modular Switch White", "Modular Switches", 28, 55),
            ("10A 2-Way Dual Control Modular Switch", "Modular Switches", 42, 80),
            ("16A Heavy Duty Geyser/AC Switch", "Modular Switches", 85, 160),
            ("20A DP Switch with Indicator Light", "Modular Switches", 140, 260),
            ("25A High Load Starter Switch", "Modular Switches", 210, 380),
            ("6A 2-in-1 Universal Safety Socket", "Modular Sockets", 45, 90),
            ("16A 3-Pin Power Socket with Shutter", "Modular Sockets", 90, 175),
            ("Multi-Standard International Socket", "Modular Sockets", 130, 240),
            ("2-Module Curved Polycarbonate Cover Plate", "Combined Plates & Frames", 55, 110),
            ("4-Module Brushed Silver Glass Finish Plate", "Combined Plates & Frames", 180, 360),
            ("8-Module Matte Black Metallic Faceplate", "Combined Plates & Frames", 320, 640),
            ("12-Module Architectural Wooden Textured Plate", "Combined Plates & Frames", 450, 890),
            ("100W 4-Step Hum-Free Rotary Fan Regulator", "Dimmer & Fan Regulators", 160, 310),
            ("300W Capacitive Step-Less Dimmer", "Dimmer & Fan Regulators", 240, 460),
            ("Dual Fast-Charging USB-A & USB-C Wall Socket", "USB Charging Sockets", 480, 890),
        ]
    },
    {
        "category": "Fans",
        "subcategories": ["BLDC Energy Saving Fans", "Standard Ceiling Fans", "Exhaust & Ventilation Fans", "Pedestal & Table Fans", "Decorative Antique Fans"],
        "brands": ["Atomberg", "Crompton", "Havells", "Orient Electric", "Usha"],
        "cost_range": (1100, 7500),
        "markup_multiplier_range": (1.25, 1.50), # 20% to 33% gross margin
        "reorder_range": (15, 45),
        "target_margin": 24.0,
        "items": [
            ("Atomberg Renesa 1200mm 28W BLDC Fan with Remote", "BLDC Energy Saving Fans", 2450, 3690),
            ("Atomberg Studio Smart Voice-Controlled BLDC 1200mm", "BLDC Energy Saving Fans", 3400, 4990),
            ("Havells Efficiencia Neo 1200mm Super BLDC Fan", "BLDC Energy Saving Fans", 2300, 3350),
            ("Crompton Energion Groove 1200mm BLDC Remote Fan", "BLDC Energy Saving Fans", 2200, 3190),
            ("Orient Electric Aeroquiet 1200mm Silent Ceiling Fan", "BLDC Energy Saving Fans", 3800, 5450),
            ("Crompton Hill Briz 1200mm High Speed Ceiling Fan", "Standard Ceiling Fans", 1350, 1890),
            ("Havells Stealth Air 1200mm Premium Metallic Fan", "Standard Ceiling Fans", 2600, 3650),
            ("Usha Striker Galaxy 1200mm Aerodynamic Blade Fan", "Standard Ceiling Fans", 1750, 2450),
            ("Luminous Dhoom High-Speed 1200mm Economy Fan", "Standard Ceiling Fans", 1150, 1590),
            ("Havells Ventilair DB 150mm High-RPM Exhaust Fan", "Exhaust & Ventilation Fans", 750, 1150),
            ("Crompton Brisk Air 200mm Louver Window Exhaust Fan", "Exhaust & Ventilation Fans", 920, 1390),
            ("Luminous Vento Deluxe 250mm Heavy Kitchen Exhaust", "Exhaust & Ventilation Fans", 1250, 1850),
            ("Orient Stand-37 400mm Oscillating Pedestal Fan", "Pedestal & Table Fans", 1700, 2490),
            ("Usha Maxx Air 400mm Aerodynamic High-Breeze Table Fan", "Pedestal & Table Fans", 1400, 1990),
            ("Havells Florence Under-Light Chandelier Fan Antique Brass", "Decorative Antique Fans", 5800, 8900),
        ]
    },
    {
        "category": "Cooling",
        "subcategories": ["Inverter Split Air Conditioners", "Window Air Conditioners", "Tower & Desert Air Coolers", "Personal Room Air Coolers"],
        "brands": ["Voltas", "Daikin", "LG", "Blue Star", "Symphony", "Kenstar"],
        "cost_range": (4200, 42000),
        "markup_multiplier_range": (1.14, 1.28), # 12% to 22% gross margin
        "reorder_range": (8, 25),
        "target_margin": 16.5,
        "items": [
            ("Voltas 1.5 Ton 3 Star Inverter Split AC Copper", "Inverter Split Air Conditioners", 24800, 31990),
            ("Voltas 1.5 Ton 5 Star Adjustable Inverter Split AC", "Inverter Split Air Conditioners", 29500, 37490),
            ("Daikin 1.5 Ton 5 Star Dew Clean Inverter Split AC", "Inverter Split Air Conditioners", 34500, 44200),
            ("Daikin 1.0 Ton 3 Star Compact Inverter Split AC", "Inverter Split Air Conditioners", 23500, 29800),
            ("LG 1.5 Ton 5 Star Dual Inverter Split AC with AI", "Inverter Split Air Conditioners", 35200, 44990),
            ("Blue Star 2.0 Ton 3 Star Turbo Cool Split AC", "Inverter Split Air Conditioners", 39000, 48900),
            ("Voltas 1.5 Ton 3 Star Fixed Speed Window AC", "Window Air Conditioners", 21500, 26900),
            ("Blue Star 1.0 Ton 3 Star Ultra-Quiet Window AC", "Window Air Conditioners", 19800, 24500),
            ("Symphony Diet 3D 55i Portable Tower Air Cooler 55L", "Tower & Desert Air Coolers", 6800, 9490),
            ("Symphony Siesta 70XL Heavy Duty Desert Air Cooler 70L", "Tower & Desert Air Coolers", 8200, 11490),
            ("Kenstar Glam 50L Honeycomb Desert Air Cooler", "Tower & Desert Air Coolers", 6200, 8600),
            ("Crompton Ozone 75L Inverter-Compatible Desert Cooler", "Tower & Desert Air Coolers", 7800, 10790),
            ("Bajaj PX 97 Torque 36L Personal Room Air Cooler", "Personal Room Air Coolers", 4100, 5790),
            ("Havells Celia Desert Air Cooler 55L Silver/White", "Tower & Desert Air Coolers", 8900, 12200),
        ]
    },
    {
        "category": "Large Appliances",
        "subcategories": ["Frost Free Refrigerators", "Single Door Refrigerators", "Front Load Washing Machines", "Top Load Washing Machines", "Microwave Ovens"],
        "brands": ["LG", "Samsung", "Whirlpool", "Bosch", "IFB", "Haier"],
        "cost_range": (9500, 58000),
        "markup_multiplier_range": (1.12, 1.25), # 11% to 20% gross margin
        "reorder_range": (6, 20),
        "target_margin": 15.0,
        "items": [
            ("LG 242L 3 Star Smart Inverter Double Door Refrigerator", "Frost Free Refrigerators", 18800, 23990),
            ("Samsung 324L 3 Star Convertible 5-in-1 Frost Free Fridge", "Frost Free Refrigerators", 27400, 34490),
            ("Whirlpool 265L 3 Star IntelliFresh Double Door Fridge", "Frost Free Refrigerators", 20500, 25990),
            ("LG 190L 4 Star Direct Cool Single Door Refrigerator", "Single Door Refrigerators", 12400, 15990),
            ("Samsung 189L 5 Star Digi-Touch Single Door Refrigerator", "Single Door Refrigerators", 13800, 17800),
            ("Bosch 7 kg 5 Star Fully-Automatic Front Load Washer", "Front Load Washing Machines", 25800, 32990),
            ("LG 8 kg 5 Star AI Direct Drive Steam Front Load Washer", "Front Load Washing Machines", 32500, 41490),
            ("IFB 6.5 kg 5 Star Senator Smart Front Load Washer", "Front Load Washing Machines", 22800, 28990),
            ("LG 7 kg 5 Star Smart Inverter Top Load Washer", "Top Load Washing Machines", 14200, 18490),
            ("Samsung 8 kg 5 Star EcoBubble Top Load Washer", "Top Load Washing Machines", 16800, 21990),
            ("Whirlpool 7.5 kg 5 Star Royal Plus Top Load Washer", "Top Load Washing Machines", 13100, 16990),
            ("LG 28L Charcoal Convection Microwave Oven", "Microwave Ovens", 12500, 16290),
            ("Samsung 23L Solo Ceramic Enamel Microwave Oven", "Microwave Ovens", 5100, 6890),
            ("IFB 30L Rotisserie Convection Microwave Oven", "Microwave Ovens", 13200, 17490),
        ]
    },
    {
        "category": "Small Appliances",
        "subcategories": ["Mixer Grinders & Blenders", "Electric Kettles", "Induction Cooktops", "Steam & Dry Irons", "Air Fryers & Toasters", "Water Purifiers"],
        "brands": ["Philips", "Bajaj", "Prestige", "Havells", "Morphy Richards", "Kent"],
        "cost_range": (550, 12500),
        "markup_multiplier_range": (1.28, 1.60), # 22% to 38% gross margin
        "reorder_range": (20, 60),
        "target_margin": 27.5,
        "items": [
            ("Philips HL7756 750W Heavy Duty Mixer Grinder 3 Jars", "Mixer Grinders & Blenders", 2400, 3690),
            ("Prestige Iris Plus 750W Mixer Grinder with 4 Jars", "Mixer Grinders & Blenders", 2150, 3290),
            ("Sujata Powermatic Plus 900W Juicer Mixer Grinder", "Mixer Grinders & Blenders", 4100, 5850),
            ("Pigeon 1.5L Stainless Steel Cordless Electric Kettle", "Electric Kettles", 480, 799),
            ("Havells Aqua Plus 1.2L Cool-Touch Double Wall Kettle", "Electric Kettles", 980, 1590),
            ("Prestige PIC 20 1200W Automatic Induction Cooktop", "Induction Cooktops", 1450, 2290),
            ("Philips HD4928 2100W Electromagnetic Induction Cooktop", "Induction Cooktops", 2200, 3390),
            ("Philips GC1905 1440W Non-Stick Steam Iron", "Steam & Dry Irons", 1100, 1690),
            ("Bajaj DX 7 1000W Classic Heavyweight Dry Iron", "Steam & Dry Irons", 550, 890),
            ("Philips HD9200 4.1L Rapid Air Healthy Air Fryer", "Air Fryers & Toasters", 4800, 7290),
            ("Morphy Richards 2-Slice Pop-Up Automatic Toaster", "Air Fryers & Toasters", 1250, 1890),
            ("Kent Grand Plus 9L RO+UV+UF Alkaline Water Purifier", "Water Purifiers", 12500, 16990),
            ("Aquaguard Marvel NXT RO+UV Copper Booster 6.2L Purifier", "Water Purifiers", 11200, 15490),
        ]
    },
    {
        "category": "Televisions",
        "subcategories": ["4K Ultra HD Smart LED TVs", "OLED & QLED TVs", "Full HD Smart TVs", "Soundbars & Home Audio"],
        "brands": ["Sony", "Samsung", "LG", "Xiaomi", "TCL", "JBL"],
        "cost_range": (9000, 95000),
        "markup_multiplier_range": (1.10, 1.22), # 9% to 18% gross margin
        "reorder_range": (5, 18),
        "target_margin": 14.0,
        "items": [
            ("Sony Bravia 55 Inch 4K Ultra HD Google Smart LED TV", "4K Ultra HD Smart LED TVs", 46000, 54990),
            ("Sony Bravia 65 Inch 4K Ultra HD Dolby Vision Google TV", "4K Ultra HD Smart LED TVs", 68000, 79990),
            ("Samsung 55 Inch Crystal 4K Vivid Pro Smart LED TV", "4K Ultra HD Smart LED TVs", 34500, 41990),
            ("Samsung 65 Inch QLED 4K Quantum HDR Smart TV", "OLED & QLED TVs", 64000, 76990),
            ("LG 55 Inch 4K OLED evo Smart TV Infinite Contrast", "OLED & QLED TVs", 84000, 98990),
            ("LG 43 Inch 4K Ultra HD WebOS AI ThinQ Smart LED TV", "4K Ultra HD Smart LED TVs", 24500, 29990),
            ("Xiaomi 43 Inch Full HD Fire TV Edition LED Smart TV", "Full HD Smart TVs", 16800, 20990),
            ("Xiaomi 50 Inch 4K Dolby Atmos Smart Android TV", "4K Ultra HD Smart LED TVs", 24000, 29490),
            ("TCL 55 Inch Metallic Bezel-Less 4K HDR Google TV", "4K Ultra HD Smart LED TVs", 26500, 32990),
            ("Sony HT-S20R 5.1ch Real Surround Soundbar 400W", "Soundbars & Home Audio", 14200, 17990),
            ("JBL Cinema SB271 2.1ch Deep Bass Wireless Sub Soundbar", "Soundbars & Home Audio", 9200, 12490),
            ("Samsung Dolby Digital 300W Bluetooth Soundbar B-Series", "Soundbars & Home Audio", 8800, 11990),
        ]
    },
    {
        "category": "Switchgear",
        "subcategories": ["Miniature Circuit Breakers (MCB)", "Residual Current Circuit Breakers (RCCB)", "Distribution Boards (DB)", "Changeover Switches & Isolators", "Surge Protection Devices"],
        "brands": ["Schneider Electric", "Legrand", "L&T", "Siemens", "Havells"],
        "cost_range": (110, 6800),
        "markup_multiplier_range": (1.30, 1.65), # 23% to 39% gross margin
        "reorder_range": (30, 90),
        "target_margin": 30.0,
        "items": [
            ("Schneider Acti9 10A Single Pole C-Curve MCB", "Miniature Circuit Breakers (MCB)", 110, 185),
            ("Schneider Acti9 16A Single Pole C-Curve MCB", "Miniature Circuit Breakers (MCB)", 115, 190),
            ("Schneider Acti9 20A Double Pole C-Curve MCB", "Miniature Circuit Breakers (MCB)", 320, 520),
            ("Schneider Acti9 32A Triple Pole C-Curve MCB", "Miniature Circuit Breakers (MCB)", 580, 940),
            ("Legrand DX3 25A Double Pole 30mA RCCB", "Residual Current Circuit Breakers (RCCB)", 1450, 2250),
            ("Legrand DX3 40A 4-Pole 100mA Industrial RCCB", "Residual Current Circuit Breakers (RCCB)", 2400, 3650),
            ("L&T 63A 4-Pole 30mA AC Type Earth Leakage RCCB", "Residual Current Circuit Breakers (RCCB)", 2700, 4100),
            ("Havells 8-Way Double Door Metallic Distribution Board", "Distribution Boards (DB)", 850, 1390),
            ("Havells 12-Way Double Door IP43 VTPN Distribution Board", "Distribution Boards (DB)", 1400, 2250),
            ("Legrand 16-Way Premium Flush Distribution Enclosure", "Distribution Boards (DB)", 1950, 3100),
            ("L&T 32A 4-Pole Manual Changeover Switch In Enclosure", "Changeover Switches & Isolators", 1650, 2600),
            ("L&T 63A 4-Pole Heavy Industrial Rotary Isolator", "Changeover Switches & Isolators", 1150, 1850),
            ("Schneider Electric Type 2 Single Phase Surge Protector", "Surge Protection Devices", 2200, 3400),
            ("Siemens 3-Phase Commercial Line Surge Arrestor Class C", "Surge Protection Devices", 4100, 6200),
        ]
    },
    {
        "category": "Smart Home",
        "subcategories": ["Smart Wifi Switches & Plugs", "Smart Security Cameras", "Smart Video Doorbells", "Smart Ambient Lighting", "Smart Hubs & Sensors"],
        "brands": ["Qubo by Hero", "TP-Link Tapo", "Philips Wiz", "Wipro Smart", "Godrej", "Atomberg"],
        "cost_range": (450, 8500),
        "markup_multiplier_range": (1.32, 1.70), # 24% to 41% gross margin
        "reorder_range": (20, 50),
        "target_margin": 32.0,
        "items": [
            ("Tapo P110 16A Energy Monitoring Smart Wi-Fi Plug", "Smart Wifi Switches & Plugs", 620, 1090),
            ("Tapo P100 10A Compact Smart Plug Remote Controlled", "Smart Wifi Switches & Plugs", 430, 790),
            ("Wipro 4-Node Smart Modular Touch Switch Module", "Smart Wifi Switches & Plugs", 1450, 2390),
            ("Qubo Smart Cam 360 Full HD AI Motion Security Camera", "Smart Security Cameras", 1650, 2790),
            ("Tapo C210 2K 3MP Ultra HD Pan & Tilt Indoor Camera", "Smart Security Cameras", 1850, 2990),
            ("Godrej Spotlight 1080p Outdoor Weatherproof Cam", "Smart Security Cameras", 2400, 3890),
            ("Qubo Wireless Smart Video Doorbell with 2-Way Audio", "Smart Video Doorbells", 3800, 5990),
            ("Philips Wiz 10W B22 16-Million Color Wi-Fi Bulb", "Smart Ambient Lighting", 510, 899),
            ("Wipro 2-Meter RGBIC Neon Wi-Fi Smart Light Strip", "Smart Ambient Lighting", 1100, 1890),
            ("Philips Wiz Smart LED Downlight 9W Tunable White", "Smart Ambient Lighting", 650, 1120),
            ("Qubo Smart Door Magnetic Sensor & Siren Hub Kit", "Smart Hubs & Sensors", 2900, 4600),
            ("Tapo Smart Temperature & Humidity Wireless Monitor", "Smart Hubs & Sensors", 850, 1450),
        ]
    },
    {
        "category": "Electrical Accessories",
        "subcategories": ["Spike Guards & Extensions", "Multi-Plugs & Adapters", "PVC Insulation Tapes", "Conduit Pipes & Fittings", "Cable Ties & Fasteners", "Testers & Multimeters"],
        "brands": ["Anchor by Panasonic", "Goldmedal", "Steelbird", "Mtek", "Precision", "Mex"],
        "cost_range": (12, 1600),
        "markup_multiplier_range": (1.45, 2.10), # 31% to 52% gross margin (highest margin category!)
        "reorder_range": (60, 200),
        "target_margin": 42.0,
        "items": [
            ("Goldmedal Curve 4-Way Spike Guard with 2m Heavy Cord", "Spike Guards & Extensions", 280, 540),
            ("Goldmedal 6-Way Surge Protected Power Strip with Master Switch", "Spike Guards & Extensions", 410, 790),
            ("Anchor 3-Pin Universal Multi-Plug with Neon Indicator", "Multi-Plugs & Adapters", 55, 120),
            ("Anchor Travel Multi-Plug Adapter Set 3-in-1", "Multi-Plugs & Adapters", 110, 240),
            ("Steelbird Industrial Grade PVC Insulation Tape 10-Pack", "PVC Insulation Tapes", 90, 180),
            ("Heavy Duty Flame Retardant Black Tape 25m Roll", "PVC Insulation Tapes", 25, 60),
            ("Precision 25mm Heavy Duty Rigid PVC Conduit Pipe 3m", "Conduit Pipes & Fittings", 45, 95),
            ("Precision 25mm PVC Circular Junction Box 4-Way", "Conduit Pipes & Fittings", 14, 32),
            ("Nylon Cable Ties 200mm UV Resistant Pack of 100", "Cable Ties & Fasteners", 60, 130),
            ("Heavy Zinc-Plated Steel Saddle Clamps 25mm (Pack of 50)", "Cable Ties & Fasteners", 80, 175),
            ("Digital LCD Multimeter with Backlight & Probes", "Testers & Multimeters", 380, 750),
            ("Mtek Non-Contact AC Voltage Detector Pen with Flashlight", "Testers & Multimeters", 190, 390),
        ]
    }
]

def generate_catalog():
    """Expands catalog items programmatically to produce 320+ distinct, realistic SKUs."""
    catalog = []
    sku_idx = 1
    
    for cat_data in CATEGORY_DEFINITIONS:
        category = cat_data["category"]
        brands = cat_data["brands"]
        target_margin = cat_data["target_margin"]
        
        # Add primary predefined items
        for name, subcat, cost, price in cat_data["items"]:
            # Pick primary brand from name or brand list
            brand = "Generic"
            for b in brands:
                if b in name:
                    brand = b
                    break
            if brand == "Generic":
                brand = brands[sku_idx % len(brands)]
                
            catalog.append({
                "product_id": f"PRD-{sku_idx:03d}",
                "product_name": name,
                "category": category,
                "subcategory": subcat,
                "brand": brand,
                "unit_cost": float(cost),
                "selling_price": float(price),
                "reorder_point": random.randint(cat_data["reorder_range"][0], cat_data["reorder_range"][1]),
                "target_margin_percent": target_margin
            })
            sku_idx += 1
            
        # Programmatically synthesize complementary model variations to reach 300+ SKUs
        for brand in brands:
            for subcat in cat_data["subcategories"]:
                # Create 1-2 specialized SKUs for brand + subcat
                cost_lo, cost_hi = cat_data["cost_range"]
                markup_lo, markup_hi = cat_data["markup_multiplier_range"]
                
                base_cost = round(random.uniform(cost_lo, cost_lo + (cost_hi - cost_lo) * 0.4), 0)
                if base_cost > 1000:
                    base_cost = round(base_cost / 50) * 50
                else:
                    base_cost = round(base_cost / 10) * 10
                    
                markup = random.uniform(markup_lo, markup_hi)
                price = round(base_cost * markup, 0)
                if price > 1000:
                    price = round(price / 50) * 50 - 10 # classic Indian retail pricing, e.g. 1990, 4490
                else:
                    price = round(price / 10) * 10
                    
                sku_name = f"{brand} {subcat} Pro-Series V{random.choice(['X', 'Plus', 'Eco', 'Max', 'Prime'])}"
                
                catalog.append({
                    "product_id": f"PRD-{sku_idx:03d}",
                    "product_name": sku_name,
                    "category": category,
                    "subcategory": subcat,
                    "brand": brand,
                    "unit_cost": float(base_cost),
                    "selling_price": float(price),
                    "reorder_point": random.randint(cat_data["reorder_range"][0], cat_data["reorder_range"][1]),
                    "target_margin_percent": target_margin
                })
                sku_idx += 1
                
    return catalog

PRODUCTS = generate_catalog()
