
"use client";

import type { Bus, LatLng, Route } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Clock, Users, Bus as BusIcon } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";
import { cn } from "@/lib/utils";
import React, { useState, useEffect } from 'react';


type RouteDetailViewProps = {
    route: Route;
    buses: Bus[];
    onSelectBus: (bus: Bus) => void;
};

const getPassengerLoad = (busId: number) => {
    const loads = ['Low', 'Medium', 'High'];
    return loads[busId % 3];
}

const getEta = (route: Route, bus: Bus) => {
    // Calculate a dynamic ETA based on how far along the path the bus is.
    // Each path point represents roughly 15-20 seconds of travel.
    const remainingPathPoints = route.path.length - bus.pathIndex;
    // e.g. 4 points = ~1 minute. Ensure it's at least 1 minute.
    return Math.max(1, Math.round(remainingPathPoints / 4)); 
}

const getNextStopName = (route: Route, bus: Bus) => {
    if (!route.waypoints || route.waypoints.length === 0) return "N/A";
    const nextPathIndex = (bus.pathIndex + 5) % route.path.length; // look a few steps ahead
    const nextPoint = route.path[nextPathIndex];

    let closestStop = route.waypoints[0];
    let minDistance = 99999;

    route.waypoints.forEach(wp => {
        const distance = Math.sqrt(Math.pow(nextPoint.lat - wp.lat, 2) + Math.pow(nextPoint.lng - wp.lng, 2));
        if(distance < minDistance){
            minDistance = distance;
            closestStop = wp;
        }
    });

    return closestStop.name || `Stop ${route.waypoints.indexOf(closestStop) + 1}`;
}


export default function RouteDetailView({ route, buses, onSelectBus }: RouteDetailViewProps) {
  
  const getStatusColor = (busId: number) => {
    const load = getPassengerLoad(busId);
    if(load === 'Low') return 'text-green-400';
    if(load === 'Medium') return 'text-yellow-400';
    return 'text-red-400';
  }

  return (
    <div className="h-full w-full bg-background/80 backdrop-blur-sm text-foreground flex flex-col rounded-t-2xl md:rounded-lg border-t md:border border-border">
        <header className="flex items-center justify-center p-4 border-b border-border flex-shrink-0">
            <div className="flex flex-col items-center">
                <h1 className="text-lg font-bold">{route.name}</h1>
                <p className="text-sm text-muted-foreground">{buses.length} Buses Available</p>
            </div>
        </header>

        <ScrollArea className="flex-1">
            <div className="p-2 md:p-4 space-y-3">
                {buses.map((bus) => (
                    <Card key={bus.id} className="p-3 md:p-4 flex items-center justify-between bg-card hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3 md:gap-4">
                            <BusIcon className="h-8 w-8 text-primary" />
                            <div>
                                <p className="font-bold text-base md:text-lg">{bus.busNumber}</p>
                                <p className="text-xs md:text-sm text-muted-foreground">Next Stop: {getNextStopName(route, bus)}</p>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 md:gap-2">
                             <div className="flex items-center gap-2 text-xs md:text-sm">
                                <Clock className={cn("h-4 w-4", getStatusColor(bus.id))} />
                                <span className={cn("font-semibold", getStatusColor(bus.id))}>
                                   {getEta(route, bus)} min
                                </span>
                             </div>
                             <div className="flex items-center gap-2 text-xs md:text-sm">
                                <Users className={cn("h-4 w-4", getStatusColor(bus.id))} />
                                <span className={cn("font-semibold", getStatusColor(bus.id))}>{getPassengerLoad(bus.id)}</span>
                             </div>
                        </div>
                        <Button onClick={() => onSelectBus(bus)} size="sm" className="bg-primary/20 text-primary hover:bg-primary/30">
                            Track
                        </Button>
                    </Card>
                ))}
                {buses.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">No buses currently active on this route.</p>
                )}
            </div>
        </ScrollArea>
    </div>
  );
}
