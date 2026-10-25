import { useEffect, useState } from 'react';
import { placesService } from '../services';

// Compartilhado entre as telas: a lista do Explorar e o detalhe nao buscam a mesma foto duas vezes.
const cache = new Map<string, string | null>();

/** Foto do ponto no Wikimedia Commons; null enquanto carrega, sem wikidata ou sem foto. */
export function usePlaceImage(wikidata?: string | null): string | null {
  const [, setLoaded] = useState(0);

  useEffect(() => {
    if (!wikidata || cache.has(wikidata)) return;
    let ativo = true;
    placesService.getImage(wikidata)
      .then((url) => {
        cache.set(wikidata, url);
        if (ativo) setLoaded((n) => n + 1);
      })
      .catch(() => {});
    return () => { ativo = false; };
  }, [wikidata]);

  return wikidata ? cache.get(wikidata) ?? null : null;
}
