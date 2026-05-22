const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');

// POST /api/cards/:cardId/checklist — add checklist item
router.post('/cards/:cardId/checklist', async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'text is required' });
    const item = await prisma.checklistItem.create({
      data: { text, cardId: req.params.cardId },
    });
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/checklist/:id — update checklist item
router.patch('/:id', async (req, res, next) => {
  try {
    const { text, completed } = req.body;
    const item = await prisma.checklistItem.update({
      where: { id: req.params.id },
      data: {
        ...(text !== undefined && { text }),
        ...(completed !== undefined && { completed }),
      },
    });
    res.json(item);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/checklist/:id — delete checklist item
router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.checklistItem.delete({ where: { id: req.params.id } });
    res.json({ message: 'Checklist item deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
