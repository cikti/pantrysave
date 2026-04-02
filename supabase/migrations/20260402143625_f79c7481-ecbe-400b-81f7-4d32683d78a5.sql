-- Drop the restrictive SELECT policy
DROP POLICY "Users can view own profile" ON public.profiles;

-- Create a new policy allowing all authenticated users to view any profile
CREATE POLICY "Profiles are viewable by authenticated users"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);