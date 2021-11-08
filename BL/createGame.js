import { v4 as uuidV4 } from 'uuid';
import { create as saveGame, findByRoomName } from '../DAL/game.js';
import generateGameData from '../utils/generateGame.js';
import isEmpty from '../utils/isEmpty.js';

export const createGame = async ({ roomName, roomID }) => {
    try {
        const existingGame = await findByRoomName(roomName);
        if (isEmpty(existingGame)) {
            const savedGame = await saveGame({
                id: uuidV4(),
                name: roomName,
                roomIDs: { creator: roomID },
                nextMove: 'cross',
                nextMoveID: roomID,
                createdAt: new Date(),
                updatedAt: new Date(),
                createdBy: roomID,
                updatedBy: roomID
            });
            return {
                gameID: savedGame.id,
                next: 'cross',
                nextMove: roomID,
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