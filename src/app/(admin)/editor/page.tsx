"use client"

import { useCompletion } from '@ai-sdk/react'

export function AIWriter({ onComplete }: { onComplete: (text: string) => void }) {
    const { completion, complete, isLoading, stop } = useCompletion({
        api: '/api/ai/generate',
        onFinish: (_, text) => onComplete(text),
    });

  return (
    <div className="space-y-2">
      <button
        onClick={() => complete("Write a blog post about any topic of your choice.")}
        disabled={isLoading}
        className="px-4 py-2 bg-black text-white rounded"
      >
        {isLoading ? "Generating..." : "Generate with AI"}
      </button>

      {isLoading && (
        <button onClick={stop} className="text-sm text-red-500">
          Cancel
        </button>
      )}

      <div className="border p-2 min-h-[150px] whitespace-pre-wrap">
        {completion}
      </div>
    </div>
  )
}

export default AIWriter