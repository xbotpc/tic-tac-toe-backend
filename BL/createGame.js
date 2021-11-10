import { v4 as uuidV4 } from 'uuid';
import { create as saveGame, findByRoomName } from '../DAL/game.js';
import generateGameData from '../utils/generateGame.js';
import isEmpty from '../utils/isEmpty.js';

export const createGame = async ({ roomName, roomID: playerID }) => {
    try {
        const existingGame = await findByRoomName(roomName);
        if (isEmpty(existingGame)) {
            const savedGame = await saveGame({
                id: uuidV4(),
                name: roomName,
                playerIDs: { creator: playerID },
                games: [{
                    sessionID: uuidV4(),
                    winnerID: '',
                    finished: false,
                }],
                nextMove: 'cross',
                nextMoveID: playerID,
                createdAt: new Date(),
                updatedAt: new Date(),
                createdBy: playerID,
                updatedBy: playerID
            });
            return {
                gameID: savedGame.id,
                sessionID: savedGame.games[0].sessionID,
                next: 'cross',
                nextMove: playerID,
                message: `You have joined ${roomName}.`,
                gameData: generateGameData({ moves: [] }),
            }
        } return {
            // gameID: existingGame.gameID,
            // next: existingGame.nextMove,
            // nextMove: existingGame.nextMoveID,
            message: `Room already exists`,
            // gameData: generateGameData(existingGame.gameData),
        }

    } catch (error) {
        console.error('error', error);
        return {
            message: '',
            gameData: generateGameData({ moves: [] })
        }
    }
}