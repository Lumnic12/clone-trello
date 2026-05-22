const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean up existing data
  await prisma.comment.deleteMany();
  await prisma.cardMember.deleteMany();
  await prisma.label.deleteMany();
  await prisma.checklistItem.deleteMany();
  await prisma.card.deleteMany();
  await prisma.list.deleteMany();
  await prisma.board.deleteMany();
  await prisma.member.deleteMany();

  // Create Members
  const alice = await prisma.member.create({
    data: { name: 'Alice Johnson', email: 'alice@example.com', avatarColor: '#7B68EE' },
  });
  const bob = await prisma.member.create({
    data: { name: 'Bob Smith', email: 'bob@example.com', avatarColor: '#FF6B6B' },
  });
  const carol = await prisma.member.create({
    data: { name: 'Carol White', email: 'carol@example.com', avatarColor: '#4CAF50' },
  });
  const dave = await prisma.member.create({
    data: { name: 'Dave Brown', email: 'dave@example.com', avatarColor: '#FF9800' },
  });

  // Create Board
  const board = await prisma.board.create({
    data: {
      title: 'Product Roadmap',
      background: 'linear-gradient(135deg, #1a2a4a 0%, #0079BF 60%, #005f9e 100%)',
      members: { connect: [{ id: alice.id }, { id: bob.id }, { id: carol.id }, { id: dave.id }] },
    },
  });

  // Create Lists
  const backlog = await prisma.list.create({ data: { title: 'Backlog', position: 0, boardId: board.id } });
  const inProgress = await prisma.list.create({ data: { title: 'In Progress', position: 1, boardId: board.id } });
  const review = await prisma.list.create({ data: { title: 'In Review', position: 2, boardId: board.id } });
  const done = await prisma.list.create({ data: { title: 'Done', position: 3, boardId: board.id } });

  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  // Create Cards
  const card1 = await prisma.card.create({
    data: {
      title: 'Design system setup',
      description: 'Create the base design tokens, colors, typography, and spacing guidelines for the entire application.',
      position: 0,
      listId: done.id,
      coverImage: '/covers/cover1.png',
      dueDate: yesterday,
      labels: { create: [{ name: 'Design', color: '#7B68EE' }, { name: 'Foundation', color: '#4CAF50' }] },
      checklistItems: {
        create: [
          { text: 'Define color palette', completed: true },
          { text: 'Set up typography scale', completed: true },
          { text: 'Create component library', completed: true },
        ],
      },
    },
  });

  const card2 = await prisma.card.create({
    data: {
      title: 'User authentication flow',
      description: 'Implement JWT-based authentication with login, register, and password reset flows.',
      position: 0,
      listId: inProgress.id,
      coverColor: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      dueDate: tomorrow,
      labels: { create: [{ name: 'Backend', color: '#FF6B6B' }, { name: 'Security', color: '#FF9800' }] },
      checklistItems: {
        create: [
          { text: 'Setup JWT middleware', completed: true },
          { text: 'Create login endpoint', completed: true },
          { text: 'Create register endpoint', completed: false },
          { text: 'Password reset flow', completed: false },
        ],
      },
    },
  });

  const card3 = await prisma.card.create({
    data: {
      title: 'Drag and drop board',
      description: 'Implement smooth drag and drop for cards and lists using @dnd-kit library.',
      position: 1,
      listId: inProgress.id,
      coverImage: '/covers/cover3.png',
      dueDate: nextWeek,
      labels: { create: [{ name: 'Frontend', color: '#2196F3' }, { name: 'Feature', color: '#9C27B0' }] },
      checklistItems: {
        create: [
          { text: 'Setup DndContext', completed: true },
          { text: 'List reordering', completed: false },
          { text: 'Card reordering in list', completed: false },
          { text: 'Cross-list card movement', completed: false },
        ],
      },
    },
  });

  const card4 = await prisma.card.create({
    data: {
      title: 'API endpoint testing',
      description: 'Write comprehensive tests for all API endpoints using Jest and Supertest.',
      position: 0,
      listId: review.id,
      dueDate: tomorrow,
      labels: { create: [{ name: 'Testing', color: '#009688' }, { name: 'Backend', color: '#FF6B6B' }] },
    },
  });

  const card5 = await prisma.card.create({
    data: {
      title: 'Dark mode implementation',
      description: 'Add dark mode support with CSS variables and localStorage persistence.',
      position: 0,
      listId: backlog.id,
      labels: { create: [{ name: 'Frontend', color: '#2196F3' }, { name: 'UX', color: '#E91E63' }] },
    },
  });

  const card6 = await prisma.card.create({
    data: {
      title: 'Deploy to production',
      description: 'Set up CI/CD pipeline and deploy backend to Railway, frontend to Vercel.',
      position: 1,
      listId: backlog.id,
      dueDate: nextWeek,
      labels: { create: [{ name: 'DevOps', color: '#607D8B' }] },
    },
  });

  // Assign members to cards
  await prisma.cardMember.createMany({
    data: [
      { cardId: card1.id, memberId: alice.id },
      { cardId: card1.id, memberId: carol.id },
      { cardId: card2.id, memberId: bob.id },
      { cardId: card3.id, memberId: alice.id },
      { cardId: card3.id, memberId: dave.id },
      { cardId: card4.id, memberId: bob.id },
      { cardId: card4.id, memberId: carol.id },
      { cardId: card5.id, memberId: alice.id },
      { cardId: card6.id, memberId: dave.id },
    ],
  });

  // Add comments
  await prisma.comment.createMany({
    data: [
      { text: 'Looks great! Design tokens are clean and consistent.', cardId: card1.id, memberId: bob.id },
      { text: 'Approved! Ready to merge.', cardId: card1.id, memberId: carol.id },
      { text: 'Working on the register endpoint now, should be done tomorrow.', cardId: card2.id, memberId: bob.id },
      { text: 'The DnD feels very smooth so far!', cardId: card3.id, memberId: alice.id },
    ],
  });

  console.log('✅ Seed complete!');
  console.log(`   Board: ${board.title} (${board.id})`);
  console.log(`   Lists: Backlog, In Progress, In Review, Done`);
  console.log(`   Members: Alice, Bob, Carol, Dave`);
  console.log(`   Cards: 6 cards with labels, checklists, due dates, comments`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
