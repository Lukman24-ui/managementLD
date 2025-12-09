-- Create table for travel milestones/places to visit
CREATE TABLE public.travel_milestones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  couple_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  photo_url TEXT,
  photo_caption TEXT,
  visited BOOLEAN DEFAULT false,
  visited_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.travel_milestones ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Couple members can view milestones"
ON public.travel_milestones
FOR SELECT
USING (couple_id = get_user_couple_id(auth.uid()));

CREATE POLICY "Couple members can insert milestones"
ON public.travel_milestones
FOR INSERT
WITH CHECK (couple_id = get_user_couple_id(auth.uid()));

CREATE POLICY "Couple members can update milestones"
ON public.travel_milestones
FOR UPDATE
USING (couple_id = get_user_couple_id(auth.uid()));

CREATE POLICY "Couple members can delete milestones"
ON public.travel_milestones
FOR DELETE
USING (couple_id = get_user_couple_id(auth.uid()));

-- Create trigger for updated_at
CREATE TRIGGER update_travel_milestones_updated_at
BEFORE UPDATE ON public.travel_milestones
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for milestone photos
INSERT INTO storage.buckets (id, name, public) VALUES ('milestone-photos', 'milestone-photos', true);

-- Storage policies for milestone photos
CREATE POLICY "Anyone can view milestone photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'milestone-photos');

CREATE POLICY "Authenticated users can upload milestone photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'milestone-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update own milestone photos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'milestone-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete own milestone photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'milestone-photos' AND auth.role() = 'authenticated');

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.travel_milestones;