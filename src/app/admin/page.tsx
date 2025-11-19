
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Line, LineChart, Pie, PieChart, Cell } from "recharts";
import { Bus, Clock, MapPin, Users, WifiOff, Route as RouteIcon, FileBarChart, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BUSES as initialBuses, ROUTES, LOW_NETWORK_ZONE } from "@/lib/mock-data";
import { useState, useMemo, useEffect } from "react";
import type { Bus as BusType, LatLng } from "@/lib/types";

const delayData = [
  { day: 'Mon', delay: 12 },
  { day: 'Tue', delay: 15 },
  { day: 'Wed', delay: 8 },
  { day: 'Thu', delay: 18 },
  { day: 'Fri', delay: 25 },
  { day: 'Sat', delay: 22 },
  { day: 'Sun', delay: 10 },
];

const SIMULATION_INTERVAL = 2000; // 2 seconds

// Helper to check if a point is inside a polygon
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

// Helper to calculate distance for simulation
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

// Helper to simulate delay
const getSimulatedDelay = (bus: BusType) => {
    // Simulate delay based on bus ID for variety and add a random factor for "liveness"
    const baseDelay = (bus.id % 15) + Math.floor(Math.random() * 5);
    if (bus.status === 'BROKEN DOWN') return baseDelay + 15;
    if (bus.isOffline) return baseDelay + 5;
    return baseDelay;
}


export default function AdminDashboard() {

  const [liveBuses, setLiveBuses] = useState<BusType[]>(initialBuses);

  // Simulation effect to move buses
  useEffect(() => {
    const simulation = setInterval(() => {
      setLiveBuses((prevBuses) =>
        prevBuses.map((bus) => {
          const route = ROUTES.find((r) => r.id === bus.routeId);
          if (!route || !route.path || route.path.length === 0 || bus.status === 'BROKEN DOWN') return bus;

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
            isOffline: Math.random() > (isInLowNetworkZone ? 0.7 : 0.95), // Higher chance of offline in zone
          };
        })
      );
    }, SIMULATION_INTERVAL);

    return () => clearInterval(simulation);
  }, []);


  const dashboardData = useMemo(() => {
    const activeBuses = liveBuses.filter(bus => bus.status === 'OPERATIONAL');
    const totalBuses = liveBuses.length;
    const hotspots = liveBuses.filter(bus => isPointInPolygon(bus.location, LOW_NETWORK_ZONE)).length;
    
    const delays = activeBuses.map(getSimulatedDelay);
    const avgDelay = delays.length > 0 ? Math.round(delays.reduce((a, b) => a + b, 0) / delays.length) : 0;
    
    // Simulate passenger load based on route
    const passengerLoads = ROUTES.slice(0, 3).map((route, index) => {
        const busesOnRoute = liveBuses.filter(b => b.routeId === route.id).length;
        return {
            name: route.name.split(' - ')[0], // Shorten name
            value: 60 + (busesOnRoute * 5) + (route.id.charCodeAt(1) % 20) + (Math.floor(Math.random() * 10) - 5),
            fill: `hsl(var(--chart-${index + 1}))`
        }
    });
    const totalLoadValue = passengerLoads.reduce((acc, curr) => acc + curr.value, 0);
    const avgPassengerLoad = passengerLoads.length > 0 ? Math.round(totalLoadValue / (passengerLoads.length * 100) * 100) : 75;


    const busPerformanceData = liveBuses.map(bus => {
        const delay = getSimulatedDelay(bus);
        let statusText = 'On Time';
        let statusColor = 'text-green-400';
        if (bus.status === 'BROKEN DOWN') {
            statusText = 'Broken Down';
            statusColor = 'text-destructive';
        } else if (delay > 15) {
            statusText = 'Major Delay';
            statusColor = 'text-red-500';
        } else if (delay > 5) {
            statusText = 'Slight Delay';
            statusColor = 'text-yellow-400';
        }

        return {
            id: bus.id,
            busNumber: bus.busNumber,
            route: ROUTES.find(r => r.id === bus.routeId)?.name || 'Unknown Route',
            status: statusText,
            delay: `${delay} min`,
            statusColor: statusColor,
            isOffline: bus.isOffline
        }
    });
    
    const trafficCongestion = [
        { level: 'Low', value: 80, fill: 'hsl(var(--chart-2))' },
        { level: 'Medium', value: 55, fill: 'hsl(var(--chart-4))' },
        { level: 'High', value: 30, fill: 'hsl(var(--chart-1))' },
    ];


    return {
        activeBuses: activeBuses.length,
        avgDelay,
        hotspots,
        avgPassengerLoad,
        passengerLoads,
        busPerformanceData,
        trafficCongestion
    }
  }, [liveBuses]);


  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-background/95 backdrop-blur-sm z-10">
        <div className="flex items-center gap-2">
            <div className="bg-primary p-2 rounded-lg">
                <Bus className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold">Sadda Safar <span className="text-primary">Admin</span></h1>
        </div>
         <div className="flex items-center gap-2">
          <Link href="/map" passHref>
            <Button variant="outline">View Live Map</Button>
          </Link>
          <Link href="/" passHref>
            <Button>Public Home</Button>
          </Link>
        </div>
      </header>
      
      <ScrollArea className="flex-1">
        <main className="p-4 md:p-6 lg:p-8 grid gap-8">
            <section>
            <h2 className="text-xl md:text-2xl font-semibold mb-4">Overview</h2>
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Active Buses</CardTitle>
                    <Bus className="w-5 h-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl md:text-3xl font-bold">{dashboardData.activeBuses}</div>
                </CardContent>
                </Card>
                <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Avg. Delay</CardTitle>
                    <Clock className="w-5 h-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl md:text-3xl font-bold">{dashboardData.avgDelay} min</div>
                </CardContent>
                </Card>
                <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Network Hotspots</CardTitle>
                    <MapPin className="w-5 h-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl md:text-3xl font-bold">{dashboardData.hotspots}</div>
                </CardContent>
                </Card>
                <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Passenger Load</CardTitle>
                    <Users className="w-5 h-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl md:text-3xl font-bold">{dashboardData.avgPassengerLoad}%</div>
                </CardContent>
                </Card>
            </div>
            </section>

            <section>
            <h2 className="text-xl md:text-2xl font-semibold mb-4">Performance Metrics</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle>Delay Trends</CardTitle>
                            <CardDescription>Last 7 Days (Simulated)</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={{}} className="h-[250px] w-full">
                    <LineChart data={delayData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border)/0.5)" />
                        <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                        <YAxis tickLine={false} axisLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                        <ChartTooltip 
                            content={<ChartTooltipContent indicator="dot" />}
                            cursor={{stroke: 'hsl(var(--primary))', strokeWidth: 2, strokeDasharray: '3 3'}}
                        />
                        <Line type="monotone" dataKey="delay" stroke="hsl(var(--chart-2))" strokeWidth={3} dot={false} />
                    </LineChart>
                    </ChartContainer>
                </CardContent>
                </Card>
                <Card>
                <CardHeader>
                    <CardTitle>Traffic Congestion</CardTitle>
                    <CardDescription>Current network status (Simulated)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-2">
                    {dashboardData.trafficCongestion.map(item => (
                        <div key={item.level}>
                            <div className="flex justify-between text-sm mb-1">
                                <span>{item.level}</span>
                                <span className="font-semibold">{item.value}%</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2.5">
                                <div className="h-2.5 rounded-full" style={{ width: `${item.value}%`, backgroundColor: item.fill }}></div>
                            </div>
                        </div>
                    ))}
                </CardContent>
                </Card>
            </div>
            </section>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Passenger Load</CardTitle>
                        <CardDescription>By popular routes</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col md:flex-row items-center gap-4">
                        <div className="relative flex items-center justify-center flex-shrink-0">
                            <ChartContainer config={{}} className="h-[150px] w-[150px]">
                                <PieChart>
                                    <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                                    <Pie 
                                        data={dashboardData.passengerLoads} 
                                        dataKey="value" 
                                        nameKey="name"
                                        cx="50%" 
                                        cy="50%" 
                                        innerRadius={50} 
                                        outerRadius={70}
                                        stroke="hsl(var(--background))"
                                        strokeWidth={3}
                                    >
                                        {dashboardData.passengerLoads.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ChartContainer>
                            <div className="absolute flex flex-col items-center justify-center">
                                <span className="text-3xl font-bold">{dashboardData.avgPassengerLoad}%</span>
                                <span className="text-xs text-muted-foreground">Avg Load</span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 text-sm w-full">
                            {dashboardData.passengerLoads.map((item) => (
                                <div key={item.name} className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full" style={{backgroundColor: item.fill}}></span>
                                    <span>{item.name} ({item.value}%)</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Bus-wise Performance</CardTitle>
                        <CardDescription>Live status of all buses</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <ScrollArea className="h-[300px]">
                            <div className="space-y-1 pr-4">
                                {dashboardData.busPerformanceData.map((bus) => (
                                    <Link key={bus.id} href={`/map?busId=${bus.id}`} passHref>
                                        <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="bg-muted p-3 rounded-full">
                                                    <Bus className="w-5 h-5 text-muted-foreground" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold">{bus.busNumber}</p>
                                                    <p className="text-sm text-muted-foreground truncate max-w-[200px]">{bus.route}</p>
                                                </div>
                                            </div>
                                            <div className="text-right flex items-center gap-3">
                                                {bus.isOffline && <WifiOff className="w-4 h-4 text-yellow-400" title="Bus is offline" />}
                                                <div>
                                                    <p className="font-semibold">{bus.delay}</p>
                                                    <p className={`text-sm ${bus.statusColor}`}>{bus.status}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>
        </main>
      </ScrollArea>

       <footer className="flex items-center justify-around p-2 border-t border-border bg-background sticky bottom-0 md:hidden">
            <Button variant="ghost" className="flex flex-col h-auto items-center gap-1 text-primary">
                <LayoutGrid className="w-5 h-5" />
                <span className="text-xs">Overview</span>
            </Button>
            <Link href="/map" passHref>
                <Button variant="ghost" className="flex flex-col h-auto items-center gap-1 text-muted-foreground">
                    <Bus className="w-5 h-5" />
                    <span className="text-xs">Buses</span>
                </Button>
            </Link>
            <Button variant="ghost" className="flex flex-col h-auto items-center gap-1 text-muted-foreground">
                <Clock className="w-5 h-5" />
                <span className="text-xs">Delays</span>
            </Button>
            <Button variant="ghost" className="flex flex-col h-auto items-center gap-1 text-muted-foreground">
                <RouteIcon className="w-5 h-5" />
                <span className="text-xs">Routes</span>
            </Button>
            <Button variant="ghost" className="flex flex-col h-auto items-center gap-1 text-muted-foreground">
                <FileBarChart className="w-5 h-5" />
                <span className="text-xs">Reports</span>
            </Button>
        </footer>
    </div>
  );
}

    