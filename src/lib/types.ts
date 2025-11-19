
export type LatLng = {
  lat: number;
  lng: number;
};

export type Waypoint = LatLng & {
  name?: string;
};

export type Route = {
  id: string;
  name: string;
  path: LatLng[];
  waypoints?: Waypoint[];
};

export type Bus = {
  id: number;
  busNumber: string;
  routeId: string;
  location: LatLng;
  lastUpdatedAt: number;
  isOffline: boolean;
  pathIndex: number;
  status: "OPERATIONAL" | "BROKEN DOWN";
  predictedLocation?: LatLng;
  confidence?: number;
  passengerLoad?: 'Low' | 'Medium' | 'High';
  speedKmph?: number;
  distanceTravelledKm?: number;
  isInLowNetworkZone?: boolean;
};
