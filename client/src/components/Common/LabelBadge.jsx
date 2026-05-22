import { memo } from 'react';
import { getContrastColor } from '../../utils/colorHelpers';

const LabelBadge = memo(function LabelBadge({ label, onRemove, small = false }) {
  const textColor = getContrastColor(label.color);
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        background: label.color,
        color: textColor,
        borderRadius: 4,
        padding: small ? '2px 6px' : '3px 8px',
        fontSize: small ? 10 : 11,
        fontWeight: 600,
        letterSpacing: '0.3px',
        userSelect: 'none',
        flexShrink: 0,
      }}
    >
      {label.name || label.color}
      {onRemove && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(label.id); }}
          style={{
            background: 'none',
            border: 'none',
            color: textColor,
            cursor: 'pointer',
            padding: 0,
            lineHeight: 1,
            fontSize: 12,
            opacity: 0.75,
          }}
          title="Remove label"
        >
          ×
        </button>
      )}
    </span>
  );
});

export default LabelBadge;
