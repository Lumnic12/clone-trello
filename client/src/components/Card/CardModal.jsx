import { useState, useEffect, useCallback } from 'react';
import {
  getCardById, updateCard, deleteCard,
  addLabel, deleteLabel,
  addChecklistItem, updateChecklistItem, deleteChecklistItem,
  getMembers, assignMember, removeMember,
  getComments, addComment, deleteComment,
} from '../../api/api';
import { useToast } from '../../context/ToastContext';
import { useEscapeKey } from '../../hooks/useEscapeKey';
import LabelBadge from '../Common/LabelBadge';
import MemberAvatar from '../Common/MemberAvatar';
import DueDateBadge from '../Common/DueDateBadge';
import { LABEL_COLORS, AVATAR_COLORS } from '../../utils/colorHelpers';
import { COVER_IMAGES, COVER_GRADIENTS } from '../../utils/templates';
import { formatDate, toInputDate } from '../../utils/dateHelpers';

// Demo member for comments (first available member)
const DEMO_COMMENT_MEMBER_KEY = 'trello-comment-member';

export default function CardModal({ cardId, lists, onClose, onCardUpdated, onCardDeleted }) {
  const { addToast } = useToast();
  const [card, setCard] = useState(null);
  const [allMembers, setAllMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editingTitle, setEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState('');
  const [editingDesc, setEditingDesc] = useState(false);
  const [descInput, setDescInput] = useState('');
  const [dueDateInput, setDueDateInput] = useState('');
  const [commentText, setCommentText] = useState('');
  const [checklistText, setChecklistText] = useState('');
  const [showLabelPicker, setShowLabelPicker] = useState(false);
  const [labelName, setLabelName] = useState('');
  const [labelColor, setLabelColor] = useState(LABEL_COLORS[0].color);
  const [coverColor, setCoverColor] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [submittingComment, setSubmittingComment] = useState(false);

  useEscapeKey(onClose);

  const fetchCard = useCallback(async () => {
    try {
      const [cardData, members] = await Promise.all([getCardById(cardId), getMembers()]);
      setCard(cardData);
      setTitleInput(cardData.title);
      setDescInput(cardData.description || '');
      setDueDateInput(toInputDate(cardData.dueDate));
      setCoverColor(cardData.coverColor);
      setCoverImage(cardData.coverImage || null);
      setAllMembers(members);
    } catch {
      addToast('Failed to load card', 'error');
      onClose();
    } finally {
      setLoading(false);
    }
  }, [cardId]);

  useEffect(() => { fetchCard(); }, [fetchCard]);

  // ─── Title ───────────────────────────────────────────────────────────────────
  async function saveTitle() {
    if (!titleInput.trim()) { setTitleInput(card.title); setEditingTitle(false); return; }
    try {
      const updated = await updateCard(cardId, { title: titleInput.trim() });
      setCard(c => ({ ...c, title: updated.title }));
      onCardUpdated(updated);
    } catch { addToast('Failed to update title', 'error'); }
    setEditingTitle(false);
  }

  // ─── Description ─────────────────────────────────────────────────────────────
  async function saveDesc() {
    try {
      const updated = await updateCard(cardId, { description: descInput });
      setCard(c => ({ ...c, description: updated.description }));
      onCardUpdated(updated);
      addToast('Description saved');
    } catch { addToast('Failed to update description', 'error'); }
    setEditingDesc(false);
  }

  // ─── Due Date ────────────────────────────────────────────────────────────────
  async function saveDueDate(val) {
    setDueDateInput(val);
    try {
      const updated = await updateCard(cardId, { dueDate: val || null });
      setCard(c => ({ ...c, dueDate: updated.dueDate }));
      onCardUpdated(updated);
      addToast(val ? 'Due date set' : 'Due date removed');
    } catch { addToast('Failed to update due date', 'error'); }
  }

  // ─── Cover Color ─────────────────────────────────────────────────────────────
  async function saveCoverColor(color) {
    setCoverColor(color);
    setCoverImage(null);
    try {
      const updated = await updateCard(cardId, { coverColor: color, coverImage: null });
      setCard(c => ({ ...c, coverColor: updated.coverColor, coverImage: null }));
      onCardUpdated(updated);
    } catch { addToast('Failed to update cover', 'error'); }
  }

  // ─── Cover Image ─────────────────────────────────────────────────────────────
  async function saveCoverImage(imgUrl) {
    const newImg = coverImage === imgUrl ? null : imgUrl;
    setCoverImage(newImg);
    setCoverColor(null);
    try {
      const updated = await updateCard(cardId, { coverImage: newImg, coverColor: null });
      setCard(c => ({ ...c, coverImage: updated.coverImage, coverColor: null }));
      onCardUpdated(updated);
    } catch { addToast('Failed to update cover image', 'error'); }
  }

  // ─── Labels ──────────────────────────────────────────────────────────────────
  async function handleAddLabel(e) {
    e.preventDefault();
    try {
      const label = await addLabel(cardId, { name: labelName, color: labelColor });
      setCard(c => ({ ...c, labels: [...c.labels, label] }));
      setLabelName('');
      setShowLabelPicker(false);
      addToast('Label added');
    } catch { addToast('Failed to add label', 'error'); }
  }

  async function handleRemoveLabel(labelId) {
    try {
      await deleteLabel(labelId);
      setCard(c => ({ ...c, labels: c.labels.filter(l => l.id !== labelId) }));
      addToast('Label removed');
    } catch { addToast('Failed to remove label', 'error'); }
  }

  // ─── Checklist ───────────────────────────────────────────────────────────────
  async function handleAddChecklist(e) {
    e.preventDefault();
    if (!checklistText.trim()) return;
    try {
      const item = await addChecklistItem(cardId, { text: checklistText.trim() });
      setCard(c => ({ ...c, checklistItems: [...c.checklistItems, item] }));
      setChecklistText('');
    } catch { addToast('Failed to add item', 'error'); }
  }

  async function handleToggleChecklist(item) {
    try {
      const updated = await updateChecklistItem(item.id, { completed: !item.completed });
      setCard(c => ({ ...c, checklistItems: c.checklistItems.map(i => i.id === item.id ? updated : i) }));
    } catch { addToast('Failed to update item', 'error'); }
  }

  async function handleDeleteChecklist(itemId) {
    try {
      await deleteChecklistItem(itemId);
      setCard(c => ({ ...c, checklistItems: c.checklistItems.filter(i => i.id !== itemId) }));
    } catch { addToast('Failed to delete item', 'error'); }
  }

  // ─── Members ─────────────────────────────────────────────────────────────────
  const assignedIds = card?.members.map(m => m.memberId || m.member?.id) || [];

  async function handleToggleMember(memberId) {
    const isAssigned = assignedIds.includes(memberId);
    try {
      if (isAssigned) {
        await removeMember(cardId, memberId);
        setCard(c => ({ ...c, members: c.members.filter(m => (m.memberId || m.member?.id) !== memberId) }));
        addToast('Member removed');
      } else {
        const cm = await assignMember(cardId, memberId);
        const memberObj = allMembers.find(m => m.id === memberId);
        setCard(c => ({ ...c, members: [...c.members, { memberId, member: memberObj }] }));
        addToast('Member assigned');
      }
    } catch { addToast('Failed to update member', 'error'); }
  }

  // ─── Comments ────────────────────────────────────────────────────────────────
  async function handleAddComment(e) {
    e.preventDefault();
    if (!commentText.trim() || !allMembers.length) return;
    setSubmittingComment(true);
    const commentMemberId = allMembers[0].id; // Use first member as "current user"
    try {
      const comment = await addComment(cardId, { text: commentText.trim(), memberId: commentMemberId });
      setCard(c => ({ ...c, comments: [comment, ...c.comments] }));
      setCommentText('');
    } catch { addToast('Failed to add comment', 'error'); }
    setSubmittingComment(false);
  }

  async function handleDeleteComment(commentId) {
    try {
      await deleteComment(commentId);
      setCard(c => ({ ...c, comments: c.comments.filter(cm => cm.id !== commentId) }));
    } catch { addToast('Failed to delete comment', 'error'); }
  }

  // ─── Archive / Delete ────────────────────────────────────────────────────────
  async function handleArchive() {
    try {
      const updated = await updateCard(cardId, { archived: !card.archived });
      setCard(c => ({ ...c, archived: updated.archived }));
      onCardUpdated(updated);
      addToast(updated.archived ? 'Card archived' : 'Card unarchived');
    } catch { addToast('Failed to archive card', 'error'); }
  }

  async function handleDelete() {
    if (!confirm('Delete this card permanently?')) return;
    try {
      await deleteCard(cardId);
      onCardDeleted(cardId, card.listId);
      addToast('Card deleted');
    } catch { addToast('Failed to delete card', 'error'); }
  }

  if (loading || !card) {
    return (
      <div className="modal-backdrop" onClick={onClose}>
        <div className="modal-box" style={{ width: 740, padding: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid var(--brand-primary)', borderTopColor: 'transparent', animation: 'spin 0.7s linear infinite' }} />
        </div>
      </div>
    );
  }

  const totalItems = card.checklistItems.length;
  const completedItems = card.checklistItems.filter(i => i.completed).length;
  const listName = lists.find(l => l.id === card.listId)?.title || '';

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-box"
        style={{ width: 740, padding: 0, maxHeight: '92vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Cover Image */}
        {card.coverImage && (
          <div style={{ height: 160, flexShrink: 0, borderRadius: '16px 16px 0 0', overflow: 'hidden', position: 'relative' }}>
            <img src={card.coverImage} alt="Cover" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.3))' }} />
          </div>
        )}

        {/* Cover Color/Gradient (no image) */}
        {!card.coverImage && card.coverColor && (
          <div style={{
            height: card.coverColor.startsWith('linear') ? 120 : 10,
            background: card.coverColor,
            borderRadius: '16px 16px 0 0', flexShrink: 0,
          }} />
        )}

        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: (card.coverImage || (card.coverColor?.startsWith('linear'))) ? 12 : (card.coverColor ? 18 : 12),
            right: 12,
            background: (card.coverImage || card.coverColor?.startsWith('linear')) ? 'rgba(0,0,0,0.4)' : 'var(--bg-hover)',
            border: 'none',
            color: (card.coverImage || card.coverColor?.startsWith('linear')) ? 'white' : 'var(--text-secondary)',
            width: 32, height: 32, borderRadius: 8, cursor: 'pointer', fontSize: 18,
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1,
          }}
        >
          ×
        </button>

        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* ── LEFT COLUMN ───────────────────────────────────────── */}
          <div style={{ flex: 1, padding: 24, overflowY: 'auto' }}>

            {/* Card list breadcrumb */}
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
              📋 in <strong>{listName}</strong>
            </p>

            {/* Title */}
            {editingTitle ? (
              <textarea
                value={titleInput}
                onChange={e => setTitleInput(e.target.value)}
                onBlur={saveTitle}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); saveTitle(); } }}
                autoFocus
                rows={2}
                style={{
                  width: '100%', resize: 'none', fontWeight: 700, fontSize: 20,
                  background: 'var(--bg-input)', color: 'var(--text-primary)',
                  border: '2px solid var(--border-focus)', borderRadius: 8,
                  padding: '8px 10px', fontFamily: 'inherit', outline: 'none', marginBottom: 16,
                }}
              />
            ) : (
              <h2
                onClick={() => setEditingTitle(true)}
                style={{
                  fontSize: 20, fontWeight: 700, color: 'var(--text-primary)',
                  marginBottom: 16, lineHeight: 1.3, cursor: 'text',
                  padding: '6px 8px', borderRadius: 8, transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {card.title}
              </h2>
            )}

            {/* Status badges */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
              {card.archived && (
                <span style={{ background: 'var(--warning)', color: 'white', borderRadius: 6, padding: '3px 10px', fontSize: 12, fontWeight: 600 }}>
                  📦 Archived
                </span>
              )}
              {card.dueDate && <DueDateBadge dueDate={card.dueDate} />}
            </div>

            {/* Labels */}
            {card.labels.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8 }}>Labels</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {card.labels.map(label => (
                    <LabelBadge key={label.id} label={label} onRemove={handleRemoveLabel} />
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div style={{ marginBottom: 24 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8 }}>
                📝 Description
              </p>
              {editingDesc ? (
                <div>
                  <textarea
                    value={descInput}
                    onChange={e => setDescInput(e.target.value)}
                    autoFocus
                    rows={4}
                    placeholder="Add a description…"
                    style={{
                      width: '100%', resize: 'vertical',
                      background: 'var(--bg-input)', color: 'var(--text-primary)',
                      border: '2px solid var(--border-focus)', borderRadius: 8,
                      padding: '10px 12px', fontFamily: 'inherit', fontSize: 14,
                      outline: 'none', marginBottom: 8, lineHeight: 1.6,
                    }}
                  />
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-primary" style={{ fontSize: 13, padding: '6px 14px' }} onClick={saveDesc}>Save</button>
                    <button className="btn btn-ghost" style={{ fontSize: 13 }} onClick={() => { setEditingDesc(false); setDescInput(card.description || ''); }}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => setEditingDesc(true)}
                  style={{
                    minHeight: 60, padding: '10px 12px',
                    background: 'var(--bg-tertiary)', borderRadius: 8,
                    cursor: 'text', fontSize: 14, color: card.description ? 'var(--text-primary)' : 'var(--text-muted)',
                    lineHeight: 1.6, transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-tertiary)'}
                >
                  {card.description || 'Add a description…'}
                </div>
              )}
            </div>

            {/* Checklist */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                  ✓ Checklist {totalItems > 0 && `(${completedItems}/${totalItems})`}
                </p>
              </div>

              {/* Progress bar */}
              {totalItems > 0 && (
                <div style={{ height: 4, background: 'var(--bg-tertiary)', borderRadius: 2, marginBottom: 10, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${(completedItems / totalItems) * 100}%`,
                    background: completedItems === totalItems ? 'var(--success)' : 'var(--brand-primary)',
                    borderRadius: 2, transition: 'width 0.3s ease',
                  }} />
                </div>
              )}

              {card.checklistItems.map(item => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '6px 8px', borderRadius: 6,
                    marginBottom: 4, transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => handleToggleChecklist(item)}
                    style={{ width: 16, height: 16, cursor: 'pointer', accentColor: 'var(--brand-primary)' }}
                  />
                  <span style={{
                    flex: 1, fontSize: 14, color: 'var(--text-primary)',
                    textDecoration: item.completed ? 'line-through' : 'none',
                    opacity: item.completed ? 0.6 : 1,
                  }}>
                    {item.text}
                  </span>
                  <button
                    onClick={() => handleDeleteChecklist(item.id)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 16, opacity: 0.6 }}
                  >
                    ×
                  </button>
                </div>
              ))}

              <form onSubmit={handleAddChecklist} style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                <input
                  className="input"
                  value={checklistText}
                  onChange={e => setChecklistText(e.target.value)}
                  placeholder="Add an item…"
                  style={{ flex: 1 }}
                />
                <button type="submit" className="btn btn-primary" style={{ fontSize: 13, padding: '6px 12px', flexShrink: 0 }}>
                  Add
                </button>
              </form>
            </div>

            {/* Comments */}
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 12 }}>
                💬 Comments ({card.comments.length})
              </p>
              <form onSubmit={handleAddComment} style={{ marginBottom: 16 }}>
                <textarea
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  placeholder="Write a comment…"
                  rows={2}
                  style={{
                    width: '100%', resize: 'none',
                    background: 'var(--bg-input)', color: 'var(--text-primary)',
                    border: '1.5px solid var(--border-primary)', borderRadius: 8,
                    padding: '8px 10px', fontFamily: 'inherit', fontSize: 14,
                    outline: 'none', marginBottom: 8, lineHeight: 1.5,
                    transition: 'border-color 0.15s',
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--border-focus)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border-primary)'}
                />
                {commentText.trim() && (
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submittingComment}
                    style={{ fontSize: 13, padding: '6px 14px' }}
                  >
                    {submittingComment ? 'Posting…' : 'Post comment'}
                  </button>
                )}
              </form>

              {card.comments.map(comment => (
                <div
                  key={comment.id}
                  style={{
                    display: 'flex', gap: 10, marginBottom: 14,
                    padding: '10px 12px', background: 'var(--bg-tertiary)',
                    borderRadius: 10,
                  }}
                >
                  <MemberAvatar member={comment.member} size={30} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
                      <strong style={{ fontSize: 13, color: 'var(--text-primary)' }}>{comment.member?.name}</strong>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{formatDate(comment.createdAt)}</span>
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{comment.text}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 16, alignSelf: 'flex-start', opacity: 0.6 }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT SIDEBAR ─────────────────────────────────────── */}
          <div style={{
            width: 200, flexShrink: 0,
            borderLeft: '1px solid var(--border-primary)',
            padding: '24px 16px',
            overflowY: 'auto',
            background: 'var(--bg-secondary)',
            borderRadius: '0 16px 16px 0',
          }}>

            {/* Members */}
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 10 }}>Members</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
              {allMembers.map(member => {
                const isAssigned = card.members.some(m => (m.memberId || m.member?.id) === member.id);
                return (
                  <button
                    key={member.id}
                    onClick={() => handleToggleMember(member.id)}
                    title={`${isAssigned ? 'Remove' : 'Assign'} ${member.name}`}
                    style={{
                      background: 'none', border: `2px solid ${isAssigned ? 'var(--brand-primary)' : 'transparent'}`,
                      borderRadius: '50%', padding: 0, cursor: 'pointer',
                      transition: 'border-color 0.15s, transform 0.1s',
                      transform: isAssigned ? 'scale(1.05)' : 'scale(1)',
                    }}
                  >
                    <MemberAvatar member={member} size={32} showTooltip={false} />
                  </button>
                );
              })}
            </div>

            <div style={{ height: 1, background: 'var(--border-primary)', margin: '12px 0' }} />

            {/* Labels */}
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 10 }}>Labels</p>
            <button
              onClick={() => setShowLabelPicker(p => !p)}
              className="btn btn-ghost"
              style={{ width: '100%', justifyContent: 'flex-start', fontSize: 13, marginBottom: showLabelPicker ? 8 : 12 }}
            >
              🏷 Add label
            </button>
            {showLabelPicker && (
              <form onSubmit={handleAddLabel} style={{ marginBottom: 12, animation: 'slideDown 0.15s ease' }}>
                <input
                  className="input"
                  value={labelName}
                  onChange={e => setLabelName(e.target.value)}
                  placeholder="Label name (optional)"
                  style={{ marginBottom: 8, fontSize: 12 }}
                />
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
                  {LABEL_COLORS.map(({ color }) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setLabelColor(color)}
                      style={{
                        width: 24, height: 24, borderRadius: 4, background: color,
                        border: labelColor === color ? '3px solid var(--text-primary)' : '2px solid transparent',
                        cursor: 'pointer',
                      }}
                    />
                  ))}
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', fontSize: 12, padding: '6px 0' }}>
                  Add label
                </button>
              </form>
            )}

            <div style={{ height: 1, background: 'var(--border-primary)', margin: '4px 0 12px' }} />

            {/* Due Date */}
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8 }}>Due Date</p>
            <input
              type="date"
              value={dueDateInput}
              onChange={e => saveDueDate(e.target.value)}
              className="input"
              style={{ marginBottom: 4, fontSize: 13 }}
            />
            {card.dueDate && (
              <button
                onClick={() => saveDueDate('')}
                style={{
                  background: 'none', border: 'none', color: 'var(--danger)',
                  cursor: 'pointer', fontSize: 11, padding: '2px 0',
                }}
              >
                Remove due date
              </button>
            )}

            <div style={{ height: 1, background: 'var(--border-primary)', margin: '12px 0' }} />

            {/* Cover */}
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8 }}>Cover</p>

            {/* Image covers */}
            <p style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 5 }}>Photos</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginBottom: 8 }}>
              {COVER_IMAGES.map(img => (
                <button
                  key={img}
                  type="button"
                  onClick={() => saveCoverImage(img)}
                  style={{
                    height: 36, borderRadius: 6, overflow: 'hidden', border: 'none',
                    cursor: 'pointer', padding: 0,
                    outline: coverImage === img ? '3px solid var(--brand-primary)' : 'none',
                    outlineOffset: 2,
                  }}
                >
                  <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>

            {/* Gradient covers */}
            <p style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 5 }}>Gradients</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
              {COVER_GRADIENTS.map(g => (
                <button
                  key={g} type="button"
                  onClick={() => saveCoverColor(coverColor === g ? null : g)}
                  style={{
                    width: 28, height: 20, borderRadius: 4, background: g, border: 'none',
                    cursor: 'pointer',
                    outline: coverColor === g ? '3px solid var(--text-primary)' : 'none',
                    outlineOffset: 2,
                  }}
                />
              ))}
            </div>

            {/* Solid colors */}
            <p style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 5 }}>Colors</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 6 }}>
              {AVATAR_COLORS.map(color => (
                <button
                  key={color} type="button"
                  onClick={() => saveCoverColor(coverColor === color ? null : color)}
                  style={{
                    width: 22, height: 22, borderRadius: 4, background: color, border: 'none',
                    cursor: 'pointer',
                    outline: coverColor === color ? '3px solid var(--text-primary)' : 'none',
                    outlineOffset: 2,
                  }}
                />
              ))}
            </div>
            {(coverColor || coverImage) && (
              <button
                onClick={() => { saveCoverColor(null); setCoverImage(null); updateCard(cardId, { coverColor: null, coverImage: null }); }}
                style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: 11 }}
              >
                Remove cover
              </button>
            )}

            <div style={{ height: 1, background: 'var(--border-primary)', margin: '12px 0' }} />

            {/* Actions */}
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8 }}>Actions</p>
            <button
              onClick={handleArchive}
              className="btn btn-ghost"
              style={{ width: '100%', justifyContent: 'flex-start', fontSize: 13, marginBottom: 6 }}
            >
              {card.archived ? '📤 Unarchive' : '📦 Archive'}
            </button>
            <button
              onClick={handleDelete}
              className="btn btn-ghost"
              style={{ width: '100%', justifyContent: 'flex-start', fontSize: 13, color: 'var(--danger)' }}
            >
              🗑 Delete card
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
