import { createClient } from 'npm:@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

function secureInt(max: number): number {
  const x = new Uint32Array(1);
  const lim = Math.floor(0x100000000 / max) * max;
  do { crypto.getRandomValues(x); } while (x[0] >= lim);
  return x[0] % max;
}
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = secureInt(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function b64url(o: unknown): string {
  const bytes = new TextEncoder().encode(JSON.stringify(o));
  let bin = '';
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

const html = `
<div style="background:#010a13;padding:24px;font-family:Arial,sans-serif;color:#f0e6d2;text-align:center">
  <div style="max-width:480px;margin:auto;border:1px solid #c8aa6e;border-radius:12px;padding:24px;background:#091428">
    <div style="font-size:42px">🎄🎁</div>
    <h1 style="color:#c8aa6e;font-family:Georgia,serif;margin:8px 0">LoL Secret Santa 2026</h1>
    <p>¡Hola, <strong>{{params.NAME}}</strong>! El sorteo de <strong>{{params.ROOM}}</strong> ya se realizó.</p>
    <p>Tu misión navideña te espera, invocador. Nadie más sabe a quién le tocó regalarte… ni quién te regalará a ti.</p>
    <a href="{{params.LINK}}" style="display:inline-block;margin:16px 0;padding:14px 26px;background:#c8aa6e;color:#010a13;
       text-decoration:none;font-weight:bold;border-radius:8px">🎁 Abrir mi regalo</a>
    <p style="font-size:13px;opacity:.8">Fecha del intercambio: {{params.DATE}}<br>Guarda este correo y no lo reenvíes 🤫</p>
    <p style="font-size:11px;opacity:.5;word-break:break-all">Si el botón no funciona, copia este enlace:<br>{{params.LINK}}</p>
  </div>
</div>`;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  let roomId = '';
  let started = false;

  try {
    const { room_id, admin_token, site_url } = await req.json();
    roomId = room_id;
    if (!/^https?:\/\//.test(site_url ?? '')) return json({ error: 'URL del sitio inválida' }, 400);

    const { data, error } = await sb.rpc('begin_draw', { p_room: room_id, p_token: admin_token });
    if (error) return json({ error: error.message }, 400);
    started = true;

    const room = data.room as { name: string; reveal_date: string };
    const people = data.participants as { nickname: string; riot_id: string; email: string }[];

    // Ciclo aleatorio único: A→B→C→…→A (nadie a sí mismo, sin regalos mutuos). NO se guarda ni se registra.
    const order = shuffle(people);
    const messageVersions = order.map((giver, i) => {
      const target = order[(i + 1) % order.length];
      const link = `${site_url}#/regalo/${b64url({
        g: giver.nickname, t: target.nickname, r: target.riot_id, d: room.reveal_date, s: room.name,
      })}`;
      return {
        to: [{ email: giver.email, name: giver.nickname }],
        params: { NAME: giver.nickname, ROOM: room.name, DATE: room.reveal_date, LINK: link },
      };
    });

    // Un solo envío por lote: o salen todos o no sale ninguno
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'api-key': Deno.env.get('BREVO_API_KEY')!, 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({
        sender: { email: Deno.env.get('SENDER_EMAIL'), name: Deno.env.get('SENDER_NAME') ?? 'LoL Secret Santa' },
        subject: '🎁 Tu misión navideña te espera, invocador',
        htmlContent: html,
        messageVersions,
      }),
    });
    if (!res.ok) throw new Error('El proveedor de correo rechazó el envío');

    await sb.rpc('finish_draw', { p_room: room_id });
    return json({ ok: true, sent: people.length });
  } catch (_e) {
    if (started) await sb.rpc('abort_draw', { p_room: roomId });
    return json({ error: 'No se pudieron enviar los correos. El sorteo se canceló, intenta de nuevo.' }, 500);
  }
});