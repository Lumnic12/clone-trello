const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');

// POST /api/cards/:cardId/labels — add label to card
router.post('/cards/:cardId/labels', async (req, res, next) => {
  try {
    const { name, color } = req.body;
    if (!color) return res.status(400).json({ error: 'color is required' });
    const label = await prisma.label.create({
      data: { name: name || '', color, cardId: req.params.cardId },
    });
    res.status(201).json(label);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/labels/:id — remove label
router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.label.delete({ where: { id: req.params.id } });
    res.json({ message: 'Label removed' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
