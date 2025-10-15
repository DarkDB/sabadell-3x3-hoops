-- Function to automatically update team records when a match is completed
CREATE OR REPLACE FUNCTION public.update_team_records()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  old_status text;
  new_status text;
  home_won boolean;
  away_won boolean;
BEGIN
  old_status := OLD.status;
  new_status := NEW.status;
  
  -- Only process if status changed to 'completed' and we have scores
  IF new_status = 'completed' AND old_status != 'completed' 
     AND NEW.home_score IS NOT NULL AND NEW.away_score IS NOT NULL THEN
    
    home_won := NEW.home_score > NEW.away_score;
    away_won := NEW.away_score > NEW.home_score;
    
    -- Update home team
    IF home_won THEN
      UPDATE teams 
      SET wins = wins + 1 
      WHERE id = NEW.home_team_id;
    ELSIF away_won THEN
      UPDATE teams 
      SET losses = losses + 1 
      WHERE id = NEW.home_team_id;
    END IF;
    
    -- Update away team
    IF away_won THEN
      UPDATE teams 
      SET wins = wins + 1 
      WHERE id = NEW.away_team_id;
    ELSIF home_won THEN
      UPDATE teams 
      SET losses = losses + 1 
      WHERE id = NEW.away_team_id;
    END IF;
    
  -- Handle when match status goes back from completed (undo the record update)
  ELSIF old_status = 'completed' AND new_status != 'completed' 
     AND OLD.home_score IS NOT NULL AND OLD.away_score IS NOT NULL THEN
    
    home_won := OLD.home_score > OLD.away_score;
    away_won := OLD.away_score > OLD.home_score;
    
    -- Revert home team
    IF home_won THEN
      UPDATE teams 
      SET wins = GREATEST(wins - 1, 0)
      WHERE id = OLD.home_team_id;
    ELSIF away_won THEN
      UPDATE teams 
      SET losses = GREATEST(losses - 1, 0)
      WHERE id = OLD.home_team_id;
    END IF;
    
    -- Revert away team
    IF away_won THEN
      UPDATE teams 
      SET wins = GREATEST(wins - 1, 0)
      WHERE id = OLD.away_team_id;
    ELSIF home_won THEN
      UPDATE teams 
      SET losses = GREATEST(losses - 1, 0)
      WHERE id = OLD.away_team_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to automatically update team records
DROP TRIGGER IF EXISTS trigger_update_team_records ON matches;
CREATE TRIGGER trigger_update_team_records
  AFTER UPDATE ON matches
  FOR EACH ROW
  EXECUTE FUNCTION public.update_team_records();