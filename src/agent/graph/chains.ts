import { ChatOpenAI } from '@langchain/openai';
import { tools } from './tools';
import { SystemMessage } from '@langchain/core/messages';

/**
 * System message that instructs the LLM how to behave as an assistant
 */
export const systemMessage = new SystemMessage(
  `Current date and time: ${new Date().toLocaleString()}

You are an intelligent assistant that helps users find information. Your primary goal is to directly answer the user's question with accurate and helpful information.

IMPORTANT:
1. First, provide a clear, direct answer to the user's question
2. Use the search tool when you need to look up current information
3. Always be accurate, helpful, and concise in your answers

When you use the search tool, make sure to include the sources in your response. For each source you reference, include the title, URL, and date if available.

After your answer, list all sources used in this exact format:

Sources:
1. [Title](URL) - Date
2. [Another Title](Another URL) - Date

This format is crucial as it will be parsed to extract the sources properly. Even if you extract information from multiple sources, make sure to include all of them.`,
);

/**
 * Creates and configures the language model.
 *
 * @returns Configured ChatOpenAI instance
 */
export function createLLM() {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.error('OPENAI_API_KEY not found in environment');
    throw new Error('OPENAI_API_KEY is required for the agent to function');
  }

  return new ChatOpenAI({
    modelName: 'gpt-4o',
    temperature: 0,
    openAIApiKey: apiKey,
  });
}

// Criar o LLM e vincular as ferramentas
export const llm = createLLM();
export const llmWithTools = llm.bindTools(tools);
