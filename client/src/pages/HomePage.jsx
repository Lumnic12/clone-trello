import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBoards, createBoard, deleteBoard, createList } from '../api/api';
import { BOARD_COLORS, getPremiumBackground } from '../utils/colorHelpers';
import { BOARD_TEMPLATES } from '../utils/templates';
import { useToast } from '../context/ToastContext';

/* ─── Sidebar nav item ──────────────────────────────────────────────────────── */
function NavItem({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        width: '100%', padding: '8px 12px', borderRadius: 8,
        background: active ? 'var(--brand-light)' : 'transparent',
        border: 'none', cursor: 'pointer',
        color: active ? 'var(--brand-primary)' : 'var(--text-secondary)',
        fontWeight: active ? 600 : 400, fontSize: 14,
        transition: 'all 0.15s',
        textAlign: 'left',
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = active ? 'var(--brand-primary)' : 'var(--text-secondary)'; } }}
    >
      <span style={{ fontSize: 16, width: 20, textAlign: 'center' }}>{icon}</span>
      {label}
    </button>
  );
}

/* ─── Template Card ─────────────────────────────────────────────────────────── */
function TemplateCard({ template, onUse }) {
  return (
    <div
      onClick={() => onUse(template)}
      style={{
        width: 180, flexShrink: 0,
        borderRadius: 10, overflow: 'hidden',
        cursor: 'pointer', border: '1px solid var(--border-primary)',
        boxShadow: 'var(--shadow-sm)',
        transition: 'transform 0.15s, box-shadow 0.15s',
        background: 'var(--bg-card)',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
    >
      {/* Preview area */}
      <div style={{
        height: 90, background: template.background,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 36, position: 'relative',
      }}>
        <span>{template.emoji}</span>
        {/* Mini column preview */}
        <div style={{
          position: 'absolute', bottom: 6, left: 8, right: 8,
          display: 'flex', gap: 3,
        }}>
          {template.lists.slice(0, 4).map((_, i) => (
            <div key={i} style={{
              flex: 1, height: 4, borderRadius: 2,
              background: 'rgba(255,255,255,0.5)',
            }} />
          ))}
        </div>
      </div>
      <div style={{ padding: '10px 12px' }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
          {template.name}
        </p>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>
          {template.description.slice(0, 55)}…
        </p>
        <span style={{
          display: 'inline-block', marginTop: 8,
          fontSize: 10, fontWeight: 600,
          color: 'var(--brand-primary)', background: 'var(--brand-light)',
          padding: '2px 8px', borderRadius: 20,
        }}>
          {template.category}
        </span>
      </div>
    </div>
  );
}

/* ─── Board Thumbnail ───────────────────────────────────────────────────────── */
function BoardThumbnail({ board, onClick, onDelete }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, cursor: 'pointer' }}>
      <div
        onClick={onClick}
        className="board-thumbnail"
        style={{
          width: '100%', paddingBottom: '62%',
          borderRadius: 10, position: 'relative', overflow: 'hidden',
          background: getPremiumBackground(board.background),
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          boxShadow: 'var(--shadow-sm)',
          transition: 'transform 0.15s, box-shadow 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
      >
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(0,0,0,0.1), rgba(0,0,0,0.35))' }} />
        {/* Mini board preview */}
        <div style={{
          position: 'absolute', bottom: 8, left: 8, right: 8,
          display: 'flex', gap: 5,
        }}>
          {[60, 40, 75, 50].map((h, i) => (
            <div key={i} style={{
              flex: 1, background: 'rgba(255,255,255,0.25)',
              borderRadius: 4, height: h * 0.4,
            }} />
          ))}
        </div>
        {/* Delete btn — visible on hover (or always on touch devices) */}
        <button
          onClick={e => { e.stopPropagation(); onDelete(); }}
          style={{
            position: 'absolute', top: 6, right: 6,
            background: 'rgba(0,0,0,0.35)', border: 'none', color: 'white',
            width: 28, height: 28, borderRadius: 6, cursor: 'pointer',
            fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'opacity 0.15s, background 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(220,38,38,0.75)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.35)'}
          className="board-delete-btn"
          aria-label="Delete board"
          title="Delete board"
        >
          ×
        </button>
      </div>
      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', paddingLeft: 2 }}>
        {board.title}
      </p>
    </div>
  );
}

/* ─── Create Board Modal ────────────────────────────────────────────────────── */
function CreateBoardModal({ template, onClose, onCreated }) {
  const [title, setTitle] = useState(template ? template.name : '');
  const [background, setBackground] = useState(
    template ? template.background : 'url(https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80)'
  );
  const [creating, setCreating] = useState(false);
  const { addToast } = useToast();

  const ALL_COLORS = BOARD_COLORS;
  const GRADIENTS = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
  ];

  const BACKGROUND_PHOTOS = [
    'url(https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80)',
    'url(https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80)',
    'url(https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&fit=crop&q=80)',
    'url(https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?w=800&auto=format&fit=crop&q=80)',
    'url(https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&auto=format&fit=crop&q=80)',
    'url(https://images.unsplash.com/photo-1433832597026-a501c107e5b1?w=800&auto=format&fit=crop&q=80)',
  ];

  async function handleCreate(e) {
    e.preventDefault();
    if (!title.trim()) return;
    setCreating(true);
    try {
      const board = await createBoard({ title: title.trim(), background });
      // If template, create lists
      if (template?.lists) {
        for (let i = 0; i < template.lists.length; i++) {
          await createList({ title: template.lists[i], boardId: board.id });
        }
      }
      onCreated(board);
      addToast(`Board "${title}" created!`);
    } catch {
      addToast('Failed to create board', 'error');
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" style={{ width: 420, padding: 0, overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
        {/* Preview header */}
        <div style={{
          height: 120, background: getPremiumBackground(background),
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative',
        }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,rgba(0,0,0,0.1),rgba(0,0,0,0.3))' }} />
          <div style={{
            position: 'relative', display: 'flex', gap: 8,
          }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{
                width: 40, background: 'rgba(255,255,255,0.3)',
                borderRadius: 6, padding: 6,
              }}>
                {[1, 2].map(j => (
                  <div key={j} style={{ height: 8, background: 'rgba(255,255,255,0.7)', borderRadius: 3, marginBottom: j === 1 ? 4 : 0 }} />
                ))}
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: '20px 24px 24px' }}>
          {template && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              marginBottom: 16, padding: '8px 12px',
              background: 'var(--brand-light)', borderRadius: 8,
              color: 'var(--brand-primary)', fontSize: 13, fontWeight: 500,
            }}>
              {template.emoji} Using template: <strong>{template.name}</strong>
            </div>
          )}

          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
            BOARD TITLE *
          </label>
          <input
            className="input"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Enter board title"
            autoFocus
            style={{ marginBottom: 16 }}
          />

          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>
            BACKGROUND
          </label>

          {/* Photo options */}
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>PHOTOS</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
            {BACKGROUND_PHOTOS.map(p => (
              <button
                key={p}
                type="button"
                onClick={() => setBackground(p)}
                style={{
                  width: 54, height: 36, borderRadius: 6,
                  background: p, backgroundSize: 'cover', backgroundPosition: 'center', border: 'none',
                  cursor: 'pointer', outline: background === p ? '3px solid var(--brand-primary)' : 'none',
                  outlineOffset: 2, transition: 'outline 0.1s',
                }}
              />
            ))}
          </div>

          {/* Gradient options */}
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>GRADIENTS</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
            {GRADIENTS.map(g => (
              <button
                key={g}
                type="button"
                onClick={() => setBackground(g)}
                style={{
                  width: 40, height: 28, borderRadius: 6, background: g, border: 'none',
                  cursor: 'pointer', outline: background === g ? '3px solid var(--brand-primary)' : 'none',
                  outlineOffset: 2, transition: 'outline 0.1s',
                }}
              />
            ))}
          </div>
          {/* Solid colors */}
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>COLORS</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
            {ALL_COLORS.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setBackground(c)}
                style={{
                  width: 28, height: 28, borderRadius: 6, background: c, border: 'none',
                  cursor: 'pointer', outline: background === c ? '3px solid var(--brand-primary)' : 'none',
                  outlineOffset: 2,
                }}
              />
            ))}
          </div>

          {template?.lists && (
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                LISTS TO CREATE
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {template.lists.map((l, i) => (
                  <span key={i} style={{
                    fontSize: 11, padding: '2px 8px',
                    background: 'var(--bg-tertiary)', borderRadius: 20,
                    color: 'var(--text-secondary)', fontWeight: 500,
                  }}>{l}</span>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="btn btn-ghost" onClick={onClose} style={{ flex: 1 }}>Cancel</button>
            <button
              onClick={handleCreate}
              className="btn btn-primary"
              disabled={!title.trim() || creating}
              style={{ flex: 2, opacity: (!title.trim() || creating) ? 0.6 : 1 }}
            >
              {creating ? 'Creating…' : 'Create Board'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   HOME PAGE — MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════════════ */
export default function HomePage({ mobileSidebarOpen = false, onSidebarClose }) {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('boards'); // boards | templates
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [workspaceInfoModal, setWorkspaceInfoModal] = useState(null); // null | 'members' | 'settings'
  const navigate = useNavigate();
  const { addToast } = useToast();

  useEffect(() => {
    getBoards()
      .then(setBoards)
      .catch(() => addToast('Failed to load boards', 'error'))
      .finally(() => setLoading(false));
  }, []);

  function handleBoardCreated(board) {
    setBoards(prev => [board, ...prev]);
    setShowCreateModal(false);
    setSelectedTemplate(null);
    navigate(`/board/${board.id}`);
  }

  async function handleDeleteBoard(id) {
    if (!confirm('Delete this board and all its content?')) return;
    try {
      await deleteBoard(id);
      setBoards(prev => prev.filter(b => b.id !== id));
      addToast('Board deleted');
    } catch { addToast('Failed to delete board', 'error'); }
  }

  function openTemplate(tmpl) {
    setSelectedTemplate(tmpl);
    setShowCreateModal(true);
  }

  const categories = ['All', ...new Set(BOARD_TEMPLATES.map(t => t.category))];
  const filteredTemplates = categoryFilter === 'All'
    ? BOARD_TEMPLATES
    : BOARD_TEMPLATES.filter(t => t.category === categoryFilter);

  const WORKSPACE_NAME = 'My Workspace';

  // Close sidebar when navigating on mobile
  function handleSidebarNavClick(tab) {
    setActiveTab(tab);
    if (onSidebarClose) onSidebarClose();
  }

  const sidebarContent = (
    <aside
      className="home-sidebar"
      style={{
        width: 260, flexShrink: 0,
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-primary)',
        padding: '16px 12px',
        display: 'flex', flexDirection: 'column', gap: 4,
        overflowY: 'auto',
      }}
    >
      <NavItem icon="⊞" label="Boards" active={activeTab === 'boards'} onClick={() => handleSidebarNavClick('boards')} />
      <NavItem icon="◫" label="Templates" active={activeTab === 'templates'} onClick={() => handleSidebarNavClick('templates')} />
      <NavItem icon="⌂" label="Home" active={false} onClick={() => handleSidebarNavClick('boards')} />

      <div style={{ height: 1, background: 'var(--border-primary)', margin: '12px 0 8px' }} />

      {/* Workspaces */}
      <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', padding: '0 8px', marginBottom: 4 }}>
        Workspaces
      </p>

      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '6px 12px', borderRadius: 8,
        background: 'var(--bg-hover)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 700, fontSize: 14,
          }}>
            {WORKSPACE_NAME[0]}
          </div>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
            {WORKSPACE_NAME}
          </span>
        </div>
        <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>▾</span>
      </div>

      <div style={{ paddingLeft: 8 }}>
        <NavItem icon="⊞" label="Boards" active={false} onClick={() => handleSidebarNavClick('boards')} />
        <NavItem icon="👤" label="Members" active={false} onClick={() => setWorkspaceInfoModal('members')} />
        <NavItem icon="⚙" label="Settings" active={false} onClick={() => setWorkspaceInfoModal('settings')} />
      </div>

      <div style={{ marginTop: 'auto', paddingTop: 16 }}>
        <div style={{
          background: 'linear-gradient(135deg, #667eea, #764ba2)',
          borderRadius: 10, padding: '14px 16px',
          color: 'white',
        }}>
          <p style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>⚡ Go Premium</p>
          <p style={{ fontSize: 11, opacity: 0.85, lineHeight: 1.4, marginBottom: 10 }}>
            Unlock unlimited boards, power-ups, and more!
          </p>
          <button style={{
            background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)',
            color: 'white', borderRadius: 6, padding: '5px 12px',
            fontSize: 12, cursor: 'pointer', fontWeight: 600, width: '100%',
            transition: 'background 0.15s',
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
          >
            Upgrade Free →
          </button>
        </div>
      </div>
    </aside>
  );

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 50px)', background: 'var(--bg-primary)', position: 'relative' }}>

      {/* ── MOBILE SIDEBAR OVERLAY ──────────────────────────────────────────── */}
      {mobileSidebarOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 40,
            background: 'rgba(0,0,0,0.45)',
          }}
          onClick={onSidebarClose}
          aria-label="Close menu"
        />
      )}

      {/* ── MOBILE SIDEBAR DRAWER (slides in from left) ──────────────────────── */}
      <div
        className="mobile-sidebar-drawer"
        style={{
          transform: mobileSidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        }}
      >
        {sidebarContent}
      </div>

      {/* ── DESKTOP SIDEBAR ─────────────────────────────────────────────────── */}
      <div className="desktop-sidebar">
        {sidebarContent}
      </div>

      {/* ── MAIN CONTENT ─────────────────────────────────────────────────────── */}
      <main className="home-main" style={{ flex: 1, overflowY: 'auto', padding: '32px 40px' }}>

        {activeTab === 'boards' && (
          <>
            {/* ── Templates Showcase ─────────────────────────────────────── */}
            <section style={{
              background: 'var(--bg-card)',
              borderRadius: 16, border: '1px solid var(--border-primary)',
              marginBottom: 36, overflow: 'hidden',
              boxShadow: 'var(--shadow-sm)',
            }}>
              <div style={{ padding: '20px 24px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>
                    ✦ Most popular templates
                  </h2>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                    Get going faster with a template
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('templates')}
                  style={{
                    background: 'none', border: 'none',
                    color: 'var(--brand-primary)', fontSize: 13, fontWeight: 600,
                    cursor: 'pointer', padding: '6px 12px', borderRadius: 6,
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--brand-light)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  Browse all →
                </button>
              </div>

              <div style={{
                display: 'flex', gap: 12,
                padding: '0 24px 20px',
                overflowX: 'auto', scrollbarWidth: 'thin',
              }}>
                {BOARD_TEMPLATES.map(tmpl => (
                  <TemplateCard key={tmpl.id} template={tmpl} onUse={openTemplate} />
                ))}
              </div>
            </section>

            {/* ── Recently Viewed ─────────────────────────────────────────── */}
            {boards.length > 0 && (
              <section style={{ marginBottom: 36 }}>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>🕐</span> Recently viewed
                </h2>
                <div className="board-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 16, maxWidth: 700 }}>
                  {boards.slice(0, 4).map(board => (
                    <BoardThumbnail
                      key={board.id}
                      board={board}
                      onClick={() => navigate(`/board/${board.id}`)}
                      onDelete={() => handleDeleteBoard(board.id)}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* ── YOUR WORKSPACES ─────────────────────────────────────────── */}
            <section>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  YOUR WORKSPACES
                </h2>
              </div>

              {/* Workspace header */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: 16,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: 700, fontSize: 16,
                  }}>M</div>
                  <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>My Workspace</span>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {[
                    { label: '⊞ Boards', action: () => setActiveTab('boards') },
                    { label: '👤 Members', action: () => setWorkspaceInfoModal('members') },
                    { label: '⚙ Settings', action: () => setWorkspaceInfoModal('settings') },
                  ].map(({ label, action }) => (
                    <button
                      key={label}
                      onClick={action}
                      style={{
                        background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)',
                        color: 'var(--text-secondary)', borderRadius: 6,
                        padding: '5px 12px', fontSize: 12, cursor: 'pointer',
                        transition: 'all 0.15s', fontWeight: 500,
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-tertiary)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Board grid */}
              {loading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 16 }}>
                  {[...Array(8)].map((_, i) => (
                    <div key={i} style={{ paddingBottom: '62%', background: 'var(--bg-tertiary)', borderRadius: 10, animation: 'pulse 1.5s ease-in-out infinite' }} />
                  ))}
                </div>
              ) : (
                <div className="board-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 16 }}>
                  {boards.map(board => (
                    <BoardThumbnail
                      key={board.id}
                      board={board}
                      onClick={() => navigate(`/board/${board.id}`)}
                      onDelete={() => handleDeleteBoard(board.id)}
                    />
                  ))}

                  {/* Create new board */}
                  <div
                    onClick={() => { setSelectedTemplate(null); setShowCreateModal(true); }}
                    style={{
                      paddingBottom: '62%', position: 'relative',
                      borderRadius: 10, cursor: 'pointer',
                      background: 'var(--bg-tertiary)',
                      border: '2px dashed var(--border-secondary)',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'var(--bg-hover)';
                      e.currentTarget.style.borderColor = 'var(--brand-primary)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'var(--bg-tertiary)';
                      e.currentTarget.style.borderColor = 'var(--border-secondary)';
                    }}
                  >
                    <div style={{
                      position: 'absolute', inset: 0,
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center',
                      color: 'var(--text-muted)', gap: 4,
                    }}>
                      <span style={{ fontSize: 24 }}>+</span>
                      <span style={{ fontSize: 13, fontWeight: 500 }}>Create new board</span>
                    </div>
                  </div>
                </div>
              )}

              {/* View all closed boards */}
              <button style={{
                background: 'none', border: 'none',
                color: 'var(--text-secondary)', fontSize: 13,
                cursor: 'pointer', marginTop: 20, padding: '6px 0',
              }}>
                View all closed boards
              </button>
            </section>
          </>
        )}

        {activeTab === 'templates' && (
          <div>
            <div style={{ marginBottom: 32 }}>
              <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                Board Templates
              </h1>
              <p style={{ fontSize: 15, color: 'var(--text-secondary)' }}>
                Get started quickly with a professionally designed template
              </p>
            </div>

            {/* Category filter */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  style={{
                    padding: '7px 18px', borderRadius: 20,
                    border: `1.5px solid ${categoryFilter === cat ? 'var(--brand-primary)' : 'var(--border-primary)'}`,
                    background: categoryFilter === cat ? 'var(--brand-primary)' : 'transparent',
                    color: categoryFilter === cat ? 'white' : 'var(--text-secondary)',
                    fontWeight: 600, fontSize: 13, cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {filteredTemplates.map(tmpl => (
                <div
                  key={tmpl.id}
                  style={{
                    borderRadius: 14, overflow: 'hidden',
                    border: '1px solid var(--border-primary)',
                    background: 'var(--bg-card)',
                    boxShadow: 'var(--shadow-sm)',
                    transition: 'transform 0.15s, box-shadow 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
                >
                  <div style={{ height: 130, background: tmpl.background, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48, position: 'relative' }}>
                    {tmpl.emoji}
                    <div style={{
                      position: 'absolute', bottom: 10, left: 12, right: 12,
                      display: 'flex', gap: 5,
                    }}>
                      {tmpl.lists.slice(0, 5).map((list, i) => (
                        <div key={i} style={{
                          flex: 1, background: 'rgba(255,255,255,0.25)',
                          borderRadius: 4, padding: '4px 3px',
                        }}>
                          <div style={{ height: 3, background: 'rgba(255,255,255,0.7)', borderRadius: 2, marginBottom: 2 }} />
                          <div style={{ height: 3, background: 'rgba(255,255,255,0.5)', borderRadius: 2, width: '70%' }} />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ padding: '16px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                      <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{tmpl.name}</h3>
                      <span style={{
                        fontSize: 10, fontWeight: 600,
                        color: 'var(--brand-primary)', background: 'var(--brand-light)',
                        padding: '2px 8px', borderRadius: 20, flexShrink: 0, marginLeft: 8,
                      }}>{tmpl.category}</span>
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 12 }}>
                      {tmpl.description}
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 14 }}>
                      {tmpl.lists.map((l, i) => (
                        <span key={i} style={{
                          fontSize: 11, padding: '2px 8px',
                          background: 'var(--bg-tertiary)', borderRadius: 20,
                          color: 'var(--text-secondary)',
                        }}>{l}</span>
                      ))}
                    </div>
                    <button
                      onClick={() => openTemplate(tmpl)}
                      className="btn btn-primary"
                      style={{ width: '100%', justifyContent: 'center', fontSize: 14 }}
                    >
                      Use Template
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Create Board / Template Modal */}
      {showCreateModal && (
        <CreateBoardModal
          template={selectedTemplate}
          onClose={() => { setShowCreateModal(false); setSelectedTemplate(null); }}
          onCreated={handleBoardCreated}
        />
      )}

      {/* Workspace Info Modal (Members / Settings) */}
      {workspaceInfoModal && (
        <div className="modal-backdrop" onClick={() => setWorkspaceInfoModal(null)}>
          <div className="modal-box" style={{ width: 460, maxWidth: '95vw', padding: 0, overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div style={{
              padding: '16px 20px',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 8,
                  background: 'rgba(255,255,255,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18,
                }}>
                  {workspaceInfoModal === 'members' ? '👥' : '⚙️'}
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 16 }}>
                    {workspaceInfoModal === 'members' ? 'Workspace Members' : 'Workspace Settings'}
                  </p>
                  <p style={{ fontSize: 12, opacity: 0.8 }}>My Workspace</p>
                </div>
              </div>
              <button
                onClick={() => setWorkspaceInfoModal(null)}
                style={{
                  background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white',
                  width: 30, height: 30, borderRadius: '50%', cursor: 'pointer', fontSize: 18,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >×</button>
            </div>

            {/* Content */}
            <div style={{ padding: '20px 24px' }}>
              {workspaceInfoModal === 'members' ? (
                <div>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
                    Manage your workspace members and their access levels.
                  </p>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 16px', borderRadius: 10,
                    background: 'var(--bg-tertiary)', marginBottom: 12,
                  }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: '50%',
                      background: 'linear-gradient(135deg,#7B68EE,#667eea)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontWeight: 700, fontSize: 16, flexShrink: 0,
                    }}>U</div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>User (You)</p>
                      <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>user@example.com · Admin</p>
                    </div>
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: '3px 10px',
                      background: 'var(--brand-light)', color: 'var(--brand-primary)',
                      borderRadius: 20,
                    }}>Admin</span>
                  </div>
                  <button
                    className="btn btn-primary"
                    style={{ width: '100%', justifyContent: 'center' }}
                    onClick={() => { addToast('Invite feature coming soon!'); }}
                  >
                    + Invite Members
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>
                    Manage workspace name, visibility, and preferences.
                  </p>
                  {[
                    { label: 'Workspace Name', value: 'My Workspace', icon: '🏢' },
                    { label: 'Visibility', value: 'Private', icon: '🔒' },
                    { label: 'Plan', value: 'Free', icon: '⚡' },
                  ].map(item => (
                    <div key={item.label} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '10px 14px', borderRadius: 8,
                      background: 'var(--bg-tertiary)',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 16 }}>{item.icon}</span>
                        <div>
                          <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>{item.label}</p>
                          <p style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 600 }}>{item.value}</p>
                        </div>
                      </div>
                      <button
                        style={{
                          background: 'none', border: '1px solid var(--border-primary)',
                          color: 'var(--text-secondary)', borderRadius: 6,
                          padding: '4px 10px', fontSize: 12, cursor: 'pointer',
                        }}
                        onClick={() => addToast('Settings update coming soon!')}
                      >Edit</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .board-thumbnail:hover .board-delete-btn { opacity: 1 !important; }
        /* On touch devices: always show delete button slightly */
        @media (hover: none) {
          .board-delete-btn { opacity: 0.7 !important; }
        }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
      `}</style>
    </div>
  );
}
