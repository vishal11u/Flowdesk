import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateMessageDto {
  @IsNumber()
  clientId: number;

  @IsNotEmpty()
  message: string;

  @IsEnum(['incoming', 'outgoing'])
  type: 'incoming' | 'outgoing';
}
