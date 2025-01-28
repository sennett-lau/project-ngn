import Matter, { Bodies, Composite } from 'matter-js';

import { TsumsType } from '@/configs/tsum';
import { tsumSpriteName } from '@/configs/tsum';

import { GameCore } from './game';

export class Tsum {
  core: GameCore;
  x: number;
  y: number;
  tsumType: TsumsType;
  body: Matter.Body;

  constructor(core: GameCore, x: number, y: number, tsumType: TsumsType) {
    this.core = core;
    this.x = x;
    this.y = y;
    this.tsumType = tsumType;

    this.body = Bodies.circle(x, y, 50, {
      render: {
        sprite: {
          texture: this.getOriginalSpritePath(),
          xScale: 1,
          yScale: 1,
        },
        fillStyle: '#000000',
      },
    });

    (this.body as any).tsumType = tsumType;
    (this.body as any).connect = () => this.connect();
    (this.body as any).disconnect = () => this.disconnect();
    (this.body as any).remove = () => this.remove();
  }

  getOriginalSpritePath() {
    return `/assets/tsums/${tsumSpriteName[this.tsumType]}`;
  }

  getConnectedSpritePath() {
    return `/assets/tsums_connected/${tsumSpriteName[this.tsumType]}`;
  }

  connect() {
    this.body.render.sprite!.texture = this.getConnectedSpritePath();
  }

  disconnect() {
    this.body.render.sprite!.texture = this.getOriginalSpritePath();
  }

  remove() {
    Composite.remove(this.core.world, this.body);
  }
}
