import { Composite } from 'matter-js';

import GameBoard from '@/components/Game/GameBoard';
import { Tsums, TsumsType } from '@/components/Game/Tsums';
import { useMatterStore } from '@/store/matterStore';

const IndexPage = () => {
  const { world } = useMatterStore();

  const onStart = () => {
    if (!world) return;

    const random = Math.floor(Math.random() * 2);
    let type: TsumsType = TsumsType.nagano_bear;

    switch (random) {
      case 0:
        type = TsumsType.nagano_bear;
        break;
      case 1:
        type = TsumsType.baku;
        break;
    }

    Composite.add(world, Tsums(300, 200, type));
  };

  return (
    <div className='flex flex-1 flex-col items-center justify-center bg-gray-100'>
      <button className='text-2xl font-bold text-black' onClick={onStart}>
        Start
      </button>
      <GameBoard />
    </div>
  );
};

export default IndexPage;
