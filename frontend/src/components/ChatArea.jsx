import { useState, useRef, useEffect } from 'react';

export default function ChatArea({ messages, onSendMessage, disabled, loading }) {
  const [input, setInput] = useState('');
  const chatRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || disabled || loading) return;
    onSendMessage(input.trim());
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatMessage = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
  };

  return (
    <main>
      {disabled && (
        <div className="overlay">
          <div style={{ textAlign: 'center' }}>
            <h3>請先從左側選擇一個知識庫</h3>
            <p style={{ color: '#666', marginTop: '0.5rem' }}>選擇後即可開始對話</p>
          </div>
        </div>
      )}

      <div className="chat-history" ref={chatRef}>
        {messages.length === 0 ? (
          <div className="empty-state">
            <h3>{disabled ? '歡迎使用 Gemini 知識庫助理' : '已連線至知識庫'}</h3>
            <p>{disabled ? '您可以詢問關於已上傳文件的任何問題。' : '現在您可以開始提問了。'}</p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`message ${msg.role} ${msg.error ? 'error' : ''}`}
              dangerouslySetInnerHTML={{ __html: msg.loading ? '<span class="loading-dots">思考中</span>' : formatMessage(msg.text) }}
            />
          ))
        )}
      </div>

      <div className="input-area">
        <textarea
          placeholder="輸入您的問題... (Shift+Enter 換行)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
        />
        <button
          onClick={handleSend}
          disabled={disabled || loading || !input.trim()}
          style={{ padding: '0 2rem' }}
        >
          送出
        </button>
      </div>
    </main>
  );
}
