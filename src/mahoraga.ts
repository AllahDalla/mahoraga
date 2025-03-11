import { Chess } from "chess.js"

const chess = new Chess()


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