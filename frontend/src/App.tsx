import { useState, useEffect, useCallback } from 'react';
import type { Todo } from './types/todo';
import { fetchTodos, createTodo, updateTodo, deleteTodo } from './api/todos';

export default function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const load = useCallback(async () => {
    try {
      setTodos(await fetchTodos());
    } catch {
      setError('データの取得に失敗しました');
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    try {
      const todo = await createTodo(input.trim());
      setTodos((prev) => [todo, ...prev]);
      setInput('');
    } catch {
      setError('追加に失敗しました');
    }
  }

  async function handleToggle(todo: Todo) {
    try {
      const updated = await updateTodo(todo.id, { completed: !todo.completed });
      setTodos((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } catch {
      setError('更新に失敗しました');
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteTodo(id);
      setTodos((prev) => prev.filter((t) => t.id !== id));
    } catch {
      setError('削除に失敗しました');
    }
  }

  function startEdit(todo: Todo) {
    setEditingId(todo.id);
    setEditingTitle(todo.title);
  }

  async function handleEditSave(id: number) {
    if (!editingTitle.trim()) return;
    try {
      const updated = await updateTodo(id, { title: editingTitle.trim() });
      setTodos((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      setEditingId(null);
    } catch {
      setError('更新に失敗しました');
    }
  }

  const filtered = todos.filter((t) => {
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const remaining = todos.filter((t) => !t.completed).length;

  return (
    <div className="container">
      <h1>Todo App</h1>

      {error && (
        <div className="error" onClick={() => setError(null)}>
          {error}
        </div>
      )}

      <form onSubmit={handleAdd} className="add-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="新しいタスクを入力..."
          className="add-input"
        />
        <button type="submit" className="btn btn-primary">追加</button>
      </form>

      <div className="filter-bar">
        {(['all', 'active', 'completed'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`btn filter-btn ${filter === f ? 'active' : ''}`}
          >
            {f === 'all' ? 'すべて' : f === 'active' ? '未完了' : '完了済み'}
          </button>
        ))}
      </div>

      <ul className="todo-list">
        {filtered.map((todo) => (
          <li key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => void handleToggle(todo)}
              className="checkbox"
            />

            {editingId === todo.id ? (
              <input
                type="text"
                value={editingTitle}
                onChange={(e) => setEditingTitle(e.target.value)}
                onBlur={() => void handleEditSave(todo.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') void handleEditSave(todo.id);
                  if (e.key === 'Escape') setEditingId(null);
                }}
                autoFocus
                className="edit-input"
              />
            ) : (
              <span
                className="todo-title"
                onDoubleClick={() => startEdit(todo)}
              >
                {todo.title}
              </span>
            )}

            <button
              onClick={() => void handleDelete(todo.id)}
              className="btn btn-danger delete-btn"
            >
              削除
            </button>
          </li>
        ))}
        {filtered.length === 0 && (
          <li className="empty">タスクがありません</li>
        )}
      </ul>

      {todos.length > 0 && (
        <div className="status">
          残り {remaining} 件
        </div>
      )}
    </div>
  );
}
