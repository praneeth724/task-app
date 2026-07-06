'use client';

import Link from 'next/link';
import type { Task } from '../types/task';

const STATUS_STYLES: Record<Task['status'], string> = {
  TODO: 'bg-gray-100 text-gray-700',
  IN_PROGRESS: 'bg-amber-100 text-amber-700',
  DONE: 'bg-green-100 text-green-700',
};

interface TaskListProps {
  tasks: Task[];
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

export function TaskList({ tasks, onDelete, isDeleting }: TaskListProps) {
  if (tasks.length === 0) {
    return <p className="py-8 text-center text-sm text-gray-500">No tasks found.</p>;
  }

  return (
    <ul className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
      {tasks.map((task) => (
        <li key={task.id} className="flex items-center justify-between gap-4 px-4 py-3">
          <div className="min-w-0">
            <Link
              href={`/tasks/${task.id}`}
              className="truncate font-medium text-gray-900 hover:text-brand-600"
            >
              {task.title}
            </Link>
            <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
              <span className={`rounded-full px-2 py-0.5 ${STATUS_STYLES[task.status]}`}>
                {task.status.replace('_', ' ')}
              </span>
              {task.dueDate && <span>Due {new Date(task.dueDate).toLocaleDateString()}</span>}
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            <Link
              href={`/tasks/${task.id}`}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
            >
              Edit
            </Link>
            <button
              type="button"
              disabled={isDeleting}
              onClick={() => onDelete(task.id)}
              className="rounded-md border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
