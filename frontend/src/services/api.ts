import type { Store, FileItem, ChatResponse, StartChatResponse } from '../types';

const API_BASE = '/api';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || response.statusText);
  }
  return response.json();
}

export async function fetchStores(): Promise<Store[]> {
  const response = await fetch(`${API_BASE}/stores`);
  return handleResponse<Store[]>(response);
}

export async function createStore(name: string): Promise<Store> {
  const response = await fetch(`${API_BASE}/stores`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ display_name: name }),
  });
  return handleResponse<Store>(response);
}

export async function deleteStore(name: string): Promise<void> {
  const response = await fetch(`${API_BASE}/stores/${name}`, {
    method: 'DELETE',
  });
  await handleResponse<void>(response);
}

export async function fetchFiles(storeName: string): Promise<FileItem[]> {
  const response = await fetch(`${API_BASE}/stores/${storeName}/files`);
  return handleResponse<FileItem[]>(response);
}

export async function uploadFile(storeName: string, file: File): Promise<void> {
  const formData = new FormData();
  formData.append('file', file);
  const response = await fetch(`${API_BASE}/stores/${storeName}/upload`, {
    method: 'POST',
    body: formData,
  });
  await handleResponse<void>(response);
}

export async function deleteFile(fileName: string): Promise<void> {
  const response = await fetch(`${API_BASE}/files/${fileName}`, {
    method: 'DELETE',
  });
  await handleResponse<void>(response);
}

export async function startChat(storeName: string): Promise<StartChatResponse> {
  const response = await fetch(`${API_BASE}/chat/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ store_name: storeName }),
  });
  return handleResponse<StartChatResponse>(response);
}

export async function sendMessage(text: string): Promise<ChatResponse> {
  const response = await fetch(`${API_BASE}/chat/message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: text }),
  });
  return handleResponse<ChatResponse>(response);
}

export async function listPrompts(storeName: string): Promise<any> {
  const response = await fetch(`${API_BASE}/stores/${storeName}/prompts`);
  return handleResponse<any>(response);
}

export async function createPrompt(storeName: string, name: string, content: string): Promise<any> {
  const response = await fetch(`${API_BASE}/stores/${storeName}/prompts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, content }),
  });
  return handleResponse<any>(response);
}

export async function updatePrompt(storeName: string, promptId: string, name?: string, content?: string): Promise<any> {
  const response = await fetch(`${API_BASE}/stores/${storeName}/prompts/${promptId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, content }),
  });
  return handleResponse<any>(response);
}

export async function deletePrompt(storeName: string, promptId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/stores/${storeName}/prompts/${promptId}`, {
    method: 'DELETE',
  });
  await handleResponse<void>(response);
}

export async function setActivePrompt(storeName: string, promptId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/stores/${storeName}/prompts/active`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt_id: promptId }),
  });
  await handleResponse<void>(response);
}

export async function getPrompt(storeName: string): Promise<{ prompt: string }> {
  const response = await fetch(`${API_BASE}/stores/${storeName}/prompts/active`);
  const data = await handleResponse<{ prompt: any }>(response);
  // 後端返回 prompt 物件，需要提取內容
  return { prompt: data.prompt?.content || '' };
}

export async function savePrompt(storeName: string, prompt: string): Promise<void> {
  // 先創建新 prompt
  const createResponse = await fetch(`${API_BASE}/stores/${storeName}/prompts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      name: '預設 Prompt',
      content: prompt 
    }),
  });
  const created = await handleResponse<{ id: string }>(createResponse);
  
  // 然後設為啟用
  const activateResponse = await fetch(`${API_BASE}/stores/${storeName}/prompts/active`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt_id: created.id }),
  });
  await handleResponse<void>(activateResponse);
}

export async function listApiKeys(storeName?: string): Promise<any[]> {
  const url = storeName 
    ? `${API_BASE}/keys?store_name=${encodeURIComponent(storeName)}`
    : `${API_BASE}/keys`;
  const response = await fetch(url);
  return handleResponse<any[]>(response);
}

export async function createApiKey(name: string, storeName: string): Promise<{ key: string; message: string }> {
  const response = await fetch(`${API_BASE}/keys`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      name,
      store_name: storeName
    }),
  });
  return handleResponse<{ key: string; message: string }>(response);
}

export async function deleteApiKey(keyId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/keys/${keyId}`, {
    method: 'DELETE',
  });
  await handleResponse<void>(response);
}

// 以下為向下兼容的舊 API
export async function getApiKey(storeName: string): Promise<{ api_key: string }> {
  const keys = await listApiKeys(storeName);
  return { api_key: keys.length > 0 ? keys[0].key_prefix : '' };
}

export async function saveApiKey(storeName: string, apiKey: string): Promise<void> {
  // 這個應該被移除，因為新系統不再這樣使用
  throw new Error('請使用新的 API Key 管理介面');
}
