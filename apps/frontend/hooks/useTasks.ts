import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';
import { useAuth } from '../lib/auth-context';
import type {
  CreateTaskInput,
  PaginatedTasks,
  Task,
  TaskFilters,
  UpdateTaskInput,
} from '../types/task';

const TASKS_KEY = 'tasks';

function buildQuery(filters: TaskFilters) {
  const params = new URLSearchParams();
  params.set('page', String(filters.page));
  params.set('limit', String(filters.limit));
  if (filters.status) params.set('status', filters.status);
  if (filters.owner) params.set('owner', filters.owner);
  return params.toString();
}

export function useTasksQuery(filters: TaskFilters) {
  const { token } = useAuth();

  return useQuery({
    queryKey: [TASKS_KEY, filters],
    queryFn: () => apiFetch<PaginatedTasks>(`/api/tasks?${buildQuery(filters)}`, { token }),
    enabled: Boolean(token),
    placeholderData: (previousData) => previousData,
  });
}

export function useTaskQuery(id: string) {
  const { token } = useAuth();

  return useQuery({
    queryKey: [TASKS_KEY, id],
    queryFn: () => apiFetch<Task>(`/api/tasks/${id}`, { token }),
    enabled: Boolean(token) && Boolean(id),
  });
}

export function useCreateTask() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTaskInput) =>
      apiFetch<Task>('/api/tasks', { method: 'POST', body: input, token }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TASKS_KEY] });
    },
  });
}

export function useUpdateTask() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateTaskInput }) =>
      apiFetch<Task>(`/api/tasks/${id}`, { method: 'PATCH', body: input, token }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TASKS_KEY] });
    },
  });
}

export function useDeleteTask() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<void>(`/api/tasks/${id}`, { method: 'DELETE', token }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TASKS_KEY] });
    },
  });
}
