import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/domain/authenticated-user';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
  @Get('me')
  me(@CurrentUser() user: AuthenticatedUser) {
    return user;
  }

  @Get()
  findAll() {
    return ['user1', 'user2'];
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return `This is a user with id: ${id}`;
  }

  @Post()
  create(@Body() body: CreateUserDto) {
    return body;
  }
}
