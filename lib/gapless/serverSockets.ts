import { Server, Socket } from "socket.io";
import config from "../config";
import { GaplessFunctionRequest, GaplessFunctionResult } from "./gapless";

export let serverIO: Server;

export type FunctionRequestHandler = (req: GaplessFunctionRequest) => void;
export type SendResultFunction = (<T>(res: GaplessFunctionResult<T>) => void);
export type GaplessCallbackSignature<T> = (sendResult: SendResultFunction) => FunctionRequestHandler;


// Use a higher order function to inject the `send` function into the handler
const initServer = <T>(gaplessCallback: GaplessCallbackSignature<T>) => {
  try {
    console.log('basic server check');
    serverIO = new Server({ cors: {
      // TODO: Generically handle this
      origin: 'http://localhost:3000',
    } });

    serverIO.on('connection', (socket) => {
      console.log('Server Socket connected');
      
      // Connect all of the events for things like ping/pong, disconnect, etc.
      // I literally don't need any of them, but it's interesting and free lol
      connectEverything(socket);

      // The meat and potatoes, the callback to handle gapless stuff happens in here.
      const sendResult: SendResultFunction = res => {
        console.log('ourSend', res);
        socket.emit('result', res);
      };

      // When they make a call, this is the real handler.
      socket.on('call', (res: GaplessFunctionRequest) => {
        console.log('call received on server', res);
        gaplessCallback(sendResult)(res);
      });
    });

    serverIO.listen(Number.parseInt(config.WS_PORT));
  } catch (e) {
    console.error('Server Socket error', e);
  }
};


const connectEverything = (socket: Socket) => {
  socket.on('disconnect', () => {
    console.log('Server Socket disconnected');
  });

  socket.on('message', (msg) => {
    console.log('Server Socket message', msg);
  });

  socket.on('error', (err) => {
    console.error('Server Socket error', err);
  });

  socket.on('connect_error', (err) => {
    console.error('Server Socket connect_error', err);
  });

  socket.on('connect_timeout', (err) => {
    console.error('Server Socket connect_timeout', err);
  });

  socket.on('reconnect', (attemptNumber) => {
    console.log('Server Socket reconnect', attemptNumber);
  });

  socket.on('reconnect_attempt', (attemptNumber) => {
    console.log('Server Socket reconnect_attempt', attemptNumber);
  });

  socket.on('reconnecting', (attemptNumber) => {
    console.log('Server Socket reconnecting', attemptNumber);
  });

  socket.on('reconnect_error', (err) => {
    console.error('Server Socket reconnect_error', err);
  });

  socket.on('reconnect_failed', () => {
    console.error('Server Socket reconnect_failed');
  });

  socket.on('ping', () => {
    console.log('Server Socket ping');
  });

  socket.on('pong', (latency) => {
    console.log('Server Socket pong', latency);
  });
};

export default initServer;
