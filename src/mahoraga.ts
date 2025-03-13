import { Chess } from "chess.js"
import { PAWN, KNIGHT, ROOK, BISHOP, QUEEN, KING, WHITE, BLACK } from "chess.js"

const chess = new Chess()



const whitePieceVal: Object = {
    'p': 10,
    'n': 30,
    'b': 30,
    'r': 50,
    'q': 90,
    'k': 900
}

const blackPieceVal: Object = {
    'p': -10,
    'n': -30,
    'b': -30,
    'r': -50,
    'q': -90,
    'k': -900
}


export function makeMove(to: string, from: string) {
    
    chess.move({
        from: from,
        to: to
    })

    if(chess.isCheckmate()){
        return {to: "checkmate"}
    }


    if(chess.turn() === 'b'){
        const moves = chess.moves()
        console.log("Moves -> ", moves)
        const randomMove = moves[Math.floor(Math.random() * moves.length)]
        const engineMove: Object | null = chess.move(randomMove)
        if(engineMove === null){
            console.log("Error here i guess")
            return null
        }
        return engineMove

    }else{
        console.log('waiting for white')
        return null
    }
}


function decision(moves: string[]){
    
}