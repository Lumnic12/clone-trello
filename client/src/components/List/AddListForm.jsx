import { useState } from 'react';
import { createList } from '../../api/api';
import { useToast } from '../../context/ToastContext';

export default function AddListForm({ boardId, onListCreated }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { addToast } = useToast();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      const list = await createList({ title: title.trim(), boardId });
      onListCreated(list);
      setTitle('');
      setOpen(false);
      addToast('List created');
    } catch {
      addToast('Failed to create list', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{
          minWidth: 280, height: 48,
          background: 'rgba(255,255,255,0.2)',
          backdropFilter: 'blur(4px)',
          border: '2px dashed rgba(255,255,255,0.4)',
          borderRadius: 12,
          color: 'white', fontWeight: 600, fontSize: 14,
          cursor: 'pointer', flexShrink: 0,
          transition: 'all 0.15s',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
      >
        + Add another list
      </button>
    );
  }

  return (
    <div style={{
      minWidth: 280, background: 'var(--bg-tertiary)',
      borderRadius: 12, padding: 12,
      border: '1px solid var(--border-primary)',
      flexShrink: 0, animation: 'slideDown 0.15s ease',
    }}>
      <form onSubmit={handleSubmit}>
        <input
          className="input"
          value={title}
          onChange={e => setTitle(e.target.value)}
          onKeyDown={e => { if (e.key === 'Escape') { setOpen(false); setTitle(''); } }}
          placeholder="Enter list title…"
          autoFocus
          style={{ marginBottom: 8 }}
        />
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            type="submit"
            disabled={!title.trim() || submitting}
            className="btn btn-primary"
            style={{ fontSize: 13, padding: '6px 14px', opacity: (!title.trim() || submitting) ? 0.6 : 1 }}
          >
            {submitting ? 'Adding…' : 'Add list'}
          </button>
          <button
            type="button"
            onClick={() => { setOpen(false); setTitle(''); }}
            style={{
              background: 'none', border: 'none',
              color: 'var(--text-muted)', cursor: 'pointer',
              width: 32, height: 32, borderRadius: 6,
              fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            ×
          </button>
        </div>
      </form>
    </div>
  );
}
