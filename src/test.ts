var gameboard: ('x' | 'o' | undefined)[][] = [
    ['o', 'o', 'o'],
    [undefined, 'x', undefined],
    [undefined, undefined, 'x']
]

type move = `${'A' | 'B' | 'C'}${1 | 2 | 3}`; 

function isMove(move: any): move is move {
    return typeof move === 'string' && move.length === 2 && move.charAt(0) in ['A', 'B', 'C'] && move.charAt(1) in ['1', '2', '3'];
}

/**
 * Deciphers a move string in the format 'A1', 'B2', etc. and returns the corresponding x and y coordinates.
 * @param move - The move string to be deciphered.
 * @returns An array containing the x and y coordinates of the move.
 */
function decipherMove(move: move){
    let x = move.charAt(0)
    let y = move.charAt(1)
    let resultX: number;
    let resultY: number = parseInt(y)
    if(x === 'A'){
        resultX = 0
    }else if(x === 'B'){
        resultX = 1
    }else{
        resultX = 2
    }
    return [resultX, resultY]
}

/**
 * Encodes a move on the game board into a string representation.
 * @param x - The x-coordinate of the move.
 * @param y - The y-coordinate of the move.
 * @returns A string representation of the move in the format 'A1', 'B2', etc.
 */
function encodeMove(x: number, y: number): move{
    let resultX: string;
    let resultY: string;
    if(x === 0){
        resultX = 'A'
    }else if(x === 1){
        resultX = 'B'
    }else{
        resultX = 'C'
    }
    resultY = y.toString()
    return `${resultX}${resultY}` as move
}

/**
 * Places a move on the game board for the given player.
 * @param move - The move to be placed, in the format 'A1', 'B2', etc.
 * @param player - The player making the move, either 'x' or 'o'.
 * @returns `true` if the move was successfully placed, `false` otherwise.
 */
function placeMove(move: move, player: 'x' | 'o'): boolean{
    let [x, y] = decipherMove(move)
    if(x >= 0 && x < gameboard.length && y >= 0 && y < gameboard[x].length){
        if(isLegalMove(x, y)){
            gameboard[x][y] = player
            return true

        }else{
            console.log("Illegal move - Not empty")
            return false
        }
    }else{
        console.log("Invalid move")
        return false
    }
}
  
/**
 * Checks if the given position on the game board is a legal move.
 * @param x - The x-coordinate of the position to check.
 * @param y - The y-coordinate of the position to check.
 * @returns `true` if the position is empty and a legal move, `false` otherwise.
 */
function isLegalMove(x: number, y: number): boolean{
    if(gameboard[x][y] === undefined){
        return true  
    }
    return false
}
  


/**
 * Checks if the game is in a winning state for either player.
 * @returns `[true, 'x']` if player 'x' has won, `[true, 'o']` if player 'o' has won, or `false` if no player has won.
 */
function isWinState(){
    let x = []
    let o = []

    for(let i = 0; i < 3; i++){
        for(let z = 0; z < 3; z++){
            if(gameboard[i][z] === 'x'){
                x.push(true)
                continue
            }
    
            if(gameboard[i][z] === 'o'){
                o.push(true)
            }
    
        }
    
        if(x.length === 3){
            return [true, 'x']
        }
    
        if(o.length === 3){
            return [true, 'o']
        }
    
    x = []
    o = []
    
    } 

    x = []
    o = []

    for(let i = 0; i < 3; i++){
        for(let z = 0; z < 3; z++){
            if(gameboard[z][i] === 'x'){
                x.push(true)
            }
    
            if(gameboard[z][i] === 'o'){
                o.push(true)
            }
        }
    
        if(x.length === 3){
            return [true, 'x']
        }
    
        if(o.length === 3){
            return [true, 'o']
        }
    
        x = []
        o = []
    }

    x = []
    o = []

    for(let i = 0; i < 3; i++){
        if(gameboard[i][i] === 'x'){
            x.push(true)  
        }  
    
        if(gameboard[i][i] === 'o'){
            o.push(true)  
        }
    
        if(x.length === 3){
            return [true, 'x']
        }
    
        if(o.length === 3){
            return [true, 'o']
        }
    }

    x = []
    o = []

    for(let i = 0; i < 3; i++){
    
        if(gameboard[i][2-i] === 'x'){
            x.push(true)  
        }  

        if(gameboard[i][2-i] === 'o'){
            o.push(true)  
        }
    
        if(x.length === 3){
            return [true, 'x']
        }
    
        if(o.length === 3){
            return [true, 'o']
        }
    }

    return false

}
  
/**
 * Checks if the game is in a stalemate state, where all cells on the board are occupied but no player has won.
 * @returns {boolean} `true` if the game is in a stalemate state, `false` otherwise.
 */
function isStalemate(){
    if(!isWinState()){
      for(let i = 0; i < 3; i++){
        for(let z = 0; z < 3; z++){
          if(gameboard[i][z] === undefined){
            return false  
          }
        }
        
      }
      return true
    }  
}

/**
 * Clears the game board by setting all values to `undefined`.
 */
function clearBoard(){
    gameboard = [
        [undefined, undefined, undefined],
        [undefined, undefined, undefined],
        [undefined, undefined, undefined]
    ]
}

/**
 * Returns an array of available moves on the game board.
 * @returns {Array<[number, number]> | []} An array of coordinate pairs representing the available moves, or an empty array if the board is full.
 */
function availableMoves(): Array<[number, number]> | []{
    let moves: [number, number][] = []
    for(let i = 0; i < 3; i++){
        for(let z = 0; z < 3; z++){
            if(gameboard[i][z] === undefined){
                moves.push([i, z])
            }
        }
    }
    return moves
}


function positionValueRow(player: 'x' | 'o'): number{
    let value = 0
    let enemy = player === 'x' ? 'o' : 'x'
    let playerCount = 0
    let enemyCount = 0
    for(let i = 0; i < 3; i++){
        for(let z = 0; z < 3; z++){
            if(gameboard[0][i] === player){
                playerCount++
                value += 10 * playerCount
            }
    
            if(gameboard[0][i] === enemy){
                enemyCount++
                value -= 5 * enemyCount
            }
        }
        playerCount = 0
        enemyCount = 0
        
    }
    return value
}

function positionValueColumn(player: 'x' | 'o'): number{
    let value = 0
    let enemy = player === 'x' ? 'o' : 'x'
    let playerCount = 0
    let enemyCount = 0
    for(let i = 0; i < 3; i++){
        for(let z = 0; z < 3; z++){
            if(gameboard[z][i] === player){
                playerCount++
                value += 10 * playerCount
            }

            if(gameboard[z][i] === enemy){
                enemyCount++
                value -= 5 * enemyCount
            }
        }
        playerCount = 0
        enemyCount = 0
    }
    return value
}

function positionValueDiagonalLeft(player: 'x' | 'o'): number{
    let value = 0
    let enemy = player === 'x' ? 'o' : 'x'
    let playerCount = 0
    let enemyCount = 0
    for(let i = 0; i < 3; i++){
        if(gameboard[i][i] === player){
            playerCount++
            value += 10 * playerCount
        }

        if(gameboard[i][i] === enemy){
            enemyCount++
            value -= 5 * enemyCount
        }
    }
    return value
}

function positionValueDiagonalRight(player: 'x' | 'o'): number{
    let value = 0
    let enemy = player === 'x' ? 'o' : 'x'
    let playerCount = 0
    let enemyCount = 0
    for(let i = 0; i < 3; i++){
        if(gameboard[i][2-i] === player){
            playerCount++
            value += 10 * playerCount
        }

        if(gameboard[i][2-i] === enemy){
            enemyCount++
            value -= 5 * enemyCount
        }
    }
    return value
}

function totalPositionValue(player: 'x' | 'o'): number | null{
    let value = 0
    value += positionValueRow(player)
    value += positionValueColumn(player)
    value += positionValueDiagonalLeft(player)
    value += positionValueDiagonalRight(player)

    let winner = isWinState()

    // drawBoard()

    if(Array.isArray(winner)){
        if(winner[1] === player){
            return  100000
        }
        else{
            return -100000
        }
    }

    if(isStalemate()){
        return 0
    }

    if(value > 0){
        return value
    }

    return null
    
}



function drawBoard(){
    let pen = ""
    for(let i = 0; i < 3; i++){
        for(let z = 0; z < 3; z++){
            if(gameboard[i][z] === undefined){
                pen += " @ "
            }
            else{
                pen += ` ${gameboard[i][z]} `
            }
        }
        pen += "\n"
    }

    console.log(pen)
}


function findBestMove(){
    let bestScore = -Infinity
    let bestMove: [number, number] = [-99, -99] 
    const moves = availableMoves()

    if(moves.length === 0){
        console.log("No moves available")
        return []
    }


    for(const [x,y] of moves){
        let encodedMove: move = encodeMove(x, y)
        placeMove(encodedMove, 'o')
        let score = minimax(false, 1, -Infinity, Infinity)
        console.log("Score: ", score)
        console.log("Best score: ", bestScore)
        gameboard[x][y] = undefined
        if(score > bestScore){
            bestScore = score
            bestMove = [x, y]
        }
    }


    return bestMove.length !== undefined ? encodeMove(bestMove[0], bestMove[1]) : []
}
  
  
function minimax(isMax: boolean, depth: number, alpha: number, beta: number){
    const winner = totalPositionValue('o')


    // win
    if(winner === 100000){
        return winner - depth
    }

    // lost
    if(winner === -100000){
        return winner + depth
    }

    // stalemate
    if(winner === 0 || depth >= 9){
        return 0
    }

    if(isMax){
        let best = -Infinity
        for(let move of availableMoves()){
            if(move.length > 0){
                gameboard[move[0]][move[1]] = 'o'
                let score = minimax(false, depth + 1, alpha, beta)
                gameboard[move[0]][move[1]] = undefined

                if(score > best){
                    best = score
                }

                alpha = Math.max(alpha, best)
                if(beta <= alpha){
                    break
                }
            }
        }
        return best
    }else{
        let best = Infinity
        for(let move of availableMoves()){
            if(move.length > 0){
                gameboard[move[0]][move[1]] = 'x'
                let score = minimax(true, depth + 1, alpha, beta)
                gameboard[move[0]][move[1]] = undefined

                if(score < best){
                    best = score
                }

                beta = Math.min(beta, best)
                if(beta <= alpha){
                    break
                }

            }
        }
        return best
    }
    
    
}


export function getInput(): string {
    let input: string | null = (document.getElementById("userInput") as HTMLInputElement)?.value;
    console.log("You entered:", input);
    return input;
}


export function main(){
    console.log("[BEST MOVE - (X, Y) ] -> ", findBestMove())
}
