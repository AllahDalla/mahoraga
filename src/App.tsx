import { useEffect, useRef } from 'react'
import './App.css'

import { makeMove } from './mahoraga'

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


  
  function isMoveObject(move: any): move is MoveWithSan {
    return 'from' in move && 'to' in move && 'before' in move && 'after' in move || 'to' in move;
  }

  function onDrop (source: any, target: any, piece: any, newPos: any, oldPos: any, orientation: any){
    console.log("Player -> ", source, target, piece)
    
    if(turn.current === 'white'){

      if(target === 'offboard'){
        console.log("Piece off board")
        boardInstanceRef.current.position(previousMoves.current)
        return
      }

      const engineMove: Object | null = makeMove(target, source)

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
        boardInstanceRef.current.position('start')
        return
      }

      console.log(`Engine move -> `, engineMove.from, engineMove.to, engineMove.piece)
      
      const fen: string | undefined = engineMove.after
      boardInstanceRef.current.position(fen)
      previousMoves.current = fen || boardInstanceRef.current.fen()
      

        
    }else{
      turn.current = 'white'
    }
  }



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
      {/* <button>Move</button>   */}
    </>
  )
}
export default App