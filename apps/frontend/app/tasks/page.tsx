'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthGuard } from '../../components/AuthGuard';
import { Navbar } from '../../components/Navbar';
import { TaskFilters } from '../../components/TaskFilters';
import { TaskList } from '../../components/TaskList';
import { TaskForm } from '../../components/TaskForm';
import { Pagination } from '../../components/Pagination';
import { useCreateTask, useDeleteTask, useTasksQuery } from '../../hooks/useTasks';
import { useTaskSocket } from '../../hooks/useTaskSocket';
import type { TaskFilters as TaskFiltersValue, TaskStatus } from '../../types/task';

const PAGE_SIZE = 10;
const STATUSES: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'DONE'];

function parseStatus(raw: string | null): TaskStatus | undefined {
  return STATUSES.includes(raw as TaskStatus) ? (raw as TaskStatus) : undefined;
}

function TasksPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isCreating, setIsCreating] = useState(false);

  const filters: TaskFiltersValue = {
    page: Math.max(1, Number(searchParams.get('page')) || 1),
    limit: PAGE_SIZE,
    status: parseStatus(searchParams.get('status')),
    owner: searchParams.get('owner') ?? undefined,
  };

  const setFilters = (next: TaskFiltersValue) => {
    const params = new URLSearchParams();
    if (next.page > 1) params.set('page', String(next.page));
    if (next.status) params.set('status', next.status);
    if (next.owner) params.set('owner', next.owner);
    const query = params.toString();
    router.replace(query ? `/tasks?${query}` : '/tasks');
  };

  useTaskSocket();
  const { data, isLoading, isError } = useTasksQuery(filters);
  const createTask = useCreateTask();
  const deleteTask = useDeleteTask();

  return (
    <div>
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Tasks</h1>
          <button
            type="button"
            onClick={() => setIsCreating((prev) => !prev)}
            className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            {isCreating ? 'Cancel' : 'New task'}
          </button>
        </div>

        {isCreating && (
          <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4">
            <TaskForm
              isSubmitting={createTask.isPending}
              onCancel={() => setIsCreating(false)}
              onSubmit={async (input) => {
                await createTask.mutateAsync(input);
                setIsCreating(false);
              }}
            />
          </div>
        )}

        <div className="mb-4">
          <TaskFilters value={filters} onChange={setFilters} />
        </div>

        {isLoading && <p className="text-sm text-gray-500">Loading tasks...</p>}
        {isError && <p className="text-sm text-red-600">Failed to load tasks.</p>}

        {data && (
          <>
            <TaskList
              tasks={data.data}
              isDeleting={deleteTask.isPending}
              onDelete={(id) => deleteTask.mutate(id)}
            />
            <div className="mt-4">
              <Pagination
                page={data.meta.page}
                totalPages={data.meta.totalPages}
                onPageChange={(page) => setFilters({ ...filters, page })}
              />
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default function TasksPage() {
  return (
    <AuthGuard>
      <Suspense fallback={null}>
        <TasksPageContent />
      </Suspense>
    </AuthGuard>
  );
}
