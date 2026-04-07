import { Injectable, BadRequestException } from '@nestjs/common';

type Movimiento = {
  player_id: number;
  ronda_id: number;
  tipo: string; // 'Ataque' | 'Defensa' | 'Especial'
};

type Resultado = {
  ronda_id: number;
  resultado: string;
};

@Injectable()
export class GameService {
  private movimientos: Movimiento[] = [];

  createMovimiento(data: Movimiento) {
    //  Validar duplicado en misma ronda
    const yaJugo = this.movimientos.find(
      m => m.player_id === data.player_id && m.ronda_id === data.ronda_id
    );

    if (yaJugo) {
      throw new BadRequestException('El jugador ya jugó en esta ronda');
    }

    //  Validar repetición consecutiva
    const ultimoMovimiento = this.movimientos
      .filter(m => m.player_id === data.player_id)
      .pop();

    if (ultimoMovimiento && ultimoMovimiento.tipo === data.tipo) {
      throw new BadRequestException('No puede repetir el mismo movimiento consecutivo');
    }

    //  Guardar movimiento
    this.movimientos.push(data);

    //  Verificar si ambos jugadores ya jugaron
    const movimientosRonda = this.movimientos.filter(
      m => m.ronda_id === data.ronda_id
    );

    if (movimientosRonda.length === 2) {
      return this.resolverRonda(data.ronda_id);
    }

    return { message: 'Movimiento registrado, esperando al otro jugador' };
  }

  resolverRonda(ronda_id: number): Resultado {
    const movimientos = this.movimientos.filter(m => m.ronda_id === ronda_id);

    const [m1, m2] = movimientos;

    if (!m1 || !m2) {
      throw new BadRequestException('Faltan movimientos');
    }

    let resultado = '';

    if (m1.tipo === m2.tipo) {
      resultado = 'Empate';
    } else if (
      (m1.tipo === 'Ataque' && m2.tipo === 'Defensa') ||
      (m1.tipo === 'Defensa' && m2.tipo === 'Especial') ||
      (m1.tipo === 'Especial' && m2.tipo === 'Ataque')
    ) {
      resultado = `Gana jugador ${m1.player_id}`;
    } else {
      resultado = `Gana jugador ${m2.player_id}`;
    }

    return {
      ronda_id,
      resultado,
    };
  }
}
/*
Este servicio maneja la lógica del juego:

- Evita que un jugador juegue dos veces en la misma ronda
- Evita repetir el mismo movimiento consecutivo
- Guarda movimientos
- Cuando ambos jugadores han jugado, resuelve la ronda

Reglas:
Ataque > Defensa
Defensa > Especial
Especial > Ataque
Iguales = empate
*/