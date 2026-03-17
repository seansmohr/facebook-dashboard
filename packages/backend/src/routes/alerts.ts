import { Router } from 'express';
import db from '../db';
import { generateAlerts } from '../services/alertEngine';

const router = Router();

// GET /api/alerts
router.get('/', (_req, res) => {
  const weeks = db.prepare('SELECT * FROM weeks ORDER BY id ASC').all() as any[];
  const allAlerts: any[] = [];

  for (let i = 0; i < weeks.length; i++) {
    const prev = i > 0 ? weeks[i - 1] : null;
    const alerts = generateAlerts(weeks[i], prev);
    allAlerts.push(...alerts);
  }

  res.json({ success: true, data: allAlerts });
});

// POST /api/alerts/dismiss
router.post('/dismiss', (req, res) => {
  const { id } = req.body;
  if (id) {
    db.prepare('UPDATE alerts SET dismissed = 1 WHERE id = ?').run(id);
  }
  res.json({ success: true });
});

export default router;
