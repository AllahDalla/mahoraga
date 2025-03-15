import { Chess, Move, validateFen } from "chess.js"
import { PAWN, KNIGHT, ROOK, BISHOP, QUEEN, KING, WHITE, BLACK } from "chess.js"
import { bishopSquareValues, kingEndSquareValues, kingMiddleSquareValues, knightSquareValues, pawnSquareValues, queenSquareValues, rookSquareValues } from "./square_table/square_tables";

// const chess = new Chess('r1bqkb1r/p1ppPppp/1pn2n2/8/8/8/PPP1PPPP/RNBQKBNR w KQkq - 0')
type PieceSymbol = 'p' | 'n' | 'b' | 'r' | 'q' | 'k'
export class Mahoraga {
    public static chess: Chess;
    // public static whiteValue = 24000
    // public static blackValue = 24000
    public static whitePieceVal: Record<string, number> = {
        'p': 100,
        'n': 320,
        'b': 330,
        'r': 500,
        'q': 900,
        'k': 20000
    }
    
    public static blackPieceVal: Record<string, number> = {
        'p': -100,
        'n': -320,
        'b': -330,
        'r': -500,
        'q': -900,
        'k': -20000
    }

    private static blackPawnTable: Record<string, number>;
    private static blackKnightTable: Record<string, number>;
    private static blackBishopTable: Record<string, number>;
    private static blackRookTable: Record<string, number>;
    private static blackQueenTable: Record<string, number>;
    private static blackKingMiddleTable: Record<string, number>;
    private static blackKingEndTable: Record<string, number>;

    private static transpositionTable: Map<string , {score: number, depth: number}> = new Map();

    /**
     * Initializes a new chess game with an optional starting position.
     * 
     * @param beginningPosition - Optional FEN string representing the initial board state. 
     *                            Defaults to 'start' for a standard chess starting position.
     *                            If a custom FEN is provided, it will be validated before setting up the game.
     */
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
        Mahoraga.setPawnTable(this.mirrorSquareTable(pawnSquareValues))
        Mahoraga.setKnightTable(this.mirrorSquareTable(knightSquareValues))
        Mahoraga.setBishopTable(this.mirrorSquareTable(bishopSquareValues))
        Mahoraga.setRookTable(this.mirrorSquareTable(rookSquareValues))
        Mahoraga.setQueenTable(this.mirrorSquareTable(queenSquareValues))
        Mahoraga.setKingMiddleTable(this.mirrorSquareTable(kingMiddleSquareValues))
        Mahoraga.setKingEndTable(this.mirrorSquareTable(kingEndSquareValues))
        
        
    }
    
    /**
     * Resets the current chess game to its initial state.
     * 
     * @returns {void}
     */
    public static restartGame(): void{
        Mahoraga.chess.reset()
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
        }


    }


    public static engine(){
        try {

            if(Mahoraga.chess.turn() === 'b'){
                const move = this.findBestMove()
                const engineMove: Object | null = Mahoraga.chess.move(move)
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

    private static evaluateBoard(color: 'w' | 'b'): number{
        let boardValue: number = 0

        if(Mahoraga.chess.isCheckmate()){
            if(Mahoraga.chess.turn() === 'w'){
                boardValue = -1000000
                return boardValue
            }else{
                boardValue = 1000000
                return boardValue
            }
        }

        if(Mahoraga.chess.isStalemate()){
            boardValue = 50
            return boardValue
        }

        if(color === 'w'){
            boardValue += Mahoraga.materialValue('w') * (-1)
            
        }else{
            boardValue += Math.abs(Mahoraga.materialValue('b'))
        }

        return boardValue
    }


    public static findBestMove(): string{
        let bestScore = -Infinity
        let bestMove: string = ''
        let timeLimit: number = 90000
        let startTime = Date.now()
        let orderedMoves = this.moveOrder()

        for(let maxDepth = 2; maxDepth++;){
            for(const move of orderedMoves) {
                Mahoraga.chess.move(move)
                const performance = Date.now()
                const score = this.minimax(false, 1, maxDepth, -Infinity, Infinity, 'w')
                const elapsedTime = performance - Date.now()
                Mahoraga.chess.undo()
                if(score > bestScore){
                    bestScore = score
                    bestMove = move
                }
                console.log(`Elapsed time -> ${elapsedTime / 1000}s ; maxDepth -> ${maxDepth} ; Score -> ${score} ; Best move -> ${bestMove}`)
            }

            if(Date.now() - startTime > timeLimit){
                break
            }

        }

        console.log("Best move -> ", bestMove)
        return bestMove

    }


    public static minimax(isMax: boolean, depth: number, maxDepth: number, alpha: number, beta: number, color:  'w' | 'b'): number{
        try {
            const boardValue = Mahoraga.evaluateBoard(color)
            const fen = Mahoraga.chess.fen()
            const cacheKey = `${fen}_${depth}_${isMax}`
            const cachedResult = this.transpositionTable.get(cacheKey)

            if(cachedResult && cachedResult.depth >= maxDepth - depth){
                console.log("Cache hit -> ", cacheKey)
                return cachedResult.score
            }
    
            // win
            if(boardValue === 1000000){
                return boardValue - depth
            }
    
            // loss
            if(boardValue === -1000000){
                return boardValue + depth
            }
    
            // draw or depth limit
            if(depth === maxDepth || boardValue === 50){
                return boardValue - depth
            }

            const orderedMoves = this.moveOrder()
    
            if(isMax){
                let best = -Infinity
                for(const move of orderedMoves){
                    if(move){
                        Mahoraga.chess.move(move)
                        let score = this.minimax(false, depth + 1, maxDepth, alpha, beta, 'w')
                        best = Math.max(best, score)
                        Mahoraga.chess.undo()
                        alpha = Math.max(alpha, best)
                        if(beta <= alpha){
                            break
                        }
                    }
                }
                this.transpositionTable.set(cacheKey, {score: best, depth: depth})
                return best
            }else{
                let best = Infinity
                for(const move of orderedMoves){
                    if(move){
                        Mahoraga.chess.move(move)
                        let score = this.minimax(true, depth + 1, maxDepth, alpha, beta, 'b')
                        best = Math.min(best, score)
                        Mahoraga.chess.undo()
                        beta = Math.min(beta, best)
                        if(beta <= alpha){
                            break
                        }
                    }
                }
                this.transpositionTable.set(cacheKey, {score: best, depth: depth})
                return best
            }
            
        } catch (error) {
            console.log("Error in minimax -> ", error)
            return 0
        }

    }


    public static getPiecePosition(piece: {type: string, color: 'w' | 'b'}): (string | undefined)[]{
        let board = Mahoraga.chess.board().flat()
        let results = []

        for(let i = 0; i < board.length; i++){
            if(board[i] !== null && board[i]!.type === piece.type && board[i]!.color === piece.color){
                const row = 'abcdefgh'[i % 8]
                const col = Math.ceil((64 - i) / 8)
                results.push(row + col)
            }
                
        }
            

        return results

    }

    public static getPieceMoves(p: {type: PieceSymbol, color: 'w' | 'b'}): string[]{
       const moves = Mahoraga.chess.moves({piece: p.type, verbose:true})
       let results = []

       for(const move of moves){
           if(move.color === p.color){
               results.push(move.san)
           }
       }

       return results
    }

    public static getPawns(clr: 'w' | 'b'){
        return Mahoraga.getPiecePosition({type: 'p', color: clr})
    }

    public static getKnights(clr: 'w' | 'b'){
        return Mahoraga.getPiecePosition({type: 'n', color: clr})
    }
    public static getRooks(clr: 'w' | 'b'){
        return Mahoraga.getPiecePosition({type: 'r', color: clr})
    }

    public static getBishops(clr: 'w' | 'b'){
        return Mahoraga.getPiecePosition({type: 'b', color: clr})
    }

    public static getQueens(clr: 'w' | 'b'){
        return Mahoraga.getPiecePosition({type: 'q', color: clr})
    }

    public static getKings(clr: 'w' | 'b'){
        return Mahoraga.getPiecePosition({type: 'k', color: clr})
    }

    public static materialValue(color: 'w' | 'b'){
        const performance = Date.now()
        if(color === 'w'){
            let pawns = (this.getPawns(color).length * Mahoraga.whitePieceVal['p']) + this.pawnPositionValue(color)
            let knights = (this.getKnights(color).length * Mahoraga.whitePieceVal['n']) + this.knightPositionValue(color)
            let bishops = (this.getBishops(color).length * Mahoraga.whitePieceVal['b']) + this.bishopPositionValue(color)
            let rooks = (this.getRooks(color).length * Mahoraga.whitePieceVal['r']) + this.rookPositionValue(color)
            let queens = (this.getQueens(color).length  * Mahoraga.whitePieceVal['q']) + this.queenPositionValue(color)
            let king = Mahoraga.whitePieceVal['k'] + this.kingPositionValue(color)
            const elapsedTime = Date.now() - performance
            console.log(`Material Value Time [white]: ${elapsedTime}ms`)
            return pawns + knights + bishops + rooks + queens + king
        }
       
        let pawns = (this.getPawns(color).length * Mahoraga.blackPieceVal['p']) + this.pawnPositionValue(color)
        let knights = (this.getKnights(color).length * Mahoraga.blackPieceVal['n']) + this.knightPositionValue(color)
        let bishops = (this.getBishops(color).length * Mahoraga.blackPieceVal['b']) + this.bishopPositionValue(color)
        let rooks = (this.getRooks(color).length * Mahoraga.blackPieceVal['r']) + this.rookPositionValue(color)
        let queens = (this.getQueens(color).length  * Mahoraga.blackPieceVal['q']) + this.queenPositionValue(color)
        let king = Mahoraga.blackPieceVal['k'] + this.kingPositionValue(color)
        const elapsedTime = Date.now() - performance
        console.log(`Material Value Time [black]: ${elapsedTime}ms`)
        return pawns + knights + bishops + rooks + queens + king
        
    }

    public static pawnPositionValue(color: 'w' | 'b'){
        let pawns = this.getPawns(color)
        let pawns_value = 0
        for(let i = 0; i < pawns.length; i++){
            if(pawns[i] && pawns[i] !== undefined){
                pawns_value += Mahoraga.getPawnTable(color)[pawns[i] as string]
            }
        }

        return pawns_value
    }

    public static knightPositionValue(color: 'w' | 'b'){
        let knights = this.getKnights(color)
        let knights_value = 0
        for(let i = 0; i < knights.length; i++){
            if(knights[i] && knights[i] !== undefined){
                knights_value += Mahoraga.getKnightTable(color)[knights[i] as string]
            }
        }
        return knights_value
    }

    public static bishopPositionValue(color: 'w' | 'b'){
        let bishops = this.getBishops(color)
        let bishops_value = 0
        for(let i = 0; i < bishops.length; i++){
            if(bishops[i] && bishops[i] !== undefined){
                bishops_value += Mahoraga.getBishopTable(color)[bishops[i] as string]
            }
        }
        return bishops_value
    }

    public static rookPositionValue(color: 'w' | 'b'){
        let rooks = this.getRooks(color)
        let rooks_value = 0
        for(let i = 0; i < rooks.length; i++){
            if(rooks[i] && rooks[i] !== undefined){
                rooks_value += Mahoraga.getRookTable(color)[rooks[i] as string]
            }
        }
        return rooks_value
    }

    public static queenPositionValue(color: 'w' | 'b'){
        let queens = this.getQueens(color)
        let queens_value = 0
        for(let i = 0; i < queens.length; i++){
            if(queens[i] && queens[i] !== undefined){
                queens_value += Mahoraga.getQueenTable(color)[queens[i] as string]
            }
        }
        return queens_value
    }

    public static kingPositionValue(color: 'w' | 'b'){
        let kings = this.getKings(color)
        let kings_value = 0
        for(let i = 0; i < kings.length; i++){
            if(kings[i] && kings[i] !== undefined){
                kings_value += Mahoraga.getKingMiddleTable(color)[kings[i] as string]
            }
        }
        return kings_value
    }



    public static moveOrder(): string[] {
        const performance = Date.now()
        const moves = Mahoraga.chess.moves()
        const checkmates: string[] = [];
        const promotions: string[] = [];
        const checks: string[] = [];
        const captures: string[] = [];
        const regular: string[] = [];
    
        for (const move of moves) {
            // Make the move
            const moveObj = Mahoraga.chess.move(move)
    
            if (Mahoraga.chess.isCheckmate()) {
                checkmates.push(move); // Highest priority for checkmate
            } else if (moveObj.isPromotion()) { // Chess.js uses flags for promotion
                promotions.push(move); // High priority for promotion
            } else if (Mahoraga.chess.isCheck()) {
                checks.push(move); // Priority for checks
            } else if (moveObj.isCapture()) { // Chess.js uses 'c' flag for captures
                captures.push(move); // Priority for captures
            }
        
            // Undo the move to restore the board state
            Mahoraga.chess.undo()
        
            // Store the move with its score
            regular.push(move)
        }
    
        const elapsedTime = Date.now() - performance
        console.log(`Move Order Time: ${elapsedTime}ms`)
    

        // Return just the moves in the sorted order
        return [...checkmates, ...promotions, ...checks, ...captures, ...regular];
    }



    /**
     * Mirrors a square table for black's perspective.
     * This function flips the board vertically (rank 1→8, 2→7, etc.) and negates the values.
     * 
     * @param whiteTable The original square table from white's perspective
     * @returns A new square table from black's perspective
    */
    private mirrorSquareTable(whiteTable: Record<string, number>): Record<string, number> {
    const blackTable: Record<string, number> = {};
    
    // For each square in the white table
    for (const square in whiteTable) {
      // Extract file and rank
      const file = square.charAt(0);
      const rank = parseInt(square.charAt(1));
      
      // Calculate the mirrored square (same file, mirrored rank)
      const mirroredRank = 9 - rank; // 1→8, 2→7, 3→6, 4→5, 5→4, 6→3, 7→2, 8→1
      const mirroredSquare = file + mirroredRank;
      
      // Negate the value (positive for white becomes negative for black and vice versa)
      blackTable[mirroredSquare] = -whiteTable[square];
    }
    
    return blackTable;
  }
    

    // Pawn Table
public static getPawnTable(color: 'w' | 'b'): Record<string, number> {
    if(color === 'w') return pawnSquareValues
    return Mahoraga.blackPawnTable;
  }
  
  public static setPawnTable(table: Record<string, number>): void {
    Mahoraga.blackPawnTable = table;
  }
  
  // Knight Table
  public static getKnightTable(color: 'w' | 'b'): Record<string, number> {
    if(color === 'w') return knightSquareValues
    return Mahoraga.blackKnightTable;
  }
  
  public static setKnightTable(table: Record<string, number>): void {
    Mahoraga.blackKnightTable = table;
  }
  
  // Bishop Table
  public static getBishopTable(color: 'w' | 'b'): Record<string, number> {
    if(color === 'w') return bishopSquareValues
    return Mahoraga.blackBishopTable;
  }
  
  public static setBishopTable(table: Record<string, number>): void {
    Mahoraga.blackBishopTable = table;
  }
  
  // Rook Table
  public static getRookTable(color: 'w' | 'b'): Record<string, number> {
    if(color === 'w') return rookSquareValues
    return Mahoraga.blackRookTable;
  }
  
  public static setRookTable(table: Record<string, number>): void {
    Mahoraga.blackRookTable = table;
  }
  
  // Queen Table
  public static getQueenTable(color: 'w' | 'b'): Record<string, number> {
    if(color === 'w') return queenSquareValues
    return Mahoraga.blackQueenTable;
  }
  
  public static setQueenTable(table: Record<string, number>): void {
    Mahoraga.blackQueenTable = table;
  }
  
  // King Middle Table
  public static getKingMiddleTable(color: 'w' | 'b'): Record<string, number> {
    if(color === 'w') return kingMiddleSquareValues
    return Mahoraga.blackKingMiddleTable;
  }
  
  public static setKingMiddleTable(table: Record<string, number>): void {
    Mahoraga.blackKingMiddleTable = table;
  }
  
  // King End Table
  public static getKingEndTable(color: 'w' | 'b'): Record<string, number> {
    if(color === 'w') return kingEndSquareValues
    return Mahoraga.blackKingEndTable;
  }
  
  public static setKingEndTable(table: Record<string, number>): void {
    Mahoraga.blackKingEndTable = table;
  }
  

}