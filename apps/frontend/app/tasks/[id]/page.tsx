'use client';

import { useRouter } from 'next/navigation';
import { AuthGuard } from '../../../components/AuthGuard';
import { Navbar } from '../../../components/Navbar';
import { TaskForm } from '../../../components/TaskForm';
import { useTaskQuery, useUpdateTask } from '../../../hooks/useTasks';

function TaskDetailContent({ id }: { id: string }) {
  const router = useRouter();
  const { data: task, isLoading, isError } = useTaskQuery(id);
  const updateTask = useUpdateTask();

  return (
    <div>
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-semibold text-gray-900">Edit task</h1>

        {isLoading && <p className="text-sm text-gray-500">Loading task...</p>}
        {isError && <p className="text-sm text-red-600">You do not have access to this task.</p>}

        {task && (
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <TaskForm
              initialTask={task}
              isSubmitting={updateTask.isPending}
              onCancel={() => router.push('/tasks')}
              onSubmit={async (input) => {
                await updateTask.mutateAsync({ id: task.id, input });
                router.push('/tasks');
              }}
            />
          </div>
        )}
      </main>
    </div>
  );
}

export default function TaskDetailPage({ params }: { params: { id: string } }) {
  return (
    <AuthGuard>
      <TaskDetailContent id={params.id} />
    </AuthGuard>
  );
}
