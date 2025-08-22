import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/queryClient';
import type { User } from '@shared/schema';
import { isUnauthorizedError } from '@/lib/authUtils';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ConversationList from './ConversationList';
import { 
  Plus, 
  Search, 
  Settings, 
  LogOut, 
  X, 
  Menu,
  Moon,
  Sun,
  Brain
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Conversation {
  id: string;
  title: string;
  model: string;
  createdAt: string;
  updatedAt: string;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  selectedConversationId?: string;
  onConversationSelect: (conversationId: string) => void;
  onNewConversation: () => void;
}

export default function Sidebar({ 
  isOpen, 
  onClose, 
  selectedConversationId, 
  onConversationSelect,
  onNewConversation 
}: SidebarProps) {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  // Fetch conversations
  const { data: conversations = [], isLoading } = useQuery<Conversation[]>({
    queryKey: ['/api/conversations'],
    retry: false,
  });

  // Create new conversation mutation
  const createConversationMutation = useMutation<Conversation, Error, void>({
    mutationFn: async (): Promise<Conversation> => {
      const response = await apiRequest('POST', '/api/conversations', {
        title: 'New Conversation',
        model: 'gpt-4o',
      });
      return await response.json();
    },
    onSuccess: (newConversation: Conversation) => {
      queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
      onConversationSelect(newConversation.id);
      onNewConversation();
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
        description: "Failed to create new conversation",
        variant: "destructive",
      });
    },
  });

  const handleNewConversation = () => {
    createConversationMutation.mutate();
  };

  const handleLogout = () => {
    window.location.href = '/api/logout';
  };

  const filteredConversations = conversations.filter((conv: Conversation) =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getUserInitials = () => {
    if (!user) return 'U';
    const typedUser = user as User;
    const firstName = typedUser.firstName || '';
    const lastName = typedUser.lastName || '';
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase() || typedUser.email?.charAt(0).toUpperCase() || 'U';
  };

  const getUserDisplayName = () => {
    if (!user) return 'User';
    const typedUser = user as User;
    if (typedUser.firstName || typedUser.lastName) {
      return `${typedUser.firstName || ''} ${typedUser.lastName || ''}`.trim();
    }
    return typedUser.email || 'User';
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "w-80 bg-card border-r border-border flex flex-col transition-all duration-300 z-50",
          "md:relative md:translate-x-0 absolute",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Brain className="text-white w-4 h-4" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                Learning VI
              </h1>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={onClose}
              data-testid="button-close-sidebar"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* New Chat Button */}
          <Button
            onClick={handleNewConversation}
            className="w-full"
            disabled={createConversationMutation.isPending}
            data-testid="button-new-chat"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Conversation
          </Button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-border">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search"
            />
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-4">
              <ConversationList
                conversations={filteredConversations}
                selectedConversationId={selectedConversationId}
                onConversationSelect={onConversationSelect}
                isLoading={isLoading}
              />
            </div>
          </ScrollArea>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={(user as User)?.profileImageUrl || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-green-500 to-blue-500 text-white text-xs">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium truncate max-w-32" data-testid="text-username">
                {getUserDisplayName()}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                data-testid="button-theme-toggle"
              >
                {theme === 'dark' ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                data-testid="button-settings"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-foreground"
            onClick={handleLogout}
            data-testid="button-logout"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </>
  );
}
