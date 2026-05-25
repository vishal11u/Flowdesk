import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/domain/authenticated-user';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  async create(
    @Body() createMessageDto: CreateMessageDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.messagesService.create(createMessageDto, user.organizationId);
  }

  @Get('client/:clientId')
  async findByClientId(
    @Param('clientId', ParseIntPipe) clientId: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.messagesService.findByClientId(clientId, user.organizationId);
  }
}
