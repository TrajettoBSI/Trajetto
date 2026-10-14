import { api } from './api';

type Route = {
    origin: any,
    destination: any,
    waypoints?: any[],
}

export type Coordinate = { lat: number; lng: number };
export type TravelMode = 'WALK' | 'CAR' | 'TRANSIT';

export type DirectionsStep = { instruction: string; distance: number; duration: number };

export type DirectionsOption = {
    mode: TravelMode;
    distance: number;
    duration: number;
    estimated: boolean;
    geometry: string | null;
    steps: DirectionsStep[];
};

export type Directions = {
    walking: DirectionsOption;
    driving: DirectionsOption;
    transit: DirectionsOption | null;
    recommended: TravelMode;
};

export class RouteService {
    static async getRoute(route: Route) {
        const response = await api.post('/route', route)

        return response.data;
    }

    /** A pe, de carro e de transporte publico entre dois pontos, com a opcao recomendada. */
    static async getDirections(origin: Coordinate, destination: Coordinate, language: string, hour: number): Promise<Directions> {
        const response = await api.post('/route/directions', { origin, destination, language, hour });
        return response.data;
    }
}
