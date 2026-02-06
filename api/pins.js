let pins = [];
let recentPosts = {};

const TTL = 1000 * 60 * 60 * 24; // 24 hours
const RATE_LIMIT_WINDOW = 1000 * 60 * 5; // 5 minutes
const MAX_PINS_PER_WINDOW = 5;

export default function handler(req, res) {
  const now = Date.now();

  // purge expired pins
  pins = pins.filter(p => now - p.createdAt < TTL);

  // soft rate limit
  const ip = req.headers['x-forwarded-for'] || 'unknown';
  recentPosts[ip] = (recentPosts[ip] || []).filter(
    t => now - t < RATE_LIMIT_WINDOW
  );

  if (req.method === 'POST') {
    if (recentPosts[ip].length >= MAX_PINS_PER_WINDOW) {
      return res.status(429).json({
        error: 'Rate limit exceeded. Please wait a few minutes.'
      });
    }

    const { lat, lng, message } = req.body;

    if (!lat || !lng) {
      return res.status(400).json({ error: 'Invalid pin' });
    }

    const pin = {
      lat,
      lng,
      message: message || '',
      createdAt: now
    };

    pins.push(pin);
    recentPosts[ip].push(now);

    return res.status(201).json(pin);
  }

  if (req.method === 'GET') {
    return res.status(200).json(pins);
  }

  res.status(405).end();
}
