import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import http from 'http';
// import cors from 'cors';
import { Server } from 'socket.io';
import { createGame } from './BL/createGame.js';
import { generateNewGame, onPlayerMove } from './BL/gameplay.js';
import joinGame from './BL/joinGame.js';
import { CONNECTION_EVENTS, EMIT_EVENTS, REQUEST_ERROR } from './CONSTANTS/socket.js';

dotenv.config();
// const app = express();
// const server = http.createServer(app);

const { ALLOWED_DOMAIN, DB_USERNAME, DB_PASSWORD, DB_CLUSTER_LINK } = process.env;

// app.use(cors({
//     origin: ALLOWED_DOMAIN
// }));

try {
    await mongoose.connect(`mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@${DB_CLUSTER_LINK}?retryWrites=true&w=majority`,
        { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });
    console.log('DB CONNECTION SUCCESSFUL');

    const io = new Server(8081, {
        cors: {
            origin: [ALLOWED_DOMAIN],
        }
    });
    io.on(CONNECTION_EVENTS.CONNECTION, (socket) => {

        socket.on(CONNECTION_EVENTS.CREATE_ROOM, async ({ roomName = '' }) => {
            if (roomName === '') {
                // socket.emit('post-connection', { socketID: socket.id });
                console.error(REQUEST_ERROR.ROOM_NAME_IS_MISSING);
            } else {
                const response = await createGame({ roomID: socket.id, roomName });
                socket.join(response.gameID);
                socket.emit(EMIT_EVENTS.ROOM_JOINED, response);
            }
        });

        socket.on(CONNECTION_EVENTS.JOIN_ROOM, async ({ roomName = '' }) => {
            if (roomName === '') {
                // socket.emit('post-connection', { socketID: socket.id });
                console.error(REQUEST_ERROR.ROOM_NAME_IS_MISSING);
            } else {
                const response = await joinGame({ roomID: socket.id, roomName });
                socket.join(response.gameID);
                socket.emit(EMIT_EVENTS.ROOM_JOINED, response);
            }
        });

        socket.on(CONNECTION_EVENTS.BLOCK_CLICK, async ({ gameID = -1, rowID = -1, columnID = -1 }) => {
            if (gameID === -1 || rowID === -1 || columnID === -1) {
                console.error(REQUEST_ERROR.BAD_REQUEST);
            } else {
                const response = await onPlayerMove({ gameID, roomID: socket.id, rowID, columnID });
                io.to(gameID).emit(EMIT_EVENTS.ON_MOVE_RESPONSE, response);
            }
        });

        socket.on(CONNECTION_EVENTS.NEW_GAME, async ({ gameID = -1 }) => {
            if (gameID === -1) {
                console.error(REQUEST_ERROR.BAD_REQUEST);
            } else {
                const response = await generateNewGame({ gameID });
                io.to(gameID).emit(EMIT_EVENTS.ON_NEW_GAME, response);
            }
        });
    });
} catch (error) {
    console.error('MONGO CONNECTION ERROR', error);
}