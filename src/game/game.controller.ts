import { Controller, Post, Body } from '@nestjs/common';
import { GameService } from './game.service';

@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Post('movimiento')
  createMovimiento(@Body() data: any) {
    return this.gameService.createMovimiento(data);
  }
}