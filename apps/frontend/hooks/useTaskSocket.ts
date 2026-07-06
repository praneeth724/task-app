import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { createSocket } from '../lib/socket';
import { useAuth } from '../lib/auth-context';

export function useTaskSocket() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!token) return undefined;

    const socket = createSocket(token);
    const invalidate = () => queryClient.invalidateQueries({ queryKey: ['tasks'] });

    socket.on('task:created', invalidate);
    socket.on('task:updated', invalidate);
    socket.on('task:deleted', invalidate);

    return () => {
      socket.disconnect();
    };
  }, [token, queryClient]);
}
