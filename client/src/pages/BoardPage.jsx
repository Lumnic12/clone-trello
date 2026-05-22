import { useState, useEffect, useCallback, lazy, Suspense, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  DndContext, DragOverlay, closestCorners,
  PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import {
  SortableContext, horizontalListSortingStrategy, arrayMove,
} from '@dnd-kit/sortable';
import { getBoardById, updateBoard, reorderLists, reorderCards, moveCard } from '../api/api';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import { getPremiumBackground } from '../utils/colorHelpers';
import List from '../components/List/List';
import AddListForm from '../components/List/AddListForm';
import CardPreview from '../components/Card/CardPreview';
import SearchBar from '../components/Board/SearchBar';

// Lazy-load CardModal — only fetched when a card is clicked
const CardModal = lazy(() => import('../components/Card/CardModal'));

export default function BoardPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { theme, toggleTheme } = useTheme();

  const [board, setBoard] = useState(null);
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState('');
  const [activeCard, setActiveCard] = useState(null);
  const [activeList, setActiveList] = useState(null);
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchResults, setSearchResults] = useState(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const fetchBoard = useCallback(async () => {
    try {
      const data = await getBoardById(id);
      setBoard(data);
      setTitleInput(data.title);
      setLists(data.lists);
    } catch {
      addToast('Board not found', 'error');
      navigate('/');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchBoard(); }, [fetchBoard]);

  // ─── displayedLists MUST be here (before any early returns) to satisfy Rules of Hooks ──
  const displayedLists = useMemo(() => {
    if (!searchResults) return lists;
    return lists.map(l => ({ ...l, cards: l.cards.filter(c => searchResults.some(r => r.id === c.id)) }));
  }, [lists, searchResults]);

  // ─── Board title update ──────────────────────────────────────────────────────
  async function saveBoardTitle() {
    if (!titleInput.trim() || titleInput === board.title) {
      setEditingTitle(false);
      setTitleInput(board.title);
      return;
    }
    try {
      const updated = await updateBoard(id, { title: titleInput.trim() });
      setBoard(updated);
      addToast('Board title updated');
    } catch {
      addToast('Failed to update title', 'error');
    }
    setEditingTitle(false);
  }

  // ─── List management callbacks ───────────────────────────────────────────────
  const handleListCreated = useCallback((newList) => {
    setLists(prev => [...prev, { ...newList, cards: [] }]);
  }, []);

  const handleListUpdated = useCallback((updatedList) => {
    setLists(prev => prev.map(l => l.id === updatedList.id ? { ...l, title: updatedList.title } : l));
  }, []);

  const handleListDeleted = useCallback((listId) => {
    setLists(prev => prev.filter(l => l.id !== listId));
  }, []);

  // ─── Card management callbacks ───────────────────────────────────────────────
  const handleCardCreated = useCallback((listId, card) => {
    setLists(prev => prev.map(l =>
      l.id === listId ? { ...l, cards: [...l.cards, card] } : l
    ));
  }, []);

  const handleCardUpdated = useCallback((updatedCard) => {
    setLists(prev => prev.map(l => ({
      ...l,
      cards: l.cards.map(c => c.id === updatedCard.id ? { ...c, ...updatedCard } : c),
    })));
  }, []);

  const handleCardDeleted = useCallback((cardId, listId) => {
    setLists(prev => prev.map(l =>
      l.id === listId ? { ...l, cards: l.cards.filter(c => c.id !== cardId) } : l
    ));
    setSelectedCardId(null);
  }, []);

  // ─── Drag and Drop ───────────────────────────────────────────────────────────
  function findList(id) {
    return lists.find(l => l.id === id) || lists.find(l => l.cards.some(c => c.id === id));
  }

  function handleDragStart(event) {
    const { active } = event;
    const list = lists.find(l => l.id === active.id);
    if (list) { setActiveList(list); return; }
    const card = lists.flatMap(l => l.cards).find(c => c.id === active.id);
    if (card) setActiveCard(card);
  }

  async function handleDragEnd(event) {
    const { active, over } = event;
    setActiveCard(null);
    setActiveList(null);
    if (!over || active.id === over.id) return;

    // List reordering
    if (lists.some(l => l.id === active.id)) {
      const oldIdx = lists.findIndex(l => l.id === active.id);
      const newIdx = lists.findIndex(l => l.id === over.id);
      const newLists = arrayMove(lists, oldIdx, newIdx).map((l, i) => ({ ...l, position: i }));
      setLists(newLists);
      try {
        await reorderLists(newLists.map(l => ({ id: l.id, position: l.position })));
      } catch { addToast('Failed to reorder lists', 'error'); fetchBoard(); }
      return;
    }

    // Card drag
    const sourceList = findList(active.id);
    const destList = findList(over.id);
    if (!sourceList || !destList) return;

    if (sourceList.id === destList.id) {
      // Same list reorder
      const oldIdx = sourceList.cards.findIndex(c => c.id === active.id);
      const newIdx = destList.cards.findIndex(c => c.id === over.id);
      if (oldIdx === -1 || newIdx === -1) return;
      const newCards = arrayMove(sourceList.cards, oldIdx, newIdx).map((c, i) => ({ ...c, position: i }));
      setLists(prev => prev.map(l => l.id === sourceList.id ? { ...l, cards: newCards } : l));
      try {
        await reorderCards(newCards.map(c => ({ id: c.id, position: c.position })));
      } catch { addToast('Failed to reorder cards', 'error'); fetchBoard(); }
    } else {
      // Cross-list move
      const card = sourceList.cards.find(c => c.id === active.id);
      const newPosition = destList.cards.length;
      setLists(prev => prev.map(l => {
        if (l.id === sourceList.id) return { ...l, cards: l.cards.filter(c => c.id !== active.id) };
        if (l.id === destList.id) return { ...l, cards: [...l.cards, { ...card, listId: destList.id, position: newPosition }] };
        return l;
      }));
      try {
        await moveCard(active.id, { listId: destList.id, position: newPosition });
      } catch { addToast('Failed to move card', 'error'); fetchBoard(); }
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--brand-primary)', borderTopColor: 'transparent', animation: 'spin 0.7s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--text-secondary)' }}>Loading board…</p>
        </div>
      </div>
    );
  }



  return (
    <div style={{
      minHeight: '100vh',
      background: getPremiumBackground(board?.background),
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      position: 'relative',
    }}>
      {/* Dark overlay on board background */}
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 0, pointerEvents: 'none' }} />

      {/* Board Header */}
      <div style={{
        position: 'sticky', top: 50, zIndex: 10,
        background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(8px)',
        padding: '10px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
        borderBottom: '1px solid rgba(255,255,255,0.1)',
      }}>
        {/* Editable Title */}
        {editingTitle ? (
          <input
            value={titleInput}
            onChange={e => setTitleInput(e.target.value)}
            onBlur={saveBoardTitle}
            onKeyDown={e => { if (e.key === 'Enter') saveBoardTitle(); if (e.key === 'Escape') { setEditingTitle(false); setTitleInput(board.title); } }}
            autoFocus
            style={{
              background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: 8,
              padding: '6px 12px', fontWeight: 700, fontSize: 18, color: '#172b4d',
              outline: 'none', minWidth: 200,
            }}
          />
        ) : (
          <h1
            onClick={() => setEditingTitle(true)}
            style={{
              color: 'white', fontWeight: 700, fontSize: 18,
              cursor: 'pointer', padding: '6px 10px', borderRadius: 8,
              transition: 'background 0.15s',
              textShadow: '0 1px 3px rgba(0,0,0,0.4)',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            title="Click to edit"
          >
            {board?.title}
          </h1>
        )}

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setShowSearch(s => !s)}
            style={{
              background: showSearch ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.15)',
              border: 'none', color: 'white', padding: '6px 12px', borderRadius: 8,
              cursor: 'pointer', fontSize: 14, fontWeight: 500,
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
            onMouseLeave={e => e.currentTarget.style.background = showSearch ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.15)'}
          >
            🔍 Search
          </button>
          <button
            onClick={toggleTheme}
            style={{
              background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white',
              width: 36, height: 36, borderRadius: 8, cursor: 'pointer', fontSize: 16,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </div>

      {/* Search Bar */}
      {showSearch && (
        <div style={{ position: 'sticky', top: 100, zIndex: 9, background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(8px)', padding: '8px 20px' }}>
          <SearchBar boardId={id} members={[]} onResults={setSearchResults} onClear={() => setSearchResults(null)} />
        </div>
      )}

      {/* Board Content */}
      <div className="board-scroll" style={{ position: 'relative', zIndex: 1, padding: '20px', overflowX: 'auto', display: 'flex', gap: 16, alignItems: 'flex-start', minHeight: 'calc(100vh - 110px)', paddingBottom: 40 }}>
        <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <SortableContext items={lists.map(l => l.id)} strategy={horizontalListSortingStrategy}>
            {displayedLists.map(list => (
              <List
                key={list.id}
                list={list}
                onListUpdated={handleListUpdated}
                onListDeleted={handleListDeleted}
                onCardCreated={handleCardCreated}
                onCardClick={setSelectedCardId}
                highlightedIds={searchResults ? searchResults.map(r => r.id) : null}
              />
            ))}
          </SortableContext>

          <DragOverlay>
            {activeCard && <CardPreview card={activeCard} isDragging />}
          </DragOverlay>
        </DndContext>

        {/* AddListForm is OUTSIDE DndContext so its inputs/buttons work */}
        <AddListForm boardId={id} onListCreated={handleListCreated} />
      </div>

      {/* Card Modal — lazy loaded */}
      {selectedCardId && (
        <Suspense fallback={
          <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, background: 'var(--bg-overlay)' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid var(--brand-primary)', borderTopColor: 'transparent', animation: 'spin 0.7s linear infinite' }} />
          </div>
        }>
          <CardModal
            cardId={selectedCardId}
            lists={lists}
            onClose={() => setSelectedCardId(null)}
            onCardUpdated={handleCardUpdated}
            onCardDeleted={handleCardDeleted}
          />
        </Suspense>
      )}
    </div>
  );
}
