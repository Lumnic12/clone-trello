import { useState, useRef, useCallback } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  SortableContext, verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { deleteList, updateList } from '../../api/api';
import { useToast } from '../../context/ToastContext';
import { useClickOutside } from '../../hooks/useClickOutside';
import CardPreview from '../Card/CardPreview';
import AddCardForm from './AddCardForm';

export default function List({ list, onListUpdated, onListDeleted, onCardCreated, onCardClick, highlightedIds }) {
  const { addToast } = useToast();
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(list.title);
  const [showMenu, setShowMenu] = useState(false);
  const [showAddCard, setShowAddCard] = useState(false);
  const menuRef = useRef(null);
  const closeMenu = useCallback(() => setShowMenu(false), []);
  useClickOutside(menuRef, closeMenu);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: list.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  async function saveTitle() {
    if (!titleInput.trim() || titleInput === list.title) {
      setEditingTitle(false);
      setTitleInput(list.title);
      return;
    }
    try {
      const updated = await updateList(list.id, { title: titleInput.trim() });
      onListUpdated(updated);
      addToast('List renamed');
    } catch {
      addToast('Failed to rename list', 'error');
    }
    setEditingTitle(false);
  }

  async function handleDelete() {
    if (!confirm(`Delete "${list.title}" and all its cards?`)) return;
    setShowMenu(false);
    try {
      await deleteList(list.id);
      onListDeleted(list.id);
      addToast('List deleted');
    } catch {
      addToast('Failed to delete list', 'error');
    }
  }

  return (
    <div ref={setNodeRef} style={style} className="list-column">
      {/* List Header */}
      <div
        style={{
          padding: '10px 12px 6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 4,
          cursor: 'grab',
        }}
        {...attributes}
        {...listeners}
      >
        {editingTitle ? (
          <input
            value={titleInput}
            onChange={e => setTitleInput(e.target.value)}
            onBlur={saveTitle}
            onKeyDown={e => {
              if (e.key === 'Enter') saveTitle();
              if (e.key === 'Escape') { setEditingTitle(false); setTitleInput(list.title); }
            }}
            autoFocus
            onClick={e => e.stopPropagation()}
            onMouseDown={e => e.stopPropagation()}
            className="input"
            style={{ fontWeight: 600, fontSize: 14, padding: '4px 8px' }}
          />
        ) : (
          <h3
            onClick={(e) => { e.stopPropagation(); setEditingTitle(true); }}
            onMouseDown={e => e.stopPropagation()}
            style={{
              fontWeight: 700, fontSize: 14,
              color: 'var(--text-primary)',
              cursor: 'text',
              flex: 1,
              borderRadius: 4,
              padding: '4px 4px',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            {list.title}
            <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--text-muted)', marginLeft: 6 }}>
              {list.cards.length}
            </span>
          </h3>
        )}

        {/* List menu */}
        <div ref={menuRef} style={{ position: 'relative' }} onMouseDown={e => e.stopPropagation()}>
          <button
            onClick={() => setShowMenu(m => !m)}
            style={{
              background: 'none', border: 'none',
              color: 'var(--text-muted)', cursor: 'pointer',
              width: 28, height: 28, borderRadius: 6,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            ···
          </button>
          {showMenu && (
            <div style={{
              position: 'absolute', top: '100%', right: 0,
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-primary)',
              borderRadius: 10, padding: 6,
              boxShadow: 'var(--shadow-lg)', zIndex: 20,
              minWidth: 160, animation: 'slideDown 0.15s ease',
            }}>
              <button
                onClick={() => { setShowMenu(false); setEditingTitle(true); }}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  background: 'none', border: 'none',
                  padding: '8px 12px', borderRadius: 6,
                  color: 'var(--text-primary)', cursor: 'pointer', fontSize: 13,
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                ✏️ Rename list
              </button>
              <button
                onClick={handleDelete}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  background: 'none', border: 'none',
                  padding: '8px 12px', borderRadius: 6,
                  color: 'var(--danger)', cursor: 'pointer', fontSize: 13,
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                🗑 Delete list
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Cards */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px', minHeight: 4 }}>
        <SortableContext items={list.cards.map(c => c.id)} strategy={verticalListSortingStrategy}>
          {list.cards.map(card => (
            <CardPreview
              key={card.id}
              card={card}
              onClick={() => onCardClick(card.id)}
              highlighted={highlightedIds ? highlightedIds.includes(card.id) : true}
            />
          ))}
        </SortableContext>
      </div>

      {/* Add Card — stop DnD from intercepting pointer events inside form */}
      <div
        style={{ padding: '6px 8px 10px' }}
        onPointerDown={e => e.stopPropagation()}
        onMouseDown={e => e.stopPropagation()}
      >
        {showAddCard ? (
          <AddCardForm
            listId={list.id}
            onCardCreated={(card) => { onCardCreated(list.id, card); setShowAddCard(false); }}
            onCancel={() => setShowAddCard(false)}
          />
        ) : (
          <button
            onClick={() => setShowAddCard(true)}
            onPointerDown={e => e.stopPropagation()}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              width: '100%', background: 'none', border: 'none',
              color: 'var(--text-secondary)', cursor: 'pointer',
              padding: '6px 8px', borderRadius: 8,
              fontSize: 14, transition: 'all 0.15s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'var(--bg-hover)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'none';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
            + Add a card
          </button>
        )}
      </div>
    </div>
  );
}
