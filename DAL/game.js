import games from "../models/games.cjs";

export const findByID = async (id) => {
    try {
        return await games.findOne({ id }, {}, { lean: true })
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

export const addMove = async (gameID, { move, ...rest }) => {
    try {
        return await games.findOneAndUpdate({
            id: gameID
        }, {
            $push: { moves: move },
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