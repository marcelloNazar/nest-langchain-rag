import { Injectable, Logger } from '@nestjs/common';
import { AgentRequestDto } from './dto/agent-request.dto';
import { AgentResponseDto, Source } from './dto/agent-response.dto';
import { HumanMessage } from '@langchain/core/messages';
import { BaseMessage } from '@langchain/core/messages';
import { app } from './graph/graph';
import { v4 as uuidv4 } from 'uuid';

/**
 * Interface to represent the message content structure
 */
interface MessageContent {
  type: string;
  text: string;
}

/**
 * Interface for the structure of the state returned by the agent
 */
interface AgentState {
  messages: BaseMessage[];
  sources?: Source[];
}

@Injectable()
export class AgentService {
  private readonly logger = new Logger(AgentService.name);
  // Temporary in-memory thread storage
  private readonly threadRegistry = new Map<string, string>();

  /**
   * Processes a query and returns a response with sources
   */
  async getAnswer(request: AgentRequestDto): Promise<AgentResponseDto> {
    try {
      // Gets or creates a thread_id for the conversation
      const threadId = this.getOrCreateThreadId(request.conversationId);
      this.logger.log(
        `Using thread ID: ${threadId} for conversation: ${request.conversationId}`,
      );

      // Configures the configuration object with thread_id
      const config = {
        configurable: {
          thread_id: threadId,
          conversationId: request.conversationId,
        },
      };

      // Invokes the ReAct agent with the query and thread configuration
      const result = (await app.invoke(
        {
          messages: [new HumanMessage(request.query)],
          sources: [],
        },
        config,
      )) as AgentState;

      // Extracts response from the last message
      const lastMessage = result.messages?.[result.messages.length - 1];
      const answer = this.extractContent(lastMessage);

      // Gets sources from the state or extracts from the text
      const sources = result.sources?.length
        ? this.formatSources(result.sources)
        : this.extractSourcesFromText(answer);

      // Builds response using the DTO, including the thread_id
      return {
        answer,
        sources,
        threadId,
      };
    } catch (error) {
      this.logger.error('Error processing request', error);
      return {
        answer:
          'An error occurred while processing your request. Please try again.',
        sources: [],
      };
    }
  }

  /**
   * Gets an existing thread_id or creates a new one for the conversation
   */
  private getOrCreateThreadId(conversationId?: string): string {
    if (!conversationId) {
      // If there is no conversation id, creates an anonymous thread
      return uuidv4();
    }

    // Checks if a thread already exists for this conversation
    if (!this.threadRegistry.has(conversationId)) {
      // Creates a new thread_id
      this.threadRegistry.set(conversationId, uuidv4());
    }

    return this.threadRegistry.get(conversationId);
  }

  /**
   * Initializes a new conversation (resets the thread)
   */
  resetConversation(conversationId: string): string {
    const newThreadId = uuidv4();
    this.threadRegistry.set(conversationId, newThreadId);
    return newThreadId;
  }

  /**
   * Extracts content from the LLM message
   */
  private extractContent(message?: BaseMessage): string {
    if (!message) return 'No response generated.';

    const content = message.content;

    if (typeof content === 'string') {
      return content;
    }

    if (Array.isArray(content)) {
      return content
        .map((item) => {
          if (typeof item === 'string') {
            return item;
          }

          // Checks if it's an object with a text field
          const contentItem = item as MessageContent;
          return contentItem.type === 'text' ? contentItem.text : '';
        })
        .filter(Boolean)
        .join(' ');
    }

    return 'Unable to process response format.';
  }

  /**
   * Formats sources from the state to the response format
   */
  private formatSources(stateSources: Source[]): Source[] {
    return stateSources.map((source) => ({
      title: source.title || 'Untitled',
      url: source.url || '',
      date: source.date || new Date().toISOString().split('T')[0],
      content: source.content || '',
    }));
  }

  /**
   * Extracts sources from text using regular expressions
   */
  private extractSourcesFromText(text: string): Source[] {
    const sources: Source[] = [];
    const today = new Date().toISOString().split('T')[0];

    // First tries links in markdown format
    const linkRegex =
      /\[(.*?)\]\((https?:\/\/[^\s\)]+)\)(?:\s*-\s*([^,\n]+))?/g;
    let match;

    while ((match = linkRegex.exec(text)) !== null) {
      sources.push({
        title: match[1] || 'Untitled',
        url: match[2],
        date: match[3] || today,
        content: '',
      });
    }

    // If it doesn't find markdown links, looks for simple URLs
    if (sources.length === 0) {
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      let urlMatch;
      let index = 1;

      while ((urlMatch = urlRegex.exec(text)) !== null) {
        sources.push({
          title: `Source ${index++}`,
          url: urlMatch[1],
          date: today,
          content: '',
        });
      }
    }

    return sources;
  }
}
