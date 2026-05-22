const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');

// GET /api/boards — fetch all boards
router.get('/', async (req, res, next) => {
  try {
    const boards = await prisma.board.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(boards);
  } catch (err) {
    next(err);
  }
});

// POST /api/boards — create new board
router.post('/', async (req, res, next) => {
  try {
    const { title, background } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });
    const board = await prisma.board.create({
      data: { title, background: background || '#0079BF' },
    });
    res.status(201).json(board);
  } catch (err) {
    next(err);
  }
});

// GET /api/boards/:id — fetch single board with nested lists and cards
router.get('/:id', async (req, res, next) => {
  try {
    const board = await prisma.board.findUnique({
      where: { id: req.params.id },
      include: {
        lists: {
          orderBy: { position: 'asc' },
          include: {
            cards: {
              where: { archived: false },
              orderBy: { position: 'asc' },
              include: {
                labels: true,
                members: { include: { member: true } },
                checklistItems: true,
              },
            },
          },
        },
      },
    });
    if (!board) return res.status(404).json({ error: 'Board not found' });
    res.json(board);
  } catch (err) {
    next(err);
  }
});

// PUT /api/boards/:id — update board
router.put('/:id', async (req, res, next) => {
  try {
    const { title, background } = req.body;
    const board = await prisma.board.update({
      where: { id: req.params.id },
      data: {
        ...(title && { title }),
        ...(background && { background }),
      },
    });
    res.json(board);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/boards/:id — delete board
router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.board.delete({ where: { id: req.params.id } });
    res.json({ message: 'Board deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
