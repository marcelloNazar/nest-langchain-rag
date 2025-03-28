import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
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

  @ApiProperty({
    description: 'Conversation identifier for thread persistence (optional)',
    example: 'conv123',
    required: false,
  })
  @IsString()
  @IsOptional()
  conversationId?: string;
}
