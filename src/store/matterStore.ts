import { create } from 'zustand';

import Matter from 'matter-js';

type MatterState = {
  engine: Matter.Engine | null;
  world: Matter.World | null;
  render: Matter.Render | null;
  setEngine: (engine: Matter.Engine) => void;
  setWorld: (world: Matter.World) => void;
  setRender: (render: Matter.Render) => void;
};

export const useMatterStore = create<MatterState>()((set) => ({
  engine: null,
  world: null,
  render: null,
  setEngine: (engine: Matter.Engine) => set({ engine }),
  setWorld: (world: Matter.World) => set({ world }),
  setRender: (render: Matter.Render) => set({ render }),
}));
