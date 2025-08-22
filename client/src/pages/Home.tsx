import React, { useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { WebSocketProvider } from '@/contexts/WebSocketContext';
import Sidebar from '@/components/sidebar/Sidebar';
import ChatInterface from '@/components/chat/ChatInterface';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState<string | undefined>();
  const isMobile = useIsMobile();

  // Close sidebar on mobile when conversation changes
  useEffect(() => {
    if (isMobile && selectedConversationId) {
      setIsSidebarOpen(false);
    }
  }, [selectedConversationId, isMobile]);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobile && isSidebarOpen) {
        const sidebar = document.getElementById('sidebar');
        const menuButton = document.getElementById('menu-button');
        
        if (
          sidebar && 
          !sidebar.contains(event.target as Node) &&
          menuButton &&
          !menuButton.contains(event.target as Node)
        ) {
          setIsSidebarOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile, isSidebarOpen]);

  const handleConversationSelect = (conversationId: string) => {
    setSelectedConversationId(conversationId);
  };

  const handleNewConversation = () => {
    // Clear selection to show welcome screen
    setSelectedConversationId(undefined);
  };

  return (
    <WebSocketProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        {/* Sidebar */}
        <div id="sidebar">
          <Sidebar
            isOpen={isMobile ? isSidebarOpen : true}
            onClose={() => setIsSidebarOpen(false)}
            selectedConversationId={selectedConversationId}
            onConversationSelect={handleConversationSelect}
            onNewConversation={handleNewConversation}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile Menu Button */}
          {isMobile && (
            <div className="p-4 border-b border-border md:hidden">
              <Button
                id="menu-button"
                variant="ghost"
                size="sm"
                onClick={() => setIsSidebarOpen(true)}
                data-testid="button-toggle-sidebar"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          )}

          {/* Chat Interface */}
          <ChatInterface
            conversationId={selectedConversationId}
            onConversationChange={handleConversationSelect}
          />
        </div>
      </div>
    </WebSocketProvider>
  );
}
