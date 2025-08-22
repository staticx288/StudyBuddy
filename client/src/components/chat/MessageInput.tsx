import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Paperclip, Route } from 'lucide-react';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  disabled?: boolean;
  isLoading?: boolean;
  getModelForPrefix?: (content: string) => string;
}

export default function MessageInput({ 
  onSendMessage, 
  disabled = false, 
  isLoading = false,
  getModelForPrefix 
}: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [routedModel, setRoutedModel] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const maxLength = 4000;
  const currentLength = message.length;
  const isValid = currentLength > 0 && currentLength <= maxLength;

  useEffect(() => {
    if (getModelForPrefix && message.trim()) {
      const model = getModelForPrefix(message);
      const defaultModel = 'gpt-4o';
      
      // Check if a specific prefix was detected
      const prefixes = ['code:', 'research:', 'creative:', 'analysis:'];
      const hasPrefix = prefixes.some(prefix => message.toLowerCase().startsWith(prefix));
      
      if (hasPrefix && model !== defaultModel) {
        setRoutedModel(model);
      } else {
        setRoutedModel(null);
      }
    } else {
      setRoutedModel(null);
    }
  }, [message, getModelForPrefix]);

  const handleSubmit = () => {
    if (!isValid || disabled || isLoading) return;
    
    onSendMessage(message);
    setMessage('');
    setRoutedModel(null);
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    const newHeight = Math.min(textarea.scrollHeight, 150);
    textarea.style.height = `${newHeight}px`;
  };

  return (
    <div className="border-t border-border bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="relative">
          <div className="flex items-end space-x-3">
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                value={message}
                onChange={handleTextareaChange}
                onKeyDown={handleKeyDown}
                placeholder="Message Learning VI... (Use code:, research:, creative:, or analysis: prefixes for specialized routing)"
                className="min-h-[50px] max-h-[150px] pr-12 resize-none"
                disabled={disabled}
                data-testid="input-message"
              />
              
              {/* Character Count */}
              <div className="absolute bottom-2 right-12 text-xs text-muted-foreground">
                <span className={currentLength > maxLength ? 'text-destructive' : ''}>
                  {currentLength}
                </span>
                /{maxLength}
              </div>
              
              {/* Attach Button */}
              <Button
                variant="ghost"
                size="sm"
                className="absolute bottom-2 right-2 h-6 w-6 p-0"
                disabled={disabled}
                data-testid="button-attach"
              >
                <Paperclip className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
            
            {/* Send Button */}
            <Button
              onClick={handleSubmit}
              disabled={!isValid || disabled || isLoading}
              className="h-12 w-12 p-0"
              data-testid="button-send"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          {/* Model Routing Indicator */}
          {routedModel && (
            <div className="mt-2 flex items-center space-x-2 text-xs text-muted-foreground">
              <Route className="h-3 w-3" />
              <span>Will route to: <span className="font-medium text-foreground">{routedModel}</span></span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
