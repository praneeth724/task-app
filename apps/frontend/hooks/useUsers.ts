import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';
import { useAuth } from '../lib/auth-context';
import type { User } from '../types/user';

export function useUsersQuery() {
  const { token, user } = useAuth();

  return useQuery({
    queryKey: ['users'],
    queryFn: () => apiFetch<User[]>('/api/users', { token }),
    enabled: Boolean(token) && user?.role === 'ADMIN',
  });
}
