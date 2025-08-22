import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Copy, RotateCcw, ThumbsUp, User, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  model?: string;
  createdAt: string;
}

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      toast({
        title: "Copied",
        description: "Message copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy message",
        variant: "destructive",
      });
    }
  };

  const isUser = message.role === 'user';
  const timeAgo = formatDistanceToNow(new Date(message.createdAt), { addSuffix: true });

  return (
    <div className={cn(
      "flex",
      isUser ? "justify-end" : "justify-start"
    )}>
      <div className={cn(
        "max-w-4xl",
        isUser ? "max-w-3xl" : "max-w-4xl"
      )}>
        {isUser ? (
          // User Message
          <>
            <div className="bg-blue-600 text-white rounded-2xl rounded-br-md px-4 py-3 shadow-lg">
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
            <div className="flex items-center justify-end space-x-2 mt-2">
              <span className="text-xs text-muted-foreground">You</span>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground">{timeAgo}</span>
              <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                <User className="w-3 h-3 text-white" />
              </div>
            </div>
          </>
        ) : (
          // AI Message
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3 shadow-lg">
                {message.model && (
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-full">
                      {message.model}
                    </span>
                    {message.model !== 'gpt-4o' && (
                      <span className="text-xs text-muted-foreground">Auto-selected for prefix</span>
                    )}
                  </div>
                )}
                
                <div className="prose dark:prose-invert max-w-none prose-sm">
                  <p className="whitespace-pre-wrap m-0">{message.content}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 mt-2">
                <span className="text-xs text-muted-foreground">Learning VI</span>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-xs text-muted-foreground">{timeAgo}</span>
                <div className="flex items-center space-x-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 w-6 p-0"
                    onClick={handleCopy}
                    data-testid={`button-copy-${message.id}`}
                  >
                    <Copy className="h-3 w-3 text-muted-foreground" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 w-6 p-0"
                    data-testid={`button-regenerate-${message.id}`}
                  >
                    <RotateCcw className="h-3 w-3 text-muted-foreground" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 w-6 p-0"
                    data-testid={`button-like-${message.id}`}
                  >
                    <ThumbsUp className="h-3 w-3 text-muted-foreground" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
