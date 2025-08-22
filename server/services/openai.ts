import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ModelRoutingConfig {
  [prefix: string]: {
    model: string;
    systemPrompt?: string;
  };
}

// Model routing configuration based on prefixes
export const modelRouting: ModelRoutingConfig = {
  'code:': {
    model: 'gpt-4o',
    systemPrompt: 'You are an expert software developer and architect. Provide detailed, accurate code examples and explanations. Focus on best practices, security, and maintainability.',
  },
  'research:': {
    model: 'gpt-4o',
    systemPrompt: 'You are a research assistant. Provide well-researched, accurate information with proper context and citations when possible. Be thorough and analytical.',
  },
  'creative:': {
    model: 'gpt-4o',
    systemPrompt: 'You are a creative writing assistant. Help with storytelling, creative projects, brainstorming, and artistic endeavors. Be imaginative and inspiring.',
  },
  'analysis:': {
    model: 'gpt-4o',
    systemPrompt: 'You are a data analyst and strategic thinker. Provide detailed analysis, break down complex problems, and offer insights based on available information.',
  },
};

export class OpenAIService {
  public modelRouting = modelRouting;
  private getModelAndPrompt(message: string): { model: string; systemPrompt?: string; cleanedMessage: string } {
    const lowercaseMessage = message.toLowerCase();
    
    for (const [prefix, config] of Object.entries(modelRouting)) {
      if (lowercaseMessage.startsWith(prefix)) {
        return {
          model: config.model,
          systemPrompt: config.systemPrompt,
          cleanedMessage: message.substring(prefix.length).trim(),
        };
      }
    }
    
    // Default to gpt-4o
    return {
      model: 'gpt-4o',
      cleanedMessage: message,
    };
  }

  async generateResponse(
    userMessage: string,
    conversationHistory: ChatMessage[] = []
  ): Promise<{ content: string; model: string; tokenCount?: number }> {
    try {
      const { model, systemPrompt, cleanedMessage } = this.getModelAndPrompt(userMessage);
      
      const messages: ChatMessage[] = [];
      
      // Add system prompt if available
      if (systemPrompt) {
        messages.push({ role: 'system', content: systemPrompt });
      }
      
      // Add conversation history (last 10 messages to manage context)
      const recentHistory = conversationHistory.slice(-10);
      messages.push(...recentHistory);
      
      // Add current user message
      messages.push({ role: 'user', content: cleanedMessage });

      const response = await openai.chat.completions.create({
        model: model,
        messages: messages,
        temperature: 0.7,
        max_tokens: 4000,
      });

      const content = response.choices[0].message.content || '';
      const tokenCount = response.usage?.total_tokens;

      return {
        content,
        model,
        tokenCount,
      };
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error(`Failed to generate AI response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateTitle(messages: ChatMessage[]): Promise<string> {
    try {
      // Use first user message to generate a conversation title
      const firstUserMessage = messages.find(m => m.role === 'user')?.content || '';
      
      if (!firstUserMessage) {
        return 'New Conversation';
      }

      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'Generate a short, descriptive title (4-6 words) for a conversation based on the user\'s first message. Do not use quotes or special characters.',
          },
          {
            role: 'user',
            content: firstUserMessage,
          },
        ],
        temperature: 0.3,
        max_tokens: 20,
      });

      return response.choices[0].message.content?.trim() || 'New Conversation';
    } catch (error) {
      console.error('Failed to generate conversation title:', error);
      return 'New Conversation';
    }
  }

  getModelForPrefix(prefix: string): string {
    return modelRouting[prefix]?.model || 'gpt-4o';
  }
}

export const openaiService = new OpenAIService();
