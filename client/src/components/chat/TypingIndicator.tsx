import React from 'react';
import { Bot } from 'lucide-react';

export default function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="max-w-4xl">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3 shadow-lg">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '0s' }}></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
                <span className="text-sm text-muted-foreground">Learning VI is thinking...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
