'use client';

import { useState } from 'react';
import { AuthGuard } from '../../components/AuthGuard';
import { Navbar } from '../../components/Navbar';
import { TaskFilters } from '../../components/TaskFilters';
import { TaskList } from '../../components/TaskList';
import { TaskForm } from '../../components/TaskForm';
import { Pagination } from '../../components/Pagination';
import { useCreateTask, useDeleteTask, useTasksQuery } from '../../hooks/useTasks';
import { useTaskSocket } from '../../hooks/useTaskSocket';
import type { TaskFilters as TaskFiltersValue } from '../../types/task';

const DEFAULT_FILTERS: TaskFiltersValue = { page: 1, limit: 10 };

function TasksPageContent() {
  const [filters, setFilters] = useState<TaskFiltersValue>(DEFAULT_FILTERS);
  const [isCreating, setIsCreating] = useState(false);

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
                onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
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
      <TasksPageContent />
    </AuthGuard>
  );
}
