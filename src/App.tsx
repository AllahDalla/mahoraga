import { useEffect, useRef, useState } from 'react'
import './App.css'

import { Mahoraga } from './mahoraga'
import { getInput, main } from './test.ts'

// Only declare the types globally
declare global {
  interface Window {
    $: any
    jQuery: any
    Chessboard: any
  }
}

interface MoveWithSan {
  from?: string;
  to?: string
  promotion?: string
  san?: string
  captured?: string
  flags?: string
  piece?: string
  after?: string
  before?: string
}

function App() {
  const boardRef = useRef<HTMLDivElement>(null)
  const boardInstanceRef = useRef<any>(null)
  const turn = useRef<string>('white')
  const previousMoves = useRef<string>('start')
  let [engineMove, setEngineMove] = useState<string | undefined>(undefined)



  
  function isMoveObject(move: any): move is MoveWithSan {
    return 'from' in move && 'to' in move && 'before' in move && 'after' in move || 'to' in move;
  }

  function engine(source: string, target:string, piece?: string){
    const playerMove = Mahoraga.makeMove(target, source, piece)

    if(playerMove && playerMove.status === 'gameover'){
      console.log("Game over")
      return
    }

    const engineMove: Object | null = Mahoraga.engine()
    if(engineMove === null){
      console.log("Illegal move")
      return 
    }
    
    if(!engineMove || typeof engineMove !== 'object'){
      console.log("Invalid move object")
      boardInstanceRef.current.position(previousMoves.current)
      return
    }
    
    if(!isMoveObject(engineMove)){
      console.log("Invalid move object")
      boardInstanceRef.current.position(previousMoves.current)
      return
    }

    if(engineMove.to === 'offboard'){
      console.log("Piece off board")
      boardInstanceRef.current.position = previousMoves.current
      return
    }

    if(engineMove.to === 'checkmate'){
      console.log("Checkmate")
      setTimeout(() => {
        boardInstanceRef.current.clear()
        boardInstanceRef.current.position('start')

      }, 1000)
      return
    }

    console.log(`Engine move -> `, engineMove.from, engineMove.to, engineMove.piece)
    
    const fen: string | undefined = engineMove.after
    // setEngineMove(fen)
    setEngineMove(`${engineMove.from}-${engineMove.to}`)
    // boardInstanceRef.current.move(`${engineMove.from}-${engineMove.to}`)
    previousMoves.current = fen || boardInstanceRef.current.fen()
    


  }

  function onDrop (source: any, target: any, piece: any, newPos: any, oldPos: any, orientation: any){
    console.log("Player -> ", source, target, piece)
    
    if(turn.current === 'white'){
      
      if(target === 'offboard'){
        console.log("Piece off board")
        boardInstanceRef.current.position(previousMoves.current)
        return
      }

      console.log("BOARD FEN -> ", boardInstanceRef.current.fen())
      engine(source, target, piece)
      turn.current = 'black'
        
    }else{
      turn.current = 'white'
    }
  }

  useEffect(() => {
    console.log("Outside")
    console.log("Outside Turn -> ", turn.current)
    if(engineMove){
      console.log("Inside")
      console.log("Inside Turn -> ", turn.current)
      boardInstanceRef.current.move(engineMove)
      turn.current = 'white'
    }

  }, [engineMove])

  useEffect(() => {
    new Mahoraga()
  }, [])



  useEffect(() => {
    // Create an async function inside useEffect
    const initializeChessboard = async () => {
      try {
        // Step 1: Dynamically import jQuery
        const jqueryModule = await import('jquery')
        const $ = jqueryModule.default
        
        // Step 2: Make jQuery globally available
        window.$ = window.jQuery = $
        
        // Step 3: Import the CSS
        await import('@chrisoakman/chessboardjs/dist/chessboard-1.0.0.min.css')
        
        // Step 4: Import chessboardjs AFTER jQuery is available globally
        await import('@chrisoakman/chessboardjs/dist/chessboard-1.0.0.min.js')
        
        // Step 5: Initialize the chess board
        if (boardRef.current && !boardInstanceRef.current) {
          boardInstanceRef.current = window.Chessboard(boardRef.current, {
            position: 'start',
            draggable: true,
            dropOffBoard: 'snapback',
            pieceTheme: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png',
            onDrop: onDrop,

          })
          
          // Add resize handler
          $(window).resize(() => {
            if (boardInstanceRef.current) {
              boardInstanceRef.current.resize()
            }
          })
          
          console.log('Chess board initialized:', boardInstanceRef.current)
        } else {
          console.log('Board ref or instance issue:', {
            boardRef: boardRef.current,
            boardInstanceExists: !!boardInstanceRef.current
          })
        }
      } catch (error) {
        console.error('Error initializing chessboard:', error)
      }
    }

    // Call the async function
    initializeChessboard()

    // Cleanup function
    return () => {
      boardInstanceRef.current = null
    }
  }, [])


  return (
    <>
      <div className="App">
        <h1>MAHORAGA</h1>
        <div ref={boardRef} style={{ width: '400px', margin: '0 auto' }}></div>
      </div>
    </>
  )
}
export default App