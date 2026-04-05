export interface Env {
	DB: D1Database;
	ASSETS: Fetcher;
}

interface GuestbookEntry {
	id: number;
	nickname: string;
	emoji: string;
	message: string;
	created_at: string;
}

const CORS_HEADERS = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type',
};

function json(data: unknown, status = 200): Response {
	return new Response(JSON.stringify(data), {
		status,
		headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
	});
}

async function hashIP(ip: string): Promise<string> {
	const data = new TextEncoder().encode(ip + '_blake_fan_salt');
	const hash = await crypto.subtle.digest('SHA-256', data);
	return Array.from(new Uint8Array(hash).slice(0, 8))
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('');
}

async function getEntries(env: Env, url: URL): Promise<Response> {
	const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100);
	const offset = parseInt(url.searchParams.get('offset') || '0');

	const { results } = await env.DB.prepare(
		'SELECT id, nickname, emoji, message, created_at FROM guestbook ORDER BY created_at DESC LIMIT ? OFFSET ?'
	)
		.bind(limit, offset)
		.all<GuestbookEntry>();

	return json(results);
}

async function createEntry(request: Request, env: Env): Promise<Response> {
	const body = await request.json<{ nickname?: string; emoji?: string; message?: string }>();

	const nickname = (body.nickname || '').trim();
	const message = (body.message || '').trim();
	const emoji = body.emoji || '💖';

	if (!nickname || !message) {
		return json({ error: '닉네임과 메시지를 모두 입력해주세요.' }, 400);
	}
	if (nickname.length > 20) {
		return json({ error: '닉네임은 20자 이하로 입력해주세요.' }, 400);
	}
	if (message.length > 500) {
		return json({ error: '메시지는 500자 이하로 입력해주세요.' }, 400);
	}

	const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
	const ipHash = await hashIP(clientIP);

	// Rate limit: 1 message per 30 seconds per IP
	const recent = await env.DB.prepare(
		"SELECT COUNT(*) as cnt FROM guestbook WHERE ip_hash = ? AND created_at > datetime('now', '-30 seconds')"
	)
		.bind(ipHash)
		.first<{ cnt: number }>();

	if (recent && recent.cnt > 0) {
		return json({ error: '잠시 후 다시 시도해주세요.' }, 429);
	}

	await env.DB.prepare('INSERT INTO guestbook (nickname, emoji, message, ip_hash) VALUES (?, ?, ?, ?)')
		.bind(nickname, emoji, message, ipHash)
		.run();

	return json({ success: true }, 201);
}

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const url = new URL(request.url);

		if (request.method === 'OPTIONS') {
			return new Response(null, { status: 204, headers: CORS_HEADERS });
		}

		if (url.pathname === '/api/guestbook') {
			try {
				if (request.method === 'GET') return await getEntries(env, url);
				if (request.method === 'POST') return await createEntry(request, env);
				return json({ error: 'Method not allowed' }, 405);
			} catch (e) {
				console.error(e);
				return json({ error: '서버 오류가 발생했습니다.' }, 500);
			}
		}

		return env.ASSETS.fetch(request);
	},
} satisfies ExportedHandler<Env>;
