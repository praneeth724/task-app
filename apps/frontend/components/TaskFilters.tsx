'use client';

import { useAuth } from '../lib/auth-context';
import { useUsersQuery } from '../hooks/useUsers';
import type { TaskFilters as TaskFiltersValue, TaskStatus } from '../types/task';

const STATUS_OPTIONS: Array<TaskStatus | ''> = ['', 'TODO', 'IN_PROGRESS', 'DONE'];

interface TaskFiltersProps {
  value: TaskFiltersValue;
  onChange: (value: TaskFiltersValue) => void;
}

export function TaskFilters({ value, onChange }: TaskFiltersProps) {
  const { user } = useAuth();
  const { data: users } = useUsersQuery();

  return (
    <div className="flex flex-wrap gap-3">
      <select
        value={value.status ?? ''}
        onChange={(e) =>
          onChange({
            ...value,
            page: 1,
            status: (e.target.value || undefined) as TaskStatus | undefined,
          })
        }
        className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
      >
        {STATUS_OPTIONS.map((status) => (
          <option key={status} value={status}>
            {status === '' ? 'All statuses' : status.replace('_', ' ')}
          </option>
        ))}
      </select>

      {user?.role === 'ADMIN' && (
        <select
          value={value.owner ?? ''}
          onChange={(e) => onChange({ ...value, page: 1, owner: e.target.value || undefined })}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
        >
          <option value="">All owners</option>
          {users?.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
