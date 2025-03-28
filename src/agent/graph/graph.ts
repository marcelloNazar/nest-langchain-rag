import { START, END, StateGraph, MemorySaver } from '@langchain/langgraph';
import { ToolNode } from '@langchain/langgraph/prebuilt';
import { AgentStateAnnotation } from './state';
import { assistant } from './nodes';
import { tools } from './tools';

/**
 * Determines the next node based on message content
 */
function toolsCondition(state) {
  const messages = state.messages || [];
  if (messages.length === 0) return 'tools';

  const lastMessage = messages[messages.length - 1];

  if (
    'tool_calls' in lastMessage &&
    Array.isArray(lastMessage.tool_calls) &&
    lastMessage.tool_calls.length > 0
  ) {
    return 'tools';
  }

  return END;
}

/**
 * Custom tools node that processes tools and captures sources
 */
const toolsWithSourceCapture = async (state) => {
  // First, process tools using the standard ToolNode
  const toolNode = new ToolNode(tools);
  const toolResult = await toolNode.invoke(state);

  // Then capture sources from tools
  let capturedSources = [];
  for (const tool of tools) {
    if ('getSources' in tool && typeof tool.getSources === 'function') {
      const sources = tool.getSources();
      if (sources && Array.isArray(sources) && sources.length > 0) {
        capturedSources = sources;
        break;
      }
    }
  }

  // Return combined result
  return {
    ...toolResult,
    sources: capturedSources,
  };
};

// Main graph configuration
const builder = new StateGraph(AgentStateAnnotation)
  .addNode('assistant', assistant)
  .addNode('tools', toolsWithSourceCapture)
  .addEdge(START, 'assistant')
  .addConditionalEdges('assistant', toolsCondition, {
    tools: 'tools',
    [END]: END,
  })
  .addEdge('tools', 'assistant');

// Criar um checkpointer para persistência de conversas
const checkpointer = new MemorySaver();

// Compilar o grafo com o checkpointer para habilitar persistência entre chamadas
export const graph = builder.compile({
  checkpointer,
});
export const app = graph;
