import { Controller, Post, Body } from '@nestjs/common';
import { AgentService } from './agent.service';
import { AgentRequestDto } from './dto/agent-request.dto';
import { AgentResponseDto } from './dto/agent-response.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

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
}
