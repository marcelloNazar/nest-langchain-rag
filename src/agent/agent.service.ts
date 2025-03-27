import { Injectable } from '@nestjs/common';
import { AgentRequestDto } from './dto/agent-request.dto';
import { AgentResponseDto } from './dto/agent-response.dto';

@Injectable()
export class AgentService {
  getAnswer(createAgentDto: AgentRequestDto): Promise<AgentResponseDto> {
    const { query } = createAgentDto;
    const answer = `This action adds a new agent ${query}`;
    const sources = [
      {
        title: 'Source 1',
        url: 'https://www.source1.com',
        date: '2021-01-01',
      },
    ];
    return Promise.resolve({
      answer,
      sources,
    });
  }
}
