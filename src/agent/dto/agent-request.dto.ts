import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AgentRequestDto {
  @ApiProperty({
    description: 'Query to be processed by the agent',
    example:
      'What are the latest headlines about artificial intelligence today?',
  })
  @IsString()
  @IsNotEmpty()
  query: string;
}
