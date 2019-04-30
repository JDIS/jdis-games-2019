function textToGame(text) {
    try {
        let {history, redTeamName, blueTeamName} = JSON.parse(text);
        if (!history.length) {
            return alert("The klvr file is empty.")
        }
        history = history.map(game => game.split("\n"));
        let scores = [];
        for (let game of history) {
            game.pop(); scores.push(game.pop());
        }
        return {history, redTeamName, blueTeamName, scores};
    } catch(e) {
        return alert("The klvr file is corrupted.");
    }
}
