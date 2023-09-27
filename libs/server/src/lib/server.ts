/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import express from 'express';
// import { readFileSync } from 'fs';
import * as http from 'http';
import * as path from 'path';
import { Server } from 'socket.io';
import { getValue } from './server-socket-event-handlers/get_value';
import { requestRender } from './server-socket-event-handlers/request_render';
import { runScript } from './server-socket-event-handlers/run_script';
import { setValue } from './server-socket-event-handlers/set_value';
import { BackroadSession } from './sessions/session';
import { sessionManager } from './sessions/session-manager';
import { setValueIfNotExists } from './server-socket-event-handlers/set_value_if_not_exists';
import { setValueAndReRun } from './server-socket-event-handlers/set_value_and_re_run';

export const startBackroadServer = (options: {
  port?: number;
  scriptPath: string;
}) => {
  const serverPort = options.port || 3333;
  const app = express();
  const server = http.createServer(app);
  const io = new Server(server, { path: '/api/socket.io', cors: {} });
  app.use('/assets', express.static(path.join(__dirname, 'assets')));

  app.get('/api', (req, res) => {
    res.send({ message: 'Welcome to server!' });
  });

  io.on('connection', (socket) => {
    const backroadSession = new BackroadSession(socket);
    sessionManager.register(backroadSession);
    console.log('a user connected', backroadSession.id);
    // every session joins a room with name equal to its own id,
    // useful for informing to client app to render a node (when script requests for it through request_render)
    socket.join(backroadSession.id);
    socket.on('get_value', getValue(socket));
    // socket.on('set_value', setValue(socket));
    socket.on('request_render', requestRender(socket));
    socket.on('set_value_if_not_exists', setValueIfNotExists(socket));

    socket.on(
      'run_script',
      runScript(socket, {
        serverPort,
        scriptPath: options.scriptPath,
        backroadSession,
      })
    );
    socket.on('set_value_and_re_run', setValueAndReRun(socket));
    // account for disconnection
    socket.on('disconnect', () => {
      sessionManager.unregister(backroadSession);
      console.log('user disconnected', backroadSession.id);
    });
  });
  server.listen(serverPort);
};
