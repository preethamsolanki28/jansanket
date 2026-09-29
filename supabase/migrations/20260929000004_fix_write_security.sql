-- Migration: 20260929000004_fix_write_security.sql
-- Goal: Fix Database Write Security
-- Restricts citizen_requests INSERT access strictly to service_role.
-- Completely blocks anonymous/browser-client direct inserts, ensuring all writes must traverse server-side validation.

DROP POLICY IF EXISTS "Allow insert on citizen_requests" ON citizen_requests;
DROP POLICY IF EXISTS "Allow public insert on citizen_requests" ON citizen_requests;

CREATE POLICY "Allow service_role insert on citizen_requests"
    ON citizen_requests FOR INSERT
    TO service_role
    WITH CHECK (true);
