import { io, Socket } from 'socket.io-client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { Incident, Alert, Resource } from '../types';

interface SocketContextType {
  connected: boolean;
  lastIncident: Incident | null;
  lastAlert: Alert | null;
  lastResourceUpdate: Resource | null;
}

const SocketContext = createContext<SocketContextType>({
  connected: false,
  lastIncident: null,
  lastAlert: null,
  lastResourceUpdate: null
});

let socket: Socket | null = null;

export function SocketProvider({ children }: { children: ReactNode }) {
  const [connected, setConnected] = useState(false);
  const [lastIncident, setLastIncident] = useState<Incident | null>(null);
  const [lastAlert, setLastAlert] = useState<Alert | null>(null);
  const [lastResourceUpdate, setLastResourceUpdate] = useState<Resource | null>(null);

  useEffect(() => {
    socket = io('http://localhost:3001', { transports: ['websocket', 'polling'] });

    socket.on('connect', () => {
      setConnected(true);
      socket?.emit('join:command-center');
    });

    socket.on('disconnect', () => setConnected(false));

    socket.on('incident:new', (data: Incident) => setLastIncident(data));
    socket.on('incident:updated', (data: Incident) => setLastIncident(data));
    socket.on('resource:updated', (data: Resource) => setLastResourceUpdate(data));
    socket.on('alert:new', (data: Alert) => setLastAlert(data));

    return () => { socket?.disconnect(); };
  }, []);

  return (
    <SocketContext.Provider value={{ connected, lastIncident, lastAlert, lastResourceUpdate }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
