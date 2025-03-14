import { Chess, validateFen } from "chess.js"
import { PAWN, KNIGHT, ROOK, BISHOP, QUEEN, KING, WHITE, BLACK } from "chess.js"

// const chess = new Chess('r1bqkb1r/p1ppPppp/1pn2n2/8/8/8/PPP1PPPP/RNBQKBNR w KQkq - 0')
export class Mahoraga {
    public static chess: Chess;
    public static whitePieceVal: Object = {
        'p': 10,
        'n': 30,
        'b': 30,
        'r': 50,
        'q': 90,
        'k': 900
    }
    
    public static blackPieceVal: Object = {
        'p': -10,
        'n': -30,
        'b': -30,
        'r': -50,
        'q': -90,
        'k': -900
    }

    constructor(beginningPosition: string = 'start'){

        if(!(beginningPosition === 'start')){
            const validate: {ok: boolean; error?: string | undefined} = validateFen(beginningPosition)
            if(validate.ok){
                Mahoraga.chess = new Chess(beginningPosition)
                return
            }else{
                console.log("Invalid Initializing FEN -> ", validate.error)
                return
            }
        }

        Mahoraga.chess = new Chess()
    }


    public static makeMove(to: string, from: string, piece?: string){
        try {
            const moveObject = Mahoraga.chess.move({
                from: from,
                to: to,
                promotion: 'q'
            })

            console.log("Move made -> ", moveObject)

            if(Mahoraga.chess.isGameOver()){
                console.log("Game Over Fen -> ", Mahoraga.chess.fen())
                return {status: "gameover"}
            }

            return {status: "play"}

        } catch (error) {
            console.log("Illegal move -> ", error)
            Mahoraga.chess.undo()
        }


    }


    public static engine(){
        try {

            if(Mahoraga.chess.turn() === 'b'){
                const moves = Mahoraga.chess.moves()
                console.log("Moves -> ", moves)
                const randomMove = moves[Math.floor(Math.random() * moves.length)]
                const engineMove: Object | null = Mahoraga.chess.move(randomMove)
                return engineMove
            }

            console.log("Waiting for white")
            return null
            
        } catch (error) {
            console.log("Engine made illegal move -> ", error)
            Mahoraga.chess.undo()
            return null
        }
    }
    
}