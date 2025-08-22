import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { openaiService } from "./services/openai";
import { initializeWebSocket, getWebSocketService } from "./services/websocket";
import { insertConversationSchema, insertMessageSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Initialize WebSocket service
  initializeWebSocket(httpServer);
  
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Conversation routes
  app.get('/api/conversations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const conversations = await storage.getUserConversations(userId);
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  app.get('/api/conversations/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const conversationId = req.params.id;
      
      const result = await storage.getConversationWithMessages(conversationId, userId);
      if (!result) {
        return res.status(404).json({ message: "Conversation not found" });
      }

      res.json(result);
    } catch (error) {
      console.error("Error fetching conversation:", error);
      res.status(500).json({ message: "Failed to fetch conversation" });
    }
  });

  app.post('/api/conversations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertConversationSchema.parse({
        ...req.body,
        userId,
      });

      const conversation = await storage.createConversation(validatedData);
      res.status(201).json(conversation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      console.error("Error creating conversation:", error);
      res.status(500).json({ message: "Failed to create conversation" });
    }
  });

  app.patch('/api/conversations/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const conversationId = req.params.id;
      
      const updates = insertConversationSchema.partial().parse(req.body);
      const conversation = await storage.updateConversation(conversationId, userId, updates);
      
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }

      res.json(conversation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      console.error("Error updating conversation:", error);
      res.status(500).json({ message: "Failed to update conversation" });
    }
  });

  app.delete('/api/conversations/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const conversationId = req.params.id;
      
      const deleted = await storage.deleteConversation(conversationId, userId);
      if (!deleted) {
        return res.status(404).json({ message: "Conversation not found" });
      }

      res.status(204).send();
    } catch (error) {
      console.error("Error deleting conversation:", error);
      res.status(500).json({ message: "Failed to delete conversation" });
    }
  });

  // Message routes
  app.get('/api/conversations/:id/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const conversationId = req.params.id;
      
      const messages = await storage.getConversationMessages(conversationId, userId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post('/api/conversations/:id/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const conversationId = req.params.id;
      
      // Verify conversation exists and belongs to user
      const conversation = await storage.getConversation(conversationId, userId);
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }

      const { content } = req.body;
      if (!content || typeof content !== 'string') {
        return res.status(400).json({ message: "Message content is required" });
      }

      // Add user message
      const userMessage = await storage.addMessage({
        conversationId,
        role: 'user',
        content,
      });

      // Get conversation history for context
      const messages = await storage.getConversationMessages(conversationId, userId);
      const conversationHistory = messages
        .filter(m => m.id !== userMessage.id) // Exclude the message we just added
        .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }));

      // Generate AI response
      const aiResponse = await openaiService.generateResponse(content, conversationHistory);
      
      // Add AI message
      const aiMessage = await storage.addMessage({
        conversationId,
        role: 'assistant',
        content: aiResponse.content,
        model: aiResponse.model,
        tokenCount: aiResponse.tokenCount,
      });

      // Update conversation title if this is the first exchange
      if (messages.length === 1) { // Only user message exists
        const title = await openaiService.generateTitle([
          { role: 'user', content },
          { role: 'assistant', content: aiResponse.content }
        ]);
        await storage.updateConversation(conversationId, userId, { title });
      }

      // Notify WebSocket clients
      const wsService = getWebSocketService();
      wsService.notifyNewMessage(conversationId, {
        userMessage,
        aiMessage,
      });

      res.json({
        userMessage,
        aiMessage,
      });
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  // Export conversation route
  app.get('/api/conversations/:id/export', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const conversationId = req.params.id;
      const format = req.query.format || 'markdown';
      
      const result = await storage.getConversationWithMessages(conversationId, userId);
      if (!result) {
        return res.status(404).json({ message: "Conversation not found" });
      }

      const { conversation, messages } = result;
      
      let content: string;
      let contentType: string;
      let fileExtension: string;

      switch (format) {
        case 'json':
          content = JSON.stringify({ conversation, messages }, null, 2);
          contentType = 'application/json';
          fileExtension = 'json';
          break;
        case 'txt':
          content = messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n');
          contentType = 'text/plain';
          fileExtension = 'txt';
          break;
        case 'markdown':
        default:
          content = `# ${conversation.title}\n\n` +
            messages.map(m => `## ${m.role === 'user' ? 'You' : 'Learning VI'}\n\n${m.content}\n`).join('\n');
          contentType = 'text/markdown';
          fileExtension = 'md';
      }

      const filename = `${conversation.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${fileExtension}`;
      
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Type', contentType);
      res.send(content);
    } catch (error) {
      console.error("Error exporting conversation:", error);
      res.status(500).json({ message: "Failed to export conversation" });
    }
  });

  // Model routing info route
  app.get('/api/models/routing', (req, res) => {
    const routingInfo = Object.entries(openaiService.modelRouting).map(([prefix, config]) => ({
      prefix,
      model: config.model,
      description: config.systemPrompt ? config.systemPrompt.substring(0, 100) + '...' : '',
    }));
    
    res.json(routingInfo);
  });

  return httpServer;
}
