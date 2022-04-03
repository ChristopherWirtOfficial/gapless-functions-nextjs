import { NextApiRequest, NextApiResponse } from 'next'
import { Server } from 'Socket.IO'

type GaplessResponse = NextApiResponse & {
  socket.blah: string
};

const SocketHandler = (req: NextApiRequest, res: NextApiResponse) => {
  if (res.socket?.server?.io) {
    console.log('Socket is already running')
  } else {
    console.log('Socket is initializing')
    const io = new Server(res.socket.server)
    res.socket.server.io = io
  }
  res.end()
}

export default SocketHandler;
