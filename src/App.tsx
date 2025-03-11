import { useEffect, useRef } from 'react'
import './App.css'

// Only declare the types globally
declare global {
  interface Window {
    $: any
    jQuery: any
    Chessboard: any
  }
}

function App() {
  const boardRef = useRef<HTMLDivElement>(null)
  const boardInstanceRef = useRef<any>(null)

  useEffect(() => {
    // Step 1: Dynamically import jQuery
    import('jquery').then((jqueryModule) => {
      const $ = jqueryModule.default
      
      // Step 2: Make jQuery globally available
      window.$ = window.jQuery = $
      
      // Step 3: Import the CSS
      import('@chrisoakman/chessboardjs/dist/chessboard-1.0.0.min.css')
      
      // Step 4: Import chessboardjs AFTER jQuery is available globally
      import('@chrisoakman/chessboardjs/dist/chessboard-1.0.0.min.js').then(() => {
        console.log('Chessboard.js loaded')
        
        // Step 5: Initialize the chess board
        if (boardRef.current && !boardInstanceRef.current) {
          boardInstanceRef.current = window.Chessboard(boardRef.current, {
            position: 'start',
            pieceTheme: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png'
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
      }).catch(err => {
        console.error('Error loading chessboard.js:', err)
      })
    }).catch(err => {
      console.error('Error loading jQuery:', err)
    })

    return () => {
      boardInstanceRef.current = null
    }
  }, [])

  return (
    <div className="App">
      <h1>Chess Game</h1>
      <div ref={boardRef} style={{ width: '400px', margin: '0 auto' }}></div>
    </div>
  )
}

export default App