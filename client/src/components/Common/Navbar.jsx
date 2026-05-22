import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { createBoard } from '../../api/api';
import { BOARD_COLORS } from '../../utils/colorHelpers';
import { useToast } from '../../context/ToastContext';
import { useClickOutside } from '../../hooks/useClickOutside';

function QuickCreateModal({ onClose }) {
  const [title, setTitle] = useState('');
  const [bg, setBg] = useState(BOARD_COLORS[0]);
  const [creating, setCreating] = useState(false);
  const { addToast } = useToast();
  const navigate = useNavigate();
  const ref = useRef(null);
  useClickOutside(ref, onClose);

  const GRADIENTS = [
    'linear-gradient(135deg,#667eea,#764ba2)',
    'linear-gradient(135deg,#f093fb,#f5576c)',
    'linear-gradient(135deg,#4facfe,#00f2fe)',
    'linear-gradient(135deg,#43e97b,#38f9d7)',
  ];

  async function handleCreate(e) {
    e.preventDefault();
    if (!title.trim()) return;
    setCreating(true);
    try {
      const board = await createBoard({ title: title.trim(), background: bg });
      addToast(`Board "${title}" created!`);
      onClose();
      navigate(`/board/${board.id}`);
    } catch { addToast('Failed to create board', 'error'); }
    setCreating(false);
  }

  return (
    <div style={{
      position: 'absolute', top: '110%', left: 0,
      background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)',
      borderRadius: 14, boxShadow: 'var(--shadow-lg)',
      width: 320, zIndex: 200, animation: 'slideDown 0.15s ease',
      overflow: 'hidden',
    }} ref={ref}>
      <div style={{ height: 80, background: bg, position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(rgba(0,0,0,0.1),rgba(0,0,0,0.3))' }} />
        <div style={{ position: 'absolute', bottom: 8, left: 12, color: 'white', fontWeight: 700, fontSize: 16 }}>
          {title || 'Board name'}
        </div>
      </div>
      <div style={{ padding: 16 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6 }}>BACKGROUND</p>
        <div style={{ display: 'flex', gap: 5, marginBottom: 6 }}>
          {GRADIENTS.map(g => (
            <button key={g} type="button" onClick={() => setBg(g)} style={{
              flex: 1, height: 24, background: g, borderRadius: 5, border: 'none', cursor: 'pointer',
              outline: bg === g ? '2.5px solid var(--brand-primary)' : 'none', outlineOffset: 2,
            }} />
          ))}
        </div>
        <div style={{ display: 'flex', gap: 5, marginBottom: 12 }}>
          {BOARD_COLORS.slice(0, 6).map(c => (
            <button key={c} type="button" onClick={() => setBg(c)} style={{
              width: 24, height: 24, background: c, borderRadius: 5, border: 'none', cursor: 'pointer',
              outline: bg === c ? '2.5px solid var(--brand-primary)' : 'none', outlineOffset: 2,
            }} />
          ))}
        </div>
        <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6 }}>BOARD TITLE *</p>
        <input className="input" value={title} onChange={e => setTitle(e.target.value)} placeholder="Enter board title" autoFocus style={{ marginBottom: 10 }} />
        <button
          onClick={handleCreate}
          className="btn btn-primary"
          disabled={!title.trim() || creating}
          style={{ width: '100%', opacity: (!title.trim() || creating) ? 0.6 : 1 }}
        >
          {creating ? 'Creating…' : 'Create board'}
        </button>
      </div>
    </div>
  );
}

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const [showCreate, setShowCreate] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const createRef = useRef(null);

  return (
    <nav style={{
      background: theme === 'dark' ? '#1d2436' : '#0052CC',
      height: 50,
      display: 'flex', alignItems: 'center',
      padding: '0 12px',
      gap: 8,
      position: 'sticky', top: 0, zIndex: 50,
      boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
    }}>
      {/* Hamburger */}
      <button style={{
        background: 'none', border: 'none', color: 'rgba(255,255,255,0.85)',
        fontSize: 18, cursor: 'pointer', width: 32, height: 32, borderRadius: 6,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 0.15s',
      }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
        onMouseLeave={e => e.currentTarget.style.background = 'none'}
      >
        ☰
      </button>

      {/* Logo */}
      <Link to="/" style={{
        color: 'white', textDecoration: 'none',
        fontWeight: 800, fontSize: 19, letterSpacing: '-0.5px',
        display: 'flex', alignItems: 'center', gap: 6, marginRight: 4,
      }}>
        <span style={{
          width: 28, height: 28,
          background: 'rgba(255,255,255,0.2)',
          borderRadius: 6,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16,
        }}>⬛</span>
        Trello
      </Link>

      {/* Nav pills */}
      {['Workspaces', 'Recent', 'Starred', 'Templates'].map(item => (
        <button key={item} style={{
          background: 'none', border: 'none', color: 'rgba(255,255,255,0.85)',
          fontSize: 14, fontWeight: 500, cursor: 'pointer',
          padding: '6px 10px', borderRadius: 6,
          transition: 'background 0.15s',
          display: 'flex', alignItems: 'center', gap: 4,
          whiteSpace: 'nowrap',
        }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}
        >
          {item} <span style={{ fontSize: 10 }}>▾</span>
        </button>
      ))}

      {/* Create button */}
      <div style={{ position: 'relative' }} ref={createRef}>
        <button
          onClick={() => setShowCreate(p => !p)}
          style={{
            background: 'white', border: 'none',
            color: '#0052CC', fontWeight: 700, fontSize: 14,
            padding: '6px 14px', borderRadius: 6, cursor: 'pointer',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#f0f4ff'}
          onMouseLeave={e => e.currentTarget.style.background = 'white'}
        >
          Create
        </button>
        {showCreate && <QuickCreateModal onClose={() => setShowCreate(false)} />}
      </div>

      {/* Search */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', maxWidth: 480, margin: '0 auto' }}>
        <div style={{ position: 'relative', width: '100%' }}>
          <span style={{
            position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
            color: 'rgba(255,255,255,0.6)', fontSize: 14, pointerEvents: 'none',
          }}>🔍</span>
          <input
            placeholder="Search"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            style={{
              width: '100%',
              background: searchFocused ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.15)',
              border: `1.5px solid ${searchFocused ? 'white' : 'rgba(255,255,255,0.3)'}`,
              borderRadius: 6, padding: '7px 12px 7px 34px',
              color: searchFocused ? '#172b4d' : 'rgba(255,255,255,0.9)',
              fontSize: 14, outline: 'none',
              transition: 'all 0.2s',
              '::placeholder': { color: 'rgba(255,255,255,0.6)' },
            }}
          />
        </div>
      </div>

      {/* Right actions */}
      <div style={{ display: 'flex', gap: 4, marginLeft: 'auto' }}>
        {/* Theme toggle */}
        <button onClick={toggleTheme} style={{
          background: 'none', border: 'none', color: 'rgba(255,255,255,0.85)',
          width: 32, height: 32, borderRadius: '50%', cursor: 'pointer',
          fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 0.15s',
        }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        {/* Notification */}
        <button style={{
          background: 'none', border: 'none', color: 'rgba(255,255,255,0.85)',
          width: 32, height: 32, borderRadius: '50%', cursor: 'pointer',
          fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 0.15s', position: 'relative',
        }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}
        >
          🔔
          <span style={{
            position: 'absolute', top: 4, right: 4,
            width: 8, height: 8, background: '#FF5630',
            borderRadius: '50%', border: '1.5px solid white',
          }} />
        </button>

        {/* Avatar */}
        <button style={{
          width: 32, height: 32, borderRadius: '50%',
          background: 'linear-gradient(135deg,#7B68EE,#667eea)',
          border: '2px solid rgba(255,255,255,0.4)',
          color: 'white', fontWeight: 700, fontSize: 14,
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'border-color 0.15s',
        }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'white'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'}
        >
          U
        </button>
      </div>
    </nav>
  );
}
