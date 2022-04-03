import { io, Socket } from "socket.io-client";
import config from "../config";
import { GaplessFunctionRequest } from "./gapless";

export let clientIO: Socket;

export const callRemoteFunction = (gaplessInfo: GaplessFunctionRequest) => {
  console.log('callRemoteFunction', gaplessInfo);
  clientIO.emit('call', gaplessInfo);
};

const initClientSockets = () => {
  try {
    console.log('basic client check');
    // client code

    clientIO = io(`http://localhost:${config.WS_PORT}`);

    clientIO.on('connect', () => {
      console.log('Client Socket connected');
    });

    clientIO.on('message', (msg) => {
      console.log('Client Socket message', msg);
    });
  } catch (e) {
    console.error('Client Socket error', e);
  }
};

export default initClientSockets;
