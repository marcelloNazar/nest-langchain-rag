import { BaseMessage } from '@langchain/core/messages';
import { Annotation, messagesStateReducer } from '@langchain/langgraph';
import { Source } from '../dto/agent-response.dto';

/**
 * State definition for the LangGraph ReAct agent
 */
export const AgentStateAnnotation = Annotation.Root({
  /**
   * Conversation messages between user and agent
   */
  messages: Annotation<BaseMessage[]>({
    reducer: messagesStateReducer,
    default: () => [],
  }),

  /**
   * Information sources for responses
   */
  sources: Annotation<Source[]>({
    reducer: (state: Source[] = [], update: Source | Source[]) => {
      const updateArray = Array.isArray(update) ? update : [update];
      return [...state, ...updateArray];
    },
    default: () => [],
  }),
});

/**
 * Type for partial state returns
 */
export type AgentStateType = Partial<typeof AgentStateAnnotation.State>;

/**
 * Interface for agent state
 */
export interface AgentState {
  messages: BaseMessage[];
  sources: Source[];
}
