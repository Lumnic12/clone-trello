import { useState, useCallback } from 'react';
import { createCard, addLabel, addChecklistItem } from '../../api/api';
import { useToast } from '../../context/ToastContext';

// ─── Trello-style label colors ────────────────────────────────────────────────
const QUICK_LABELS = [
  { color: '#4BCE97', name: 'Green'  },
  { color: '#F5CD47', name: 'Yellow' },
  { color: '#FEA362', name: 'Orange' },
  { color: '#F87168', name: 'Red'    },
  { color: '#9F8FEF', name: 'Purple' },
  { color: '#579DFF', name: 'Blue'   },
  { color: '#6CC3E0', name: 'Sky'    },
  { color: '#94C748', name: 'Lime'   },
  { color: '#E774BB', name: 'Pink'   },
  { color: '#8590A2', name: 'Grey'   },
];

// ─── Cover gradients + solid colors ──────────────────────────────────────────
const COVER_OPTIONS = [
  { v: 'linear-gradient(135deg,#667eea,#764ba2)',  l: 'Purple Dream' },
  { v: 'linear-gradient(135deg,#f093fb,#f5576c)',  l: 'Pink Fusion'  },
  { v: 'linear-gradient(135deg,#4facfe,#00f2fe)',  l: 'Ocean Blue'   },
  { v: 'linear-gradient(135deg,#43e97b,#38f9d7)',  l: 'Fresh Mint'   },
  { v: 'linear-gradient(135deg,#fa709a,#fee140)',  l: 'Sunset'       },
  { v: 'linear-gradient(135deg,#30cfd0,#667eea)',  l: 'Aurora'       },
  { v: 'linear-gradient(135deg,#f7971e,#ffd200)',  l: 'Gold'         },
  { v: 'linear-gradient(135deg,#c471f5,#fa71cd)',  l: 'Orchid'       },
  { v: '#0079BF', l: 'Blue'   },
  { v: '#4BCE97', l: 'Green'  },
  { v: '#F87168', l: 'Red'    },
  { v: '#9F8FEF', l: 'Purple' },
];

// ─── Panel styles helper ──────────────────────────────────────────────────────
const panelStyle = {
  background: 'var(--bg-secondary)',
  border: '1px solid var(--border-primary)',
  borderRadius: 10, padding: '12px 12px 10px',
  marginBottom: 8,
  boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AddCardForm({ listId, onCardCreated, onCancel }) {
  const [title,        setTitle]        = useState('');
  const [description,  setDescription]  = useState('');
  const [dueDate,      setDueDate]      = useState('');
  const [selectedLabels, setSelectedLabels] = useState([]); // [{color,name}]
  const [coverColor,   setCoverColor]   = useState('');
  const [checkItems,   setCheckItems]   = useState([{ text: '', done: false }]);
  const [activePanel,  setActivePanel]  = useState(null); // 'labels'|'date'|'cover'|'checklist'|'desc'
  const [submitting,   setSubmitting]   = useState(false);
  const { addToast } = useToast();

  // Toggle panel (same button closes it)
  const togglePanel = useCallback((name) => {
    setActivePanel(p => p === name ? null : name);
  }, []);

  // Toggle label selection
  function toggleLabel(lbl) {
    setSelectedLabels(prev =>
      prev.some(l => l.color === lbl.color)
        ? prev.filter(l => l.color !== lbl.color)
        : [...prev, lbl]
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed || submitting) return;
    setSubmitting(true);

    try {
      const card = await createCard({
        title: trimmed,
        listId,
        description: description.trim() || null,
        coverColor:  coverColor || null,
        dueDate:     dueDate || null,
      });

      // Fire label + checklist extras in parallel (non-blocking)
      const validItems = checkItems.filter(c => c.text.trim());
      Promise.allSettled([
        ...selectedLabels.map(l => addLabel(card.id, { name: l.name, color: l.color })),
        ...validItems.map(c => addChecklistItem(card.id, { text: c.text.trim() })),
      ]);

      onCardCreated(card);
      addToast('Card added ✓');
    } catch {
      addToast('Failed to add card', 'error');
      setSubmitting(false);
    }
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const hasChecklist = checkItems.some(c => c.text.trim());

  // ── Quick action button style ──────────────────────────────────────────────
  function quickBtnStyle(key, active) {
    const isOpen   = activePanel === key;
    const hasValue = active;
    return {
      display: 'flex', alignItems: 'center', gap: 4,
      padding: '5px 10px', borderRadius: 6, cursor: 'pointer',
      fontSize: 11, fontWeight: 600, border: '1.5px solid',
      transition: 'all 0.15s',
      background:     isOpen   ? '#e4f0f6' : hasValue ? '#e4f0f6' : 'var(--bg-hover)',
      borderColor:    isOpen || hasValue ? '#0079BF' : 'var(--border-primary)',
      color:          isOpen || hasValue ? '#0079BF' : 'var(--text-secondary)',
    };
  }

  return (
    <form onSubmit={handleSubmit} style={{ animation: 'slideDown 0.15s ease' }}>

      {/* ── Cover preview strip ────────────────────────────────────────────── */}
      {coverColor && (
        <div style={{
          height: coverColor.startsWith('linear') ? 72 : 10,
          background: coverColor,
          borderRadius: coverColor.startsWith('linear') ? '8px 8px 0 0' : 4,
          marginBottom: coverColor.startsWith('linear') ? 0 : 6,
          transition: 'height 0.2s',
        }} />
      )}

      {/* ── Label pills ────────────────────────────────────────────────────── */}
      {selectedLabels.length > 0 && (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', margin: '6px 0' }}>
          {selectedLabels.map(l => (
            <span key={l.color} style={{
              background: l.color, color: '#fff',
              borderRadius: 4, padding: '2px 10px', fontSize: 11, fontWeight: 700,
              letterSpacing: 0.3,
            }}>
              {l.name}
            </span>
          ))}
        </div>
      )}

      {/* ── Title textarea ─────────────────────────────────────────────────── */}
      <textarea
        value={title}
        onChange={e => setTitle(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e); }
          if (e.key === 'Escape') onCancel();
        }}
        placeholder="Enter a title for this card…"
        autoFocus
        rows={2}
        style={{
          width: '100%', resize: 'none',
          background: '#fff', color: '#172b4d',
          border: '2px solid #0079BF', borderRadius: 8,
          padding: '8px 10px', fontSize: 14, fontFamily: 'inherit',
          outline: 'none', marginBottom: 6,
          boxShadow: '0 0 0 3px rgba(0,121,191,0.15)',
        }}
      />

      {/* ── Expanded panels ────────────────────────────────────────────────── */}

      {/* Description */}
      {activePanel === 'desc' && (
        <div style={panelStyle}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#626f86', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 6 }}>
            Description
          </p>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Add a more detailed description…"
            autoFocus
            rows={3}
            style={{
              width: '100%', resize: 'vertical',
              background: 'var(--bg-input)', color: 'var(--text-primary)',
              border: '1.5px solid var(--border-primary)', borderRadius: 8,
              padding: '8px 10px', fontSize: 13, fontFamily: 'inherit', outline: 'none',
            }}
          />
        </div>
      )}

      {/* Due date */}
      {activePanel === 'date' && (
        <div style={panelStyle}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#626f86', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 6 }}>
            Due Date
          </p>
          <input
            type="date"
            value={dueDate}
            min={todayStr}
            autoFocus
            onChange={e => setDueDate(e.target.value)}
            style={{
              width: '100%',
              background: 'var(--bg-input)', color: 'var(--text-primary)',
              border: '1.5px solid var(--border-primary)', borderRadius: 8,
              padding: '8px 10px', fontSize: 13, fontFamily: 'inherit', outline: 'none',
            }}
          />
          {dueDate && (
            <button type="button" onClick={() => setDueDate('')}
              style={{ background: 'none', border: 'none', color: '#F87168', cursor: 'pointer', fontSize: 11, marginTop: 6 }}>
              Remove date
            </button>
          )}
        </div>
      )}

      {/* Label picker */}
      {activePanel === 'labels' && (
        <div style={panelStyle}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#626f86', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8 }}>
            Labels
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
            {QUICK_LABELS.map(lbl => {
              const sel = selectedLabels.some(l => l.color === lbl.color);
              return (
                <button
                  key={lbl.color}
                  type="button"
                  title={lbl.name}
                  onClick={() => toggleLabel(lbl)}
                  style={{
                    height: 28, borderRadius: 6, background: lbl.color,
                    border: sel ? '3px solid #172b4d' : '3px solid transparent',
                    cursor: 'pointer', transition: 'transform 0.1s, border 0.1s',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontSize: 14, fontWeight: 700,
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  {sel ? '✓' : ''}
                </button>
              );
            })}
          </div>
          {selectedLabels.length > 0 && (
            <button type="button" onClick={() => setSelectedLabels([])}
              style={{ background: 'none', border: 'none', color: '#626f86', cursor: 'pointer', fontSize: 11, marginTop: 8 }}>
              Clear all
            </button>
          )}
        </div>
      )}

      {/* Cover picker */}
      {activePanel === 'cover' && (
        <div style={panelStyle}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#626f86', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8 }}>
            Cover
          </p>
          {/* Gradient row */}
          <p style={{ fontSize: 10, color: '#9ba6b6', fontWeight: 600, marginBottom: 4 }}>GRADIENTS</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 10 }}>
            {COVER_OPTIONS.filter(o => o.v.startsWith('linear')).map(opt => (
              <button
                key={opt.v}
                type="button"
                title={opt.l}
                onClick={() => { setCoverColor(opt.v); setActivePanel(null); }}
                style={{
                  width: 44, height: 28, borderRadius: 6, background: opt.v,
                  border: coverColor === opt.v ? '3px solid #172b4d' : '2px solid transparent',
                  cursor: 'pointer', transition: 'transform 0.1s',
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              />
            ))}
          </div>
          {/* Solid color row */}
          <p style={{ fontSize: 10, color: '#9ba6b6', fontWeight: 600, marginBottom: 4 }}>SOLID COLORS</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 8 }}>
            {COVER_OPTIONS.filter(o => !o.v.startsWith('linear')).map(opt => (
              <button
                key={opt.v}
                type="button"
                title={opt.l}
                onClick={() => { setCoverColor(opt.v); setActivePanel(null); }}
                style={{
                  width: 28, height: 28, borderRadius: 6, background: opt.v,
                  border: coverColor === opt.v ? '3px solid #172b4d' : '2px solid transparent',
                  cursor: 'pointer', transition: 'transform 0.1s',
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              />
            ))}
          </div>
          {coverColor && (
            <button type="button" onClick={() => setCoverColor('')}
              style={{ background: 'none', border: 'none', color: '#626f86', cursor: 'pointer', fontSize: 11 }}>
              Remove cover
            </button>
          )}
        </div>
      )}

      {/* Checklist */}
      {activePanel === 'checklist' && (
        <div style={panelStyle}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#626f86', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8 }}>
            Checklist
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {checkItems.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 12, color: '#9ba6b6', width: 16, textAlign: 'right', flexShrink: 0 }}>
                  {idx + 1}.
                </span>
                <input
                  value={item.text}
                  autoFocus={idx === checkItems.length - 1}
                  onChange={e => {
                    const next = checkItems.map((c, i) => i === idx ? { ...c, text: e.target.value } : c);
                    setCheckItems(next);
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      setCheckItems(prev => [...prev, { text: '', done: false }]);
                    }
                    if (e.key === 'Backspace' && !item.text && checkItems.length > 1) {
                      e.preventDefault();
                      setCheckItems(prev => prev.filter((_, i) => i !== idx));
                    }
                  }}
                  placeholder={`Item ${idx + 1}…`}
                  style={{
                    flex: 1,
                    background: 'var(--bg-input)', color: 'var(--text-primary)',
                    border: '1.5px solid var(--border-primary)', borderRadius: 6,
                    padding: '6px 8px', fontSize: 13, fontFamily: 'inherit', outline: 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (checkItems.length === 1) { setCheckItems([{ text: '', done: false }]); }
                    else setCheckItems(prev => prev.filter((_, i) => i !== idx));
                  }}
                  style={{ background: 'none', border: 'none', color: '#9ba6b6', cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: '0 2px', flexShrink: 0 }}
                >×</button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setCheckItems(prev => [...prev, { text: '', done: false }])}
            style={{
              background: 'none', border: 'none',
              color: '#0079BF', cursor: 'pointer',
              fontSize: 12, fontWeight: 600, padding: '6px 0 0',
              display: 'flex', alignItems: 'center', gap: 4,
            }}
          >
            + Add another item
          </button>
        </div>
      )}

      {/* ── Quick action buttons ────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 8 }}>
        {[
          { key: 'labels',    icon: '🏷',  label: 'Label',       active: selectedLabels.length > 0, badge: selectedLabels.length || null },
          { key: 'date',      icon: '📅',  label: 'Due date',    active: !!dueDate },
          { key: 'cover',     icon: '🎨',  label: 'Cover',       active: !!coverColor },
          { key: 'checklist', icon: '☑',   label: 'Checklist',   active: hasChecklist, badge: hasChecklist ? checkItems.filter(c=>c.text.trim()).length : null },
          { key: 'desc',      icon: '📝',  label: 'Description', active: !!description.trim() },
        ].map(btn => (
          <button
            key={btn.key}
            type="button"
            onClick={() => togglePanel(btn.key)}
            style={quickBtnStyle(btn.key, btn.active)}
          >
            <span style={{ fontSize: 12 }}>{btn.icon}</span>
            {btn.label}
            {btn.badge ? (
              <span style={{
                background: '#0079BF', color: '#fff', borderRadius: '50%',
                width: 15, height: 15, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 9, fontWeight: 700,
              }}>
                {btn.badge}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {/* ── Summary row (shows when options are filled) ─────────────────────── */}
      {(dueDate || description.trim()) && (
        <div style={{
          display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8,
          padding: '6px 8px', background: 'rgba(0,121,191,0.06)', borderRadius: 6,
          border: '1px solid rgba(0,121,191,0.15)',
        }}>
          {dueDate && (
            <span style={{ fontSize: 11, color: '#0079BF', fontWeight: 600 }}>
              📅 Due {new Date(dueDate + 'T00:00:00').toLocaleDateString('en', { month: 'short', day: 'numeric' })}
            </span>
          )}
          {description.trim() && (
            <span style={{ fontSize: 11, color: '#0079BF', fontWeight: 600 }}>
              📝 Has description
            </span>
          )}
        </div>
      )}

      {/* ── Submit row ──────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <button
          type="submit"
          disabled={!title.trim() || submitting}
          style={{
            background: title.trim() && !submitting ? '#0079BF' : '#9ba6b6',
            color: '#fff', border: 'none', borderRadius: 6,
            padding: '7px 16px', fontSize: 14, fontWeight: 600,
            cursor: title.trim() && !submitting ? 'pointer' : 'not-allowed',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => { if (title.trim() && !submitting) e.currentTarget.style.background = '#026aa7'; }}
          onMouseLeave={e => { if (title.trim() && !submitting) e.currentTarget.style.background = '#0079BF'; }}
        >
          {submitting ? 'Adding…' : 'Add card'}
        </button>

        <button
          type="button"
          onClick={onCancel}
          style={{
            background: 'none', border: 'none',
            color: 'var(--text-muted)', cursor: 'pointer',
            width: 32, height: 32, borderRadius: 6,
            fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.15s, color 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-muted)'; }}
        >
          ×
        </button>
      </div>
    </form>
  );
}
