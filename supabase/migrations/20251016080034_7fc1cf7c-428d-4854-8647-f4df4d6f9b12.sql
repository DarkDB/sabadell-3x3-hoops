-- Create team_registrations table
CREATE TABLE public.team_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  team_name TEXT NOT NULL,
  captain_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  league_id UUID NOT NULL REFERENCES public.leagues(id),
  number_of_players INTEGER NOT NULL,
  message TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  payment_proof_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create players table
CREATE TABLE public.players (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_registration_id UUID NOT NULL REFERENCES public.team_registrations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  jersey_number INTEGER,
  position TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.team_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;

-- RLS Policies for team_registrations
CREATE POLICY "Users can view their own registrations"
  ON public.team_registrations
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own registrations"
  ON public.team_registrations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own registrations"
  ON public.team_registrations
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all registrations"
  ON public.team_registrations
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage all registrations"
  ON public.team_registrations
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for players
CREATE POLICY "Users can view their own team players"
  ON public.players
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.team_registrations
      WHERE team_registrations.id = players.team_registration_id
      AND team_registrations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their own team players"
  ON public.players
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.team_registrations
      WHERE team_registrations.id = players.team_registration_id
      AND team_registrations.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all players"
  ON public.players
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage all players"
  ON public.players
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_team_registrations_updated_at
  BEFORE UPDATE ON public.team_registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();