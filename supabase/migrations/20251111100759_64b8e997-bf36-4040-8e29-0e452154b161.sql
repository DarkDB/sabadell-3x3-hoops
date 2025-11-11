-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL, -- 'new_match', 'match_update', 'match_completed', 'general'
  related_match_id uuid,
  read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own notifications"
  ON public.notifications
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON public.notifications
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
  ON public.notifications
  FOR INSERT
  WITH CHECK (true);

-- Enable realtime
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Function to get team captain user_id
CREATE OR REPLACE FUNCTION get_team_captain_user_id(team_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT tr.user_id
  FROM teams t
  JOIN team_registrations tr ON tr.team_name = t.name
  WHERE t.id = team_id
  LIMIT 1;
$$;

-- Function to notify team members about new match
CREATE OR REPLACE FUNCTION notify_new_match()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  home_captain_id uuid;
  away_captain_id uuid;
  league_name text;
BEGIN
  -- Get league name
  SELECT name INTO league_name FROM leagues WHERE id = NEW.league_id;
  
  -- Get team captains
  home_captain_id := get_team_captain_user_id(NEW.home_team_id);
  away_captain_id := get_team_captain_user_id(NEW.away_team_id);
  
  -- Notify home team captain
  IF home_captain_id IS NOT NULL THEN
    INSERT INTO notifications (user_id, title, message, type, related_match_id)
    VALUES (
      home_captain_id,
      '🏀 Nuevo Partido Programado',
      'Tu equipo tiene un nuevo partido programado en ' || league_name || ' el ' || 
      to_char(NEW.match_date, 'DD/MM/YYYY HH24:MI'),
      'new_match',
      NEW.id
    );
  END IF;
  
  -- Notify away team captain
  IF away_captain_id IS NOT NULL THEN
    INSERT INTO notifications (user_id, title, message, type, related_match_id)
    VALUES (
      away_captain_id,
      '🏀 Nuevo Partido Programado',
      'Tu equipo tiene un nuevo partido programado en ' || league_name || ' el ' || 
      to_char(NEW.match_date, 'DD/MM/YYYY HH24:MI'),
      'new_match',
      NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Function to notify about match updates
CREATE OR REPLACE FUNCTION notify_match_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  home_captain_id uuid;
  away_captain_id uuid;
  notification_msg text;
BEGIN
  -- Only notify if match date or location changed
  IF OLD.match_date != NEW.match_date OR OLD.location != NEW.location THEN
    home_captain_id := get_team_captain_user_id(NEW.home_team_id);
    away_captain_id := get_team_captain_user_id(NEW.away_team_id);
    
    IF OLD.match_date != NEW.match_date THEN
      notification_msg := '⏰ Cambio de horario: Tu partido ha sido reprogramado para el ' || 
                         to_char(NEW.match_date, 'DD/MM/YYYY HH24:MI');
    ELSE
      notification_msg := '📍 Cambio de ubicación: Tu partido ahora será en ' || NEW.location;
    END IF;
    
    -- Notify home team
    IF home_captain_id IS NOT NULL THEN
      INSERT INTO notifications (user_id, title, message, type, related_match_id)
      VALUES (home_captain_id, 'Actualización de Partido', notification_msg, 'match_update', NEW.id);
    END IF;
    
    -- Notify away team
    IF away_captain_id IS NOT NULL THEN
      INSERT INTO notifications (user_id, title, message, type, related_match_id)
      VALUES (away_captain_id, 'Actualización de Partido', notification_msg, 'match_update', NEW.id);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Function to notify about completed matches
CREATE OR REPLACE FUNCTION notify_match_completed()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  home_captain_id uuid;
  away_captain_id uuid;
  home_team_name text;
  away_team_name text;
BEGIN
  -- Only notify when status changes to completed
  IF OLD.status != 'completed' AND NEW.status = 'completed' THEN
    home_captain_id := get_team_captain_user_id(NEW.home_team_id);
    away_captain_id := get_team_captain_user_id(NEW.away_team_id);
    
    SELECT name INTO home_team_name FROM teams WHERE id = NEW.home_team_id;
    SELECT name INTO away_team_name FROM teams WHERE id = NEW.away_team_id;
    
    -- Notify home team
    IF home_captain_id IS NOT NULL THEN
      INSERT INTO notifications (user_id, title, message, type, related_match_id)
      VALUES (
        home_captain_id,
        '✅ Partido Finalizado',
        'Resultado final: ' || home_team_name || ' ' || COALESCE(NEW.home_score::text, '0') || 
        ' - ' || COALESCE(NEW.away_score::text, '0') || ' ' || away_team_name,
        'match_completed',
        NEW.id
      );
    END IF;
    
    -- Notify away team
    IF away_captain_id IS NOT NULL THEN
      INSERT INTO notifications (user_id, title, message, type, related_match_id)
      VALUES (
        away_captain_id,
        '✅ Partido Finalizado',
        'Resultado final: ' || home_team_name || ' ' || COALESCE(NEW.home_score::text, '0') || 
        ' - ' || COALESCE(NEW.away_score::text, '0') || ' ' || away_team_name,
        'match_completed',
        NEW.id
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create triggers
CREATE TRIGGER on_match_created
  AFTER INSERT ON matches
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_match();

CREATE TRIGGER on_match_updated
  AFTER UPDATE ON matches
  FOR EACH ROW
  EXECUTE FUNCTION notify_match_update();

CREATE TRIGGER on_match_completed
  AFTER UPDATE ON matches
  FOR EACH ROW
  EXECUTE FUNCTION notify_match_completed();