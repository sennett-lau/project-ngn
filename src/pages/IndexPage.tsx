import { GameBoard } from '@/components/Game/GameBoard';
import { useGameStore } from '@/store/gameStore';

const IndexPage = () => {
  const { score, gameCore } = useGameStore();

  const onStart = () => {
    gameCore?.reset();
  };

  return (
    <div className='flex flex-1 flex-col items-center justify-center bg-gray-100 gap-4'>
      <button className='text-2xl font-bold text-black' onClick={onStart}>
        Start
      </button>
      <GameBoard />
      <div className='text-2xl font-bold text-black'>Score: {score}</div>
    </div>
  );
};

export default IndexPage;
