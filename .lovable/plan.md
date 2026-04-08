

# Add Google Sign-In to PantrySave

## Overview
Add a "Sign in with Google" button to the login and signup pages using Lovable Cloud's managed Google OAuth. No API keys or external setup needed — Lovable Cloud handles Google credentials automatically.

## Steps

### 1. Configure Social Auth (Tool Call)
Use the **Configure Social Login** tool to generate the `src/integrations/lovable/` module and install the `@lovable.dev/cloud-auth-js` package. This provides `lovable.auth.signInWithOAuth("google", ...)`.

### 2. Update Login Page (`src/pages/LoginPage.tsx`)
- Keep the entire existing email/password form untouched
- After the "Sign In" button, add:
  - An "OR" divider (horizontal line with "OR" text centered)
  - A "Sign in with Google" button with Google icon (SVG)
- The Google button calls `lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin })`
- Handle errors with toast/error state
- On success, navigate to `/`

### 3. Update Signup Page (`src/pages/SignupPage.tsx`)
- Keep the entire existing signup form untouched
- After the "Create Account" button, add the same "OR" divider and "Sign in with Google" button
- Same handler logic as login page

### 4. Auth Context — No Changes Needed
The existing `AuthContext` uses `supabase.auth.onAuthStateChange` which automatically picks up Google OAuth sessions. The `handle_new_user` database trigger already creates a profile row for new users. No changes needed.

### 5. Zero-State for New Google Users
Already handled by existing system:
- `handle_new_user()` trigger creates profile
- `user_impact` rows default to zero (created on first access)
- `user_points` defaults to zero
- Cart, orders, vouchers start empty

## Technical Notes
- Uses `lovable.auth.signInWithOAuth("google")` — NOT `supabase.auth.signInWithOAuth`
- No Firebase needed — Lovable Cloud manages Google OAuth natively
- Sign out already works for all auth methods via `supabase.auth.signOut()`
- No database migrations needed
- No existing features are modified

