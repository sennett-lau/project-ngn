export enum TsumsType {
  nagano_bear = 'nagano_bear',
  baku = 'baku',
  koroke = 'koroke',
}

export const tsumSpriteName: Record<TsumsType, string> = {
  [TsumsType.nagano_bear]: 'nagano_bear.png',
  [TsumsType.baku]: 'paku.png',
  [TsumsType.koroke]: 'koroke.png',
};

export const numberOfTsumsType = Object.keys(tsumSpriteName).length;
