#!/usr/bin/env node

import { WebSocketServer } from 'ws'
import { setupWSConnection } from 'y-websocket/bin/utils'

const port = process.env.WEBSOCKET_PORT || 1234

const wss = new WebSocketServer({ 
  port,
  perMessageDeflate: {
    zlibDeflateOptions: {
      level: 6,
    },
    zlibInflateOptions: {
      chunkSize: 1024,
    },
    threshold: 1024,
    concurrencyLimit: 10,
  },
})

wss.on('connection', (ws, req) => {
  console.log('🔗 New collaborative editing connection')
  
  // Set up Yjs connection for collaborative editing
  setupWSConnection(ws, req, {
    gc: true
  })
  
  ws.on('close', () => {
    console.log('📡 Collaborative editing connection closed')
  })

  ws.on('error', (error) => {
    console.error('WebSocket error:', error)
  })
})

wss.on('error', (error) => {
  console.error('WebSocket Server error:', error)
})

console.log(`🚀 ZWriter Collaboration Server running on ws://localhost:${port}`)
console.log('Ready for real-time collaborative editing!')

process.on('SIGINT', () => {
  console.log('\n👋 Shutting down collaboration server...')
  wss.close(() => {
    process.exit(0)
  })
})