const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');

// GET /api/search/boards/:boardId — search cards with filters
// Query params: q, label, memberId, dueDate (overdue|soon|none)
router.get('/boards/:boardId', async (req, res, next) => {
  try {
    const { q, label, memberId, dueDate } = req.query;
    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    // Build where clause dynamically
    const where = {
      archived: false,
      list: { boardId: req.params.boardId },
    };

    if (q) {
      where.title = { contains: q, mode: 'insensitive' };
    }
    if (label) {
      where.labels = { some: { color: label } };
    }
    if (memberId) {
      where.members = { some: { memberId } };
    }
    if (dueDate === 'overdue') {
      where.dueDate = { lt: now };
    } else if (dueDate === 'soon') {
      where.dueDate = { gte: now, lte: threeDaysFromNow };
    } else if (dueDate === 'none') {
      where.dueDate = null;
    }

    const cards = await prisma.card.findMany({
      where,
      include: {
        labels: true,
        members: { include: { member: true } },
        list: { select: { id: true, title: true, boardId: true } },
      },
      orderBy: [{ list: { position: 'asc' } }, { position: 'asc' }],
    });

    res.json(cards);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
