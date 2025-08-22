import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { MoreVertical, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Conversation {
  id: string;
  title: string;
  model: string;
  createdAt: string;
  updatedAt: string;
}

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversationId?: string;
  onConversationSelect: (conversationId: string) => void;
  isLoading?: boolean;
}

export default function ConversationList({
  conversations,
  selectedConversationId,
  onConversationSelect,
  isLoading = false,
}: ConversationListProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="p-3 rounded-lg bg-muted animate-pulse">
            <div className="h-4 bg-background rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-background rounded w-1/2 mb-1"></div>
            <div className="h-3 bg-background rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground text-sm">No conversations yet</p>
        <p className="text-muted-foreground text-xs mt-1">Start a new conversation to begin</p>
      </div>
    );
  }

  const getModelPrefix = (title: string): string | null => {
    const prefixes = ['code:', 'research:', 'creative:', 'analysis:'];
    const lowerTitle = title.toLowerCase();
    return prefixes.find(prefix => lowerTitle.includes(prefix.slice(0, -1))) || null;
  };

  return (
    <div className="space-y-2">
      {conversations.map((conversation) => {
        const isSelected = selectedConversationId === conversation.id;
        const timeAgo = formatDistanceToNow(new Date(conversation.updatedAt), { addSuffix: true });
        const modelPrefix = getModelPrefix(conversation.title);

        return (
          <div
            key={conversation.id}
            className={cn(
              "p-3 rounded-lg cursor-pointer transition-colors",
              isSelected
                ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
                : "hover:bg-accent"
            )}
            onClick={() => onConversationSelect(conversation.id)}
            data-testid={`conversation-${conversation.id}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3
                  className={cn(
                    "text-sm font-medium truncate",
                    isSelected
                      ? "text-blue-900 dark:text-blue-100"
                      : "text-foreground"
                  )}
                >
                  {conversation.title}
                </h3>
                {modelPrefix && (
                  <p
                    className={cn(
                      "text-xs mt-1 truncate",
                      isSelected
                        ? "text-blue-600 dark:text-blue-300"
                        : "text-muted-foreground"
                    )}
                  >
                    {modelPrefix} {conversation.title.replace(modelPrefix, '').trim()}
                  </p>
                )}
                <p
                  className={cn(
                    "text-xs mt-1",
                    isSelected
                      ? "text-blue-500 dark:text-blue-400"
                      : "text-muted-foreground"
                  )}
                >
                  {timeAgo}
                </p>
              </div>
              <div className="flex items-center space-x-1 ml-2">
                {isSelected && (
                  <Circle className="w-2 h-2 fill-green-500 text-green-500" />
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:bg-background"
                  onClick={(e) => {
                    e.stopPropagation();
                    // TODO: Implement conversation options menu
                  }}
                  data-testid={`button-options-${conversation.id}`}
                >
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
