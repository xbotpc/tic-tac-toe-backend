import { v4 as uuidV4 } from 'uuid';
import { create as saveGame } from '../DAL/game.js';
import generateGameData from '../utils/generateGame.js';

export const createGame = async ({ roomName, roomID }) => {
    try {
        const savedGame = await saveGame({
            id: uuidV4(),
            name: roomName,
            roomIDs: { creator: roomID },
            nextMove: 'cross',
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: roomID,
            updatedBy: roomID
        });

        return {
            gameID: savedGame.id,
            next: 'cross',
            message: `You have joined ${roomName}.`,
            gameData: generateGameData({ moves: [] }),
        }
    } catch (error) {
        console.error('error', error);
        return {
            message: '',
            gameData: generateGameData({ moves: [] })
        }
    }
}