import { Controller, Post, Body } from '@nestjs/common';
import { AiService } from './ai.service';
import { GenerateReplyDto } from './dto/generate-reply.dto';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('generate-reply')
  async generateReply(@Body() generateReplyDto: GenerateReplyDto) {
    return this.aiService.generateReply(generateReplyDto);
  }
}
