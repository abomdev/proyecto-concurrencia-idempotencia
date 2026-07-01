import { Server as HttpServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import { setIo } from './io'

export function initSocket(httpServer: HttpServer): SocketIOServer {
  const io = new SocketIOServer(httpServer, {
    cors: { origin: '*' },
  })

  io.on('connection', (socket) => {
    socket.on('join:showtime', (showtimeId: string) => {
      socket.join(`showtime:${showtimeId}`)
    })
    socket.on('leave:showtime', (showtimeId: string) => {
      socket.leave(`showtime:${showtimeId}`)
    })
  })

  setIo(io)
  return io
}
