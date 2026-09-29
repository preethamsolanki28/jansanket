-- TASK-011: Seed Context Records
-- Keyed strictly by state + district + category
-- 8 districts across 4 states x 6 core categories = 48 records
-- source_status is strictly 'demo_synthetic' with candidate reference source_url
-- Population proxies calibrated for planning sub-district intelligence

INSERT INTO district_context (
    state, district, category, population,
    infrastructure_gap_index, planned_coverage_pct, population_impact_score,
    source_status, source_url
) VALUES
-- 1. Karnataka - Ramanagara (Hero demo district: Ramanagara roads)
('Karnataka', 'Ramanagara', 'roads', 55000, 78.00, 22.00, 72.00, 'demo_synthetic', 'https://indiainvestmentgrid.gov.in/'),
('Karnataka', 'Ramanagara', 'water', 55000, 42.00, 68.00, 50.00, 'demo_synthetic', 'https://data.gov.in/'),
('Karnataka', 'Ramanagara', 'sanitation', 55000, 38.00, 72.00, 45.00, 'demo_synthetic', 'https://data.gov.in/'),
('Karnataka', 'Ramanagara', 'healthcare', 55000, 46.00, 60.00, 55.00, 'demo_synthetic', 'https://data.gov.in/catalog/rural-health-statistics-2017'),
('Karnataka', 'Ramanagara', 'education', 55000, 32.00, 78.00, 40.00, 'demo_synthetic', 'https://data.gov.in/'),
('Karnataka', 'Ramanagara', 'power', 55000, 28.00, 85.00, 38.00, 'demo_synthetic', 'https://indiainvestmentgrid.gov.in/'),

-- 2. Karnataka - Tumakuru
('Karnataka', 'Tumakuru', 'roads', 70000, 40.00, 65.00, 48.00, 'demo_synthetic', 'https://indiainvestmentgrid.gov.in/'),
('Karnataka', 'Tumakuru', 'water', 70000, 44.00, 62.00, 52.00, 'demo_synthetic', 'https://data.gov.in/'),
('Karnataka', 'Tumakuru', 'sanitation', 70000, 34.00, 70.00, 46.00, 'demo_synthetic', 'https://data.gov.in/'),
('Karnataka', 'Tumakuru', 'healthcare', 70000, 48.00, 58.00, 52.00, 'demo_synthetic', 'https://data.gov.in/catalog/rural-health-statistics-2017'),
('Karnataka', 'Tumakuru', 'education', 70000, 66.00, 38.00, 70.00, 'demo_synthetic', 'https://data.gov.in/'),
('Karnataka', 'Tumakuru', 'power', 70000, 34.00, 75.00, 42.00, 'demo_synthetic', 'https://indiainvestmentgrid.gov.in/'),

-- 3. Uttar Pradesh - Bahraich (Hotspot: Bahraich water)
('Uttar Pradesh', 'Bahraich', 'roads', 75000, 50.00, 50.00, 52.00, 'demo_synthetic', 'https://indiainvestmentgrid.gov.in/'),
('Uttar Pradesh', 'Bahraich', 'water', 75000, 84.00, 18.00, 82.00, 'demo_synthetic', 'https://data.gov.in/'),
('Uttar Pradesh', 'Bahraich', 'sanitation', 75000, 56.00, 48.00, 55.00, 'demo_synthetic', 'https://data.gov.in/'),
('Uttar Pradesh', 'Bahraich', 'healthcare', 75000, 60.00, 42.00, 58.00, 'demo_synthetic', 'https://data.gov.in/catalog/rural-health-statistics-2017'),
('Uttar Pradesh', 'Bahraich', 'education', 75000, 52.00, 52.00, 50.00, 'demo_synthetic', 'https://jk.data.gov.in/resource/district-wise-percentage-educational-infrastructure-government-schools-uttar-pradesh-udise'),
('Uttar Pradesh', 'Bahraich', 'power', 75000, 42.00, 60.00, 45.00, 'demo_synthetic', 'https://indiainvestmentgrid.gov.in/'),

-- 4. Uttar Pradesh - Varanasi (Hotspot: Varanasi sanitation)
('Uttar Pradesh', 'Varanasi', 'roads', 80000, 45.00, 70.00, 52.00, 'demo_synthetic', 'https://indiainvestmentgrid.gov.in/'),
('Uttar Pradesh', 'Varanasi', 'water', 80000, 42.00, 68.00, 50.00, 'demo_synthetic', 'https://data.gov.in/'),
('Uttar Pradesh', 'Varanasi', 'sanitation', 80000, 74.00, 32.00, 75.00, 'demo_synthetic', 'https://data.gov.in/'),
('Uttar Pradesh', 'Varanasi', 'healthcare', 80000, 42.00, 75.00, 50.00, 'demo_synthetic', 'https://data.gov.in/catalog/rural-health-statistics-2017'),
('Uttar Pradesh', 'Varanasi', 'education', 80000, 38.00, 72.00, 46.00, 'demo_synthetic', 'https://jk.data.gov.in/resource/district-wise-percentage-educational-infrastructure-government-schools-uttar-pradesh-udise'),
('Uttar Pradesh', 'Varanasi', 'power', 80000, 36.00, 80.00, 44.00, 'demo_synthetic', 'https://indiainvestmentgrid.gov.in/'),

-- 5. Rajasthan - Barmer (Hotspot: Barmer power)
('Rajasthan', 'Barmer', 'roads', 65000, 48.00, 56.00, 50.00, 'demo_synthetic', 'https://indiainvestmentgrid.gov.in/'),
('Rajasthan', 'Barmer', 'water', 65000, 56.00, 45.00, 55.00, 'demo_synthetic', 'https://data.gov.in/'),
('Rajasthan', 'Barmer', 'sanitation', 65000, 45.00, 55.00, 48.00, 'demo_synthetic', 'https://data.gov.in/'),
('Rajasthan', 'Barmer', 'healthcare', 65000, 54.00, 48.00, 52.00, 'demo_synthetic', 'https://data.gov.in/catalog/rural-health-statistics-2017'),
('Rajasthan', 'Barmer', 'education', 65000, 48.00, 55.00, 50.00, 'demo_synthetic', 'https://data.gov.in/'),
('Rajasthan', 'Barmer', 'power', 65000, 82.00, 20.00, 78.00, 'demo_synthetic', 'https://indiainvestmentgrid.gov.in/'),

-- 6. Rajasthan - Dausa (Hotspot: Dausa roads)
('Rajasthan', 'Dausa', 'roads', 60000, 66.00, 38.00, 64.00, 'demo_synthetic', 'https://indiainvestmentgrid.gov.in/'),
('Rajasthan', 'Dausa', 'water', 60000, 48.00, 55.00, 50.00, 'demo_synthetic', 'https://data.gov.in/'),
('Rajasthan', 'Dausa', 'sanitation', 60000, 38.00, 68.00, 42.00, 'demo_synthetic', 'https://data.gov.in/'),
('Rajasthan', 'Dausa', 'healthcare', 60000, 44.00, 60.00, 48.00, 'demo_synthetic', 'https://data.gov.in/catalog/rural-health-statistics-2017'),
('Rajasthan', 'Dausa', 'education', 60000, 42.00, 62.00, 46.00, 'demo_synthetic', 'https://data.gov.in/'),
('Rajasthan', 'Dausa', 'power', 60000, 44.00, 65.00, 48.00, 'demo_synthetic', 'https://indiainvestmentgrid.gov.in/'),

-- 7. Tamil Nadu - Dharmapuri (Hotspot: Dharmapuri healthcare)
('Tamil Nadu', 'Dharmapuri', 'roads', 60000, 46.00, 62.00, 48.00, 'demo_synthetic', 'https://indiainvestmentgrid.gov.in/'),
('Tamil Nadu', 'Dharmapuri', 'water', 60000, 52.00, 55.00, 52.00, 'demo_synthetic', 'https://data.gov.in/'),
('Tamil Nadu', 'Dharmapuri', 'sanitation', 60000, 42.00, 65.00, 45.00, 'demo_synthetic', 'https://data.gov.in/'),
('Tamil Nadu', 'Dharmapuri', 'healthcare', 60000, 76.00, 26.00, 74.00, 'demo_synthetic', 'https://data.gov.in/catalog/rural-health-statistics-2017'),
('Tamil Nadu', 'Dharmapuri', 'education', 60000, 36.00, 74.00, 42.00, 'demo_synthetic', 'https://data.gov.in/'),
('Tamil Nadu', 'Dharmapuri', 'power', 60000, 30.00, 82.00, 38.00, 'demo_synthetic', 'https://indiainvestmentgrid.gov.in/'),

-- 8. Tamil Nadu - Madurai
('Tamil Nadu', 'Madurai', 'roads', 75000, 45.00, 68.00, 55.00, 'demo_synthetic', 'https://indiainvestmentgrid.gov.in/'),
('Tamil Nadu', 'Madurai', 'water', 75000, 55.00, 55.00, 62.00, 'demo_synthetic', 'https://data.gov.in/'),
('Tamil Nadu', 'Madurai', 'sanitation', 75000, 50.00, 62.00, 58.00, 'demo_synthetic', 'https://data.gov.in/'),
('Tamil Nadu', 'Madurai', 'healthcare', 75000, 42.00, 72.00, 54.00, 'demo_synthetic', 'https://data.gov.in/catalog/rural-health-statistics-2017'),
('Tamil Nadu', 'Madurai', 'education', 75000, 38.00, 76.00, 50.00, 'demo_synthetic', 'https://data.gov.in/'),
('Tamil Nadu', 'Madurai', 'power', 75000, 36.00, 78.00, 46.00, 'demo_synthetic', 'https://indiainvestmentgrid.gov.in/')
ON CONFLICT (state, district, category) DO UPDATE SET
    population = EXCLUDED.population,
    infrastructure_gap_index = EXCLUDED.infrastructure_gap_index,
    planned_coverage_pct = EXCLUDED.planned_coverage_pct,
    population_impact_score = EXCLUDED.population_impact_score,
    source_status = EXCLUDED.source_status,
    source_url = EXCLUDED.source_url,
    updated_at = now();
