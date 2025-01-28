import Matter, {
  Bodies,
  Composite,
  Engine,
  Events,
  Mouse,
  MouseConstraint,
  Render,
  Runner,
} from 'matter-js';

import { gameConfig } from '@/configs/game';
import { numberOfTsumsType, tsumSpriteName, TsumsType } from '@/configs/tsum';
import { useGameStore } from '@/store/gameStore';

import { Tsum } from './tsum';

export class GameCore {
  engine: Matter.Engine;
  world: Matter.World;
  render: Matter.Render;

  score = 0;

  connectingType: TsumsType | null = null;

  tsums: Tsum[] = [];

  constructor(element: HTMLElement) {
    this.engine = Engine.create();
    this.world = this.engine.world;
    this.render = Render.create({
      element,
      engine: this.engine,
      options: {
        width: gameConfig.boardWidth,
        height: gameConfig.boardHeight,
        wireframes: false,
        background: '#FEFEFE',
      },
    });

    Render.run(this.render);

    const runner = Runner.create();
    Runner.run(runner, this.engine);

    this.createWalls();
    this.spawnTsums(gameConfig.numberOfTsums);
    this.initMouseLogic();
  }

  createWalls() {
    const numSegments = 300; // Number of segments to approximate the circle
    const radius = 410;
    const centerX = 300;
    const centerY = 400;

    const walls = [];

    for (let i = 0; i < numSegments; i++) {
      const angle = (i / numSegments) * Math.PI * 2;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      const body = Bodies.rectangle(x, y, 30, 600, { isStatic: true, angle: angle });
      walls.push(body);
    }

    Composite.add(this.world, [
      ...walls,
      Bodies.rectangle(0, 400, 30, 800, { isStatic: true }), // Left wall
      Bodies.rectangle(600, 400, 30, 800, { isStatic: true }), // Right wall
    ]);
  }

  spawnTsums(numTsums: number) {
    const maxAttempts = 100;
    const bodies = Composite.allBodies(this.world);

    const minX = gameConfig.tsumsRadius;
    const maxX = gameConfig.boardWidth - gameConfig.tsumsRadius;
    const minY = gameConfig.tsumsRadius;
    const maxY = gameConfig.boardHeight - gameConfig.tsumsRadius;

    for (let i = 0; i < numTsums; i++) {
      const attempts = 0;
      let position;

      do {
        position = {
          x: Math.random() * (maxX - minX) + minX,
          y: Math.random() * (maxY - minY) + minY,
        };
      } while (
        _isOverlapping(position.x, position.y, bodies, gameConfig.tsumsRadius) &&
        attempts < maxAttempts
      );

      if (attempts < maxAttempts) {
        const random = Math.floor(Math.random() * numberOfTsumsType);
        const type: TsumsType = Object.keys(tsumSpriteName)[random] as TsumsType;

        const tsum = new Tsum(this, position.x, position.y, type);

        this.tsums.push(tsum);

        Composite.add(this.world, tsum.body);
      }
    }
  }

  initMouseLogic() {
    const mouse = Mouse.create(this.render.canvas);
    const mouseConstraint = MouseConstraint.create(this.engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0,
        render: {
          visible: false,
        },
      },
    });

    Composite.add(this.world, mouseConstraint);

    const touchedBodies: Set<Matter.Body> = new Set();
    const touchedCenters: Matter.Vector[] = [];
    let isMouseDown = false;

    // Add event listener for mouse down
    Events.on(mouseConstraint, 'mousedown', () => {
      isMouseDown = true;
      touchedCenters.length = 0; // Clear the centers on mouse down
      this.connectingType = null; // Reset the current type
    });

    // Add event listener for mouse move
    Events.on(mouseConstraint, 'mousemove', () => {
      if (!isMouseDown) return; // Only link when mouse is down

      const bodies = Composite.allBodies(this.world);

      bodies.forEach((body) => {
        if (Matter.Bounds.contains(body.bounds, mouse.position)) {
          if (Matter.Vertices.contains(body.vertices, mouse.position)) {
            if (!touchedBodies.has(body)) {
              const bodyType = (body as any).tsumType; // Assume tsumType is stored in the body

              if (this.connectingType === null) {
                this.connectingType = bodyType; // Set the current type based on the first touched tsum
              }

              if (bodyType === this.connectingType) {
                // Calculate the distance from the last touched center
                const center = Matter.Vertices.centre(body.vertices);
                const lastCenter = touchedCenters[touchedCenters.length - 1];
                const distance = lastCenter
                  ? Matter.Vector.magnitude(Matter.Vector.sub(center, lastCenter))
                  : 0;

                // Only add the body if it's within 200px of the last touched body
                if (distance <= gameConfig.maxConnectDistance || touchedCenters.length === 0) {
                  touchedCenters.push(center);

                  // Change the texture when the mouse touches the body
                  (body as any).connect();
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
      if (touchedBodies.size >= gameConfig.minRewardableConnection) {
        const numberOfRewardableTsums = touchedBodies.size;
        // Increase the score
        this.score += numberOfRewardableTsums * 10;

        // update gameStore
        useGameStore.getState().updateScore();

        // Remove the touched bodies from the world
        touchedBodies.forEach((body) => {
          (body as any).remove();
        });

        this.spawnTsums(numberOfRewardableTsums);
      } else {
        // Revert the texture back if not enough connections
        touchedBodies.forEach((body) => {
          (body as any).disconnect();
        });
      }

      // Clear the touched bodies and centers
      touchedBodies.clear();
      touchedCenters.length = 0;
      this.connectingType = null;
    });

    // Add a render event to draw the lines
    Events.on(this.render, 'afterRender', () => this._drawLines(touchedBodies));
  }

  reset() {
    this.score = 0;
    useGameStore.getState().updateScore();
    this.connectingType = null;
    this.tsums.forEach((tsum) => tsum.remove());
    this.tsums = [];
    this.spawnTsums(gameConfig.numberOfTsums);
  }

  clear() {
    Matter.Render.stop(this.render);
    Matter.World.clear(this.world, true);
    Matter.Engine.clear(this.engine);
    this.render.canvas.remove();
    this.render.textures = {};
  }

  _drawLines = (touchedBodies: Set<Matter.Body>) => {
    const context = this.render.context;
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
}

const _isOverlapping = (x: number, y: number, bodies: Matter.Body[], radius: number) => {
  return bodies.some((body) => {
    const center = Matter.Vertices.centre(body.vertices);
    const distance = Matter.Vector.magnitude(Matter.Vector.sub({ x, y }, center));
    return distance < radius * 2; // Check if distance is less than diameter
  });
};
