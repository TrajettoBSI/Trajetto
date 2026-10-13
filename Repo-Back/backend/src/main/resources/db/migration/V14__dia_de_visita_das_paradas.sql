ALTER TABLE places
    ADD COLUMN visit_date DATE NULL;

UPDATE places p
JOIN itineraries i ON i.id = p.itinerary_id
SET p.visit_date = i.start_date
WHERE p.visit_date IS NULL;
