import { useEffect, useState } from 'react';

import { Composite, Events, Mouse, MouseConstraint } from 'matter-js';
import Matter from 'matter-js';

import { GameBoard, getGameBoardWalls } from '@/components/Game/GameBoard';
import { Tsums, TsumsType } from '@/components/Game/Tsums';
import { useMatterStore } from '@/store/matterStore';

const config = {
  maxConnectDistance: 150,
  minRewardableConnection: 3,
};

const IndexPage = () => {
  const { world, engine, render } = useMatterStore();
  const [score, setScore] = useState(0);

  const initTsums = () => {
    if (!world) return;
    const initialPosition = [
      { x: 300, y: 60 },
      { x: 200, y: 125 },
      { x: 400, y: 125 },
      { x: 300, y: 190 },
      { x: 500, y: 190 },
      { x: 100, y: 190 },
      { x: 200, y: 255 },
      { x: 400, y: 255 },
      { x: 300, y: 320 },
      { x: 500, y: 320 },
      { x: 100, y: 320 },
      { x: 200, y: 385 },
      { x: 400, y: 385 },
      { x: 300, y: 450 },
      { x: 500, y: 450 },
      { x: 100, y: 450 },
      { x: 200, y: 515 },
      { x: 400, y: 515 },
      { x: 200, y: 645 },
      { x: 400, y: 645 },
    ];

    for (const position of [...initialPosition, ...initialPosition]) {
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

      Composite.add(world, Tsums(position.x, position.y, type));
    }
  };

  const setupGameLogic = () => {
    if (!world || !engine || !render) return;
    const mouse = Mouse.create(render.canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0,
        render: {
          visible: false,
        },
      },
    });

    Composite.add(world, mouseConstraint);

    const touchedBodies: Set<Matter.Body> = new Set();
    const touchedCenters: Matter.Vector[] = [];
    let isMouseDown = false;
    let currentType: TsumsType | null = null;

    // Add event listener for mouse down
    Events.on(mouseConstraint, 'mousedown', () => {
      isMouseDown = true;
      touchedCenters.length = 0; // Clear the centers on mouse down
      currentType = null; // Reset the current type
    });

    // Add event listener for mouse move
    Events.on(mouseConstraint, 'mousemove', () => {
      if (!isMouseDown) return; // Only link when mouse is down

      const bodies = Composite.allBodies(world);

      bodies.forEach((body) => {
        if (Matter.Bounds.contains(body.bounds, mouse.position)) {
          if (Matter.Vertices.contains(body.vertices, mouse.position)) {
            if (!touchedBodies.has(body)) {
              const bodyType = (body as any).tsumType; // Assume tsumType is stored in the body

              if (currentType === null) {
                currentType = bodyType; // Set the current type based on the first touched tsum
              }

              if (bodyType === currentType) {
                // Calculate the distance from the last touched center
                const center = Matter.Vertices.centre(body.vertices);
                const lastCenter = touchedCenters[touchedCenters.length - 1];
                const distance = lastCenter
                  ? Matter.Vector.magnitude(Matter.Vector.sub(center, lastCenter))
                  : 0;

                // Only add the body if it's within 200px of the last touched body
                if (distance <= config.maxConnectDistance || touchedCenters.length === 0) {
                  touchedCenters.push(center);

                  // Change the texture when the mouse touches the body
                  body.render!.sprite!.texture = (body as any).touchedTexture;
                  console.log('touched', bodyType);
                  touchedBodies.add(body);
                }
              }
            }
          }
        }
      });
    });

    Events.on(mouseConstraint, 'mouseup', () => {
      isMouseDown = false;
      // Check if the number of touched circles is greater than minRewardableConnection
      if (touchedBodies.size >= config.minRewardableConnection) {
        // Increase the score
        setScore((prevScore) => prevScore + touchedBodies.size * 10);

        // Remove the touched bodies from the world
        touchedBodies.forEach((body) => {
          Composite.remove(world, body);
        });
      } else {
        // Revert the texture back if not enough connections
        touchedBodies.forEach((body) => {
          body.render!.sprite!.texture = (body as any).originalTexture;
        });
      }

      // Clear the touched bodies and centers
      touchedBodies.clear();
      touchedCenters.length = 0;
      currentType = null;
    });

    // Custom render function to draw lines
    const drawLines = () => {
      const context = render.context;
      context.beginPath();
      context.lineWidth = 2;
      context.strokeStyle = 'blue';

      // Update the touchedCenters based on the current positions of the touchedBodies
      const updatedCenters = Array.from(touchedBodies).map((body) =>
        Matter.Vertices.centre(body.vertices),
      );

      for (let i = 0; i < updatedCenters.length - 1; i++) {
        const start = updatedCenters[i];
        const end = updatedCenters[i + 1];
        context.moveTo(start.x, start.y);
        context.lineTo(end.x, end.y);
      }

      context.stroke();
    };

    // Add a render event to draw the lines
    Events.on(render, 'afterRender', drawLines);
  };

  const resetGame = () => {
    if (!world) return;
    Composite.remove(world, Composite.allBodies(world));
    Composite.add(world, getGameBoardWalls());
    setScore(0);
  };

  const onStart = () => {
    resetGame();
    initTsums();
    setupGameLogic();
  };

  useEffect(() => {
    if (!world || !engine || !render) return;

    onStart();
  }, [world, engine, render]);

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
