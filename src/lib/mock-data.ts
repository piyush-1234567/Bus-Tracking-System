
import type { Route, Bus, LatLng, Waypoint } from "@/lib/types";

// Helper function to create a simple path between waypoints
const createPath = (waypoints: LatLng[]): LatLng[] => {
  const path: LatLng[] = [];
  if (waypoints.length < 2) return waypoints;

  for (let i = 0; i < waypoints.length - 1; i++) {
    const start = waypoints[i];
    const end = waypoints[i + 1];
    
    // Add 10 interpolated points for each segment for a smoother line
    for (let j = 0; j <= 10; j++) {
      const lat = start.lat + (end.lat - start.lat) * (j / 10);
      const lng = start.lng + (end.lng - start.lng) * (j / 10);
      path.push({ lat, lng });
    }
  }
  return path;
};

// Data derived from user-provided datasets
const stopData: { [key: number]: Waypoint } = {
  0: { lat: 28.851958, lng: 77.088107, name: "Narela Terminal" },
  1: { lat: 28.853311, lng: 77.088548, name: "Police Station Narela" },
  2: { lat: 28.854965, lng: 77.089322, name: "Safiyabad Crossing" },
  3: { lat: 28.857713, lng: 77.092846, name: "Ramdev Chowk / Pitori Johad" },
  4: { lat: 28.857684, lng: 77.097117, name: "Narela A-6 / CPJ College" },
  5: { lat: 28.854724, lng: 77.097933, name: "State Bank Of Allahbad" },
  6: { lat: 28.851769, lng: 77.097906, name: "Sec A-9 Narela" },
  7: { lat: 28.851771, lng: 77.097849, name: "Narela Pocket 13 / A-9" },
  8: { lat: 28.848993, lng: 77.098485, name: "Narela Pocket 13 / A-6" },
  9: { lat: 28.840804, lng: 77.10202, name: "Raja Harish Chandra Hospital" },
  10: { lat: 28.837226, lng: 77.098578, name: "Kasturi Ram School" },
  11: { lat: 28.83657, lng: 77.09201, name: "Munim Ji Ka Bagh" },
  12: { lat: 28.838193, lng: 77.091456, name: "New Anaj Mandi" },
  13: { lat: 28.840582, lng: 77.090589, name: "Kurani More" },
  14: { lat: 28.837755, lng: 77.081097, name: "Prem Nagar Narela" },
  15: { lat: 28.83657, lng: 77.079258, name: "Maharaja Agrassen School" },
  16: { lat: 28.833186, lng: 77.077052, name: "Bharat Mata School" },
  17: { lat: 28.825219, lng: 77.069668, name: "Kaushal Devi Netraheen Ashram" },
  18: { lat: 28.819549, lng: 77.06355, name: "Sannoth Crossing / Ghoga Crossing" },
  19: { lat: 28.815434, lng: 77.058213, name: "Delhi Jal Board Bawana" },
  20: { lat: 28.811811, lng: 77.053975, name: "Jain Bekhunth Mandir" },
  21: { lat: 28.807197, lng: 77.048415, name: "Bawana JJ Colony CRPF Camp" },
  23: { lat: 28.758318, lng: 77.148305, name: "Swaroop Nagar GT Road" },
  24: { lat: 28.75027, lng: 77.15075, name: "Libas Pur GT Road" },
  25: { lat: 28.7402, lng: 77.154, name: "Sanjay Gandhi Transport Nagar" },
  26: { lat: 28.735084, lng: 77.155874, name: "Mukarba Chowk" },
  27: { lat: 28.731117, lng: 77.158967, name: "GTK Depot" },
  28: { lat: 28.7257, lng: 77.163, name: "Jahangirpuri GT Road (Metro Station)" },
  29: { lat: 28.721715, lng: 77.166162, name: "Mahindra Park" },
  30: { lat: 28.7206, lng: 77.1671, name: "Sarai Pipal Thala" },
  31: { lat: 28.717467, lng: 77.169917, name: "Adarsh Nagar Metro Station" },
  32: { lat: 28.714415, lng: 77.172422, name: "New Sabzi Mandi" },
  33: { lat: 28.706533222382745, lng: 77.17927958748578, name: "Azadpur Terminal (Bara Bagh Road)" },
  34: { lat: 28.7017, lng: 77.1831, name: "Bara Bagh" },
  35: { lat: 28.6995, lng: 77.1849, name: "Gujranwala Town" },
  36: { lat: 28.6971, lng: 77.1869, name: "Telephone Exchange" },
  37: { lat: 28.6954, lng: 77.1883, name: "State Bank Colony" },
  38: { lat: 28.691, lng: 77.192, name: "Gurudwara Nanak Pyau" },
  39: { lat: 28.6882666666667, lng: 77.1937, name: "Rana Pratap Bagh" },
  40: { lat: 28.6848, lng: 77.1963, name: "Gur Mandi" },
  41: { lat: 28.682832, lng: 77.197614, name: "Roop Nagar / Shakti Nagar (GT Road)" },
};

const busTimeline = [
    { bus: "DL1PC5377", dir: "up", stops: [16, 17, 18, 19, 20, 21, 23, 24, 25, 30, 31, 32, 33, 34, 35, 36, 37] },
    { bus: "DL1PC5392", dir: "up", stops: [16, 17, 18, 19, 20, 21, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37] },
    { bus: "DL1PC5377", dir: "down", stops: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 14, 15, 16, 17, 18, 19, 20, 21, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41] },
    { bus: "DL1PC5392", dir: "down", stops: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 20, 21, 23, 24, 25, 26, 27, 28, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41] },
    { bus: "DL1PC5389", dir: "down", stops: [25, 26, 27, 28, 29, 30, 31, 32, 33, 35, 36, 37, 38, 39, 40, 41] },
    { bus: "DL1PC5377", dir: "up", stops: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 23, 24, 25, 26, 28, 29, 30, 31, 32, 33, 35, 36, 37] },
    { bus: "DL1PC5408", dir: "up", stops: [16, 17, 18, 19, 20, 21, 23, 24, 25, 26, 37] },
    { bus: "DL1PC5389", dir: "up", stops: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37] },
    { bus: "DL1PC5408", dir: "down", stops: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 37, 38, 39, 40, 41] },
    { bus: "DL1PC5392", dir: "up", stops: [1, 2, 3, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37] },
];

const newRoutes: Route[] = busTimeline.map((routeInfo, index) => {
    const waypoints = routeInfo.stops.map(stopId => stopData[stopId]).filter(Boolean) as Waypoint[];
    return {
        id: `${routeInfo.bus.replace(/ /g, '')}-${routeInfo.dir}-${index}`,
        name: `${routeInfo.bus} (${routeInfo.dir})`,
        waypoints: waypoints,
        get path() { return createPath(this.waypoints!) }
    };
});

const newBuses: Bus[] = newRoutes.map((route, index) => ({
    id: 201 + index, // Start IDs after existing ones
    busNumber: route.name.split(' ')[0],
    routeId: route.id,
    location: route.waypoints![0] || { lat: 28.7041, lng: 77.1025 },
    lastUpdatedAt: Date.now(),
    isOffline: Math.random() > 0.8,
    status: "OPERATIONAL",
    pathIndex: 0,
    speedKmph: 0,
    distanceTravelledKm: 0,
}));


// Original Mock Data
const originalRoutes: Route[] = [
  {
    id: "R1",
    name: "Route 101 - University to Downtown",
    waypoints: [
      { lat: 28.7197, lng: 77.1901, name: "University" },
      { lat: 28.7041, lng: 77.2152, name: "City Center" },
      { lat: 28.6882, lng: 77.2190, name: "Downtown" },
    ],
    get path() { return createPath(this.waypoints!) }
  },
  {
    id: "R2",
    name: "Route 22A - West End to Airport",
    waypoints: [
        { lat: 28.6882, lng: 77.1610, name: "West End" },
        { lat: 28.6587, lng: 77.1345, name: "Uptown Mall" },
        { lat: 28.6200, lng: 77.1000, name: "Airport" },
    ],
    get path() { return createPath(this.waypoints!) }
  },
  {
    id: "R3",
    name: "Route 7 - Metro Station to Hospital",
    waypoints: [
        { lat: 28.7257, lng: 77.1630, name: "Metro Station" },
        { lat: 28.7500, lng: 77.1800, name: "Community College" },
        { lat: 28.8408, lng: 77.1020, name: "Hospital" },
    ],
    get path() { return createPath(this.waypoints!) }
  },
];

// Define a polygon for the low network zone for demonstration
export const LOW_NETWORK_ZONE: LatLng[] = [
    { lat: 28.71, lng: 77.17 },
    { lat: 28.73, lng: 77.19 },
    { lat: 28.71, lng: 77.21 },
    { lat: 28.69, lng: 77.19 },
];

const originalBuses: Bus[] = [
  {
    id: 101,
    busNumber: "DL5C1234",
    routeId: "R1",
    location: { lat: 28.7197, lng: 77.1901 },
    lastUpdatedAt: Date.now(),
    isOffline: false,
    status: "OPERATIONAL",
    pathIndex: 0,
    speedKmph: 0,
    distanceTravelledKm: 0,
  },
  {
    id: 102,
    busNumber: "DL8S5678",
    routeId: "R1",
    location: { lat: 28.7041, lng: 77.2152 },
    lastUpdatedAt: Date.now(),
    isOffline: true,
    status: "OPERATIONAL",
    pathIndex: 10,
    speedKmph: 0,
    distanceTravelledKm: 0,
  },
  {
    id: 103,
    busNumber: "DL1A9012",
    routeId: "R2",
    location: { lat: 28.6882, lng: 77.1610 },
    lastUpdatedAt: Date.now(),
    isOffline: false,
    status: "OPERATIONAL",
    pathIndex: 0,
    speedKmph: 0,
    distanceTravelledKm: 0,
  },
   {
    id: 104,
    busNumber: "DL3B3456",
    routeId: "R3",
    location: { lat: 28.7257, lng: 77.1630 },
    lastUpdatedAt: Date.now(),
    isOffline: false,
    status: "OPERATIONAL",
    pathIndex: 0,
    speedKmph: 0,
    distanceTravelledKm: 0,
  },
];


export const ROUTES: Route[] = [...originalRoutes, ...newRoutes];
export const BUSES: Bus[] = [...originalBuses, ...newBuses];
