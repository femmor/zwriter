"use client";

import { useEffect, useState } from 'react'
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import Collaboration from '@tiptap/extension-collaboration'
import CollaborationCursor from '@tiptap/extension-collaboration-cursor'

interface CollaborationConfig {
  documentId: string
  userName: string
  userColor: string
}

interface CollaborationHookReturn {
  yDoc: Y.Doc | null
  provider: WebsocketProvider | null
  collaborationExtension: typeof Collaboration | null
  collaborationCursorExtension: typeof CollaborationCursor | null
  isConnected: boolean
  connectedUsers: number
}

// Generate random colors for users
const generateUserColor = () => {
  const colors = [
    '#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b',
    '#eb4d4b', '#6c5ce7', '#a29bfe', '#fd79a8', '#fdcb6e'
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

export function useCollaboration(config: CollaborationConfig | null): CollaborationHookReturn {
  const [yDoc, setYDoc] = useState<Y.Doc | null>(null)
  const [provider, setProvider] = useState<WebsocketProvider | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [connectedUsers, setConnectedUsers] = useState(0)

  useEffect(() => {
    if (!config) {
      return
    }

    const { documentId, userName, userColor } = config
    // Create Yjs document
    const doc = new Y.Doc()
    
    // Create WebSocket provider (you'll need to set up a WebSocket server)
    // For development, we'll use a mock provider or connect to localhost
    const wsProvider = new WebsocketProvider(
      process.env.NODE_ENV === 'production' 
        ? 'wss://your-websocket-server.com' 
        : 'ws://localhost:1234',
      documentId,
      doc
    )

    // Handle connection status
    wsProvider.on('status', (event: { status: string }) => {
      setIsConnected(event.status === 'connected')
    })

    // Track connected users
    wsProvider.awareness.on('update', () => {
      setConnectedUsers(wsProvider.awareness.getStates().size)
    })

    // Set user awareness info
    wsProvider.awareness.setLocalStateField('user', {
      name: userName,
      color: userColor || generateUserColor(),
    })

    // Use setTimeout to avoid synchronous setState in effect
    setTimeout(() => {
      setYDoc(doc)
      setProvider(wsProvider)
    }, 0)

    return () => {
      wsProvider.destroy()
      doc.destroy()
    }
  }, [config])

  const collaborationExtension = yDoc ? Collaboration.configure({
    document: yDoc,
  }) : null

  const collaborationCursorExtension = provider ? CollaborationCursor.configure({
    provider,
    user: {
      name: config?.userName || 'Anonymous',
      color: config?.userColor || generateUserColor(),
    },
  }) : null

  return {
    yDoc,
    provider,
    collaborationExtension,
    collaborationCursorExtension,
    isConnected,
    connectedUsers
  }
}