import { findByRoomName, update as updateGame } from "../DAL/game.js";
import generateGameData from "../utils/generateGame.js";
import isEmpty from "../utils/isEmpty.js";

const joinGame = async ({ roomName, roomID: joineeID }) => {
    try {
        const savedGame = await findByRoomName(roomName);
        if (isEmpty(savedGame) || isEmpty(savedGame.id)) {
            return null;
        }
        await updateGame(savedGame.id, {
            roomIDs: {
                ...savedGame.roomIDs,
                joinee: joineeID
            },
            nextMoveID: !isEmpty(savedGame.moves.length) ? joineeID : savedGame.roomIDs.creator
        });
        return {
            gameID: savedGame.id,
            next: 'circle',
            nextMove: joineeID,
            message: `You have joined ${roomName}.`,
            gameData: generateGameData(savedGame),
        }
    } catch (error) {
        console.error('error', error);
        return null;
    }
}

export default joinGame;