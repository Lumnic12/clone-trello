import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

// ─── Boards ───────────────────────────────────────────────────────────────────
export const getBoards = () => api.get('/boards').then(r => r.data);
export const getBoardById = (id) => api.get(`/boards/${id}`).then(r => r.data);
export const createBoard = (data) => api.post('/boards', data).then(r => r.data);
export const updateBoard = (id, data) => api.put(`/boards/${id}`, data).then(r => r.data);
export const deleteBoard = (id) => api.delete(`/boards/${id}`).then(r => r.data);

// ─── Lists ────────────────────────────────────────────────────────────────────
export const createList = (data) => api.post('/lists', data).then(r => r.data);
export const updateList = (id, data) => api.put(`/lists/${id}`, data).then(r => r.data);
export const deleteList = (id) => api.delete(`/lists/${id}`).then(r => r.data);
export const reorderLists = (lists) => api.patch('/lists/reorder', { lists }).then(r => r.data);

// ─── Cards ────────────────────────────────────────────────────────────────────
export const getCardById = (id) => api.get(`/cards/${id}`).then(r => r.data);
export const createCard = (data) => api.post('/cards', data).then(r => r.data);
export const updateCard = (id, data) => api.put(`/cards/${id}`, data).then(r => r.data);
export const deleteCard = (id) => api.delete(`/cards/${id}`).then(r => r.data);
export const reorderCards = (cards) => api.patch('/cards/reorder', { cards }).then(r => r.data);
export const moveCard = (id, data) => api.patch(`/cards/${id}/move`, data).then(r => r.data);

// ─── Labels ───────────────────────────────────────────────────────────────────
export const addLabel = (cardId, data) => api.post(`/labels/cards/${cardId}/labels`, data).then(r => r.data);
export const deleteLabel = (id) => api.delete(`/labels/${id}`).then(r => r.data);

// ─── Checklist ────────────────────────────────────────────────────────────────
export const addChecklistItem = (cardId, data) => api.post(`/checklist/cards/${cardId}/checklist`, data).then(r => r.data);
export const updateChecklistItem = (id, data) => api.patch(`/checklist/${id}`, data).then(r => r.data);
export const deleteChecklistItem = (id) => api.delete(`/checklist/${id}`).then(r => r.data);

// ─── Members ─────────────────────────────────────────────────────────────────
export const getMembers = () => api.get('/members').then(r => r.data);
export const assignMember = (cardId, memberId) => api.post(`/members/cards/${cardId}/members`, { memberId }).then(r => r.data);
export const removeMember = (cardId, memberId) => api.delete(`/members/cards/${cardId}/members/${memberId}`).then(r => r.data);

// ─── Comments ────────────────────────────────────────────────────────────────
export const getComments = (cardId) => api.get(`/comments/cards/${cardId}`).then(r => r.data);
export const addComment = (cardId, data) => api.post(`/comments/cards/${cardId}`, data).then(r => r.data);
export const deleteComment = (id) => api.delete(`/comments/${id}`).then(r => r.data);

// ─── Search ──────────────────────────────────────────────────────────────────
export const searchCards = (boardId, params) => api.get(`/search/boards/${boardId}`, { params }).then(r => r.data);

export default api;
