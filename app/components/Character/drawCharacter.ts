import type { Character } from '@fwo/schemas';

export const drawCharacter = (canvas: HTMLCanvasElement, character: Character) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return;
  }

  const layers: HTMLImageElement[] = [];

  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    layers.forEach((layer) => {
      ctx.drawImage(layer, 0, 0);
    });
  };

  const drawBody = () => {
    const body = new Image();
    body.src = new URL('/character/male.png', import.meta.url).href;
    body.onload = () => {
      console.log('test');
      layers.push(body);
      draw();
    };
  };

  const drawWeapon = () => {
    const body = new Image();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { code } = character.inventory[0];
    // fixme fix vite dynamic import
    body.src = new URL('/items/wac.png', import.meta.url).href;
    body.onload = () => {
      console.log('test');
      layers.push(body);
      draw();
    };
  };

  drawBody();
  drawWeapon();
};
