'use client';

import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000').replace(/\/$/, '');

/**
 * Subscribes to workspace Socket.IO events and triggers refresh when disconnected polling still runs.
 */
export function useProjectSocket(
  projectId: string | undefined,
  token: string | null,
  enabled: boolean,
  onEvent: () => void,
) {
  const cbRef = useRef(onEvent);
  cbRef.current = onEvent;

  useEffect(() => {
    if (!enabled || !projectId || !token) return;

    const socket = io(`${API_BASE}/workspace`, {
      transports: ['websocket', 'polling'],
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 8,
    });

    const refresh = () => {
      try {
        cbRef.current();
      } catch {
        /* ignore */
      }
    };

    socket.on('connect', () => {
      socket.emit('joinProject', { projectId });
      socket.emit('joinUser', {});
    });
    socket.on('message', refresh);
    socket.on('milestone', refresh);
    socket.on('bid', refresh);
    socket.on('report', refresh);

    return () => {
      socket.disconnect();
    };
  }, [projectId, token, enabled]);
}
