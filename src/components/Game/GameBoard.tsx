import { useEffect, useRef } from 'react';

import Matter, { Bodies, Composite, Runner } from 'matter-js';

import { useMatterStore } from '@/store/matterStore';

const GameBoard = () => {
  const { setEngine, setWorld, setRender } = useMatterStore();

  const sceneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mEngine = Matter.Engine.create();
    const mWorld = mEngine.world;

    const mRender = Matter.Render.create({
      element: sceneRef.current!,
      engine: mEngine,
      options: {
        width: 600,
        height: 800,
        wireframes: false,
        background: '#F8F8F8',
      },
    });

    // Run the renderer
    Matter.Render.run(mRender);

    const runner = Runner.create();
    Runner.run(runner, mEngine);

    // Create an inverted circle wall using multiple static bodies
    const numSegments = 300; // Number of segments to approximate the circle
    const radius = 410;
    const centerX = 300;
    const centerY = 400;

    for (let i = 0; i < numSegments; i++) {
      const angle = (i / numSegments) * Math.PI * 2;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      const body = Bodies.rectangle(x, y, 30, 600, { isStatic: true, angle: angle });
      Composite.add(mWorld, body);
    }

    setEngine(mEngine);
    setWorld(mWorld);
    setRender(mRender);

    Composite.add(mWorld, [
      Bodies.rectangle(0, 400, 20, 800, { isStatic: true }), // Left wall
      Bodies.rectangle(600, 400, 20, 800, { isStatic: true }), // Right wall
    ]);

    // Clean up on component unmount
    return () => {
      Matter.Render.stop(mRender);
      Matter.World.clear(mWorld, false);
      Matter.Engine.clear(mEngine);
      mRender.canvas.remove();
      mRender.textures = {};
    };
  }, []); // Empty dependency array ensures this runs once on mount

  return (
    <div
      ref={sceneRef}
      className='mx-auto mt-4 flex justify-center items-center relative'
      style={{
        height: '800px',
        width: '600px',
        border: '1px solid black',
        backgroundColor: 'white',
      }}
    ></div>
  );
};

export default GameBoard;
