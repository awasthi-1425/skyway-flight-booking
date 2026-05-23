-- Create the flights table
CREATE TABLE flights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flight_no VARCHAR(50) NOT NULL,
  origin VARCHAR(100) NOT NULL,
  destination VARCHAR(100) NOT NULL,
  departs_at TIMESTAMPTZ NOT NULL,
  arrives_at TIMESTAMPTZ NOT NULL,
  aircraft_type VARCHAR(100),
  status VARCHAR(50) DEFAULT 'Scheduled',
  base_price DECIMAL(10, 2) NOT NULL
);

-- Create the seats table
CREATE TABLE seats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flight_id UUID REFERENCES flights(id) ON DELETE CASCADE,
  seat_number VARCHAR(10) NOT NULL,
  class VARCHAR(50) CHECK (class IN ('economy', 'business', 'first')),
  is_available BOOLEAN DEFAULT true,
  extra_fee DECIMAL(10, 2) DEFAULT 0.00
);

-- Enable Row Level Security (RLS)
ALTER TABLE flights ENABLE ROW LEVEL SECURITY;
ALTER TABLE seats ENABLE ROW LEVEL SECURITY;

-- Allow public read access to flights and seats (users need to see them to book!)
CREATE POLICY "Flights are viewable by everyone" ON flights FOR SELECT USING (true);
CREATE POLICY "Seats are viewable by everyone" ON seats FOR SELECT USING (true);