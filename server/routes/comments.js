const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');

// GET /api/comments/cards/:cardId — fetch comments for a card
router.get('/cards/:cardId', async (req, res, next) => {
  try {
    const comments = await prisma.comment.findMany({
      where: { cardId: req.params.cardId },
      include: { member: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(comments);
  } catch (err) {
    next(err);
  }
});

// POST /api/comments/cards/:cardId — add comment to card
router.post('/cards/:cardId', async (req, res, next) => {
  try {
    const { text, memberId } = req.body;
    if (!text || !memberId) return res.status(400).json({ error: 'text and memberId are required' });
    const comment = await prisma.comment.create({
      data: { text, cardId: req.params.cardId, memberId },
      include: { member: true },
    });
    res.status(201).json(comment);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/comments/:id — delete comment
router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.comment.delete({ where: { id: req.params.id } });
    res.json({ message: 'Comment deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
