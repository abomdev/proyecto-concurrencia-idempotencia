import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

export function useSocket() {
  function connect(): Socket {
    if (!socket || socket.disconnected) {
      socket = io(import.meta.env.VITE_API_URL ?? 'http://localhost:3000')
    }
    return socket
  }

  function disconnect(): void {
    socket?.disconnect()
    socket = null
  }

  return { connect, disconnect, socket: () => socket }
}
