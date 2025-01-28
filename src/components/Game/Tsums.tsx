import { Bodies } from 'matter-js';

export enum TsumsType {
  nagano_bear = 'nagano_bear',
  baku = 'baku',
}

const imagePath = {
  [TsumsType.nagano_bear]: '/assets/tsums/nagano_bear.png',
  [TsumsType.baku]: '/assets/tsums/paku.png',
};

export const imageTouchedPath = {
  [TsumsType.nagano_bear]: '/assets/tsums_touched/nagano_bear.png',
  [TsumsType.baku]: '/assets/tsums_touched/paku.png',
};

export const Tsums = (x: number, y: number, type: TsumsType) => {
  const circle = Bodies.circle(x, y, 50, {
    render: {
      sprite: {
        texture: imagePath[type],
        xScale: 1,
        yScale: 1,
      },
      fillStyle: '#000000',
    },
  });

  (circle as any).tsumType = type;
  (circle as any).originalTexture = imagePath[type];
  (circle as any).touchedTexture = imageTouchedPath[type];

  return circle;
};
