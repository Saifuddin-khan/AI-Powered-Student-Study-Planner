import React, { useState, useEffect, useCallback } from 'react';
import { MdAdd, MdMenuBook } from 'react-icons/md';
import { toast } from 'react-toastify';

import subjectService from '../../services/subjectService';
import PageHeader     from '../../components/common/PageHeader';
import SearchBar      from '../../components/common/SearchBar';
import EmptyState     from '../../components/ui/EmptyState/EmptyState';
import { SkeletonList } from '../../components/ui/Skeleton/Skeleton';
import ConfirmDialog  from '../../components/ui/ConfirmDialog/ConfirmDialog';
import SubjectCard    from './SubjectCard';
import SubjectForm    from './SubjectForm';
import './Subjects.css';

export default function Subjects() {
  const [subjects,  setSubjects]  = useState([]);
  const [filtered,  setFiltered]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');

  const [formOpen,  setFormOpen]  = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting,     setDeleting]     = useState(false);

  /* ── Load ─────────────────────────────────────────────── */
  const loadSubjects = useCallback(async () => {
    try {
      const res = await subjectService.getAll();
      setSubjects(res.data?.data ?? []);
    } catch {
      toast.error('Failed to load subjects');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadSubjects(); }, [loadSubjects]);

  /* ── Client-side search ───────────────────────────────── */
  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(q
      ? subjects.filter(s => s.name.toLowerCase().includes(q) || (s.description || '').toLowerCase().includes(q))
      : subjects
    );
  }, [search, subjects]);

  /* ── CRUD handlers ────────────────────────────────────── */
  const openCreate = () => { setEditTarget(null); setFormOpen(true); };
  const openEdit   = (s) => { setEditTarget(s);   setFormOpen(true); };

  const handleSave = useCallback(async (data) => {
    if (editTarget) {
      const res = await subjectService.update(editTarget.id, data);
      const updated = res.data?.data;
      setSubjects(prev => prev.map(s => s.id === editTarget.id ? updated : s));
      toast.success('Subject updated');
    } else {
      const res = await subjectService.create(data);
      setSubjects(prev => [res.data?.data, ...prev]);
      toast.success('Subject added');
    }
  }, [editTarget]);

  const handleDeleteConfirm = useCallback(async () => {
    setDeleting(true);
    try {
      await subjectService.delete(deleteTarget.id);
      setSubjects(prev => prev.filter(s => s.id !== deleteTarget.id));
      toast.success('Subject deleted');
      setDeleteTarget(null);
    } catch {
      toast.error('Failed to delete subject');
    } finally {
      setDeleting(false);
    }
  }, [deleteTarget]);

  /* ── Render ───────────────────────────────────────────── */
  return (
    <div className="page-enter subjects-page">
      <PageHeader
        title="Subjects"
        subtitle="Organise your study modules"
        accentColor="#38BDF8"
        action={{ label: 'Add Subject', onClick: openCreate, icon: <MdAdd size={18} /> }}
      />

      <SearchBar placeholder="Search subjects…" onSearch={setSearch} />

      {loading && <SkeletonList count={4} />}

      {!loading && filtered.length === 0 && (
        <EmptyState
          icon={<MdMenuBook size={40} />}
          title={search ? 'No subjects match' : 'No subjects yet'}
          message={search ? 'Try a different keyword.' : 'Add your first subject to get started.'}
          action={!search && (
            <button className="empty-state-action-btn" onClick={openCreate}>
              + Add Subject
            </button>
          )}
        />
      )}

      {!loading && filtered.length > 0 && (
        <div className="subjects-grid">
          {filtered.map(s => (
            <SubjectCard
              key={s.id}
              subject={s}
              onEdit={openEdit}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      <SubjectForm
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onSaved={handleSave}
        initial={editTarget}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        loading={deleting}
        title="Delete Subject?"
        message={`"${deleteTarget?.name}" will be permanently deleted.`}
      />
    </div>
  );
}
