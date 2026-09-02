import { createClient } from '@supabase/supabase-js';

// القيم المؤقتة للتطوير - ستعمل بعد إضافة قيم Supabase الحقيقية
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';
const supabaseEnabled = import.meta.env.VITE_USE_SUPABASE === 'true';

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

// This app uses its own lightweight admin session in AuthContext. Supabase is
// currently used only as a database client, so do not let GoTrue create or
// refresh a browser auth session (which can contend for Navigator locks across
// tabs and leave an unhandled LockAcquireTimeoutError in the console).
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
    },
});
export const isSupabaseConfigured = () => isConfigured;
