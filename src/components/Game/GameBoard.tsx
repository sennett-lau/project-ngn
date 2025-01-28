import { useEffect, useRef } from 'react';

import { gameConfig } from '@/configs/game';
import { useGameStore } from '@/store/gameStore';
import { GameCore } from '@/utils/game';

export const GameBoard = () => {
  const { setGameCore } = useGameStore();

  const sceneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sceneRef.current) return;

    const gameCore = new GameCore(sceneRef.current);

    setGameCore(gameCore);

    return () => {
      gameCore.clear();
    };
  }, [sceneRef]);

  return (
    <div
      ref={sceneRef}
      className='mx-auto mt-4 flex justify-center items-center relative'
      style={{
        height: `${gameConfig.boardHeight}px`,
        width: `${gameConfig.boardWidth}px`,
        border: '1px solid black',
        backgroundColor: 'white',
      }}
    ></div>
  );
};
