// Busca de endereços no Nominatim (OpenStreetMap), usado para escolher o ponto de
// partida do roteiro.
//
// Este é o único serviço que não fala com o backend do Trajetto, e por isso não usa o
// cliente compartilhado: aquele cliente anexa o token da sessão em toda requisição, e o
// token não deve sair para um serviço de terceiros.

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

// Exigido pela política de uso do Nominatim: identifica o aplicativo que está consultando.
const USER_AGENT = 'TrajettoApp/1.0 (admin@authserver.com.br)';

// Sem cidade escolhida, a busca fica na Italia (o catalogo comecou por Roma).
const DEFAULT_COUNTRY = 'it';
// Meia largura, em graus, da caixa em volta da cidade escolhida (~25 km).
const CITY_BOX_DEGREES = 0.25;
// Sem limite, uma rede que não responde deixa a busca girando para sempre.
const REQUEST_TIMEOUT_MS = 10000;
const RESULT_LIMIT = 5;

export interface PlaceSuggestion {
  lat: number;
  lng: number;
  /** Endereço completo, para o usuário conferir que achou o lugar certo. */
  displayName: string;
  /** Rua e número, para caber na linha da lista. */
  shortName: string;
}

/** Cidade em volta da qual a busca fica presa. */
export interface SearchArea {
  latitude: number;
  longitude: number;
  /** Código ISO de duas letras. */
  country: string;
}

/**
 * Endereços que combinam com o texto digitado. Lista vazia quando nada é encontrado.
 * Com `area`, só valem endereços em volta da cidade - a partida tem de ser na cidade do roteiro.
 */
export async function searchAddresses(query: string, area?: SearchArea): Promise<PlaceSuggestion[]> {
  const params = new URLSearchParams({
    q: query,
    countrycodes: (area?.country ?? DEFAULT_COUNTRY).toLowerCase(),
    limit: String(RESULT_LIMIT),
    format: 'json',
    addressdetails: '1',
  });
  if (area) {
    const d = CITY_BOX_DEGREES;
    params.set('viewbox', [area.longitude - d, area.latitude + d, area.longitude + d, area.latitude - d].join(','));
    params.set('bounded', '1');
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let data: unknown;
  try {
    const res = await fetch(`${NOMINATIM_URL}?${params}`, {
      headers: {
        'Accept-Language': 'pt-BR,pt;q=0.9',
        'User-Agent': USER_AGENT,
      },
      signal: controller.signal,
    });
    data = await res.json();
  } finally {
    clearTimeout(timer);
  }

  if (!Array.isArray(data)) return [];

  return data.map((item: any) => {
    const addr = item.address ?? {};
    const short =
      addr.road
        ? `${addr.road}${addr.house_number ? ' ' + addr.house_number : ''}${addr.suburb ? ', ' + addr.suburb : ''}`
        : item.display_name.split(',')[0];
    return {
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      displayName: item.display_name,
      shortName: short,
    };
  });
}

export const geocodingService = { searchAddresses };
