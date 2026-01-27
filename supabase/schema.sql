-- Enable PostGIS is optional but useful for geo queries later
-- create extension if not exists postgis;

-- 1. Target Locations Table
-- Stores the specific cities or zip codes we are targeting with pSEO pages.
CREATE TABLE target_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    zip_code TEXT NOT NULL UNIQUE, -- The primary key for our lookup
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    slug TEXT GENERATED ALWAYS AS (lower(replace(city || '-' || state || '-' || zip_code, ' ', '-'))) STORED,
    neighborhoods JSONB DEFAULT '[]'::JSONB, -- Phase 2.1: Store real neighborhood data
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for fast lookup by slug or zip
CREATE INDEX idx_locations_zip ON target_locations(zip_code);
CREATE INDEX idx_locations_slug ON target_locations(slug);


-- 2. Soil Cache Table
-- Stores the USDA data we fetch for each location.
-- We cache this to avoid hitting the slow USDA API on every page load.
CREATE TABLE soil_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id UUID REFERENCES target_locations(id) ON DELETE CASCADE,
    
    -- USDA SDA Specific Fields
    map_unit_symbol TEXT,         -- e.g., 'HoA'
    map_unit_name TEXT,           -- e.g., 'Houston Black Clay'
    component_name TEXT,          -- e.g., 'Houston Black'
    
    -- Critical Engineering Metrics
    shrink_swell_potential NUMERIC, -- "Linear Extensibility Percent" (LEP)
    plasticity_index NUMERIC,       -- PI (Liquid Limit - Plastic Limit)
    
    -- Risk Classification (Computed or Stored)
    risk_level TEXT CHECK (risk_level IN ('Low', 'Moderate', 'High', 'Severe')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(location_id) -- One soil report per location
);


-- 3. RLS Policies (Row Level Security)
-- Enable RLS
ALTER TABLE target_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE soil_cache ENABLE ROW LEVEL SECURITY;

-- Allow Public Read Access (Needed for the Website to render pages)
CREATE POLICY "Allow Public Read Locations" ON target_locations FOR SELECT USING (true);
CREATE POLICY "Allow Public Read Soil" ON soil_cache FOR SELECT USING (true);

-- Allow Service Role Write Access (For our ingestion scripts)
-- (Implicitly allowed for service role, but good to be explicit if using authenticated users)
