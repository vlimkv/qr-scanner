import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Метод не поддерживается' });
  }

  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: '❌ Токен отсутствует' });
  }

  try {
    const { data, error } = await supabase
      .from('participants')
      .select('id, name, entered')
      .eq('qr_token', token)
      .single();

    if (error || !data) {
      return res.status(404).json({ message: '❌ Участник не найден' });
    }

    if (data.entered) {
      return res.status(200).json({
        message: `⚠️ Уже заходил: ${data.name}`,
        name: data.name // 👈 ЭТО ТОЖЕ ДОБАВЬ!
      });
    }

    const { error: updateError } = await supabase
      .from('participants')
      .update({ entered: true })
      .eq('id', data.id);

    if (updateError) {
      return res.status(500).json({ message: '🚫 Ошибка при обновлении' });
    }

    return res.status(200).json({
      message: `✅ Вход разрешён: ${data.name}`,
      name: data.name // 👈 ЭТО ДОБАВЬ!
    });
  } catch (err) {
    console.error('❌ Internal error:', err);
    return res.status(500).json({ message: '🚫 Внутренняя ошибка сервера' });
  }
}