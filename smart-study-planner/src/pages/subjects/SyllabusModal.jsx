import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  MdUploadFile, MdPictureAsPdf, MdImage, MdDelete, MdAutoAwesome,
  MdCheckCircle, MdError, MdHourglassEmpty, MdLightbulb,
} from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import syllabusService from '../../services/syllabusService';
import Modal           from '../../components/ui/Modal/Modal';
import Badge            from '../../components/ui/Badge/Badge';
import Button           from '../../components/ui/Button/Button';
import { SkeletonList } from '../../components/ui/Skeleton/Skeleton';
import EmptyState       from '../../components/ui/EmptyState/EmptyState';
import './SyllabusModal.css';

const POLL_INTERVAL_MS = 3000;

const STATUS_META = {
  PENDING:    { icon: <MdHourglassEmpty size={14} />, variant: 'muted',   label: 'Queued'      },
  PROCESSING: { icon: <MdHourglassEmpty size={14} />, variant: 'warning', label: 'Analyzing…'  },
  COMPLETED:  { icon: <MdCheckCircle size={14} />,    variant: 'success', label: 'Ready'        },
  FAILED:     { icon: <MdError size={14} />,          variant: 'danger',  label: 'Failed'       },
};

const DIFFICULTY_VARIANT = { EASY: 'success', MEDIUM: 'warning', HARD: 'danger' };

function fileIcon(fileType) {
  return fileType === 'PDF' ? <MdPictureAsPdf size={18} /> : <MdImage size={18} />;
}

export default function SyllabusModal({ subject, isOpen, onClose }) {
  const navigate = useNavigate();
  const [files,        setFiles]        = useState([]);
  const [loadingFiles, setLoadingFiles] = useState(true);
  const [uploading,    setUploading]    = useState(false);
  const [activeFile,   setActiveFile]   = useState(null);
  const fileInputRef = useRef(null);
  const pollRef       = useRef(null);

  const loadFiles = useCallback(async () => {
    if (!subject) return;
    setLoadingFiles(true);
    try {
      const res = await syllabusService.getBySubject(subject.id, { size: 20 });
      setFiles(res.data?.data?.content ?? []);
    } catch {
      toast.error('Failed to load syllabus files');
    } finally {
      setLoadingFiles(false);
    }
  }, [subject]);

  useEffect(() => {
    if (isOpen) { loadFiles(); setActiveFile(null); }
    return () => clearInterval(pollRef.current);
  }, [isOpen, loadFiles]);

  const pollFile = useCallback((fileId) => {
    clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const res = await syllabusService.getById(fileId);
        const updated = res.data?.data;
        if (!updated) return;
        setFiles(prev => prev.map(f => f.id === fileId ? updated : f));
        setActiveFile(prev => (prev && prev.id === fileId) ? updated : prev);
        if (updated.status === 'COMPLETED' || updated.status === 'FAILED') {
          clearInterval(pollRef.current);
          if (updated.status === 'COMPLETED') toast.success('Syllabus analyzed successfully!');
          else toast.error(updated.errorMessage || 'Syllabus analysis failed');
        }
      } catch {
        clearInterval(pollRef.current);
      }
    }, POLL_INTERVAL_MS);
  }, []);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['pdf', 'jpg', 'jpeg', 'png'].includes(ext)) {
      toast.error('Only PDF, JPG, and PNG files are supported');
      e.target.value = '';
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must not exceed 10MB');
      e.target.value = '';
      return;
    }
    setUploading(true);
    try {
      const res = await syllabusService.upload(subject.id, file);
      const created = res.data?.data;
      setFiles(prev => [created, ...prev]);
      setActiveFile(created);
      toast.success('Syllabus uploaded — AI analysis in progress');
      pollFile(created.id);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload syllabus');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (file) => {
    try {
      await syllabusService.delete(file.id);
      setFiles(prev => prev.filter(f => f.id !== file.id));
      if (activeFile?.id === file.id) setActiveFile(null);
      toast.success('Syllabus file deleted');
    } catch {
      toast.error('Failed to delete syllabus file');
    }
  };

  const openFile = async (file) => {
    setActiveFile(file);
    if (file.status === 'COMPLETED' && (!file.topics || file.topics.length === 0)) {
      try {
        const res = await syllabusService.getById(file.id);
        setActiveFile(res.data?.data);
      } catch { /* keep showing what we have */ }
    }
  };

  const handleViewTasks = () => {
    onClose();
    // Wait 2 seconds for async task generation to complete, then navigate
    setTimeout(() => {
      navigate('/tasks');
    }, 2000);
  };

  if (!subject) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${subject.name} — AI Syllabus Analyzer`} size="lg">
      <div className="syllabus-modal">
        <div className="syllabus-modal__upload">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileChange}
            disabled={uploading}
            style={{ display: 'none' }}
          />
          <button
            className="syllabus-modal__upload-btn"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <MdUploadFile size={20} />
            {uploading ? 'Uploading…' : 'Upload Syllabus (PDF, JPG, PNG)'}
          </button>
        </div>

        {loadingFiles && <SkeletonList count={2} />}

        {!loadingFiles && files.length === 0 && (
          <EmptyState
            icon={<MdAutoAwesome size={32} />}
            title="No syllabus uploaded yet"
            message="Upload a syllabus and AI will extract its units, chapters, and topics automatically."
          />
        )}

        {!loadingFiles && files.length > 0 && (
          <div className="syllabus-modal__list">
            {files.map(file => {
              const meta = STATUS_META[file.status] || STATUS_META.PENDING;
              return (
                <div
                  key={file.id}
                  className={`syllabus-modal__row${activeFile?.id === file.id ? ' syllabus-modal__row--active' : ''}`}
                  onClick={() => openFile(file)}
                >
                  {fileIcon(file.fileType)}
                  <span className="syllabus-modal__row-name">{file.fileName}</span>
                  <Badge variant={meta.variant} size="sm">{meta.icon} {meta.label}</Badge>
                  <button
                    className="syllabus-modal__row-delete"
                    onClick={(e) => { e.stopPropagation(); handleDelete(file); }}
                    aria-label="Delete syllabus file"
                  >
                    <MdDelete size={15} />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {activeFile?.status === 'FAILED' && (
          <p className="syllabus-modal__error">{activeFile.errorMessage}</p>
        )}

        {activeFile?.status === 'COMPLETED' && activeFile.topics?.length > 0 && (
          <>
            <div className="syllabus-modal__action-bar" style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'center'
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ color: '#047857', fontSize: '14px', fontWeight: '500' }}>
                  ✅ Study plan & tasks auto-generated!
                </div>
                <div style={{ color: '#059669', fontSize: '12px', marginTop: '4px' }}>
                  AI has created your personalized study plan
                </div>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={handleViewTasks}
              >
                View Tasks →
              </Button>
            </div>

            <div className="syllabus-modal__topics">
              {Object.entries(groupByUnit(activeFile.topics)).map(([unitName, chapters]) => (
                <div key={unitName} className="syllabus-modal__unit">
                  <div className="syllabus-modal__unit-name">{unitName}</div>
                  {Object.entries(chapters).map(([chapterName, topics]) => (
                    <div key={chapterName} className="syllabus-modal__chapter">
                      <div className="syllabus-modal__chapter-name">{chapterName}</div>
                      <div className="syllabus-modal__topic-list">
                        {topics.map(t => (
                          <span key={t.id} className="syllabus-modal__topic-pill">
                            {t.topicName}
                            <Badge variant={DIFFICULTY_VARIANT[t.difficultyLevel] || 'muted'} size="sm">
                              {t.difficultyLevel}
                            </Badge>
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}

function groupByUnit(topics) {
  const units = {};
  for (const t of topics) {
    const unitKey = t.unitName || 'General';
    const chapterKey = t.chapterName || 'General';
    units[unitKey] ??= {};
    units[unitKey][chapterKey] ??= [];
    units[unitKey][chapterKey].push(t);
  }
  return units;
}
