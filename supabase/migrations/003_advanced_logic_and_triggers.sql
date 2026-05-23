-- 3. RPC FUNCTION: Cancel Booking (Frontend calls this)
CREATE OR REPLACE FUNCTION cancel_booking(p_booking_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- We just update the status. 
    -- Your amazing trigger (enforce_2_hour_cancellation) will automatically 
    -- catch this, check the time, and free the seat!
    UPDATE bookings
    SET status = 'cancelled'
    WHERE id = p_booking_id AND user_id = auth.uid();
END;
$$;


-- 4. RPC FUNCTION: Reschedule Flight
CREATE OR REPLACE FUNCTION reschedule_flight(
    p_booking_id UUID,
    p_new_flight_id UUID,
    p_fee DECIMAL
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_old_flight_id UUID;
    v_old_seat_id UUID;
    v_departs_at TIMESTAMPTZ;
BEGIN
    -- Get current booking details
    SELECT flight_id, seat_id INTO v_old_flight_id, v_old_seat_id
    FROM bookings 
    WHERE id = p_booking_id AND user_id = auth.uid();

    -- Check the 2-hour rule for rescheduling as well!
    SELECT departs_at INTO v_departs_at FROM flights WHERE id = v_old_flight_id;
    IF v_departs_at <= (now() + interval '2 hours') THEN
        RAISE EXCEPTION 'Rescheduling within 2 hours of departure is not permitted.';
    END IF;

    -- Free up the old seat
    UPDATE seats SET is_available = true WHERE id = v_old_seat_id;

    -- Log the reschedule into your reschedules table
    INSERT INTO reschedules (booking_id, old_flight_id, new_flight_id, fee_charged)
    VALUES (p_booking_id, v_old_flight_id, p_new_flight_id, p_fee);

    -- Update the booking with the new flight and status
    UPDATE bookings 
    SET flight_id = p_new_flight_id, 
        status = 'rescheduled', 
        total_price = total_price + p_fee,
        seat_id = NULL -- They will need a new seat on the new flight!
    WHERE id = p_booking_id;
END;
$$;