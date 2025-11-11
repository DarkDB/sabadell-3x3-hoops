-- Fix search_path for security definer functions
CREATE OR REPLACE FUNCTION get_team_captain_user_id(team_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT tr.user_id
  FROM teams t
  JOIN team_registrations tr ON tr.team_name = t.name
  WHERE t.id = team_id
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION notify_new_match()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  home_captain_id uuid;
  away_captain_id uuid;
  league_name text;
BEGIN
  SELECT name INTO league_name FROM leagues WHERE id = NEW.league_id;
  
  home_captain_id := get_team_captain_user_id(NEW.home_team_id);
  away_captain_id := get_team_captain_user_id(NEW.away_team_id);
  
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

CREATE OR REPLACE FUNCTION notify_match_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  home_captain_id uuid;
  away_captain_id uuid;
  notification_msg text;
BEGIN
  IF OLD.match_date != NEW.match_date OR OLD.location != NEW.location THEN
    home_captain_id := get_team_captain_user_id(NEW.home_team_id);
    away_captain_id := get_team_captain_user_id(NEW.away_team_id);
    
    IF OLD.match_date != NEW.match_date THEN
      notification_msg := '⏰ Cambio de horario: Tu partido ha sido reprogramado para el ' || 
                         to_char(NEW.match_date, 'DD/MM/YYYY HH24:MI');
    ELSE
      notification_msg := '📍 Cambio de ubicación: Tu partido ahora será en ' || NEW.location;
    END IF;
    
    IF home_captain_id IS NOT NULL THEN
      INSERT INTO notifications (user_id, title, message, type, related_match_id)
      VALUES (home_captain_id, 'Actualización de Partido', notification_msg, 'match_update', NEW.id);
    END IF;
    
    IF away_captain_id IS NOT NULL THEN
      INSERT INTO notifications (user_id, title, message, type, related_match_id)
      VALUES (away_captain_id, 'Actualización de Partido', notification_msg, 'match_update', NEW.id);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION notify_match_completed()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  home_captain_id uuid;
  away_captain_id uuid;
  home_team_name text;
  away_team_name text;
BEGIN
  IF OLD.status != 'completed' AND NEW.status = 'completed' THEN
    home_captain_id := get_team_captain_user_id(NEW.home_team_id);
    away_captain_id := get_team_captain_user_id(NEW.away_team_id);
    
    SELECT name INTO home_team_name FROM teams WHERE id = NEW.home_team_id;
    SELECT name INTO away_team_name FROM teams WHERE id = NEW.away_team_id;
    
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