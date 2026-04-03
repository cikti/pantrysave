
INSERT INTO public.profiles (id, name)
SELECT u.id, COALESCE(u.raw_user_meta_data->>'name', '')
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;
