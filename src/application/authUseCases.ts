import { supabase } from '../infrastructure/supabase/client'

export const authUseCases = {
  getSession: () => supabase.auth.getSession(),
  onAuthStateChange: supabase.auth.onAuthStateChange.bind(supabase.auth),
  signInWithPassword: supabase.auth.signInWithPassword.bind(supabase.auth),
  signOut: supabase.auth.signOut.bind(supabase.auth),
}
