import { prisma } from "@/lib/prisma";

export interface AISettings {
  id: string;
  userId: string;
  openRouterKey?: string | null;
  openRouterModel?: string | null;
  openRouterFallbackModels?: string | null;
  claudeKey?: string | null;
  claudeModel?: string | null;
  ollamaUrl?: string | null;
  ollamaModel?: string | null;
  defaultProvider: string;
  aiSuggestionsEnabled: boolean;
  autoImproveText: boolean;
  citationAssist: boolean;
  grammarCheck: boolean;
}

export interface AIProvider {
  name: string;
  key?: string;
  model?: string;
  url?: string;
  fallbackModels?: string[];
}

export interface AIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AIRequest {
  messages: AIMessage[];
  temperature?: number;
  maxTokens?: number;
  model?: string;
  truncateForLocal?: boolean; // For local models with limited context
}

export interface AIResponse {
  content: string;
  model: string;
  provider: string;
}

/**
 * Central AI service that handles all AI calls with automatic fallback
 */
export class AIService {
  private settings: AISettings;
  private providers: AIProvider[] = [];

  constructor(settings: AISettings) {
    this.settings = settings;
    this.initializeProviders();
  }

  private initializeProviders() {
    // OpenRouter provider
    if (this.settings.openRouterKey) {
      const fallbackModels = this.settings.openRouterFallbackModels
        ? JSON.parse(this.settings.openRouterFallbackModels)
        : [];

      this.providers.push({
        name: "OPENROUTER",
        key: this.settings.openRouterKey,
        model: this.settings.openRouterModel || "meta-llama/llama-3.2-3b-instruct:free",
        fallbackModels: [this.settings.openRouterModel || "meta-llama/llama-3.2-3b-instruct:free", ...fallbackModels].filter(Boolean),
      });
    }

    // Claude provider
    if (this.settings.claudeKey) {
      this.providers.push({
        name: "CLAUDE",
        key: this.settings.claudeKey,
        model: this.settings.claudeModel || "claude-3-5-sonnet-20241022",
      });
    }

    // Ollama provider
    if (this.settings.ollamaUrl && this.settings.ollamaModel) {
      this.providers.push({
        name: "OLLAMA",
        url: this.settings.ollamaUrl,
        model: this.settings.ollamaModel,
      });
    }
  }

  /**
   * Get AI response with automatic fallback through all configured providers
   */
  async getResponse(request: AIRequest): Promise<AIResponse> {
    if (!this.settings.aiSuggestionsEnabled) {
      throw new Error("AI suggestions are not enabled");
    }

    if (this.providers.length === 0) {
      throw new Error("No AI providers configured");
    }

    const errors: string[] = [];

    // Try providers in order: default first, then others
    const providersToTry = this.getProvidersInOrder();

    for (const provider of providersToTry) {
      try {
        console.log(`Trying AI provider: ${provider.name}`);

        const response = await this.callProvider(provider, request);

        if (response) {
          console.log(`Success with provider: ${provider.name}, model: ${response.model}`);
          return response;
        }
      } catch (error) {
        const errorMsg = `${provider.name}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        console.error(`AI provider ${provider.name} failed:`, error);
        errors.push(errorMsg);
      }
    }

    throw new Error(`All AI providers failed: ${errors.join('; ')}`);
  }

  private getProvidersInOrder(): AIProvider[] {
    const defaultProvider = this.providers.find(p => p.name === this.settings.defaultProvider);
    const otherProviders = this.providers.filter(p => p.name !== this.settings.defaultProvider);

    return defaultProvider ? [defaultProvider, ...otherProviders] : this.providers;
  }

  private async callProvider(provider: AIProvider, request: AIRequest): Promise<AIResponse | null> {
    switch (provider.name) {
      case "OPENROUTER":
        return await this.callOpenRouter(provider, request);
      case "CLAUDE":
        return await this.callClaude(provider, request);
      case "OLLAMA":
        return await this.callOllama(provider, request);
      default:
        throw new Error(`Unknown provider: ${provider.name}`);
    }
  }

  private async callOpenRouter(provider: AIProvider, request: AIRequest): Promise<AIResponse | null> {
    if (!provider.fallbackModels || provider.fallbackModels.length === 0) {
      throw new Error("No OpenRouter models configured");
    }

    let lastError: Error | null = null;

    for (const model of provider.fallbackModels) {
      try {
        console.log(`Trying OpenRouter model: ${model}`);

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${provider.key}`,
            "HTTP-Referer": process.env.NEXTAUTH_URL || "http://localhost:3000",
            "X-Title": "CV Builder Pro",
          },
          body: JSON.stringify({
            model: model,
            messages: request.messages,
            temperature: request.temperature ?? 0.7,
            max_tokens: request.maxTokens ?? 1000,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`OpenRouter API error for model ${model}:`, response.status, errorText);

          // For rate limits, try next model
          if (response.status === 429) {
            lastError = new Error(`Rate limited on model ${model}`);
            continue;
          }

          // For other errors, don't retry
          throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
          throw new Error("Invalid OpenRouter response structure");
        }

        return {
          content: data.choices[0].message.content?.trim() || "",
          model: model,
          provider: "OPENROUTER",
        };

      } catch (error) {
        console.error(`Error with OpenRouter model ${model}:`, error);
        lastError = error as Error;
        continue;
      }
    }

    throw lastError || new Error("All OpenRouter models failed");
  }

  private async callClaude(provider: AIProvider, request: AIRequest): Promise<AIResponse> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "anthropic-version": "2023-06-01",
    };

    if (provider.key) {
      headers["x-api-key"] = provider.key;
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: provider.model,
        max_tokens: request.maxTokens ?? 1000,
        temperature: request.temperature ?? 0.7,
        messages: request.messages,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Claude API error:", response.status, errorText);
      throw new Error(`Claude API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.content || !data.content[0] || !data.content[0].text) {
      throw new Error("Invalid Claude response structure");
    }

    return {
      content: data.content[0].text.trim(),
      model: provider.model!,
      provider: "CLAUDE",
    };
  }

  private async callOllama(provider: AIProvider, request: AIRequest): Promise<AIResponse> {
    // Ollama models like Gemma 7B have larger context windows
    // Significantly increased limits for comprehensive responses
    const maxTokens = Math.min(request.maxTokens ?? 1000, 40000); // Increased to 40000 tokens

    // For Ollama, truncate input if requested (for PDF parsing with limited context)
    // Greatly increased character limit to preserve much more content
    let messages = request.messages;
    if (request.truncateForLocal) {
      messages = messages.map(msg => ({
        ...msg,
        content: msg.content.length > 80000 ? msg.content.substring(0, 80000) + "..." : msg.content
      }));
    }

    const response = await fetch(`${provider.url}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: provider.model,
        messages: messages,
        stream: false,
        options: {
          temperature: request.temperature ?? 0.7,
          num_predict: maxTokens,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Ollama API error:", response.status, errorText);
      throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.message || !data.message.content) {
      throw new Error("Invalid Ollama response structure");
    }

    return {
      content: data.message.content.trim(),
      model: provider.model!,
      provider: "OLLAMA",
    };
  }

  /**
   * Get AI settings for the admin user
   */
  static async getAISettings(): Promise<AISettings | null> {
    const adminUser = await prisma.user.findFirst({
      where: { role: "ADMIN" },
    });

    if (!adminUser) {
      return null;
    }

    return await prisma.aISettings.findUnique({
      where: { userId: adminUser.id },
    });
  }

  /**
   * Create AI service instance with admin settings
   */
  static async create(): Promise<AIService | null> {
    const settings = await this.getAISettings();

    if (!settings || !settings.aiSuggestionsEnabled) {
      return null;
    }

    return new AIService(settings);
  }
}