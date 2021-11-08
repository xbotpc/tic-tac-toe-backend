const mongoose = require('mongoose')

const gamesSchema = new mongoose.Schema({
    id: { type: String, required: true, index: true },
    roomIDs: {
        creator: { type: String, required: true },
        joinee: { type: String, required: false }
    },
    name: { type: String, required: true },
    nextMove: { type: String, defaultData: 'cross', required: true },
    nextMoveID: { type: String, defaultData: '', required: false },
    moves: [{
        roomID: { type: String, required: true },
        type: { type: String, required: true },
        rowID: { type: Number, required: true },
        columnID: { type: Number, required: true },
        createdAt: { type: Date, required: true },
    }],
    createdAt: { type: Date, required: true },
    updatedAt: { type: Date, required: true },
    createdBy: { type: String, required: true },
    updatedBy: { type: String, required: true },
});

const gamesModel = mongoose.model('games', gamesSchema);

module.exports = gamesModel;