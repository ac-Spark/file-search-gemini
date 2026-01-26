import { useState, useEffect } from 'react';
import * as api from '../services/api';

interface Prompt {
  id: string;
  name: string;
  content: string;
  created_at: string;
  updated_at: string;
}

interface PromptManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStore: string | null;
  onRefresh: () => void;
  onRestartChat: () => void;
}

export default function PromptManagementModal({
  isOpen,
  onClose,
  currentStore,
  onRefresh,
  onRestartChat,
}: PromptManagementModalProps) {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [activePromptId, setActivePromptId] = useState<string | null>(null);
  const [maxPrompts, setMaxPrompts] = useState(3);
  const [loading, setLoading] = useState(false);
  const [newPromptName, setNewPromptName] = useState('');
  const [newPromptContent, setNewPromptContent] = useState('');
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editContent, setEditContent] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isOpen && currentStore) {
      loadPrompts();
    }
  }, [isOpen, currentStore]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (editingId) {
          cancelEdit();
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose, editingId]);

  const loadPrompts = async () => {
    if (!currentStore) return;
    setLoading(true);
    try {
      const data = await api.listPrompts(currentStore);
      setPrompts(data.prompts || []);
      setActivePromptId(data.active_prompt_id);
      setMaxPrompts(data.max_prompts || 3);
    } catch (e) {
      console.error('Failed to load prompts:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!currentStore || !newPromptName.trim() || !newPromptContent.trim()) return;
    setCreating(true);
    try {
      await api.createPrompt(currentStore, newPromptName.trim(), newPromptContent.trim());
      setNewPromptName('');
      setNewPromptContent('');
      await loadPrompts();
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : String(e);
      alert('建立失敗: ' + errorMsg);
    } finally {
      setCreating(false);
    }
  };

  const handleSetActive = async (promptId: string) => {
    if (!currentStore) return;
    try {
      await api.setActivePrompt(currentStore, promptId);
      await loadPrompts();
      await onRestartChat();
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : String(e);
      alert('設定失敗: ' + errorMsg);
    }
  };

  const handleDelete = async (promptId: string) => {
    if (!currentStore) return;
    if (!confirm('確定要刪除此 Prompt 嗎？')) return;
    try {
      await api.deletePrompt(currentStore, promptId);
      await loadPrompts();
      if (promptId === activePromptId) {
        await onRestartChat();
      }
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : String(e);
      alert('刪除失敗: ' + errorMsg);
    }
  };

  const startEdit = (prompt: Prompt) => {
    setEditingId(prompt.id);
    setEditName(prompt.name);
    setEditContent(prompt.content);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditContent('');
  };

  const toggleExpand = (promptId: string) => {
    setExpandedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(promptId)) {
        newSet.delete(promptId);
      } else {
        newSet.add(promptId);
      }
      return newSet;
    });
  };

  const getPreviewText = (content: string, maxLines: number = 3) => {
    const lines = content.split('\n');
    if (lines.length <= maxLines) return content;
    return lines.slice(0, maxLines).join('\n') + '...';
  };

  const saveEdit = async () => {
    if (!currentStore || !editingId) return;
    try {
      await api.updatePrompt(currentStore, editingId, editName, editContent);
      await loadPrompts();
      if (editingId === activePromptId) {
        await onRestartChat();
      }
      cancelEdit();
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : String(e);
      alert('更新失敗: ' + errorMsg);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '700px' }}>
        <h2>⚙ Prompt 管理</h2>

        {!currentStore ? (
          <p style={{ color: '#8090b0', textAlign: 'center', padding: '2rem 0' }}>
            請先選擇知識庫
          </p>
        ) : loading ? (
          <p style={{ color: 'var(--crystal-amber)', textAlign: 'center', padding: '2rem 0' }}>
            載入中...
          </p>
        ) : (
          <div className="modal-content">
            <div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--crystal-cyan)' }}>
                建立新 Prompt {prompts.length >= maxPrompts && <span style={{ color: 'var(--crystal-amber)' }}>（已達上限 {maxPrompts} 個）</span>}
              </h3>
              {prompts.length < maxPrompts && (
                <>
                  <input
                    type="text"
                    value={newPromptName}
                    onChange={e => setNewPromptName(e.target.value)}
                    placeholder="Prompt 名稱..."
                    style={{ width: '100%', marginBottom: '0.5rem' }}
                  />
                  <textarea
                    value={newPromptContent}
                    onChange={e => setNewPromptContent(e.target.value)}
                    placeholder="Prompt 內容..."
                    style={{ minHeight: '150px', width: '100%', marginBottom: '0.5rem', resize: 'vertical' }}
                  />
                  <button 
                    onClick={handleCreate} 
                    disabled={creating || !newPromptName.trim() || !newPromptContent.trim()}
                    style={{ width: '100%' }}
                  >
                    {creating ? '建立中...' : '✓ 建立 Prompt'}
                  </button>
                </>
              )}
            </div>

            <div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--crystal-amber)' }}>
                現有 Prompts
              </h3>
              {prompts.length === 0 ? (
                <p style={{ color: '#8090b0', textAlign: 'center', padding: '2rem 0' }}>
                  尚無 Prompt
                </p>
              ) : (
                <ul className="file-list">
                  {prompts.map(prompt => (
                    <li key={prompt.id} style={{ flexDirection: 'column', alignItems: 'stretch', gap: '0.5rem' }}>
                      {editingId === prompt.id ? (
                        <>
                          <input
                            type="text"
                            value={editName}
                            onChange={e => setEditName(e.target.value)}
                            style={{ width: '100%' }}
                          />
                          <textarea
                            value={editContent}
                            onChange={e => setEditContent(e.target.value)}
                            style={{ minHeight: '300px', maxHeight: '500px', width: '100%', resize: 'vertical' }}
                          />
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button onClick={saveEdit} className="small">✓ 儲存</button>
                            <button onClick={cancelEdit} className="secondary small">✕ 取消</button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <strong>{prompt.name}</strong>
                              {prompt.id === activePromptId && (
                                <span style={{ marginLeft: '0.5rem', color: 'var(--crystal-teal)' }}>◆ 啟用中</span>
                              )}
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              {prompt.id !== activePromptId && (
                                <button onClick={() => handleSetActive(prompt.id)} className="small">
                                  ◆ 啟用
                                </button>
                              )}
                              <button onClick={() => startEdit(prompt)} className="secondary small">
                                ✎ 編輯
                              </button>
                              <button onClick={() => handleDelete(prompt.id)} className="danger small">
                                ✕ 刪除
                              </button>
                            </div>
                          </div>
                          <div style={{ position: 'relative' }}>
                            <pre style={{
                              fontSize: '0.85rem',
                              color: '#8090b0',
                              whiteSpace: 'pre-wrap',
                              background: 'rgba(0,0,0,0.2)',
                              padding: '0.5rem',
                              borderRadius: '4px',
                              margin: 0,
                              maxHeight: expandedIds.has(prompt.id) ? '400px' : 'none',
                              overflow: expandedIds.has(prompt.id) ? 'auto' : 'visible',
                              transition: 'max-height 0.3s ease'
                            }}>
                              {expandedIds.has(prompt.id) ? prompt.content : getPreviewText(prompt.content)}
                            </pre>
                            {prompt.content.split('\n').length > 3 && (
                              <button
                                onClick={() => toggleExpand(prompt.id)}
                                className="secondary small"
                                style={{
                                  marginTop: '0.5rem',
                                  fontSize: '0.8rem',
                                  padding: '0.25rem 0.75rem'
                                }}
                              >
                                {expandedIds.has(prompt.id) ? '▲ 收起' : '▼ 展開完整內容'}
                              </button>
                            )}
                          </div>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        <div className="modal-actions">
          <button onClick={onClose} className="secondary">
            關閉
          </button>
        </div>
      </div>
    </div>
  );
}
