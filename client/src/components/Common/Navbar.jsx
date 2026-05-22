import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { createBoard } from '../../api/api';
import { BOARD_COLORS, getPremiumBackground } from '../../utils/colorHelpers';
import { useToast } from '../../context/ToastContext';
import { useClickOutside } from '../../hooks/useClickOutside';

/* ─── Quick Create Modal ─────────────────────────────────────────────────────── */
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
      <div style={{ height: 80, background: getPremiumBackground(bg), backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
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

/* ─── Profile Dropdown ───────────────────────────────────────────────────────── */
function ProfileDropdown({ onClose, toggleTheme, theme }) {
  const ref = useRef(null);
  useClickOutside(ref, onClose);

  const menuItems = [
    { icon: '👤', label: 'Profile', action: () => {} },
    { icon: '⚙️', label: 'Account Settings', action: () => {} },
    { icon: theme === 'dark' ? '☀️' : '🌙', label: theme === 'dark' ? 'Light Mode' : 'Dark Mode', action: toggleTheme },
    { icon: '❓', label: 'Help', action: () => window.open('https://support.atlassian.com/trello/', '_blank') },
    { icon: '🚪', label: 'Log out', action: () => {} },
  ];

  return (
    <div ref={ref} style={{
      position: 'absolute', top: '110%', right: 0,
      background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)',
      borderRadius: 12, boxShadow: 'var(--shadow-lg)',
      width: 220, zIndex: 200, animation: 'slideDown 0.15s ease',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '14px 16px',
        background: 'linear-gradient(135deg,#667eea,#764ba2)',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: 'rgba(255,255,255,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontWeight: 700, fontSize: 16, border: '2px solid rgba(255,255,255,0.5)',
        }}>U</div>
        <div>
          <p style={{ color: 'white', fontWeight: 700, fontSize: 14 }}>User</p>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 11 }}>user@example.com</p>
        </div>
      </div>
      {/* Menu Items */}
      <div style={{ padding: '6px 0' }}>
        {menuItems.map((item, i) => (
          <button
            key={i}
            onClick={() => { item.action(); onClose(); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              width: '100%', padding: '9px 16px',
              background: 'none', border: 'none',
              color: 'var(--text-primary)', fontSize: 13, cursor: 'pointer',
              textAlign: 'left', transition: 'background 0.12s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            <span style={{ fontSize: 15, width: 20, textAlign: 'center' }}>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── Notification Panel ─────────────────────────────────────────────────────── */
function NotificationPanel({ onClose }) {
  const ref = useRef(null);
  useClickOutside(ref, onClose);

  return (
    <div ref={ref} style={{
      position: 'absolute', top: '110%', right: 0,
      background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)',
      borderRadius: 12, boxShadow: 'var(--shadow-lg)',
      width: 300, zIndex: 200, animation: 'slideDown 0.15s ease',
      overflow: 'hidden',
    }}>
      <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>Notifications</p>
        <button style={{ background: 'none', border: 'none', color: 'var(--brand-primary)', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>
          Mark all read
        </button>
      </div>
      <div style={{ padding: 16, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>🔔</div>
        <p style={{ fontWeight: 600, marginBottom: 4, color: 'var(--text-secondary)' }}>All caught up!</p>
        <p>You have no new notifications</p>
      </div>
    </div>
  );
}

/* ─── Navbar ─────────────────────────────────────────────────────────────────── */
export default function Navbar({ onMenuToggle }) {
  const { theme, toggleTheme } = useTheme();
  const [showCreate, setShowCreate] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const createRef = useRef(null);
  const profileRef = useRef(null);
  const notifsRef = useRef(null);

  return (
    <nav style={{
      background: theme === 'dark' ? '#1d2436' : '#0052CC',
      height: 50,
      display: 'flex', alignItems: 'center',
      padding: '0 12px',
      gap: 6,
      position: 'sticky', top: 0, zIndex: 50,
      boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
    }}>
      {/* Hamburger — mobile only triggers sidebar */}
      <button
        id="nav-hamburger"
        onClick={onMenuToggle}
        style={{
          background: 'none', border: 'none', color: 'rgba(255,255,255,0.85)',
          fontSize: 18, cursor: 'pointer', width: 32, height: 32, borderRadius: 6,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 0.15s', flexShrink: 0,
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
        onMouseLeave={e => e.currentTarget.style.background = 'none'}
        aria-label="Toggle menu"
      >
        ☰
      </button>

      {/* Logo */}
      <Link to="/" style={{
        color: 'white', textDecoration: 'none',
        fontWeight: 800, fontSize: 19, letterSpacing: '-0.5px',
        display: 'flex', alignItems: 'center', gap: 6, marginRight: 4,
        flexShrink: 0,
      }}>
        <span style={{
          width: 28, height: 28,
          background: 'rgba(255,255,255,0.2)',
          borderRadius: 6,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16,
        }}>⬛</span>
        <span className="nav-logo-text">Trello</span>
      </Link>

      {/* Nav pills — hidden on mobile */}
      <div className="nav-pills">
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
      </div>

      {/* Create button */}
      <div style={{ position: 'relative', flexShrink: 0 }} ref={createRef}>
        <button
          id="nav-create-btn"
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

      {/* Search — grows, hidden on very small screens */}
      <div className="nav-search" style={{ flex: 1, display: 'flex', justifyContent: 'center', maxWidth: 480, margin: '0 auto' }}>
        <div style={{ position: 'relative', width: '100%' }}>
          <span style={{
            position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
            color: searchFocused ? '#626f86' : 'rgba(255,255,255,0.6)', fontSize: 14, pointerEvents: 'none',
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
            }}
          />
        </div>
      </div>

      {/* Right actions */}
      <div style={{ display: 'flex', gap: 2, marginLeft: 'auto', flexShrink: 0, alignItems: 'center' }}>
        {/* Theme toggle */}
        <button
          id="nav-theme-btn"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          style={{
            background: 'none', border: 'none', color: 'rgba(255,255,255,0.85)',
            width: 34, height: 34, borderRadius: '50%', cursor: 'pointer',
            fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        {/* Notification */}
        <div style={{ position: 'relative' }} ref={notifsRef}>
          <button
            id="nav-notif-btn"
            onClick={() => { setShowNotifs(p => !p); setShowProfile(false); }}
            title="Notifications"
            style={{
              background: 'none', border: 'none', color: 'rgba(255,255,255,0.85)',
              width: 34, height: 34, borderRadius: '50%', cursor: 'pointer',
              fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.15s', position: 'relative',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            🔔
            <span style={{
              position: 'absolute', top: 5, right: 5,
              width: 8, height: 8, background: '#FF5630',
              borderRadius: '50%', border: '1.5px solid white',
            }} />
          </button>
          {showNotifs && (
            <NotificationPanel onClose={() => setShowNotifs(false)} />
          )}
        </div>

        {/* Avatar / Profile */}
        <div style={{ position: 'relative' }} ref={profileRef}>
          <button
            id="nav-avatar-btn"
            onClick={() => { setShowProfile(p => !p); setShowNotifs(false); }}
            title="Account"
            style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'linear-gradient(135deg,#7B68EE,#667eea)',
              border: `2px solid ${showProfile ? 'white' : 'rgba(255,255,255,0.4)'}`,
              color: 'white', fontWeight: 700, fontSize: 14,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'border-color 0.15s',
              flexShrink: 0,
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'white'}
            onMouseLeave={e => { if (!showProfile) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'; }}
          >
            U
          </button>
          {showProfile && (
            <ProfileDropdown
              onClose={() => setShowProfile(false)}
              toggleTheme={toggleTheme}
              theme={theme}
            />
          )}
        </div>
      </div>
    </nav>
  );
}
