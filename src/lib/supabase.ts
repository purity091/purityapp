import { createClient } from '@supabase/supabase-js';

// القيم المؤقتة للتطوير - ستعمل بعد إضافة قيم Supabase الحقيقية
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';
// A valid Supabase URL and key are enough to enable the data source. The
// explicit flag can still disable it for a deliberate frontend-only build.
const supabaseEnabled = import.meta.env.VITE_USE_SUPABASE !== 'false';
// Realtime is optional. Some browsers, corporate networks and privacy
// extensions block WebSockets even when the Supabase REST/Auth endpoints work.
// The app uses REST polling as the reliable fallback unless Realtime is
// explicitly enabled for the deployment.
const realtimeEnabled = import.meta.env.VITE_ENABLE_REALTIME === 'true';

// تحذير في Console إذا لم تكن القيم موجودة
if (supabaseEnabled && supabaseUrl === 'https://placeholder.supabase.co') {
    console.warn('⚠️ Supabase URL not configured!');
    console.warn('📝 Follow these steps:');
    console.warn('1. Go to https://supabase.com');
    console.warn('2. Create a new project (free)');
    console.warn('3. Get your URL and anon key from Settings → API');
    console.warn('4. Add them to .env file');
    console.warn('5. Restart the dev server');
}

// Frontend-only mode is the safe default; enable Supabase explicitly when it is ready.
const isConfigured = supabaseEnabled && supabaseUrl !== 'https://placeholder.supabase.co' && supabaseAnonKey !== 'placeholder-key';

// Keep the GoTrue session in the browser so customer accounts survive reloads.
// AuthContext performs a single initial session read and then listens for
// changes, keeping the number of auth requests small.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
    },
});
export const isSupabaseConfigured = () => isConfigured;
export const isRealtimeEnabled = () => isConfigured && realtimeEnabled;
