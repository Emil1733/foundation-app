-- Fix: Add missing column for drainage class
ALTER TABLE soil_cache 
ADD COLUMN drainage_class TEXT;
