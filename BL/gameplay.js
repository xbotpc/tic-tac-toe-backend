import { v4 as UUIDv4 } from 'uuid';
import {
    updateWinner,
    findByID as findGameByID,
    addMove,
    addNewGame
} from '../DAL/game.js';
import generateGameData from '../utils/generateGame.js';
import isEmpty from '../utils/isEmpty.js';

export const onPlayerMove = async ({ gameID, roomID: playerID, rowID, columnID }) => {
    try {
        let message = 'no winner yet';
        let currentGame = { games: [{ moves: [] }] };
        let nextMove = '';
        let winnerID = undefined;
        let latestGameIndex = 0;
        let latestGame = currentGame.games[latestGameIndex];
        const score = {
            player1: 0,
            tie: 0,
            player2: 0,
        }
        if (rowID >= 0 && rowID <= 2 && columnID >= 0 && columnID <= 2) {
            currentGame = await findGameByID(gameID);

            latestGameIndex = currentGame.games.length - 1;
            latestGame = currentGame.games[latestGameIndex];

            if (!isEmpty(latestGame.moves.length)) {
                const exists = latestGame.moves.find(x => x.rowID === rowID && x.columnID === columnID);
                if (exists) {
                    return { message: 'Illegal Move', gameData: generateGameData(latestGame), nextMove: currentGame.nextMoveID };
                } else {
                    const currentMove = latestGame.moves[latestGame.moves.length - 1].type === 'cross' ? 'circle' : 'cross';

                    currentGame = await addMove(gameID, latestGame.sessionID, {
                        move: {
                            playerID,
                            type: currentMove,
                            rowID,
                            columnID,
                            createdAt: new Date()
                        },
                        nextMove: currentMove === 'cross' ? 'circle' : 'cross',
                        nextMoveID: currentGame.nextMoveID === currentGame.playerIDs.creator ? currentGame.playerIDs.joinee : currentGame.playerIDs.creator
                    });

                    // Check if current player has won the game
                    const sameRowData = currentGame.games[latestGameIndex].moves.filter(x => x.rowID === rowID);
                    const completeRowStrike = sameRowData.length === 3 && sameRowData.every(x => x.type === currentMove);
                    if (completeRowStrike) {
                        message = 'winner';
                        currentGame = generateGameData(currentGame.games[latestGameIndex]);
                        // nextMove = currentGame.nextMoveID;
                        winnerID = playerID;
                    } else {
                        const sameColumnData = currentGame.games[latestGameIndex].moves.filter(x => x.columnID === columnID);
                        const completeColumnStrike = sameColumnData.length === 3 && sameColumnData.every(x => x.type === currentMove);
                        if (completeColumnStrike) {
                            message = 'winner';
                            nextMove = currentGame.nextMoveID;
                            currentGame = generateGameData(currentGame.games[latestGameIndex]);
                            winnerID = playerID;
                        } else if ((rowID + columnID) % 2 === 0) {
                            const firstDiagonalData = currentGame.games[latestGameIndex].moves
                                .filter((x, i) => (x.columnID === 0 && x.rowID === 2) || (x.columnID === 1 && x.rowID === 1) || (x.columnID === 2 && x.rowID === 0));
                            const completeFirstDiagonalStrike = firstDiagonalData.length === 3 && firstDiagonalData.every(x => x.type === currentMove);
                            if (completeFirstDiagonalStrike) {
                                message = 'winner';
                                currentGame = generateGameData(currentGame.games[latestGameIndex]);
                                nextMove = currentGame.nextMoveID;
                                winnerID = playerID;
                            } else {
                                const secondDiagonalData = currentGame.games[latestGameIndex].moves.filter((x) => x.columnID === x.rowID);
                                const completeSecondDiagonalStrike = secondDiagonalData.length === 3 && secondDiagonalData.every(x => x.type === currentMove);
                                if (completeSecondDiagonalStrike) {
                                    message = 'winner';
                                    currentGame = generateGameData(currentGame.games[latestGameIndex]);
                                    nextMove = currentGame.nextMoveID;
                                    winnerID = playerID;
                                } else {
                                    message = 'no winner yet';
                                    nextMove = currentGame.nextMoveID;
                                    currentGame = generateGameData(currentGame.games[latestGameIndex]);
                                }
                            }
                        } else {
                            message = 'no winner yet';
                            nextMove = currentGame.nextMoveID;
                            currentGame = generateGameData(currentGame.games[latestGameIndex]);
                        }
                    }
                }
            } else {
                currentGame = await addMove(gameID, latestGame.sessionID, {
                    move: {
                        playerID,
                        type: currentGame.games.length !== 0 ? currentGame.nextMove : 'cross',
                        rowID,
                        columnID,
                        createdAt: new Date()
                    },
                    nextMove: currentGame.nextMove === 'circle' ? 'cross' : 'circle',
                    nextMoveID: currentGame.nextMoveID.includes([currentGame.playerIDs.creator || ''])
                        ? currentGame.playerIDs.joinee
                        : currentGame.playerIDs.creator,
                });
                message = 'no winner yet';
                nextMove = currentGame.nextMoveID;
                currentGame = generateGameData(currentGame.games[latestGameIndex]);
            }
        } else {
            message = 'cheater';
            nextMove = currentGame.nextMoveID;
            currentGame = generateGameData({ moves: [] });
        }

        if (message === 'winner') {
            const aa = await updateWinner(gameID, latestGame.sessionID, winnerID);
            score.player1 = aa.games.filter(x => x.finished && x.winnerID === aa.playerIDs.creator).length;
            score.tie = aa.games.filter(x => x.finished && x.winnerID === '').length;
            score.player2 = aa.games.filter(x => x.finished && x.winnerID === aa.playerIDs.joinee).length;
        }

        if (latestGame.moves === 9 || currentGame.flat().every(x => x.type !== '')) {
            const aa = await updateWinner(gameID, latestGame.sessionID, '');
            message = 'tie'
            score.player1 = aa.games.filter(x => x.finished && x.winnerID === aa.playerIDs.creator).length;
            score.tie = aa.games.filter(x => x.finished && x.winnerID === '').length;
            score.player2 = aa.games.filter(x => x.finished && x.winnerID === aa.playerIDs.joinee).length;
        }

        return { message, gameData: currentGame, nextMove, winnerID, score }
    } catch (error) {
        console.error('error', error);
        return { message: 'error', gameData: generateGameData({ moves: [] }), nextMove: currentGame.nextMoveID }
    }
}

export const generateNewGame = async ({ gameID }) => {
    try {
        const currentGame = await findGameByID(gameID)
        const newGame = {
            sessionID: UUIDv4(),
            winnerID: '',
            finished: false
        };
        const nextMove = currentGame.games.length % 2 === 0 ? 'cross' : 'circle';
        const nextMoveID = currentGame.games.length % 2 === 0 ? currentGame.playerIDs.creator : currentGame.playerIDs.joinee;
        const rest = {
            nextMoveID,
            nextMove
        }
        await addNewGame(gameID, newGame, rest);
        return { gameData: generateGameData({ moves: [] }), nextMove: nextMoveID };
    } catch (error) {
        console.error('error', error);
        return { message: 'error', gameData: generateGameData({ moves: [] }), nextMove: currentGame.nextMoveID }
    }
}