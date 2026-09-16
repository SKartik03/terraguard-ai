"""
TerraGuard AI - SQLite Database Initialization and Synthetic Benchmark Seeding
Generates deterministic SQLite database `terraguard.db` with demo locations,
historical landslide & non-landslide calibration events, and assessment schema.
"""
import sqlite3
import os
import random
from datetime import datetime, timedelta

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "terraguard.db")

LOCATIONS = [
    {
        "name": "Wayanad Vythiri Ghats",
        "region": "Western Ghats, Kerala",
        "latitude": 11.5540,
        "longitude": 76.0422,
        "baseline_slope": 38.5,
        "geology_type": "Weak",
        "baseline_soil_moisture": 72.0,
        "baseline_ndvi": 0.45,
        "land_cover": "Barren",
        "description": "High-precipitation monsoonal fracture zone with extensive slope destabilization history.",
        "baseline_risk_level": "HIGH"
    },
    {
        "name": "Joshimath Subsidence Ridge",
        "region": "Chamoli, Uttarakhand",
        "latitude": 30.5564,
        "longitude": 79.5663,
        "baseline_slope": 42.0,
        "geology_type": "Weak",
        "baseline_soil_moisture": 58.0,
        "baseline_ndvi": 0.22,
        "land_cover": "Barren",
        "description": "Ancient landslide debris mound with active tectonic shearing and groundwater percolation.",
        "baseline_risk_level": "CRITICAL"
    },
    {
        "name": "Malin Hills Escarpment",
        "region": "Pune Western Ghats, Maharashtra",
        "latitude": 19.1608,
        "longitude": 73.6827,
        "baseline_slope": 36.0,
        "geology_type": "Weak",
        "baseline_soil_moisture": 65.0,
        "baseline_ndvi": 0.38,
        "land_cover": "Agriculture",
        "description": "Terraced basaltic hillslopes vulnerable to prolonged cloudburst saturation.",
        "baseline_risk_level": "HIGH"
    },
    {
        "name": "Nilgiris Coonoor Slopes",
        "region": "Nilgiri Hills, Tamil Nadu",
        "latitude": 11.3530,
        "longitude": 76.7959,
        "baseline_slope": 28.0,
        "geology_type": "Moderate",
        "baseline_soil_moisture": 48.0,
        "baseline_ndvi": 0.65,
        "land_cover": "Grassland",
        "description": "Lateritic clay formations on steep tea estate slopes subjected to seasonal northeast monsoon.",
        "baseline_risk_level": "MODERATE"
    },
    {
        "name": "Shimla Upper Ridge",
        "region": "Himachal Pradesh",
        "latitude": 31.1048,
        "longitude": 77.1734,
        "baseline_slope": 31.5,
        "geology_type": "Moderate",
        "baseline_soil_moisture": 42.0,
        "baseline_ndvi": 0.58,
        "land_cover": "Urban",
        "description": "Overloaded ridge corridor with mixed phyllite-quartzite bedrock and storm runoff convergence.",
        "baseline_risk_level": "MODERATE"
    },
    {
        "name": "Darjeeling Lebong Spur",
        "region": "Eastern Himalayas, West Bengal",
        "latitude": 27.0410,
        "longitude": 88.2663,
        "baseline_slope": 34.0,
        "geology_type": "Weak",
        "baseline_soil_moisture": 62.0,
        "baseline_ndvi": 0.40,
        "land_cover": "Barren",
        "description": "Gneissic weathered soil layers susceptible to debris flows during intense Bay of Bengal depressions.",
        "baseline_risk_level": "HIGH"
    }
]

def init_database():
    """Creates tables if they do not exist and loads initial seed data."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # 1. Locations table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS locations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        region TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        baseline_slope REAL NOT NULL,
        geology_type TEXT NOT NULL,
        baseline_soil_moisture REAL NOT NULL,
        baseline_ndvi REAL NOT NULL,
        land_cover TEXT NOT NULL,
        description TEXT,
        baseline_risk_level TEXT NOT NULL
    )
    """)

    # 2. Historical events table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS historical_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_date TEXT NOT NULL,
        location_name TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        rainfall_mm REAL NOT NULL,
        slope_deg REAL NOT NULL,
        soil_moisture_pct REAL NOT NULL,
        geology_condition TEXT NOT NULL,
        ndvi REAL NOT NULL,
        land_cover TEXT NOT NULL,
        window_hours INTEGER NOT NULL,
        landslide_occurred INTEGER NOT NULL,
        severity TEXT NOT NULL,
        casualties INTEGER DEFAULT 0,
        damage_est_usd INTEGER DEFAULT 0,
        notes TEXT
    )
    """)

    # 3. Risk assessments log table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS risk_assessments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        created_at TEXT NOT NULL,
        location_name TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        rainfall_mm REAL NOT NULL,
        slope_deg REAL NOT NULL,
        soil_moisture_pct REAL NOT NULL,
        geology_condition TEXT NOT NULL,
        ndvi REAL NOT NULL,
        land_cover TEXT NOT NULL,
        window_hours INTEGER NOT NULL,
        layer1_score REAL NOT NULL,
        layer1_risk_class TEXT NOT NULL,
        ml_risk_prob REAL,
        ml_risk_class TEXT,
        dominant_factor TEXT NOT NULL
    )
    """)

    # Seed Locations
    for loc in LOCATIONS:
        cursor.execute("""
        INSERT OR REPLACE INTO locations 
        (name, region, latitude, longitude, baseline_slope, geology_type, baseline_soil_moisture, baseline_ndvi, land_cover, description, baseline_risk_level)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            loc["name"], loc["region"], loc["latitude"], loc["longitude"],
            loc["baseline_slope"], loc["geology_type"], loc["baseline_soil_moisture"],
            loc["baseline_ndvi"], loc["land_cover"], loc["description"], loc["baseline_risk_level"]
        ))

    # Seed Historical Events (deterministic synthetic seed)
    cursor.execute("SELECT COUNT(*) FROM historical_events")
    count = cursor.fetchone()[0]
    
    if count == 0:
        print("Seeding historical landslide benchmark dataset...")
        seed_events = generate_historical_events()
        cursor.executemany("""
        INSERT INTO historical_events 
        (event_date, location_name, latitude, longitude, rainfall_mm, slope_deg, soil_moisture_pct, 
         geology_condition, ndvi, land_cover, window_hours, landslide_occurred, severity, casualties, damage_est_usd, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, seed_events)
        print(f"Successfully seeded {len(seed_events)} historical events.")

    conn.commit()
    conn.close()
    print(f"Database initialized at: {DB_PATH}")

def generate_historical_events():
    """Generates 150 deterministic historical and non-landslide calibration events."""
    rng = random.Random(42)  # Strictly deterministic seed
    events = []
    base_date = datetime(2012, 6, 1)

    geology_options = ["Stable", "Moderate", "Weak"]
    landcover_options = ["Forest", "Grassland", "Agriculture", "Barren", "Urban"]
    windows = [6, 12, 24, 48, 72]

    # Major real historical benchmark events
    anchors = [
        ("2024-07-30", "Wayanad Vythiri Ghats", 11.5540, 76.0422, 185.0, 39.0, 84.0, "Weak", 0.32, "Barren", 24, 1, "CRITICAL", 350, 45000000, "Catastrophic debris flow triggered by 572mm 48h extreme monsoon spell."),
        ("2023-01-05", "Joshimath Subsidence Ridge", 30.5564, 79.5663, 65.0, 43.0, 62.0, "Weak", 0.18, "Barren", 48, 1, "CRITICAL", 0, 18000000, "Severe structural fissure collapse and slope subsidence in Ravigram sector."),
        ("2014-07-30", "Malin Hills Escarpment", 19.1608, 73.6827, 142.0, 37.0, 78.0, "Weak", 0.35, "Agriculture", 24, 1, "CRITICAL", 151, 12000000, "Entire village slope liquefied following 108mm relentless morning downpour."),
        ("2021-10-18", "Nilgiris Coonoor Slopes", 11.3530, 76.7959, 115.0, 30.0, 68.0, "Moderate", 0.55, "Grassland", 24, 1, "HIGH", 4, 3200000, "Multiple road cut slips along Mettupalayam-Ooty highway corridor."),
        ("2023-08-14", "Shimla Upper Ridge", 31.1048, 77.1734, 138.0, 33.0, 74.0, "Moderate", 0.48, "Urban", 24, 1, "HIGH", 21, 8500000, "Shiv temple collapse and landslide near Summer Hill after cloudburst."),
        ("2020-09-22", "Darjeeling Lebong Spur", 27.0410, 88.2663, 160.0, 36.0, 80.0, "Weak", 0.38, "Barren", 24, 1, "HIGH", 8, 4100000, "Slope failure blocking Hill Cart Road NH-55.")
    ]

    for a in anchors:
        events.append(a)

    # 144 generated calibration records (72 landslides, 72 non-landslide controls)
    for i in range(144):
        loc = LOCATIONS[i % len(LOCATIONS)]
        days_offset = rng.randint(50, 4500)
        dt = (base_date + timedelta(days=days_offset)).strftime("%Y-%m-%d")
        
        # Decide if this record is a positive event (landslide) or negative (non-landslide)
        is_slide = 1 if i % 2 == 0 else 0
        
        if is_slide:
            rainfall = round(rng.uniform(85.0, 220.0), 1)
            slope = round(loc["baseline_slope"] + rng.uniform(-3.0, 5.0), 1)
            soil_moist = round(rng.uniform(62.0, 95.0), 1)
            geology = rng.choice(["Moderate", "Weak", "Weak"])
            ndvi = round(rng.uniform(0.12, 0.48), 2)
            landcover = rng.choice(["Agriculture", "Barren", "Barren", "Urban"])
            window = rng.choice([12, 24, 48, 72])
            severity = "CRITICAL" if rainfall > 140 or slope > 40 else "HIGH"
            casualties = rng.choice([0, 0, 1, 3, 7, 14]) if severity == "HIGH" else rng.choice([0, 4, 12, 25])
            damage = casualties * 250000 + rng.randint(200000, 2500000)
            notes = f"Landslide event logged at {loc['name']} under {rainfall}mm cumulative rainfall."
        else:
            rainfall = round(rng.uniform(5.0, 65.0), 1)
            slope = round(max(5.0, loc["baseline_slope"] + rng.uniform(-15.0, -2.0)), 1)
            soil_moist = round(rng.uniform(15.0, 52.0), 1)
            geology = rng.choice(["Stable", "Stable", "Moderate"])
            ndvi = round(rng.uniform(0.55, 0.88), 2)
            landcover = rng.choice(["Forest", "Forest", "Grassland"])
            window = rng.choice(windows)
            severity = "LOW" if rainfall < 40 else "MODERATE"
            casualties = 0
            damage = 0
            notes = f"Stable slope condition recorded at {loc['name']} with normal threshold drainage."

        events.append((
            dt, loc["name"], 
            round(loc["latitude"] + rng.uniform(-0.04, 0.04), 4),
            round(loc["longitude"] + rng.uniform(-0.04, 0.04), 4),
            rainfall, slope, soil_moist, geology, ndvi, landcover, window,
            is_slide, severity, casualties, damage, notes
        ))

    return events

if __name__ == "__main__":
    init_database()
