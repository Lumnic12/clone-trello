/**
 * auto-reset.js
 * 
 * Every hour, wipes all boards/cards/lists created by users and
 * reseeds the demo data. This keeps the DB clean for a public demo.
 *
 * Only runs if DEMO_MODE=true in .env (disabled in real production).
 */

const prisma = require('./prisma');

// ─── Demo seed data ───────────────────────────────────────────────────────────
async function reseedDemo() {
  console.log('[AutoReset] 🔄 Resetting demo database...');

  try {
    // Delete in foreign-key order
    await prisma.comment.deleteMany();
    await prisma.cardMember.deleteMany();
    await prisma.label.deleteMany();
    await prisma.checklistItem.deleteMany();
    await prisma.card.deleteMany();
    await prisma.list.deleteMany();
    await prisma.board.deleteMany();
    await prisma.member.deleteMany();

    // ── Members ──────────────────────────────────────────────────────────────
    const [alice, bob, carol, dave] = await Promise.all([
      prisma.member.create({ data: { name: 'Alice Johnson', email: 'alice@example.com', avatarColor: '#7B68EE' } }),
      prisma.member.create({ data: { name: 'Bob Smith',    email: 'bob@example.com',   avatarColor: '#FF6B6B' } }),
      prisma.member.create({ data: { name: 'Carol White',  email: 'carol@example.com', avatarColor: '#4CAF50' } }),
      prisma.member.create({ data: { name: 'Dave Brown',   email: 'dave@example.com',  avatarColor: '#FF9800' } }),
    ]);

    // ── Board ─────────────────────────────────────────────────────────────────
    const board = await prisma.board.create({
      data: {
        title: 'Product Roadmap',
        background: 'linear-gradient(135deg, #1a2a4a 0%, #0079BF 60%, #005f9e 100%)',
        members: { connect: [{ id: alice.id }, { id: bob.id }, { id: carol.id }, { id: dave.id }] },
      },
    });

    // ── Lists ─────────────────────────────────────────────────────────────────
    const [backlog, inProgress, review, done] = await Promise.all([
      prisma.list.create({ data: { title: 'Backlog',      position: 0, boardId: board.id } }),
      prisma.list.create({ data: { title: 'In Progress',  position: 1, boardId: board.id } }),
      prisma.list.create({ data: { title: 'In Review',    position: 2, boardId: board.id } }),
      prisma.list.create({ data: { title: 'Done',         position: 3, boardId: board.id } }),
    ]);

    const now       = new Date();
    const yesterday = new Date(now - 86400000);
    const tomorrow  = new Date(now + 86400000);
    const nextWeek  = new Date(now + 7 * 86400000);

    // ── Cards ─────────────────────────────────────────────────────────────────
    const [card1, card2, card3, card4, card5, card6] = await Promise.all([
      prisma.card.create({ data: {
        title: 'Design system setup',
        description: 'Create the base design tokens, colors, typography, and spacing guidelines.',
        position: 0, listId: done.id, dueDate: yesterday,
        labels: { create: [{ name: 'Design', color: '#7B68EE' }, { name: 'Foundation', color: '#4CAF50' }] },
        checklistItems: { create: [
          { text: 'Define color palette', completed: true },
          { text: 'Set up typography scale', completed: true },
          { text: 'Create component library', completed: true },
        ]},
      }}),
      prisma.card.create({ data: {
        title: 'User authentication flow',
        description: 'Implement JWT-based authentication with login, register, and password reset flows.',
        position: 0, listId: inProgress.id,
        coverColor: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        dueDate: tomorrow,
        labels: { create: [{ name: 'Backend', color: '#FF6B6B' }, { name: 'Security', color: '#FF9800' }] },
        checklistItems: { create: [
          { text: 'Setup JWT middleware',    completed: true  },
          { text: 'Create login endpoint',   completed: true  },
          { text: 'Create register endpoint',completed: false },
          { text: 'Password reset flow',     completed: false },
        ]},
      }}),
      prisma.card.create({ data: {
        title: 'Drag and drop board',
        description: 'Implement smooth drag and drop for cards and lists using @dnd-kit library.',
        position: 1, listId: inProgress.id, dueDate: nextWeek,
        labels: { create: [{ name: 'Frontend', color: '#2196F3' }, { name: 'Feature', color: '#9C27B0' }] },
        checklistItems: { create: [
          { text: 'Setup DndContext',           completed: true  },
          { text: 'List reordering',            completed: false },
          { text: 'Card reordering in list',    completed: false },
          { text: 'Cross-list card movement',   completed: false },
        ]},
      }}),
      prisma.card.create({ data: {
        title: 'API endpoint testing',
        description: 'Write comprehensive tests for all API endpoints using Jest and Supertest.',
        position: 0, listId: review.id, dueDate: tomorrow,
        labels: { create: [{ name: 'Testing', color: '#009688' }, { name: 'Backend', color: '#FF6B6B' }] },
      }}),
      prisma.card.create({ data: {
        title: 'Dark mode implementation',
        description: 'Add dark mode support with CSS variables and localStorage persistence.',
        position: 0, listId: backlog.id,
        labels: { create: [{ name: 'Frontend', color: '#2196F3' }, { name: 'UX', color: '#E91E63' }] },
      }}),
      prisma.card.create({ data: {
        title: 'Deploy to production',
        description: 'Set up CI/CD pipeline and deploy backend to Railway, frontend to Vercel.',
        position: 1, listId: backlog.id, dueDate: nextWeek,
        labels: { create: [{ name: 'DevOps', color: '#607D8B' }] },
      }}),
    ]);

    // ── Member assignments ────────────────────────────────────────────────────
    await prisma.cardMember.createMany({
      data: [
        { cardId: card1.id, memberId: alice.id },
        { cardId: card1.id, memberId: carol.id },
        { cardId: card2.id, memberId: bob.id   },
        { cardId: card3.id, memberId: alice.id },
        { cardId: card3.id, memberId: dave.id  },
        { cardId: card4.id, memberId: bob.id   },
        { cardId: card4.id, memberId: carol.id },
        { cardId: card5.id, memberId: alice.id },
        { cardId: card6.id, memberId: dave.id  },
      ],
    });

    // ── Comments ──────────────────────────────────────────────────────────────
    await prisma.comment.createMany({
      data: [
        { text: 'Looks great! Design tokens are clean and consistent.', cardId: card1.id, memberId: bob.id   },
        { text: 'Approved! Ready to merge.',                            cardId: card1.id, memberId: carol.id },
        { text: 'Working on the register endpoint, done tomorrow.',     cardId: card2.id, memberId: bob.id   },
        { text: 'The DnD feels very smooth so far!',                   cardId: card3.id, memberId: alice.id },
      ],
    });

    console.log(`[AutoReset] ✅ Demo reset complete. Board: ${board.id}`);
  } catch (err) {
    console.error('[AutoReset] ❌ Reset failed:', err.message);
  }
}

// ─── Scheduler ────────────────────────────────────────────────────────────────
const RESET_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

function startAutoReset() {
  if (process.env.DEMO_MODE !== 'true') {
    console.log('[AutoReset] Demo mode off — auto-reset disabled.');
    return;
  }

  console.log(`[AutoReset] 🕐 Demo mode ON — DB will reset every 1 hour.`);

  // Run once immediately on startup to guarantee fresh data
  reseedDemo();

  // Then every hour
  setInterval(reseedDemo, RESET_INTERVAL_MS);
}

module.exports = { startAutoReset, reseedDemo };
