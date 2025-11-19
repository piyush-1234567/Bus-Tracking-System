
"use client";

import type { Bus, LatLng, Route } from "@/lib/types";
import React, { useMemo, useEffect, useRef } from "react";
import { Search } from "lucide-react";
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { cn } from "@/lib/utils";
import { useMap } from 'react-leaflet';

const busIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/128/3448/3448624.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
});

const userIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
    shadowSize: [41, 41]
});

const predictedBusIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/128/1098/1098422.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
});

const locationIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
});


// A component to programmatically change the map's view
function ChangeView({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom);
  }, [center, zoom, map]);
  return null;
}


type BusMapProps = {
  buses: Bus[];
  routes: Route[];
  selectedRouteId: string | null;
  selectedBus: Bus | null;
  onSelectBus: (bus: Bus | null) => void;
  userLocation: LatLng | null;
  walkingPath: LatLng[] | null;
  searchedRoute: { path: LatLng[], name: string, start: LatLng, end: LatLng } | null;
  className?: string;
};

export default function BusMap({
  buses,
  routes,
  selectedRouteId,
  selectedBus,
  onSelectBus,
  userLocation,
  walkingPath,
  searchedRoute,
  className
}: BusMapProps) {

  const busesToDisplay = useMemo(() => {
    if (userLocation || searchedRoute) {
        return buses; // Show all buses when user location or a search is active
    }
    if (selectedRouteId) {
        return buses.filter(b => b.routeId === selectedRouteId);
    }
    return buses; // Default to showing all buses if no specific filter
  }, [buses, selectedRouteId, userLocation, searchedRoute]);

  const selectedRoute = routes.find((r) => r.id === selectedRouteId);
  
  const routePath = useMemo(() => {
    if (searchedRoute) {
        return searchedRoute.path.map(p => [p.lat, p.lng] as [number, number]);
    }
    if (selectedRoute) {
        return selectedRoute.path.map(p => [p.lat, p.lng] as [number, number]);
    }
    return [];
  }, [searchedRoute, selectedRoute]);


  const center: [number, number] = useMemo(() => {
    if (searchedRoute) {
        return [searchedRoute.start.lat, searchedRoute.start.lng];
    }
    if (selectedBus) {
      return [selectedBus.location.lat, selectedBus.location.lng];
    }
    if (userLocation) {
      return [userLocation.lat, userLocation.lng];
    }
    if (selectedRoute && selectedRoute.path.length > 0) {
      return [selectedRoute.path[0].lat, selectedRoute.path[0].lng];
    }
    return [28.7041, 77.1025]; // Default center (Delhi)
  }, [selectedBus, userLocation, selectedRoute, searchedRoute]);

  const walkingPolyline = useMemo(() => {
    if (walkingPath) {
      return walkingPath.map(p => [p.lat, p.lng] as [number, number]);
    }
    return [];
  }, [walkingPath]);


  return (
    <main className={cn("flex-1 flex flex-col bg-muted/40", className)}>
       <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%', zIndex: 0 }}>
            <ChangeView center={center} zoom={14} />
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {userLocation && (
                <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon} zIndexOffset={1000}>
                    <Popup>You are here</Popup>
                </Marker>
            )}
            {busesToDisplay.map((bus) => (
              <React.Fragment key={bus.id}>
                <Marker 
                    position={[bus.location.lat, bus.location.lng]} 
                    icon={bus.isOffline ? predictedBusIcon : busIcon}
                    eventHandlers={{ click: () => onSelectBus(bus) }}
                    zIndexOffset={1000}
                >
                    <Popup>
                        Bus: {bus.busNumber} <br/>
                        Status: {bus.isOffline ? 'Offline' : 'Live'}
                    </Popup>
                </Marker>
                {bus.predictedLocation && (
                    <Marker 
                        key={`pred-${bus.id}`} 
                        position={[bus.predictedLocation.lat, bus.predictedLocation.lng]} 
                        icon={predictedBusIcon}
                        opacity={bus.confidence ?? 0.7}
                        zIndexOffset={999}
                    >
                        <Popup>
                            Predicted Location for {bus.busNumber} <br/>
                            Confidence: {Math.round((bus.confidence ?? 0) * 100)}%
                        </Popup>
                    </Marker>
                )}
              </React.Fragment>
            ))}

            {searchedRoute && (
                <>
                    <Marker position={[searchedRoute.start.lat, searchedRoute.start.lng]} icon={locationIcon}>
                        <Popup>Starting Point</Popup>
                    </Marker>
                    <Marker position={[searchedRoute.end.lat, searchedRoute.end.lng]} icon={locationIcon}>
                        <Popup>Destination</Popup>
                    </Marker>
                </>
            )}

            {routePath.length > 0 && <Polyline positions={routePath} color="hsl(var(--primary))" weight={5} />}
            {walkingPolyline.length > 0 && <Polyline positions={walkingPolyline} color="hsl(var(--accent))" weight={4} dashArray="5, 5" />}
        </MapContainer>
    </main>
  );
}
