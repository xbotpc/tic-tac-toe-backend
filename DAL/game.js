import games from "../models/games.cjs";

export const findByID = async (id) => {
    try {
        return await games.findOne({ id }, {}, { lean: true })
    } catch (error) {
        console.error('findByID', error);
        return null;
    }
}

export const addNewGame = async (id, newGame, rest) => {
    try {
        return await games.findOneAndUpdate({ id }, {
            $push: {
                games: newGame
            },
            ...rest
        }, {
            new: true,
            lean: true
        });
    } catch (error) {
        console.error('findByID', error);
        return null;
    }
}

export const findByRoomName = async (name) => {
    try {
        return await games.findOne({ name }, {}, { lean: true })
    } catch (error) {
        console.error('findByRoomName', error);
        return null;
    }
}

export const create = async (game) => {
    try {
        return await games.create(game)
        // return await games.remove();
    } catch (error) {
        console.error('create', error);
        return null;
    }
}

export const update = async (id, game) => {
    try {
        return await games.findOneAndUpdate({ id }, game)
    } catch (error) {
        console.error('update', error);
        return null;
    }
}

export const addMove = async (gameID, sessionID, { move, ...rest }) => {
    try {
        return await games.findOneAndUpdate({
            id: gameID,
            "games.sessionID": sessionID
        }, {
            $push: {
                "games.$.moves": move
            },
            ...rest
        }, {
            new: true,
            lean: true
        });
    } catch (error) {
        console.error('create', error);
        return null;
    }
}

export const updateWinner = async (gameID, sessionID, winnerID) => {
    try {
        return await games.findOneAndUpdate({
            id: gameID,
            "games.sessionID": sessionID
        }, {
            $set: {
                "games.$.winnerID": winnerID,
                "games.$.finished": true,
            },
        }, {
            new: true,
            lean: true
        });
    } catch (error) {
        console.error('create', error);
        return null;
    }
}