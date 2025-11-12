-- Add age and email columns to players table
ALTER TABLE public.players 
ADD COLUMN age integer,
ADD COLUMN email text;

-- Add a check constraint to ensure age is reasonable if provided
ALTER TABLE public.players
ADD CONSTRAINT players_age_check CHECK (age IS NULL OR (age >= 10 AND age <= 100));