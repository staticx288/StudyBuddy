import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { apiRequest } from '@/lib/queryClient';
import { isUnauthorizedError } from '@/lib/authUtils';
import { useToast } from '@/hooks/use-toast';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Settings } from 'lucide-react';

interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  model?: string;
  tokenCount?: number;
  createdAt: string;
}

interface Conversation {
  id: string;
  title: string;
  model: string;
  createdAt: string;
  updatedAt: string;
}

interface ChatInterfaceProps {
  conversationId?: string;
  onConversationChange?: (conversationId: string) => void;
}

export default function ChatInterface({ conversationId, onConversationChange }: ChatInterfaceProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { sendMessage: sendWebSocketMessage, lastMessage } = useWebSocket();
  const [isTyping, setIsTyping] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gpt-4o');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Fetch conversation and messages
  const { data: conversationData, isLoading } = useQuery<{ conversation: Conversation; messages: Message[] }>({
    queryKey: ['/api/conversations', conversationId],
    enabled: !!conversationId,
    retry: false,
  });

  // Fetch model routing info
  const { data: modelRouting } = useQuery<Array<{ prefix: string; model: string; description: string }>>({
    queryKey: ['/api/models/routing'],
    retry: false,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!conversationId) {
        throw new Error('No conversation selected');
      }
      const response = await apiRequest('POST', `/api/conversations/${conversationId}/messages`, { content });
      return await response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch conversation data
      queryClient.invalidateQueries({ queryKey: ['/api/conversations', conversationId] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handle WebSocket messages
  useEffect(() => {
    if (lastMessage?.type === 'message' && lastMessage.conversationId === conversationId) {
      setIsTyping(false);
      queryClient.invalidateQueries({ queryKey: ['/api/conversations', conversationId] });
    }
  }, [lastMessage, conversationId, queryClient]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationData?.messages]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || sendMessageMutation.isPending) return;

    setIsTyping(true);
    
    // Send typing notification via WebSocket
    if (user && conversationId) {
      sendWebSocketMessage({
        type: 'typing',
        conversationId,
        userId: (user as any).id,
        data: { isTyping: true }
      });
    }

    try {
      await sendMessageMutation.mutateAsync(content);
    } finally {
      setIsTyping(false);
    }
  };

  const handleExport = async () => {
    if (!conversationId) return;

    try {
      const response = await fetch(`/api/conversations/${conversationId}/export?format=markdown`, {
        credentials: 'include',
      });
      
      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = response.headers.get('Content-Disposition')?.split('filename=')[1]?.replace(/"/g, '') || 'conversation.md';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Success",
        description: "Conversation exported successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export conversation",
        variant: "destructive",
      });
    }
  };

  const getModelForPrefix = (content: string): string => {
    const lowerContent = content.toLowerCase();
    const routing = modelRouting || [];
    
    for (const route of routing) {
      if (lowerContent.startsWith(route.prefix)) {
        return route.model;
      }
    }
    
    return selectedModel;
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading conversation...</p>
        </div>
      </div>
    );
  }

  const conversation: Conversation | undefined = conversationData?.conversation;
  const messages: Message[] = conversationData?.messages || [];

  return (
    <div className="flex-1 flex flex-col">
      {/* Top Bar */}
      <div className="bg-background border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium">Model:</span>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className="w-48" data-testid="select-model">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4o">GPT-4o (Default)</SelectItem>
                  <SelectItem value="gpt-4">GPT-4</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center space-x-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span className="text-xs text-green-600 dark:text-green-400">Online</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleExport}
              disabled={!conversationId || !messages.length}
              data-testid="button-export"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6" data-testid="messages-container">
        {!conversationId ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-sm font-bold">VI</span>
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-2">Welcome to Learning VI</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Start a conversation with our advanced AI system. Use prefixes like{' '}
              <code className="bg-muted px-2 py-1 rounded text-sm">code:</code>,{' '}
              <code className="bg-muted px-2 py-1 rounded text-sm">research:</code>, or{' '}
              <code className="bg-muted px-2 py-1 rounded text-sm">creative:</code>{' '}
              to route to specialized models.
            </p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            
            {isTyping && <TypingIndicator />}
            
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <MessageInput
        onSendMessage={handleSendMessage}
        disabled={!conversationId || sendMessageMutation.isPending}
        isLoading={sendMessageMutation.isPending}
        getModelForPrefix={getModelForPrefix}
      />
    </div>
  );
}
