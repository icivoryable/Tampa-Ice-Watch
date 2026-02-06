// api/pins.js

let pins = [];

// auto-expire after 24 hours
const TTL = 1000 * 60 * 60 * 24;

export default function handler(req, res) {
  const now = Date.now();

  // purge expired pins
  pins = pins.filter(p => now - p.createdAt < TTL);

  if (req.method === 'GET') {
    return res.status(200).json(pins);
  }

  if (req.method === 'POST') {
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
    return res.status(201).json(pin);
  }

  res.status(405).end();
}
