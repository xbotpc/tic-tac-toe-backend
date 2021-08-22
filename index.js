import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Server } from 'socket.io';
import { createGame } from './BL/createGame.js';
import { onPlayerMove } from './BL/gameplay.js';
import joinGame from './BL/joinGame.js';

const io = new Server(8080, {
    cors: {
        origin: ['http://localhost:3000']
    }
});

dotenv.config();

const { DB_USERNAME, DB_PASSWORD, DB_CLUSTER_LINK } = process.env;

mongoose.connect(`mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@${DB_CLUSTER_LINK}?retryWrites=true&w=majority`,
    { useNewUrlParser: true, useUnifiedTopology: true })
    .then((res) => {
        console.log('DB CONNECTION SUCCESSFUL');
        io.on('connection', (socket) => {

            socket.on('createRoom', async ({ roomName = '' }) => {
                if (roomName === '') {
                    // socket.emit('post-connection', { socketID: socket.id });
                    console.log('hrerer')
                } else {
                    const response = await createGame({ roomID: socket.id, roomName });
                    socket.join(response.gameID);
                    socket.emit('roomJoined', response);
                }
            });

            socket.on('joinRoom', async ({ roomName = '' }) => {
                if (roomName === '') {
                    // socket.emit('post-connection', { socketID: socket.id });
                    console.log('hrerer')
                } else {
                    const response = await joinGame({ roomID: socket.id, roomName });
                    socket.join(response.gameID);
                    socket.emit('roomJoined', response);
                }
            });

            socket.on('blockClick', async ({ gameID = -1, rowID = -1, columnID = -1 }) => {
                if (gameID === -1 || rowID === -1 || columnID === -1) {
                    console.log('Bad Request')
                } else {
                    const response= await onPlayerMove({ gameID, rowID, columnID });
                    io.to(gameID).emit('onMoveResponse', response);
                }
            });
        });

    }).catch((err) => {
        console.error('err', err);
    });