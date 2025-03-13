"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInput = getInput;
exports.main = main;
var gameboard = [
    ['o', undefined, 'x'],
    [undefined, undefined, undefined],
    ['x', undefined, undefined]
];
function isMove(move) {
    return typeof move === 'string' && move.length === 2 && move.charAt(0) in ['A', 'B', 'C'] && move.charAt(1) in ['1', '2', '3'];
}
/**
 * Deciphers a move string in the format 'A1', 'B2', etc. and returns the corresponding x and y coordinates.
 * @param move - The move string to be deciphered.
 * @returns An array containing the x and y coordinates of the move.
 */
function decipherMove(move) {
    var x = move.charAt(0);
    var y = move.charAt(1);
    var resultX;
    var resultY = parseInt(y);
    if (x === 'A') {
        resultX = 0;
    }
    else if (x === 'B') {
        resultX = 1;
    }
    else {
        resultX = 2;
    }
    return [resultX, resultY];
}
/**
 * Encodes a move on the game board into a string representation.
 * @param x - The x-coordinate of the move.
 * @param y - The y-coordinate of the move.
 * @returns A string representation of the move in the format 'A1', 'B2', etc.
 */
function encodeMove(x, y) {
    var resultX;
    var resultY;
    if (x === 0) {
        resultX = 'A';
    }
    else if (x === 1) {
        resultX = 'B';
    }
    else {
        resultX = 'C';
    }
    resultY = y.toString();
    return "".concat(resultX).concat(resultY);
}
/**
 * Places a move on the game board for the given player.
 * @param move - The move to be placed, in the format 'A1', 'B2', etc.
 * @param player - The player making the move, either 'x' or 'o'.
 * @returns `true` if the move was successfully placed, `false` otherwise.
 */
function placeMove(move, player) {
    var _a = decipherMove(move), x = _a[0], y = _a[1];
    if (x >= 0 && x < gameboard.length && y >= 0 && y < gameboard[x].length) {
        if (isLegalMove(x, y)) {
            gameboard[x][y] = player;
            return true;
        }
        else {
            console.log("Illegal move - Not empty");
            return false;
        }
    }
    else {
        console.log("Invalid move");
        return false;
    }
}
/**
 * Checks if the given position on the game board is a legal move.
 * @param x - The x-coordinate of the position to check.
 * @param y - The y-coordinate of the position to check.
 * @returns `true` if the position is empty and a legal move, `false` otherwise.
 */
function isLegalMove(x, y) {
    if (gameboard[x][y] === undefined) {
        return true;
    }
    return false;
}
/**
 * Checks if the game is in a winning state for either player.
 * @returns `[true, 'x']` if player 'x' has won, `[true, 'o']` if player 'o' has won, or `false` if no player has won.
 */
function isWinState() {
    var x = [];
    var o = [];
    for (var i = 0; i < 3; i++) {
        for (var z = 0; z < 3; z++) {
            if (gameboard[i][z] === 'x') {
                x.push(true);
                continue;
            }
            if (gameboard[i][z] === 'o') {
                o.push(true);
            }
        }
        if (x.length === 3) {
            return [true, 'x'];
        }
        if (o.length === 3) {
            return [true, 'o'];
        }
        x = [];
        o = [];
    }
    x = [];
    o = [];
    for (var i = 0; i < 3; i++) {
        for (var z = 0; z < 3; z++) {
            if (gameboard[z][i] === 'x') {
                x.push(true);
            }
            if (gameboard[z][i] === 'o') {
                o.push(true);
            }
        }
        if (x.length === 3) {
            return [true, 'x'];
        }
        if (o.length === 3) {
            return [true, 'o'];
        }
        x = [];
        o = [];
    }
    x = [];
    o = [];
    for (var i = 0; i < 3; i++) {
        if (gameboard[i][i] === 'x') {
            x.push(true);
        }
        if (gameboard[i][i] === 'o') {
            o.push(true);
        }
        if (x.length === 3) {
            return [true, 'x'];
        }
        if (o.length === 3) {
            return [true, 'o'];
        }
    }
    x = [];
    o = [];
    for (var i = 0; i < 3; i++) {
        if (gameboard[i][2 - i] === 'x') {
            x.push(true);
        }
        if (gameboard[i][2 - i] === 'o') {
            o.push(true);
        }
        if (x.length === 3) {
            return [true, 'x'];
        }
        if (o.length === 3) {
            return [true, 'o'];
        }
    }
    return false;
}
/**
 * Checks if the game is in a stalemate state, where all cells on the board are occupied but no player has won.
 * @returns {boolean} `true` if the game is in a stalemate state, `false` otherwise.
 */
function isStalemate() {
    if (!isWinState()) {
        for (var i = 0; i < 3; i++) {
            for (var z = 0; z < 3; z++) {
                if (gameboard[i][z] === undefined) {
                    return false;
                }
            }
        }
        return true;
    }
}
/**
 * Clears the game board by setting all values to `undefined`.
 */
function clearBoard() {
    gameboard = [
        [undefined, undefined, undefined],
        [undefined, undefined, undefined],
        [undefined, undefined, undefined]
    ];
}
/**
 * Returns an array of available moves on the game board.
 * @returns {Array<[number, number]> | []} An array of coordinate pairs representing the available moves, or an empty array if the board is full.
 */
function availableMoves() {
    var moves = [];
    for (var i = 0; i < 3; i++) {
        for (var z = 0; z < 3; z++) {
            if (gameboard[i][z] === undefined) {
                moves.push([i, z]);
            }
        }
    }
    return moves;
}
function positionValueRow(player) {
    var value = 0;
    var enemy = player === 'x' ? 'o' : 'x';
    var playerCount = 0;
    var enemyCount = 0;
    for (var i = 0; i < 3; i++) {
        for (var z = 0; z < 3; z++) {
            if (gameboard[0][i] === player) {
                playerCount++;
                value += 10 * playerCount;
            }
            if (gameboard[0][i] === enemy) {
                enemyCount++;
                value -= 5 * enemyCount;
            }
        }
        playerCount = 0;
        enemyCount = 0;
    }
    return value;
}
function positionValueColumn(player) {
    var value = 0;
    var enemy = player === 'x' ? 'o' : 'x';
    var playerCount = 0;
    var enemyCount = 0;
    for (var i = 0; i < 3; i++) {
        for (var z = 0; z < 3; z++) {
            if (gameboard[z][i] === player) {
                playerCount++;
                value += 10 * playerCount;
            }
            if (gameboard[z][i] === enemy) {
                enemyCount++;
                value -= 5 * enemyCount;
            }
        }
        playerCount = 0;
        enemyCount = 0;
    }
    return value;
}
function positionValueDiagonalLeft(player) {
    var value = 0;
    var enemy = player === 'x' ? 'o' : 'x';
    var playerCount = 0;
    var enemyCount = 0;
    for (var i = 0; i < 3; i++) {
        if (gameboard[i][i] === player) {
            playerCount++;
            value += 10 * playerCount;
        }
        if (gameboard[i][i] === enemy) {
            enemyCount++;
            value -= 5 * enemyCount;
        }
    }
    return value;
}
function positionValueDiagonalRight(player) {
    var value = 0;
    var enemy = player === 'x' ? 'o' : 'x';
    var playerCount = 0;
    var enemyCount = 0;
    for (var i = 0; i < 3; i++) {
        if (gameboard[i][2 - i] === player) {
            playerCount++;
            value += 10 * playerCount;
        }
        if (gameboard[i][2 - i] === enemy) {
            enemyCount++;
            value -= 5 * enemyCount;
        }
    }
    return value;
}
function totalPositionValue(player) {
    var value = 0;
    // value += positionValueRow(player)
    // value += positionValueColumn(player)
    // value += positionValueDiagonalLeft(player)
    // value += positionValueDiagonalRight(player)
    var winner = isWinState();
    console.log("Winner -> ", winner);
    if (Array.isArray(winner)) {
        if (winner[1] === player) {
            value = 100000;
        }
        else {
            console.log("Him lose");
            value = -100000;
        }
    }
    if (isStalemate()) {
        value = 0;
    }
    return value;
}
function drawBoard() {
    var pen = "";
    for (var i = 0; i < 3; i++) {
        for (var z = 0; z < 3; z++) {
            if (gameboard[i][z] === undefined) {
                pen += " @ ";
            }
            else {
                pen += " ".concat(gameboard[i][z], " ");
            }
        }
        pen += "\n";
    }
    console.log(pen);
}
function findBestMove() {
    var bestScore = -Infinity;
    var bestMove = [-99, -99];
    var moves = availableMoves();
    if (moves.length === 0) {
        console.log("No moves available");
        return [];
    }
    console.log("Available moves: ", moves);
    for (var _i = 0, moves_1 = moves; _i < moves_1.length; _i++) {
        var _a = moves_1[_i], x = _a[0], y = _a[1];
        var encodedMove = encodeMove(x, y);
        placeMove(encodedMove, 'o');
        var score = minimax(false);
        gameboard[x][y] = undefined;
        if (score > bestScore) {
            bestScore = score;
            bestMove = [x, y];
        }
    }
    return bestMove.length !== undefined ? encodeMove(bestMove[0], bestMove[1]) : [];
}
function minimax(isMax) {
    var winner = totalPositionValue('o');
    // win
    if (winner === 100000) {
        return winner;
    }
    // lost
    if (winner === -100000) {
        return winner;
    }
    // stalemate
    if (winner === 0) {
        return 0;
    }
    if (isMax) {
        var best = -Infinity;
        for (var _i = 0, _a = availableMoves(); _i < _a.length; _i++) {
            var move = _a[_i];
            if (move.length > 0) {
                gameboard[move[0]][move[1]] = 'o';
                best = Math.max(best, minimax(!isMax));
                gameboard[move[0]][move[1]] = undefined;
            }
        }
        return best;
    }
    else {
        var best = Infinity;
        for (var _b = 0, _c = availableMoves(); _b < _c.length; _b++) {
            var move = _c[_b];
            if (move.length > 0) {
                gameboard[move[0]][move[1]] = 'x';
                best = Math.min(best, minimax(!isMax));
                gameboard[move[0]][move[1]] = undefined;
            }
        }
        return best;
    }
}
function getInput() {
    var _a;
    var input = (_a = document.getElementById("userInput")) === null || _a === void 0 ? void 0 : _a.value;
    console.log("You entered:", input);
    return input;
}
function main() {
    console.log("[BEST MOVE - (X, Y) ] -> ", findBestMove());
}
