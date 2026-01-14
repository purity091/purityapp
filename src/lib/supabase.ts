import { createClient } from '@supabase/supabase-js';

// القيم المؤقتة للتطوير - ستعمل بعد إضافة قيم Supabase الحقيقية
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

// تحذير  في Console إذا لم تكن القيم موجودة
if (supabaseUrl === 'https://placeholder.supabase.co') {
    console.warn('⚠️ Supabase URL not configured!');
    console.warn('📝 Follow these steps:');
    console.warn('1. Go to https://supabase.com');
    console.warn('2. Create a new project (free)');
    console.warn('3. Get your URL and anon key from Settings → API');
    console.warn('4. Add them to .env file');
    console.warn('5. Restart the dev server');
}

const isConfigured = supabaseUrl !== 'https://placeholder.supabase.co' && supabaseAnonKey !== 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export const isSupabaseConfigured = () => isConfigured;
