import { useEffect, useRef } from 'react';
import { useCharacter } from '@/hooks/useCharacter';
import { drawCharacter } from './drawCharacter';

export const Character = () => {
  const { character } = useCharacter();
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvas.current) {
      drawCharacter(canvas.current, character);
    }
  }, [character]);

  return (
    <canvas
      ref={canvas}
      style={{ display: 'block', margin: 'auto' }}
      width={200}
      height={200}
    />
  );
};
