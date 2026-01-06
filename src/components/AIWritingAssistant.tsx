"use client";

import { useState, useCallback } from 'react'
import { useCompletion } from '@ai-sdk/react'
import { 
  Sparkles, 
  RefreshCw, 
  Check, 
  X, 
  Wand2, 
  Edit3, 
  FileText, 
  Lightbulb 
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'

interface AIWritingAssistantProps {
  selectedText?: string
  onInsert: (text: string) => void
  onReplace: (text: string) => void
  className?: string
}

type AssistanceType = 
  | 'improve' 
  | 'expand' 
  | 'summarize' 
  | 'rewrite' 
  | 'continue' 
  | 'custom'
  | 'brainstorm'
  | 'outline'

interface AssistanceOption {
  type: AssistanceType
  label: string
  icon: React.ReactNode
  prompt: (text?: string) => string
  description: string
}

const assistanceOptions: AssistanceOption[] = [
  {
    type: 'improve',
    label: 'Improve Writing',
    icon: <Edit3 size={16} />,
    description: 'Enhance clarity, grammar, and style',
    prompt: (text) => text 
      ? `Please improve the following text by enhancing clarity, grammar, and style while maintaining the original meaning:\n\n${text}`
      : 'Help me improve my writing with better clarity, grammar, and style.'
  },
  {
    type: 'expand',
    label: 'Expand Content',
    icon: <FileText size={16} />,
    description: 'Add more detail and depth',
    prompt: (text) => text
      ? `Please expand on the following text by adding more detail, examples, and depth:\n\n${text}`
      : 'Help me expand this content with more details and examples.'
  },
  {
    type: 'summarize',
    label: 'Summarize',
    icon: <RefreshCw size={16} />,
    description: 'Create a concise summary',
    prompt: (text) => text
      ? `Please create a concise summary of the following text:\n\n${text}`
      : 'Help me summarize this content into key points.'
  },
  {
    type: 'rewrite',
    label: 'Rewrite',
    icon: <Wand2 size={16} />,
    description: 'Rewrite in a different tone or style',
    prompt: (text) => text
      ? `Please rewrite the following text in a different tone or style while preserving the core message:\n\n${text}`
      : 'Help me rewrite this content with a different approach.'
  },
  {
    type: 'continue',
    label: 'Continue Writing',
    icon: <Sparkles size={16} />,
    description: 'Generate the next part',
    prompt: (text) => text
      ? `Please continue writing from where this text left off:\n\n${text}`
      : 'Help me continue writing this piece.'
  },
  {
    type: 'brainstorm',
    label: 'Brainstorm Ideas',
    icon: <Lightbulb size={16} />,
    description: 'Generate related ideas and topics',
    prompt: (text) => text
      ? `Based on this text, please brainstorm 5-10 related ideas, topics, or angles to explore:\n\n${text}`
      : 'Help me brainstorm ideas for my writing topic.'
  },
  {
    type: 'outline',
    label: 'Create Outline',
    icon: <FileText size={16} />,
    description: 'Structure content into an outline',
    prompt: (text) => text
      ? `Please create a detailed outline based on this text:\n\n${text}`
      : 'Help me create an outline for my content.'
  }
]

export function AIWritingAssistant({ 
  selectedText, 
  onInsert, 
  onReplace, 
  className = "" 
}: AIWritingAssistantProps) {
  const [customPrompt, setCustomPrompt] = useState('')

  const { 
    completion, 
    complete, 
    isLoading, 
    stop, 
    error 
  } = useCompletion({
    api: '/api/ai/generate',
    onError: (error) => {
      console.error('AI completion error:', error)
    }
  })

  const handleAssistance = useCallback(async (type: AssistanceType) => {
    let prompt = ''
    
    if (type === 'custom') {
      if (!customPrompt.trim()) {
        alert('Please enter a custom prompt')
        return
      }
      prompt = selectedText 
        ? `${customPrompt}\n\nText to work with:\n${selectedText}`
        : customPrompt
    } else {
      const option = assistanceOptions.find(opt => opt.type === type)
      if (option) {
        prompt = option.prompt(selectedText)
      }
    }

    try {
      await complete(prompt)
    } catch (err) {
      console.error('Failed to get AI assistance:', err)
    }
  }, [selectedText, customPrompt, complete])

  const handleInsert = useCallback(() => {
    if (completion.trim()) {
      onInsert(completion)
    }
  }, [completion, onInsert])

  const handleReplace = useCallback(() => {
    if (completion.trim()) {
      onReplace(completion)
    }
  }, [completion, onReplace])

  const clearResults = useCallback(() => {
    stop()
    // Note: useCompletion doesn't have a built-in clear method
    // The completion will be cleared when a new request starts
  }, [stop])

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="text-blue-600" size={20} />
          AI Writing Assistant
        </CardTitle>
        {selectedText && (
          <Badge variant="outline" className="w-fit">
            {selectedText.length} characters selected
          </Badge>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Quick Actions */}
        <div>
          <h4 className="text-sm font-medium mb-3">Quick Actions</h4>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
            {assistanceOptions.map((option) => (
              <Button
                key={option.type}
                variant="outline"
                size="sm"
                onClick={() => handleAssistance(option.type)}
                disabled={isLoading}
                className="justify-start gap-2 h-auto py-2 px-3 w-full min-h-[60px]"
              >
                <div className="flex-shrink-0">{option.icon}</div>
                <div className="text-left flex-1 min-w-0">
                  <div className="text-xs font-medium line-clamp-1 whitespace-normal break-words">{option.label}</div>
                  <div className="text-xs text-gray-500 leading-tight line-clamp-2 whitespace-normal break-words overflow-hidden">{option.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Custom Prompt */}
        <div>
          <h4 className="text-sm font-medium mb-2">Custom Prompt</h4>
          <div className="flex gap-2">
            <Textarea
              placeholder="Enter your custom AI prompt..."
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              className="min-h-[60px]"
            />
            <Button
              onClick={() => handleAssistance('custom')}
              disabled={isLoading || !customPrompt.trim()}
              size="sm"
              className="shrink-0"
            >
              <Wand2 size={16} />
            </Button>
          </div>
        </div>

        {/* AI Response */}
        {(completion || isLoading || error) && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">AI Response</h4>
              {isLoading && (
                <Button
                  onClick={stop}
                  variant="outline"
                  size="sm"
                  className="text-red-600 border-red-200"
                >
                  <X size={16} className="mr-1" />
                  Cancel
                </Button>
              )}
            </div>

            <div className="relative">
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 min-h-[120px] max-h-[400px] overflow-y-auto">
                {isLoading && (
                  <div className="flex items-center gap-2 text-blue-600">
                    <RefreshCw size={16} className="animate-spin" />
                    <span className="text-sm">AI is thinking...</span>
                  </div>
                )}
                
                {error && (
                  <div className="text-red-600 text-sm">
                    Error: {error.message}
                  </div>
                )}
                
                {completion && (
                  <div className="prose prose-sm max-w-none">
                    <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                      {completion}
                    </pre>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            {completion && !isLoading && (
              <div className="flex gap-2 justify-end">
                <Button
                  onClick={clearResults}
                  variant="outline"
                  size="sm"
                >
                  <X size={16} className="mr-1" />
                  Clear
                </Button>
                
                <Button
                  onClick={handleInsert}
                  variant="outline"
                  size="sm"
                  className="text-green-700 border-green-200"
                >
                  <Check size={16} className="mr-1" />
                  Insert
                </Button>

                {selectedText && (
                  <Button
                    onClick={handleReplace}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <RefreshCw size={16} className="mr-1" />
                    Replace
                  </Button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Help Text */}
        {!selectedText && (
          <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded-md">
            💡 <strong>Tip:</strong> Select text in the editor first for contextual assistance, 
            or use the quick actions above for general writing help.
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default AIWritingAssistant