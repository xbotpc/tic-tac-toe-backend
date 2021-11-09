import {
    addMove,
    findByID as findGameByID
} from '../DAL/game.js';
import generateGameData from '../utils/generateGame.js';
import isEmpty from '../utils/isEmpty.js';

export const onPlayerMove = async ({ gameID, roomID, rowID, columnID }) => {
    try {
        let message = 'no winner yet';
        let currentGame = { move: [] };
        let nextMove = '';
        let winnerID = undefined;
        if (rowID >= 0 && rowID <= 2 && columnID >= 0 && columnID <= 2) {
            currentGame = await findGameByID(gameID);

            if (!isEmpty(currentGame.moves.length)) {
                const exists = currentGame.moves.find(x => x.rowID === rowID && x.columnID === columnID);
                if (exists) {
                    return { message: 'Illegal Move', gameData: generateGameData(currentGame), nextMove: currentGame.nextMoveID };
                } else {
                    const currentMove = currentGame.moves[currentGame.moves.length - 1].type === 'cross' ? 'circle' : 'cross';

                    currentGame = await addMove(gameID, {
                        move: {
                            roomID,
                            type: currentMove,
                            rowID,
                            columnID,
                            createdAt: new Date()
                        },
                        nextMove: currentMove === 'cross' ? 'circle' : 'cross',
                        nextMoveID: currentGame.nextMoveID === currentGame.roomIDs.creator ? currentGame.roomIDs.joinee : currentGame.roomIDs.creator
                    });

                    // Check if current player has won the game
                    const sameRowData = currentGame.moves.filter(x => x.rowID === rowID);
                    const completeRowStrike = sameRowData.length === 3 && sameRowData.every(x => x.type === currentMove);
                    if (completeRowStrike) {
                        message = 'winner';
                        currentGame = generateGameData(currentGame);
                        nextMove = currentGame.nextMoveID;
                        winnerID = roomID;
                    } else {
                        const sameColumnData = currentGame.moves.filter(x => x.columnID === columnID);
                        const completeColumnStrike = sameColumnData.length === 3 && sameColumnData.every(x => x.type === currentMove);
                        if (completeColumnStrike) {
                            message = 'winner';
                            nextMove = currentGame.nextMoveID;
                            currentGame = generateGameData(currentGame);
                            winnerID = roomID;
                        } else if ((rowID + columnID) % 2 === 0) {
                            const firstDiagonalData = currentGame.moves.filter((x, i) => (x.columnID === 0 && x.rowID === 2) || (x.columnID === 1 && x.rowID === 1) || (x.columnID === 2 && x.rowID === 0));
                            const completeFirstDiagonalStrike = firstDiagonalData.length === 3 && firstDiagonalData.every(x => x.type === currentMove);
                            if (completeFirstDiagonalStrike) {
                                message = 'winner';
                                currentGame = generateGameData(currentGame);
                                nextMove = currentGame.nextMoveID;
                                winnerID = roomID;
                            } else {
                                const secondDiagonalData = currentGame.moves.filter((x) => x.columnID === x.rowID);
                                const completeSecondDiagonalStrike = secondDiagonalData.length === 3 && secondDiagonalData.every(x => x.type === currentMove);
                                if (completeSecondDiagonalStrike) {
                                    message = 'winner';
                                    currentGame = generateGameData(currentGame);
                                    nextMove = currentGame.nextMoveID;
                                    winnerID = roomID;
                                } else {
                                    message = 'no winner yet';
                                    nextMove = currentGame.nextMoveID;
                                    currentGame = generateGameData(currentGame);
                                }
                            }
                        } else {
                            message = 'no winner yet';
                            nextMove = currentGame.nextMoveID;
                            currentGame = generateGameData(currentGame);
                        }
                    }

                }
            } else {
                currentGame = await addMove(gameID, {
                    move: {
                        roomID,
                        type: 'cross',
                        rowID,
                        columnID,
                        createdAt: new Date()
                    },
                    nextMove: 'circle',
                    nextMoveID: currentGame.roomIDs.joinee
                });
                message = 'no winner yet';
                nextMove = currentGame.nextMoveID;
                currentGame = generateGameData(currentGame);
            }
        } else {
            message = 'cheater';
            nextMove = currentGame.nextMoveID;
            currentGame = generateGameData({ move: [] });
        }
        return { message, gameData: currentGame, nextMove, winnerID }
    } catch (error) {
        console.error('error', error);
        return { message: 'error', gameData: generateGameData({ move: [] }), nextMove: currentGame.nextMoveID }
    }
}