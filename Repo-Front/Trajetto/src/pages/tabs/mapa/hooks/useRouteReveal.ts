import { useEffect, useState } from 'react';

/** Intervalo entre um trecho e o proximo aparecer no mapa. */
export const REVEAL_STEP_MS = 280;

/**
 * Quando a rota do dia chega, os trechos aparecem um de cada vez, da partida ate a ultima
 * parada: o caminho e desenhado na frente do viajante.
 */
export function useRouteReveal<T>(segments: T[]): T[] {
  const [shown, setShown] = useState(0);

  useEffect(() => {
    // Rota nova (outro dia): recomeca o desenho do zero.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShown(0);
    if (segments.length === 0) return;
    const id = setInterval(() => {
      setShown((n) => {
        if (n + 1 >= segments.length) clearInterval(id);
        return Math.min(n + 1, segments.length);
      });
    }, REVEAL_STEP_MS);
    return () => clearInterval(id);
  }, [segments]);

  return segments.slice(0, shown);
}
