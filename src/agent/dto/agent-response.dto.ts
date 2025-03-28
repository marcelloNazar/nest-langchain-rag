import { IsArray, IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class Source {
  @ApiProperty({
    description: 'Title of the source',
    example: 'AI Weekly: Latest Breakthroughs in Natural Language Processing',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'URL of the source',
    example: 'https://techcrunch.com/2023/03/27/ai-weekly-breakthroughs/',
  })
  @IsString()
  url: string;

  @ApiProperty({
    description: 'Publication date of the source',
    example: '2023-03-27',
  })
  @IsString()
  date: string;

  @ApiProperty({
    description: 'Content of the article',
    example:
      'Recent advances in AI have shown significant progress in natural language understanding...',
    required: false,
  })
  @IsString()
  @IsOptional()
  content?: string;
}

export class AgentResponseDto {
  @ApiProperty({
    description: 'Answer provided by the news agent',
    example:
      'The latest AI news includes breakthroughs in large language models and new applications in healthcare. According to recent reports, companies like OpenAI and Google have announced significant improvements in their AI systems.',
  })
  @IsString()
  @IsNotEmpty()
  answer: string;

  @ApiProperty({
    description: 'Information sources used to generate the answer',
    type: [Source],
  })
  @IsArray()
  sources: Source[];

  @ApiProperty({
    description: 'Thread identifier for conversation continuity',
    example: 'a1b2c3d4-e5f6-7890-abcd-1234567890ab',
    required: false,
  })
  @IsString()
  @IsOptional()
  threadId?: string;
}
