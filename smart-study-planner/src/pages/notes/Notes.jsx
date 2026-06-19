import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MdAdd, MdNoteAlt } from 'react-icons/md';
import { toast } from 'react-toastify';

import noteService    from '../../services/noteService';
import subjectService from '../../services/subjectService';
import PageHeader     from '../../components/common/PageHeader';
import SearchBar      from '../../components/common/SearchBar';
import FilterBar      from '../../components/common/FilterBar';
import EmptyState     from '../../components/ui/EmptyState/EmptyState';
import { SkeletonList } from '../../components/ui/Skeleton/Skeleton';
import ConfirmDialog  from '../../components/ui/ConfirmDialog/ConfirmDialog';
import NoteCard       from './NoteCard';
import NoteForm       from './NoteForm';
import NoteView       from './NoteView';
import './Notes.css';

export default function Notes() {
  const [notes,        setNotes]        = useState([]);
  const [subjects,     setSubjects]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState('');
  const [subjFilter,   setSubjFilter]   = useState('ALL');

  const [formOpen,     setFormOpen]     = useState(false);
  const [editTarget,   setEditTarget]   = useState(null);
  const [viewNote,     setViewNote]     = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting,     setDeleting]     = useState(false);

  /* ── Load ─────────────────────────────────────────────── */
  const loadNotes = useCallback(async () => {
    try {
      const [notesRes, subjRes] = await Promise.all([
        noteService.getAll({ size: 100 }),
        subjectService.getAll(),
      ]);
      setNotes(notesRes.data?.data?.content ?? []);
      setSubjects(subjRes.data?.data ?? []);
    } catch {
      toast.error('Failed to load notes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadNotes(); }, [loadNotes]);

  /* ── Subject filter pills ─────────────────────────────── */
  const subjectFilters = useMemo(() => [
    { value: 'ALL', label: 'All Notes' },
    ...subjects.map(s => ({ value: String(s.id), label: s.name })),
  ], [subjects]);

  /* ── Client-side filter ───────────────────────────────── */
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return notes.filter(n => {
      if (subjFilter !== 'ALL' && String(n.subjectId) !== subjFilter) return false;
      if (q && !n.title.toLowerCase().includes(q) && !(n.content || '').toLowerCase().includes(q)) return false;
      return true;
    });
  }, [notes, search, subjFilter]);

  /* ── CRUD ─────────────────────────────────────────────── */
  const openCreate = () => { setEditTarget(null); setFormOpen(true); };
  const openEdit   = (n) => { setEditTarget(n);   setViewNote(null); setFormOpen(true); };

  const handleSave = useCallback(async (data) => {
    if (editTarget) {
      const res = await noteService.update(editTarget.id, data);
      setNotes(prev => prev.map(n => n.id === editTarget.id ? res.data?.data : n));
      toast.success('Note updated');
    } else {
      const res = await noteService.create(data);
      setNotes(prev => [res.data?.data, ...prev]);
      toast.success('Note created');
    }
  }, [editTarget]);

  const handleDeleteConfirm = useCallback(async () => {
    setDeleting(true);
    try {
      await noteService.delete(deleteTarget.id);
      setNotes(prev => prev.filter(n => n.id !== deleteTarget.id));
      toast.success('Note deleted');
      setDeleteTarget(null);
    } catch {
      toast.error('Failed to delete note');
    } finally {
      setDeleting(false);
    }
  }, [deleteTarget]);

  /* ── Render ───────────────────────────────────────────── */
  return (
    <div className="page-enter notes-page">
      <PageHeader
        title="Notes"
        subtitle="Your study notes and reference material"
        accentColor="#FBBF24"
        action={{ label: 'New Note', onClick: openCreate, icon: <MdAdd size={18} /> }}
      />

      <div className="notes-toolbar">
        <SearchBar placeholder="Search notes…" onSearch={setSearch} />
        {subjects.length > 0 && (
          <FilterBar filters={subjectFilters} active={subjFilter} onChange={setSubjFilter} />
        )}
      </div>

      {loading && <SkeletonList count={6} />}

      {!loading && filtered.length === 0 && (
        <EmptyState
          icon={<MdNoteAlt size={40} />}
          title={notes.length === 0 ? 'No notes yet' : 'No notes match'}
          message={notes.length === 0 ? 'Create your first note to get started.' : 'Try a different search or filter.'}
          action={notes.length === 0 && (
            <button className="empty-state-action-btn" onClick={openCreate}>+ New Note</button>
          )}
        />
      )}

      {!loading && filtered.length > 0 && (
        <div className="notes-grid">
          {filtered.map(n => (
            <NoteCard
              key={n.id}
              note={n}
              onClick={setViewNote}
              onEdit={openEdit}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      <NoteForm
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onSaved={handleSave}
        initial={editTarget}
      />

      <NoteView
        isOpen={!!viewNote}
        onClose={() => setViewNote(null)}
        note={viewNote}
        onEdit={openEdit}
        onDelete={(n) => { setViewNote(null); setDeleteTarget(n); }}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        loading={deleting}
        title="Delete Note?"
        message={`"${deleteTarget?.title}" will be permanently deleted.`}
      />
    </div>
  );
}
