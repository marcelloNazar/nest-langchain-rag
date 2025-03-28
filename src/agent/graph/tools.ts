import { TavilySearchResults } from '@langchain/community/tools/tavily_search';
import { StructuredTool } from '@langchain/core/tools';

/**
 * Class that extends TavilySearchResults to capture sources
 */
class TavilySaveSources extends TavilySearchResults {
  savedSources: any[] = [];

  constructor(options: any) {
    super(options);
    this.savedSources = [];
  }

  async _call(input: string): Promise<string> {
    const result = await super._call(input);

    try {
      const resultObj = JSON.parse(result);
      if (resultObj?.results) {
        this.savedSources = resultObj.results.map((item) => ({
          title: item.title || 'No title',
          url: item.url,
          date: new Date().toISOString().split('T')[0],
          content: item.content || '',
        }));
      }
    } catch (e) {
      console.warn('Error processing sources:', e);
    }

    return result;
  }

  /**
   * Returns the saved sources from the last search
   */
  getSources() {
    return this.savedSources;
  }
}

/**
 * Creates and configures the Tavily search tool.
 * You need to set TAVILY_API_KEY in your environment variables.
 */
const createSearchTool = () => {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) return null;

  return new TavilySaveSources({
    apiKey,
    maxResults: 3,
    includeRawContent: true, // Ensure raw content is included in results
  });
};

/**
 * Array of tools to be used in the graph
 */
export const tools: StructuredTool[] = [createSearchTool()].filter(Boolean);
