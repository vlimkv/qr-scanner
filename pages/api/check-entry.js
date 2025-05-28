import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { token } = req.body;

  const { data, error } = await supabase
    .from('participants')
    .select('id, name, entered')
    .eq('qr_token', token)
    .single();

  if (error || !data) {
    return res.status(404).json({ message: '❌ Участник не найден' });
  }

  if (data.entered) {
    return res.json({ message: `⚠️ Уже зашёл: ${data.name}` });
  }

  await supabase
    .from('participants')
    .update({ entered: true })
    .eq('id', data.id);

  return res.json({ message: `✅ Вход разрешён: ${data.name}` });
}