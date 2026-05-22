import { memo } from 'react';
import { getInitials } from '../../utils/stringHelpers';

const MemberAvatar = memo(function MemberAvatar({ member, size = 28, title, showTooltip = true }) {
  const label = member?.name || member?.email || '?';
  const color = member?.avatarColor || '#0052CC';
  const initials = getInitials(label);

  return (
    <div
      title={showTooltip ? label : undefined}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: color,
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.38,
        fontWeight: 700,
        flexShrink: 0,
        border: '2px solid var(--bg-card)',
        userSelect: 'none',
        cursor: showTooltip ? 'default' : 'pointer',
        transition: 'transform 0.15s ease',
      }}
      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
    >
      {initials}
    </div>
  );
});

export default MemberAvatar;
