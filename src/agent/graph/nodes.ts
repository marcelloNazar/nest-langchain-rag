/**
 * ReAct agent nodes implementation
 */
import { SystemMessage } from '@langchain/core/messages';
import { AgentStateType } from './state';
import { llmWithTools, systemMessage } from './chains';

/**
 * Assistant node for all interactions (sync and async)
 */
export const assistant = async (state: AgentStateType = {}) => {
  // Initialize with defaults
  const messages = state.messages || [];
  const sources = state.sources || [];

  // Skip processing for empty message state
  if (messages.length === 0) return { messages };

  try {
    // Create input messages array with system message (not saved to state)
    const inputMessages = [systemMessage, ...messages];

    // Add sources context as system message if available
    if (sources.length) {
      inputMessages.push(
        new SystemMessage(
          `Include these sources in your response: ${JSON.stringify(sources)}`,
        ),
      );
    }

    // Get LLM response
    const response = await llmWithTools.invoke(inputMessages);

    // Return updated state with only user/assistant messages
    return {
      messages: [...messages, response],
      sources,
    };
  } catch (error) {
    console.error('Assistant error:', error);
    return { messages, sources };
  }
};
