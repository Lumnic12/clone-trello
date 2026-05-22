import { useState, useEffect } from 'react';
import { searchCards, getMembers } from '../../api/api';
import { useDebounce } from '../../hooks/useDebounce';
import { LABEL_COLORS } from '../../utils/colorHelpers';

export default function SearchBar({ boardId, onResults, onClear }) {
  const [query, setQuery] = useState('');
  const [labelFilter, setLabelFilter] = useState('');
  const [memberFilter, setMemberFilter] = useState('');
  const [dueDateFilter, setDueDateFilter] = useState('');
  const [members, setMembers] = useState([]);

  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => { getMembers().then(setMembers).catch(() => {}); }, []);

  useEffect(() => {
    const hasFilter = debouncedQuery || labelFilter || memberFilter || dueDateFilter;
    if (!hasFilter) { onClear(); return; }

    const params = {};
    if (debouncedQuery) params.q = debouncedQuery;
    if (labelFilter) params.label = labelFilter;
    if (memberFilter) params.memberId = memberFilter;
    if (dueDateFilter) params.dueDate = dueDateFilter;

    searchCards(boardId, params).then(onResults).catch(() => {});
  }, [debouncedQuery, labelFilter, memberFilter, dueDateFilter]);

  function clearAll() {
    setQuery('');
    setLabelFilter('');
    setMemberFilter('');
    setDueDateFilter('');
    onClear();
  }

  const hasAny = query || labelFilter || memberFilter || dueDateFilter;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
      {/* Search input */}
      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search cards…"
        autoFocus
        style={{
          background: 'rgba(255,255,255,0.9)',
          color: '#172b4d',
          border: 'none', borderRadius: 8,
          padding: '7px 12px', fontSize: 14,
          outline: 'none', width: 200,
        }}
      />

      {/* Label filter */}
      <select
        value={labelFilter}
        onChange={e => setLabelFilter(e.target.value)}
        style={{
          background: 'rgba(255,255,255,0.9)', color: '#172b4d',
          border: 'none', borderRadius: 8, padding: '7px 10px',
          fontSize: 13, outline: 'none', cursor: 'pointer',
        }}
      >
        <option value="">🏷 Label</option>
        {LABEL_COLORS.map(({ color, name }) => (
          <option key={color} value={color}>{name}</option>
        ))}
      </select>

      {/* Member filter */}
      <select
        value={memberFilter}
        onChange={e => setMemberFilter(e.target.value)}
        style={{
          background: 'rgba(255,255,255,0.9)', color: '#172b4d',
          border: 'none', borderRadius: 8, padding: '7px 10px',
          fontSize: 13, outline: 'none', cursor: 'pointer',
        }}
      >
        <option value="">👤 Member</option>
        {members.map(m => (
          <option key={m.id} value={m.id}>{m.name}</option>
        ))}
      </select>

      {/* Due date filter */}
      <select
        value={dueDateFilter}
        onChange={e => setDueDateFilter(e.target.value)}
        style={{
          background: 'rgba(255,255,255,0.9)', color: '#172b4d',
          border: 'none', borderRadius: 8, padding: '7px 10px',
          fontSize: 13, outline: 'none', cursor: 'pointer',
        }}
      >
        <option value="">📅 Due date</option>
        <option value="overdue">Overdue</option>
        <option value="soon">Due soon (3 days)</option>
        <option value="none">No due date</option>
      </select>

      {/* Clear */}
      {hasAny && (
        <button
          onClick={clearAll}
          style={{
            background: 'rgba(255,255,255,0.2)', border: 'none',
            color: 'white', borderRadius: 8,
            padding: '7px 12px', fontSize: 13,
            cursor: 'pointer', fontWeight: 500,
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
        >
          × Clear
        </button>
      )}
    </div>
  );
}
