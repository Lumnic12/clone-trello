const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');

// GET /api/members — fetch all members
router.get('/', async (req, res, next) => {
  try {
    const members = await prisma.member.findMany({ orderBy: { name: 'asc' } });
    res.json(members);
  } catch (err) {
    next(err);
  }
});

// POST /api/members — create a member
router.post('/', async (req, res, next) => {
  try {
    const { name, email, avatarColor } = req.body;
    if (!name || !email) return res.status(400).json({ error: 'name and email are required' });
    const member = await prisma.member.create({
      data: { name, email, avatarColor: avatarColor || '#0079BF' },
    });
    res.status(201).json(member);
  } catch (err) {
    next(err);
  }
});

// POST /api/cards/:cardId/members — assign member to card
router.post('/cards/:cardId/members', async (req, res, next) => {
  try {
    const { memberId } = req.body;
    if (!memberId) return res.status(400).json({ error: 'memberId is required' });
    const cm = await prisma.cardMember.create({
      data: { cardId: req.params.cardId, memberId },
      include: { member: true },
    });
    res.status(201).json(cm);
  } catch (err) {
    // Ignore unique constraint (already assigned)
    if (err.code === 'P2002') return res.status(409).json({ error: 'Member already assigned' });
    next(err);
  }
});

// DELETE /api/cards/:cardId/members/:memberId — remove member from card
router.delete('/cards/:cardId/members/:memberId', async (req, res, next) => {
  try {
    await prisma.cardMember.delete({
      where: {
        cardId_memberId: {
          cardId: req.params.cardId,
          memberId: req.params.memberId,
        },
      },
    });
    res.json({ message: 'Member removed from card' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
