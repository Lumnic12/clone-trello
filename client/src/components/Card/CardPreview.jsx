import { memo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import LabelBadge from '../Common/LabelBadge';
import MemberAvatar from '../Common/MemberAvatar';
import DueDateBadge from '../Common/DueDateBadge';

const CardPreview = memo(function CardPreview({ card, onClick, isDragging: isDraggingProp, highlighted = true }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: card.id });

  const totalItems = card.checklistItems?.length || 0;
  const completedItems = card.checklistItems?.filter(i => i.completed)?.length || 0;

  const hasCoverImage = !!card.coverImage;
  const hasCoverColor = !!card.coverColor;
  const isGradient = hasCoverColor && card.coverColor.startsWith('linear-gradient');

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        marginBottom: 8,
        opacity: isSortableDragging ? 0.3 : highlighted ? 1 : 0.25,
        userSelect: 'none',
      }}
      {...attributes}
      {...listeners}
      onClick={(e) => {
        if (isSortableDragging) return;
        e.stopPropagation();
        onClick?.();
      }}
    >
      <div
        style={{
          background: 'var(--bg-card)',
          borderRadius: 10,
          boxShadow: isSortableDragging ? 'var(--shadow-lg)' : 'var(--shadow-card)',
          border: '1px solid var(--border-primary)',
          cursor: 'pointer',
          overflow: 'hidden',
          transition: 'box-shadow 0.15s, transform 0.15s',
        }}
        onMouseEnter={e => {
          if (!isSortableDragging) {
            e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }
        }}
        onMouseLeave={e => {
          e.currentTarget.style.boxShadow = 'var(--shadow-card)';
          e.currentTarget.style.transform = 'none';
        }}
      >
        {/* Cover Image */}
        {hasCoverImage && (
          <div style={{ height: 120, overflow: 'hidden' }}>
            <img
              src={card.coverImage}
              alt=""
              loading="lazy"
              decoding="async"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              onError={e => { e.target.style.display = 'none'; }}
            />
          </div>
        )}

        {/* Cover Color / Gradient */}
        {!hasCoverImage && hasCoverColor && (
          <div style={{
            height: isGradient ? 80 : 8,
            background: card.coverColor,
          }} />
        )}

        <div style={{ padding: '10px 12px' }}>
          {/* Labels */}
          {card.labels?.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 6 }}>
              {card.labels.map(label => (
                <LabelBadge key={label.id} label={label} small />
              ))}
            </div>
          )}

          {/* Title */}
          <p style={{
            fontSize: 14, fontWeight: 500,
            color: 'var(--text-primary)',
            lineHeight: 1.4, marginBottom: 8,
            wordBreak: 'break-word',
          }}>
            {card.title}
          </p>

          {/* Footer */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
              {card.dueDate && <DueDateBadge dueDate={card.dueDate} />}

              {totalItems > 0 && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 3,
                  fontSize: 11,
                  background: completedItems === totalItems ? 'var(--success)' : 'var(--bg-tertiary)',
                  color: completedItems === totalItems ? 'white' : 'var(--text-secondary)',
                  padding: '2px 6px', borderRadius: 4, fontWeight: 500,
                }}>
                  ✓ {completedItems}/{totalItems}
                </span>
              )}

              {card.comments?.length > 0 && (
                <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 2 }}>
                  💬 {card.comments.length}
                </span>
              )}

              {card.description && (
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }} title="Has description">≡</span>
              )}
            </div>

            {/* Avatars */}
            {card.members?.length > 0 && (
              <div style={{ display: 'flex' }}>
                {card.members.slice(0, 4).map(({ member }) => (
                  <div key={member.id} style={{ marginLeft: -4 }}>
                    <MemberAvatar member={member} size={24} />
                  </div>
                ))}
                {card.members.length > 4 && (
                  <span style={{
                    width: 24, height: 24, borderRadius: '50%',
                    background: 'var(--bg-tertiary)', fontSize: 9,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--text-secondary)', fontWeight: 700, marginLeft: -4,
                    border: '2px solid var(--bg-card)',
                  }}>
                    +{card.members.length - 4}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

export default CardPreview;
