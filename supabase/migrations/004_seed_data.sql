-- Insert 8 Flights across 4 Indian routes
INSERT INTO flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, base_price)
VALUES
('AI-101', 'DEL', 'BOM', now() + interval '1 day', now() + interval '1 day 2 hours', 'Boeing 737', 5000.00),
('AI-102', 'DEL', 'BOM', now() + interval '2 days', now() + interval '2 days 2 hours', 'Airbus A320', 4500.00),
('AI-201', 'BOM', 'DEL', now() + interval '1 day 4 hours', now() + interval '1 day 6 hours', 'Boeing 737', 5200.00),
('AI-202', 'BOM', 'DEL', now() + interval '2 days 4 hours', now() + interval '2 days 6 hours', 'Airbus A320', 4800.00),
('AI-301', 'BLR', 'DEL', now() + interval '3 days', now() + interval '3 days 3 hours', 'Boeing 737', 6000.00),
('AI-302', 'BLR', 'DEL', now() + interval '4 days', now() + interval '4 days 3 hours', 'Airbus A320', 5800.00),
('AI-401', 'DEL', 'BLR', now() + interval '3 days 5 hours', now() + interval '3 days 8 hours', 'Boeing 737', 6100.00),
('AI-402', 'DEL', 'BLR', now() + interval '4 days 5 hours', now() + interval '4 days 8 hours', 'Airbus A320', 5900.00);

-- Magically generate 60 seats (10 rows, A-F) for every flight
DO $$
DECLARE
    f_record RECORD;
    r INT;
    c TEXT;
    seat_class VARCHAR;
    fee DECIMAL;
BEGIN
    FOR f_record IN SELECT id FROM flights LOOP
        -- 10 Rows
        FOR r IN 1..10 LOOP
            -- 6 Seats per row explicitly unnested from an array
            FOR c IN SELECT unnest(ARRAY['A', 'B', 'C', 'D', 'E', 'F']) LOOP
                -- Assign cabin classes dynamically
                IF r <= 2 THEN
                    seat_class := 'first';
                    fee := 3000.00;
                ELSIF r <= 5 THEN
                    seat_class := 'business';
                    fee := 1500.00;
                ELSE
                    seat_class := 'economy';
                    fee := 0.00;
                END IF;

                INSERT INTO seats (flight_id, seat_number, class, extra_fee)
                VALUES (f_record.id, r || c, seat_class, fee);
            END LOOP;
        END LOOP;
    END LOOP;
END;
$$;