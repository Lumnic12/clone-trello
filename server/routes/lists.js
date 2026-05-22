const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');

// POST /api/lists — create list (auto-position at end)
router.post('/', async (req, res, next) => {
  try {
    const { title, boardId } = req.body;
    if (!title || !boardId) return res.status(400).json({ error: 'title and boardId are required' });

    const lastList = await prisma.list.findFirst({
      where: { boardId },
      orderBy: { position: 'desc' },
    });
    const position = lastList ? lastList.position + 1 : 0;

    const list = await prisma.list.create({
      data: { title, boardId, position },
    });
    res.status(201).json(list);
  } catch (err) {
    next(err);
  }
});

// PUT /api/lists/:id — update list title
router.put('/:id', async (req, res, next) => {
  try {
    const { title } = req.body;
    const list = await prisma.list.update({
      where: { id: req.params.id },
      data: { title },
    });
    res.json(list);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/lists/:id — delete list (cascades to cards)
router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.list.delete({ where: { id: req.params.id } });
    res.json({ message: 'List deleted' });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/lists/reorder — reorder multiple lists
router.patch('/reorder', async (req, res, next) => {
  try {
    const { lists } = req.body; // [{ id, position }]
    const updates = lists.map(({ id, position }) =>
      prisma.list.update({ where: { id }, data: { position } })
    );
    await prisma.$transaction(updates);
    res.json({ message: 'Lists reordered' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
