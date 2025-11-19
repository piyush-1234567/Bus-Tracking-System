
"use client";

import type { Bus, Route, LatLng } from '@/lib/types';
import { Button } from './ui/button';
import { ArrowLeft, Clock, Bus as BusIcon, TrendingUp, Gauge, WifiOff, MessageSquareText, ShieldCheck, Wrench } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { cn } from '@/lib/utils';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { sendSmsNotification } from '@/ai/flows/send-sms-notification';


type BusDetailSheetProps = {
    bus: Bus;
    route: Route;
    onClose: () => void;
    userPhoneNumber: string;
};

// Mock stops for demonstration
const STOPS = [
    "University",
    "Library",
    "City Center",
    "Train Station",
    "Downtown",
    "West End",
    "Uptown Mall",
    "Hospital",
    "Community College",
    "Airport"
];

// Function to generate a mock timeline
const generateTimeline = (route: Route, currentBusStopIndex: number) => {
    const stopsOnRoute = route.waypoints.map((wp, index) => ({
        name: wp.name || STOPS[index % STOPS.length], // Use waypoint name or fallback to mock
        lat: wp.lat,
        lng: wp.lng
    }));

    const now = new Date();
    const timeline = stopsOnRoute.map((stop, index) => {
        const isCurrent = index === currentBusStopIndex;
        const isPast = index < currentBusStopIndex;
        let time = new Date(now);
        if (!isPast) {
            const timeOffset = (index - currentBusStopIndex) * 15; // 15 mins per stop
            time.setMinutes(now.getMinutes() + timeOffset);
        } else {
             const timeOffset = (currentBusStopIndex - index) * 15;
             time.setMinutes(now.getMinutes() - timeOffset);
        }

        return {
            name: stop.name,
            time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'}),
            status: isCurrent ? 'Arrived' : isPast ? 'Departed' : 'ETA',
            isCurrent,
            isPast
        };
    });
    return timeline;
};


export default function BusDetailSheet({ bus, route, onClose, userPhoneNumber }: BusDetailSheetProps) {
    const { toast } = useToast();
    const [isSendingSms, setIsSendingSms] = useState(false);
    const [localBusStatus, setLocalBusStatus] = useState(bus.status);

    useEffect(() => {
        setLocalBusStatus(bus.status);
    }, [bus.status, bus.id]);

    const handleStatusToggle = () => {
        setLocalBusStatus(prevStatus => prevStatus === 'OPERATIONAL' ? 'BROKEN DOWN' : 'OPERATIONAL');
    };
    
    // Find the closest waypoint to the bus's current location to determine the "current stop"
    const currentStopIndex = route.waypoints.reduce((closestIndex, waypoint, currentIndex) => {
        const d1 = Math.sqrt(Math.pow(bus.location.lat - waypoint.lat, 2) + Math.pow(bus.location.lng - waypoint.lng, 2));
        const d2 = Math.sqrt(Math.pow(bus.location.lat - route.waypoints[closestIndex].lat, 2) + Math.pow(bus.location.lng - route.waypoints[closestIndex].lng, 2));
        return d1 < d2 ? currentIndex : closestIndex;
    }, 0);

    const timeline = generateTimeline(route, currentStopIndex);
    
    const remainingPathPoints = route.path.length - bus.pathIndex;
    const busEta = Math.max(1, Math.round(remainingPathPoints / 4));

    const handleSendSms = async () => {
        if (!userPhoneNumber) {
            toast({
                variant: 'destructive',
                title: "Phone Number Required",
                description: "Please enter your phone number in the sidebar and click save.",
            });
            return;
        }

        setIsSendingSms(true);
        toast({
            title: "Sending SMS...",
            description: `Requesting SMS for bus ${bus.busNumber} to be sent to ${userPhoneNumber}.`
        });

        const currentStop = timeline[currentStopIndex];
        const stopName = currentStop?.name || "an unknown location";

        try {
            const result = await sendSmsNotification({
                busNumber: bus.busNumber,
                location: bus.location,
                toPhoneNumber: userPhoneNumber,
                stopName: stopName,
            });
            toast({
                title: "SMS Sent!",
                description: result.status,
            });
        } catch (error: any) {
            console.error("Error sending SMS:", error);
            toast({
                variant: 'destructive',
                title: "SMS Failed",
                description: error.message || "Could not send SMS. Please check the console and your Twilio setup.",
                duration: 9000,
            });
        } finally {
            setIsSendingSms(false);
        }
    }
    
    const isOperational = localBusStatus === 'OPERATIONAL';

    return (
        <div className="h-full w-full bg-background text-foreground flex flex-col">
            <header className="flex items-center justify-between p-4 border-b border-border">
                <Button variant="ghost" size="icon" onClick={onClose}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex items-center gap-2">
                    <h1 className="text-lg font-bold">Sadda <span className="text-primary">Safar</span></h1>
                </div>
                 <div className="w-10"></div>
            </header>

            <div className="p-4 space-y-4">
                <div className="flex items-start justify-between">
                    <div>
                        <h2 className="text-2xl font-bold">{bus.busNumber}</h2>
                         <p className="text-sm text-primary font-semibold">
                            ETA: {busEta} min
                        </p>
                        <div className="flex flex-col gap-1 mt-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <Gauge className="w-4 h-4" />
                                <span>Speed: {bus.speedKmph || 0} km/h</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <TrendingUp className="w-4 h-4" />
                                <span>Distance: {(bus.distanceTravelledKm || 0).toFixed(2)} km</span>
                            </div>
                             <div 
                                className={cn("flex items-center gap-2 cursor-pointer", isOperational ? "text-green-400" : "text-destructive")}
                                onClick={handleStatusToggle}
                             >
                                {isOperational ? <ShieldCheck className="w-4 h-4" /> : <Wrench className="w-4 h-4" />}
                                <span>Vehicle Status: {localBusStatus}</span>
                            </div>
                            {bus.isInLowNetworkZone && (
                                <div className="flex items-center gap-2 text-yellow-400">
                                    <WifiOff className="w-4 h-4" />
                                    <span>In Low Network Zone</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                        <Label htmlFor="passenger-load">Passenger Load</Label>
                        <Switch id="passenger-load" checked={true} className="data-[state=checked]:bg-primary" />
                    </div>
                </div>
            </div>

            <ScrollArea className="flex-1 px-4">
                <div className="relative pl-6">
                    <div className="absolute left-9 top-0 w-0.5 h-full bg-border -translate-x-1/2"></div>
                    
                    {timeline.map((item, index) => (
                        <div key={index} className="flex items-start gap-4 py-3">
                            <div className="z-10 flex-shrink-0">
                                {item.isCurrent ? (
                                    <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary">
                                        <BusIcon className="h-4 w-4 text-primary-foreground" />
                                    </div>
                                ) : (
                                    <div className={cn("flex items-center justify-center h-6 w-6 rounded-full", item.isPast ? 'bg-muted' : 'bg-background border-2 border-primary')}>
                                        <Clock className={cn("h-4 w-4", item.isPast ? "text-muted-foreground" : "text-primary")} />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1">
                                <p className={cn("font-semibold", item.isCurrent ? "text-primary" : "text-foreground")}>{item.name}</p>
                                <p className="text-sm text-muted-foreground">
                                    {item.status}: {item.time}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>
            
            <footer className="p-4 border-t border-border grid grid-cols-1 gap-4">
                 {bus.isInLowNetworkZone && (
                    <Button onClick={handleSendSms} disabled={isSendingSms}>
                        <MessageSquareText className="mr-2 h-4 w-4" />
                        {isSendingSms ? 'Sending SMS...' : 'Send Location via SMS'}
                    </Button>
                )}
                <Button variant="outline" onClick={onClose}>Back to Map</Button>
            </footer>
        </div>
    );
}
