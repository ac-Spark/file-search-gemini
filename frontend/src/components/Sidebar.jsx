import { useState } from 'react';
import FileDropZone from './FileDropZone';

export default function Sidebar({
  isOpen,
  stores,
  currentStore,
  files,
  onStoreChange,
  onCreateStore,
  onDeleteStore,
  onUploadFile,
  onDeleteFile,
  onRefresh
}) {
  const [newStoreName, setNewStoreName] = useState('');
  const [filesExpanded, setFilesExpanded] = useState(true);
  const [storeManagementExpanded, setStoreManagementExpanded] = useState(false);

  const handleCreateStore = async () => {
    if (!newStoreName.trim()) return;
    await onCreateStore(newStoreName.trim());
    setNewStoreName('');
  };

  return (
    <aside className={!isOpen ? 'closed' : ''}>
      {/* Store 選擇 */}
      <div className="sidebar-section fixed-section">
        <h2>1. 選擇知識庫</h2>

        <div className="flex gap-sm mb-sm">
          <select
            className="flex-1"
            value={currentStore || ''}
            onChange={(e) => onStoreChange(e.target.value)}
          >
            <option value="">-- 請選擇知識庫 --</option>
            {stores.map(s => (
              <option key={s.name} value={s.name}>
                {s.display_name || s.name}
              </option>
            ))}
          </select>
          <button className="secondary" onClick={onRefresh} title="重新整理">↻</button>
        </div>

        {/* 進階管理區域 - 可收合 */}
        <details 
          open={storeManagementExpanded}
          onToggle={(e) => setStoreManagementExpanded(e.target.open)}
          style={{ marginTop: '1rem', borderTop: '1px solid #eee', paddingTop: '0.8rem' }}
        >
          <summary 
            style={{ 
              cursor: 'pointer', 
              fontSize: '0.85rem', 
              color: '#888',
              fontWeight: 500,
              userSelect: 'none',
              marginBottom: '0.8rem'
            }}
          >
            ⚙️ 知識庫管理
          </summary>
          
          <div className="flex gap-sm mb-sm">
            <input
              type="text"
              className="flex-1"
              placeholder="新知識庫名稱"
              value={newStoreName}
              onChange={(e) => setNewStoreName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateStore()}
              style={{ fontSize: '0.9rem' }}
            />
            <button className="secondary" onClick={handleCreateStore}>建立</button>
          </div>
          <button
            className="danger w-full"
            style={{ fontSize: '0.85rem' }}
            onClick={onDeleteStore}
            disabled={!currentStore}
          >
            刪除目前知識庫
          </button>
        </details>
      </div>

      {/* 檔案管理 */}
      <div className="sidebar-section scrollable-section">
        <h2>2. 管理文件</h2>
        <FileDropZone onUpload={onUploadFile} disabled={!currentStore} />

        <div 
          style={{ 
            marginTop: '1rem', 
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            userSelect: 'none'
          }}
          onClick={() => setFilesExpanded(!filesExpanded)}
        >
          <h2 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: '#666', fontWeight: 600 }}>
            已上傳文件 ({files.length})
          </h2>
          <span style={{ fontSize: '1.2rem', color: '#666' }}>
            {filesExpanded ? '▼' : '▶'}
          </span>
        </div>
        {filesExpanded && (
          <div className="file-list-container">
            <ul className="file-list">
              {!currentStore ? (
                <li style={{ color: '#999', fontStyle: 'italic' }}>請先選擇知識庫</li>
              ) : files.length === 0 ? (
                <li style={{ color: '#999' }}>(無文件)</li>
              ) : (
                files.map(f => (
                  <li key={f.name}>
                    <span title={f.name}>{f.display_name || '未命名文件'}</span>
                    <button className="danger" onClick={() => onDeleteFile(f.name)}>×</button>
                  </li>
                ))
              )}
            </ul>
          </div>
        )}
      </div>

      <div className="sidebar-footer" style={{ padding: '1rem', marginTop: 'auto', borderTop: '1px solid #eee' }}>
        <details style={{ fontSize: '0.85rem', color: '#666' }}>
          <summary style={{ cursor: 'pointer', marginBottom: '0.5rem', userSelect: 'none' }}>
            查看支援格式
          </summary>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              <tr style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '4px 0', fontWeight: 600 }}>文字</td>
                <td style={{ padding: '4px 0', textAlign: 'right' }}>.txt, .md, .html</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '4px 0', fontWeight: 600 }}>文件</td>
                <td style={{ padding: '4px 0', textAlign: 'right' }}>.pdf, .doc(x), .rtf</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '4px 0', fontWeight: 600 }}>數據</td>
                <td style={{ padding: '4px 0', textAlign: 'right' }}>.csv, .json, .xml</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '4px 0', fontWeight: 600 }}>試算表</td>
                <td style={{ padding: '4px 0', textAlign: 'right' }}>.xls, .xlsx</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '4px 0', fontWeight: 600 }}>簡報</td>
                <td style={{ padding: '4px 0', textAlign: 'right' }}>.ppt, .pptx</td>
              </tr>
              <tr>
                <td style={{ padding: '4px 0', fontWeight: 600 }}>程式碼</td>
                <td style={{ padding: '4px 0', textAlign: 'right' }}>.py, .js, .sh, .sql 等</td>
              </tr>
            </tbody>
          </table>
        </details>
      </div>
    </aside>
  );
}
