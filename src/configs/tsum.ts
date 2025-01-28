export enum TsumsType {
  nagano_bear = 'nagano_bear',
  baku = 'baku',
}

export const tsumSpriteName: Record<TsumsType, string> = {
  [TsumsType.nagano_bear]: 'nagano_bear.png',
  [TsumsType.baku]: 'paku.png',
};
