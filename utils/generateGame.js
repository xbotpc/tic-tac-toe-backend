import isEmpty from "./isEmpty.js";

const generateGameData = (data) => {
    try {
        const _data = data;
        const gameData = [];

        for (let i = 0; i < 3; i++) {
            const rowData = [];
            for (let j = 0; j < 3; j++) {
                const aa = _data.moves.find(x => x.rowID === i && x.columnID === j);
                rowData.push({
                    type: isEmpty(aa) ? '' : aa.type
                })
            }
            gameData.push(rowData);
        }
        return gameData;
    } catch (error) {
        console.error('generateGameData', error)
        return data;
    }
}

export default generateGameData;