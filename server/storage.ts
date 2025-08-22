import {
  users,
  conversations,
  messages,
  type User,
  type UpsertUser,
  type Conversation,
  type InsertConversation,
  type Message,
  type InsertMessage,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Conversation operations
  getUserConversations(userId: string): Promise<Conversation[]>;
  getConversation(id: string, userId: string): Promise<Conversation | undefined>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  updateConversation(id: string, userId: string, updates: Partial<InsertConversation>): Promise<Conversation | undefined>;
  deleteConversation(id: string, userId: string): Promise<boolean>;
  
  // Message operations
  getConversationMessages(conversationId: string, userId: string): Promise<Message[]>;
  addMessage(message: InsertMessage): Promise<Message>;
  getConversationWithMessages(conversationId: string, userId: string): Promise<{ conversation: Conversation; messages: Message[] } | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Conversation operations
  async getUserConversations(userId: string): Promise<Conversation[]> {
    return await db
      .select()
      .from(conversations)
      .where(eq(conversations.userId, userId))
      .orderBy(desc(conversations.updatedAt));
  }

  async getConversation(id: string, userId: string): Promise<Conversation | undefined> {
    const [conversation] = await db
      .select()
      .from(conversations)
      .where(and(eq(conversations.id, id), eq(conversations.userId, userId)));
    return conversation;
  }

  async createConversation(conversation: InsertConversation): Promise<Conversation> {
    const [newConversation] = await db
      .insert(conversations)
      .values({
        ...conversation,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return newConversation;
  }

  async updateConversation(id: string, userId: string, updates: Partial<InsertConversation>): Promise<Conversation | undefined> {
    const [updatedConversation] = await db
      .update(conversations)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(and(eq(conversations.id, id), eq(conversations.userId, userId)))
      .returning();
    return updatedConversation;
  }

  async deleteConversation(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(conversations)
      .where(and(eq(conversations.id, id), eq(conversations.userId, userId)));
    return (result.rowCount || 0) > 0;
  }

  // Message operations
  async getConversationMessages(conversationId: string, userId: string): Promise<Message[]> {
    // First verify the conversation belongs to the user
    const conversation = await this.getConversation(conversationId, userId);
    if (!conversation) {
      throw new Error("Conversation not found or access denied");
    }

    return await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.createdAt);
  }

  async addMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db
      .insert(messages)
      .values({
        ...message,
        createdAt: new Date(),
      })
      .returning();
    return newMessage;
  }

  async getConversationWithMessages(conversationId: string, userId: string): Promise<{ conversation: Conversation; messages: Message[] } | undefined> {
    const conversation = await this.getConversation(conversationId, userId);
    if (!conversation) {
      return undefined;
    }

    const conversationMessages = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.createdAt);

    return {
      conversation,
      messages: conversationMessages,
    };
  }
}

export const storage = new DatabaseStorage();
