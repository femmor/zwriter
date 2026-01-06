"use client";

interface CollaborationStatusProps {
  isConnected: boolean
  connectedUsers: number
  className?: string
}

export function CollaborationStatus({ 
  isConnected, 
  connectedUsers, 
  className = "" 
}: CollaborationStatusProps) {
  return (
    <div className={`flex items-center gap-2 text-sm ${className}`}>
      <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
      <span className={isConnected ? 'text-green-700' : 'text-red-700'}>
        {isConnected ? 'Connected' : 'Disconnected'}
      </span>
      {isConnected && connectedUsers > 1 && (
        <span className="text-gray-600">
          • {connectedUsers} users online
        </span>
      )}
    </div>
  )
}

export default CollaborationStatus