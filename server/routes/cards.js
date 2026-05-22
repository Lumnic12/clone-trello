const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');

// GET /api/cards/:id — fetch full card details
router.get('/:id', async (req, res, next) => {
  try {
    const card = await prisma.card.findUnique({
      where: { id: req.params.id },
      include: {
        labels: true,
        checklistItems: { orderBy: { id: 'asc' } },
        members: { include: { member: true } },
        comments: {
          include: { member: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!card) return res.status(404).json({ error: 'Card not found' });
    res.json(card);
  } catch (err) {
    next(err);
  }
});

// POST /api/cards — create card (auto-position at bottom of list)
router.post('/', async (req, res, next) => {
  try {
    const { title, listId, description, dueDate, coverColor, coverImage } = req.body;
    if (!title || !listId) return res.status(400).json({ error: 'title and listId are required' });

    const lastCard = await prisma.card.findFirst({
      where: { listId },
      orderBy: { position: 'desc' },
    });
    const position = lastCard ? lastCard.position + 1 : 0;

    const card = await prisma.card.create({
      data: {
        title,
        listId,
        position,
        description: description || null,
        dueDate: dueDate ? new Date(dueDate) : null,
        coverColor: coverColor || null,
        coverImage: coverImage || null,
      },
      include: {
        labels: true,
        members: { include: { member: true } },
        checklistItems: true,
        comments: true,
      },
    });
    res.status(201).json(card);
  } catch (err) {
    next(err);
  }
});

// PUT /api/cards/:id — update card
router.put('/:id', async (req, res, next) => {
  try {
    const { title, description, dueDate, archived, coverColor, coverImage } = req.body;
    const card = await prisma.card.update({
      where: { id: req.params.id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(archived !== undefined && { archived }),
        ...(coverColor !== undefined && { coverColor }),
        ...(coverImage !== undefined && { coverImage }),
      },
      include: {
        labels: true,
        checklistItems: true,
        members: { include: { member: true } },
      },
    });
    res.json(card);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/cards/:id — delete card
router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.card.delete({ where: { id: req.params.id } });
    res.json({ message: 'Card deleted' });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/cards/reorder — reorder cards in same list
router.patch('/reorder', async (req, res, next) => {
  try {
    const { cards } = req.body; // [{ id, position }]
    const updates = cards.map(({ id, position }) =>
      prisma.card.update({ where: { id }, data: { position } })
    );
    await prisma.$transaction(updates);
    res.json({ message: 'Cards reordered' });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/cards/:id/move — move card to different list
router.patch('/:id/move', async (req, res, next) => {
  try {
    const { listId, position } = req.body;
    const card = await prisma.card.update({
      where: { id: req.params.id },
      data: { listId, position },
    });
    res.json(card);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
