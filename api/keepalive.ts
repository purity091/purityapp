import { createClient } from '@supabase/supabase-js';

type VercelRequest = {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
};

type VercelResponse = {
  status: (code: number) => VercelResponse;
  json: (body: unknown) => void;
};

const getHeader = (request: VercelRequest, name: string) => {
  const value = request.headers[name] ?? request.headers[name.toLowerCase()];
  return Array.isArray(value) ? value[0] : value;
};

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  const cronSecret = process.env.CRON_SECRET;
  const authorization = getHeader(request, 'authorization');

  if (!cronSecret || authorization !== `Bearer ${cronSecret}`) {
    return response.status(401).json({ error: 'Unauthorized' });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return response.status(500).json({ error: 'Supabase server credentials are not configured' });
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { error } = await supabase.from('bookings').select('id').limit(1);

  if (error) {
    console.error('Supabase keepalive query failed:', error.message);
    return response.status(502).json({ error: 'Supabase keepalive query failed' });
  }

  return response.status(200).json({ ok: true, checkedAt: new Date().toISOString() });
}
