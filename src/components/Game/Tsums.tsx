import { Bodies } from 'matter-js';

export enum TsumsType {
  nagano_bear = 'nagano_bear',
  baku = 'baku',
}

const imagePath = {
  [TsumsType.nagano_bear]: '/assets/tsums/nagano_bear.png',
  [TsumsType.baku]: '/assets/tsums/paku.png',
};

export const Tsums = (x: number, y: number, type: TsumsType) => {
  const circle = Bodies.circle(x, y, 50, {
    render: {
      sprite: {
        texture: imagePath[type],
        xScale: 1,
        yScale: 1,
      },
    },
  });

  return circle;
};
