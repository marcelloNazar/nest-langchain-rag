import { Controller, Post, Body, Param } from '@nestjs/common';
import { AgentService } from './agent.service';
import { AgentRequestDto } from './dto/agent-request.dto';
import { AgentResponseDto } from './dto/agent-response.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('agent')
@Controller('agent')
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  @Post()
  @ApiOperation({
    summary: 'Get information about daily news and current events',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns agent response with answer and sources',
    type: AgentResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid parameters' })
  async getAnswer(
    @Body() createAgentDto: AgentRequestDto,
  ): Promise<AgentResponseDto> {
    return this.agentService.getAnswer(createAgentDto);
  }

  @Post('reset/:conversationId')
  @ApiOperation({
    summary: 'Reset conversation thread',
  })
  @ApiParam({
    name: 'conversationId',
    description: 'Unique identifier for the conversation',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Returns new thread ID',
    schema: {
      type: 'object',
      properties: {
        threadId: {
          type: 'string',
          description: 'New thread ID for the conversation',
        },
      },
    },
  })
  resetConversation(@Param('conversationId') conversationId: string) {
    const threadId = this.agentService.resetConversation(conversationId);
    return { threadId };
  }
}
