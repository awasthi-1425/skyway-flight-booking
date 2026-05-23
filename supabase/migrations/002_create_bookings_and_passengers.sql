-- Create the bookings table
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL, 
  flight_id UUID REFERENCES flights(id) ON DELETE CASCADE,
  seat_id UUID REFERENCES seats(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'rescheduled', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT now(), -- FIXED: Changed from booked_at to created_at
  total_price DECIMAL(10, 2) NOT NULL,
  pnr_code VARCHAR(10) UNIQUE NOT NULL
);

-- Create the passengers table
CREATE TABLE passengers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  first_name VARCHAR(100) NOT NULL, -- FIXED: Split to match frontend UI
  last_name VARCHAR(100) NOT NULL,  -- FIXED: Split to match frontend UI
  email VARCHAR(255) NOT NULL,      -- ADDED: We collect this in the UI
  passport_no VARCHAR(50),          -- FIXED: Removed NOT NULL
  nationality VARCHAR(50),          -- FIXED: Removed NOT NULL
  dob DATE                          -- FIXED: Removed NOT NULL
);

-- Create the reschedules table
CREATE TABLE reschedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  old_flight_id UUID REFERENCES flights(id),
  new_flight_id UUID REFERENCES flights(id),
  requested_at TIMESTAMPTZ DEFAULT now(),
  fee_charged DECIMAL(10, 2) DEFAULT 0.00
);

-- Enable Row Level Security (RLS)
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE passengers ENABLE ROW LEVEL SECURITY;
ALTER TABLE reschedules ENABLE ROW LEVEL SECURITY;

-- Create strict RLS Policies
CREATE POLICY "Users can manage their own bookings" 
ON bookings FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage passengers for their bookings" 
ON passengers FOR ALL USING (
  EXISTS (SELECT 1 FROM bookings WHERE bookings.id = passengers.booking_id AND bookings.user_id = auth.uid())
);

CREATE POLICY "Users can manage their own reschedules" 
ON reschedules FOR ALL USING (
  EXISTS (SELECT 1 FROM bookings WHERE bookings.id = reschedules.booking_id AND bookings.user_id = auth.uid())
);