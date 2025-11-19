
"use client";

import { BUSES, ROUTES, LOW_NETWORK_ZONE } from "@/lib/mock-data";
import type { Bus, LatLng, Route } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import React, { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from 'next/navigation'
import BusDetailSheet from "@/components/bus-detail-sheet";
import dynamic from 'next/dynamic';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "./ui/button";
import { Menu, Bus as BusIcon, Phone, LocateFixed, Home, Search, Loader2, Shield, Save } from "lucide-react";
import { generateWalkingPath } from "@/ai/flows/generate-walking-path";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { findBusRoute } from "@/ai/flows/find-bus-route";
import { ScrollArea } from "./ui/scroll-area";
import { ThemeToggle } from "./theme-toggle";


const BusMap = dynamic(() => import('@/components/bus-map'), {
  ssr: false,
  loading: () => <div className="flex-1 flex items-center justify-center bg-muted"><p>Loading Map...</p></div>
});

const RouteDetailView = dynamic(() => import('@/components/route-detail-view'), {
    ssr: false,
    loading: () => <div className="absolute bottom-0 left-0 right-0 h-[40%] md:h-auto md:max-h-[50%] z-10 md:left-auto md:w-96 md:bottom-4 md:left-4 rounded-t-lg md:rounded-lg overflow-hidden shadow-lg bg-background/80 backdrop-blur-sm"><div className="flex items-center justify-center h-full">Loading route details...</div></div>
});


const SIMULATION_INTERVAL = 1500; // 1.5 seconds

// Haversine formula to calculate distance between two lat/lng points
const calculateDistance = (point1: LatLng, point2: LatLng) => {
  const R = 6371; // Radius of the Earth in km
  const dLat = (point2.lat - point1.lat) * (Math.PI / 180);
  const dLon = (point2.lng - point1.lng) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(point1.lat * (Math.PI / 180)) *
      Math.cos(point2.lat * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

// Point-in-polygon test to check if a bus is in a zone
const isPointInPolygon = (point: LatLng, polygon: LatLng[]) => {
    let isInside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const xi = polygon[i].lat, yi = polygon[i].lng;
        const xj = polygon[j].lat, yj = polygon[j].lng;

        const intersect = ((yi > point.lng) !== (yj > point.lng))
            && (point.lat < (xj - xi) * (point.lng - yi) / (yj - yi) + xi);
        if (intersect) isInside = !isInside;
    }
    return isInside;
};


function MainPageContent() {
  const [buses, setBuses] = useState<Bus[]>(BUSES);
  const [routes, setRoutes] = useState<Route[]>(ROUTES);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [selectedBusId, setSelectedBusId] = useState<number | null>(null);
  const [userLocation, setUserLocation] = useState<LatLng | null>(null);
  const [walkingPath, setWalkingPath] = useState<LatLng[] | null>(null);
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [isFindingRoute, setIsFindingRoute] = useState(false);
  const [searchedRoute, setSearchedRoute] = useState<{ path: LatLng[], name: string, start: LatLng, end: LatLng} | null>(null);
  const [userPhoneNumber, setUserPhoneNumber] = useState('');

  const { toast } = useToast();
  const searchParams = useSearchParams();

  // Effect to handle selecting a bus from URL query
  useEffect(() => {
    const busId = searchParams.get('busId');
    if (busId) {
      const busToSelect = buses.find(b => b.id === parseInt(busId, 10));
      if (busToSelect) {
        handleSelectBus(busToSelect);
      }
    }
  }, [searchParams, buses]);

  const clearSearch = () => {
    setUserLocation(null);
    setWalkingPath(null);
    setSearchedRoute(null);
  }

  const handleSelectRoute = (routeId: string | null) => {
    setSelectedRouteId(routeId);
    setSelectedBusId(null);
    clearSearch();
    setIsDetailSheetOpen(false);
    setIsSidebarOpen(false); // Close sidebar on mobile when a route is selected
  };

  const handleSelectBus = (bus: Bus | null) => {
    if (bus) {
      setSelectedBusId(bus.id);
      setSelectedRouteId(bus.routeId);
      setIsDetailSheetOpen(true);
    } else {
      setSelectedBusId(null);
      setIsDetailSheetOpen(false);
    }
  };

  const handleFindNearby = () => {
    setIsSidebarOpen(false);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const loc: LatLng = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          clearSearch();
          setUserLocation(loc);
          setSelectedRouteId(null);
          setSelectedBusId(null);
          setIsDetailSheetOpen(false);

          // Find the closest bus
          let closestBus: Bus | null = null;
          let minDistance = Infinity;

          buses.forEach(bus => {
            const distance = calculateDistance(loc, bus.location);
            if (distance < minDistance) {
              minDistance = distance;
              closestBus = bus;
            }
          });

          if (closestBus) {
             toast({
              title: "Location Found",
              description: `Found bus ${closestBus.busNumber} nearby. Generating walking path...`,
            });
            try {
              const { path } = await generateWalkingPath({ start: loc, end: closestBus.location });
              setWalkingPath(path);
               toast({
                title: "Walking Path Generated",
                description: "The walking path to the nearest bus is now on the map.",
              });
            } catch (error) {
              console.error("Error generating walking path:", error);
              // Fallback to a straight line without showing an error toast
              setWalkingPath([loc, closestBus.location]);
            }
          } else {
             toast({
              title: "Location Found",
              description: "No buses are currently nearby.",
            });
          }
        },
        () => {
          toast({
            variant: "destructive",
            title: "Location Error",
            description: "Could not get your location. Please enable location services.",
          });
        }
      );
    } else {
      toast({
        variant: "destructive",
        title: "Location Error",
        description: "Geolocation is not supported by your browser.",
      });
    }
  };

  const handleSearchRoute = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!fromLocation || !toLocation) {
          toast({
              variant: "destructive",
              title: "Missing Information",
              description: "Please enter both a 'From' and 'To' location.",
          });
          return;
      }
      setIsFindingRoute(true);
      setIsSidebarOpen(false);
      clearSearch();
      setSelectedRouteId(null);
      setSelectedBusId(null);

      toast({
          title: "Finding Route...",
          description: `Searching for a bus route from ${fromLocation} to ${toLocation}.`,
      });

      try {
        const result = await findBusRoute({ start: fromLocation, end: toLocation });
        setSearchedRoute({
            path: result.path,
            name: result.routeName,
            start: result.startCoords,
            end: result.endCoords
        });
        toast({
            title: "Route Found!",
            description: `Showing route for ${result.routeName}.`,
        });
      } catch (error) {
          console.error("Error finding route:", error);
          toast({
              variant: "destructive",
              title: "Route Not Found",
              description: "We couldn't find a direct bus route for the locations entered.",
          });
      } finally {
        setIsFindingRoute(false);
      }
  }

  const handleSetPhoneNumber = () => {
    if (!userPhoneNumber) {
        toast({
            variant: "destructive",
            title: "Phone Number Missing",
            description: "Please enter a phone number first.",
        });
        return;
    }
    // You could add more validation here if needed (e.g., regex for phone number format)
    toast({
        title: "Phone Number Set",
        description: `SMS notifications will be sent to ${userPhoneNumber}.`,
    });
    setIsSidebarOpen(false); // Close sidebar after setting
  };

  useEffect(() => {
    const simulation = setInterval(() => {
      setBuses((prevBuses) =>
        prevBuses.map((bus) => {
          const route = routes.find((r) => r.id === bus.routeId);
          if (!route || !route.path || route.path.length === 0) return bus;

          const oldLocation = bus.location;
          const newPathIndex = (bus.pathIndex + 1) % route.path.length;
          const newLocation = route.path[newPathIndex];
          
          const distanceIncrement = calculateDistance(oldLocation, newLocation);
          const newTotalDistance = (bus.distanceTravelledKm || 0) + distanceIncrement;

          const speed = distanceIncrement / (SIMULATION_INTERVAL / (1000 * 60 * 60));
          
          const isInLowNetworkZone = isPointInPolygon(newLocation, LOW_NETWORK_ZONE);

          return {
            ...bus,
            location: newLocation,
            pathIndex: newPathIndex,
            lastUpdatedAt: Date.now(),
            speedKmph: Math.round(speed),
            distanceTravelledKm: newTotalDistance,
            isInLowNetworkZone: isInLowNetworkZone,
          };
        })
      );
    }, SIMULATION_INTERVAL);

    return () => clearInterval(simulation);
  }, [routes]);


  const selectedRoute = routes.find(r => r.id === selectedRouteId);
  const busesOnSelectedRoute = buses.filter(b => b.routeId === selectedRouteId);
  
  const liveSelectedBus = buses.find(b => b.id === selectedBusId);

  return (
    <div className="flex h-screen w-full flex-col bg-background">
      <header className="flex h-16 items-center justify-between border-b bg-card px-4 md:px-6">
        <div className="flex items-center gap-2">
            <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open Menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent 
                side="left" 
                className="bg-card text-card-foreground p-0 w-80"
                showOverlay={false}
            >
                <div className="flex h-full flex-col">
                <div className="p-6">
                    <Link href="/" passHref>
                      <h2 className="text-2xl font-bold">Sadda <span className="text-primary">Safar</span></h2>
                    </Link>
                </div>
                <ScrollArea className="flex-1">
                  <nav className="flex-1 space-y-2 p-4">
                      <Link href="/" passHref>
                          <Button variant="ghost" className="w-full justify-start text-base gap-3">
                              <Home className="h-5 w-5" />
                              Home
                          </Button>
                      </Link>
                      <Button variant="ghost" className="w-full justify-start text-base gap-3" onClick={handleFindNearby}>
                        <LocateFixed className="h-5 w-5" />
                        Buses Near You
                      </Button>
                      
                       <div className="!mt-4 pt-4 border-t border-border/50">
                        <p className="px-2 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Your Phone Number</p>
                        <div className="flex gap-2 px-1">
                          <div className="relative flex-grow">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Enter for SMS alerts" 
                                value={userPhoneNumber}
                                onChange={(e) => setUserPhoneNumber(e.target.value)}
                                className="pl-9"
                            />
                          </div>
                          <Button variant="secondary" size="icon" onClick={handleSetPhoneNumber} aria-label="Save phone number">
                            <Save className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="!mt-4 pt-4 border-t border-border/50">
                        <p className="px-2 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Route Finder</p>
                        <form onSubmit={handleSearchRoute} className="space-y-3 px-1">
                            <Input 
                                placeholder="From location" 
                                value={fromLocation}
                                onChange={(e) => setFromLocation(e.target.value)}
                                disabled={isFindingRoute}
                            />
                            <Input 
                                placeholder="To location"
                                value={toLocation}
                                onChange={(e) => setToLocation(e.target.value)}
                                disabled={isFindingRoute}
                            />
                            <Button type="submit" className="w-full" disabled={isFindingRoute}>
                                {isFindingRoute ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Search className="h-4 w-4 mr-2" />
                                )}
                                Find Route
                            </Button>
                        </form>
                      </div>

                      <div className="!mt-4 pt-4 border-t border-border/50">
                          <p className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">All Routes</p>
                          <div className="flex flex-col gap-1 mt-2">
                              {routes.map(route => (
                              <Button 
                                  key={route.id}
                                  variant={selectedRouteId === route.id ? "secondary" : "ghost"}
                                  onClick={() => handleSelectRoute(route.id)}
                                  className="justify-start"
                              >
                                  {route.name}
                              </Button>
                              ))}
                          </div>
                      </div>
                  </nav>
                </ScrollArea>
                </div>
            </SheetContent>
            </Sheet>
            <Link href="/" passHref>
              <h1 className="text-xl font-semibold">Sadda <span className="text-primary">Safar</span></h1>
            </Link>
        </div>
        
        <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/admin" passHref>
                <Button variant="ghost" size="icon">
                    <Shield className="h-6 w-6" />
                    <span className="sr-only">Admin Dashboard</span>
                </Button>
            </Link>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 flex flex-col relative">
          <BusMap
            buses={buses}
            routes={routes}
            selectedRouteId={searchedRoute ? null : selectedRouteId}
            selectedBus={liveSelectedBus || null}
            onSelectBus={handleSelectBus}
            userLocation={userLocation}
            walkingPath={walkingPath}
            searchedRoute={searchedRoute}
            className="flex-1"
          />

          {selectedRoute && !liveSelectedBus && !isDetailSheetOpen &&(
             <div className="absolute bottom-0 left-0 right-0 h-[40%] md:h-auto md:max-h-[50%] z-10 bg-transparent md:left-auto md:w-96 md:bottom-4 md:left-4 md:rounded-lg overflow-hidden">
              <RouteDetailView
                route={selectedRoute}
                buses={busesOnSelectedRoute}
                onSelectBus={handleSelectBus}
              />
            </div>
          )}

           {searchedRoute && (
             <div className="absolute bottom-0 left-0 right-0 h-[40%] md:h-auto md:max-h-[50%] z-10 bg-transparent md:left-auto md:w-96 md:bottom-4 md-left-4 md:rounded-lg overflow-hidden">
              <Card className="h-full w-full bg-background/80 backdrop-blur-sm text-foreground flex flex-col rounded-t-2xl md:rounded-lg border-t md:border border-border">
                <CardHeader>
                    <CardTitle>Route Found</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Showing the best route using <span className="font-bold text-primary">{searchedRoute.name}</span>.</p>
                </CardContent>
              </Card>
            </div>
          )}
          
          <Sheet open={isDetailSheetOpen} onOpenChange={(open) => {
              setIsDetailSheetOpen(open);
              if (!open) {
                handleSelectBus(null);
              }
            }}>
            <SheetContent 
                side="right" 
                className="w-full md:w-96 p-0 bg-background text-foreground border-l border-border"
                showOverlay={false}
                onInteractOutside={(e) => {
                  e.preventDefault();
                  handleSelectBus(null);
                }}
                onEscapeKeyDown={() => handleSelectBus(null)}
            >
              {liveSelectedBus && routes.length > 0 && (
                <BusDetailSheet
                  bus={liveSelectedBus}
                  route={routes.find(r => r.id === liveSelectedBus.routeId)!}
                  onClose={() => handleSelectBus(null)}
                  userPhoneNumber={userPhoneNumber}
                />
              )}
            </SheetContent>
          </Sheet>
        </main>
      </div>
    </div>
  );
}

export default function MainPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MainPageContent />
    </Suspense>
  );
}
