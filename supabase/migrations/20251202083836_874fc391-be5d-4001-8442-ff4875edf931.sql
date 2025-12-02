-- Add age_category and gender columns to leagues table
ALTER TABLE public.leagues 
ADD COLUMN age_category text,
ADD COLUMN gender text;

-- Add comments for documentation
COMMENT ON COLUMN public.leagues.age_category IS 'Age category for the league (e.g., Sub-18, Sub-21, Senior, Veteranos)';
COMMENT ON COLUMN public.leagues.gender IS 'Gender category for the league (e.g., Masculino, Femenino, Mixto)';