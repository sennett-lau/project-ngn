import { create } from 'zustand';

import { GameCore } from '@/utils/game';

type GameState = {
  gameCore: GameCore | null;
  score: number;
  setGameCore: (gameCore: GameCore) => void;
  updateScore: () => void;
};

export const useGameStore = create<GameState>()((set, get) => ({
  gameCore: null,
  score: 0,
  setGameCore: (gameCore: GameCore) => set({ gameCore }),
  updateScore: () => {
    const gameCore = get().gameCore;
    if (gameCore) {
      const score = gameCore.score;
      set({ score });
    }
  },
}));
