import { findByRoomName, update as updateGame } from "../DAL/game.js";
import generateGameData from "../utils/generateGame.js";
import isEmpty from "../utils/isEmpty.js";

const joinGame = async ({ roomName, roomID: joineeID }) => {
    try {
        const savedGame = await findByRoomName(roomName);
        if (isEmpty(savedGame) || isEmpty(savedGame.id)) {
            return null;
        }
        const latestGameSession = savedGame.games[savedGame.games.length - 1];
        await updateGame(savedGame.id, {
            playerIDs: {
                ...savedGame.playerIDs,
                joinee: joineeID
            },
            nextMoveID: !isEmpty(latestGameSession.moves.length) ? joineeID : savedGame.playerIDs.creator
        });
        return {
            gameID: savedGame.id,
            sessionID: latestGameSession.sessionID,
            next: 'circle',
            nextMove: !isEmpty(latestGameSession.moves.length) ? joineeID : savedGame.playerIDs.creator,
            message: `You have joined ${roomName}.`,
            gameData: generateGameData(latestGameSession),
        }
    } catch (error) {
        console.error('error', error);
        return null;
    }
}

export default joinGame;