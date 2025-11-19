
"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { MapPin, Wifi, AlertTriangle } from "lucide-react";
import { updateBusLocation } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import type { LatLng } from "@/lib/types";
import { useFirestore } from "@/firebase";

type GpsStatusCardProps = {
  busId: string;
  onLocationUpdate: (location: LatLng | null) => void;
};


export default function GpsStatusCard({ busId, onLocationUpdate }: GpsStatusCardProps) {
  const [location, setLocation] = useState<LatLng | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<"prompt" | "granted" | "denied">("prompt");
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const isUpdating = useRef(false);
  const db = useFirestore();

  useEffect(() => {
    navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        setPermissionStatus(result.state);
    });

    const options: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
    };

    const success = (pos: GeolocationPosition) => {
        const crd = pos.coords;
        const newLocation: LatLng = {
            lat: crd.latitude,
            lng: crd.longitude
        };
        setLocation(newLocation);
        onLocationUpdate(newLocation); // Pass location up to parent
        setError(null);
        if (permissionStatus !== 'granted') {
            setPermissionStatus('granted');
        }
    };

    const errorCallback = (err: GeolocationPositionError) => {
        console.warn(`ERROR(${err.code}): ${err.message}`);
        setError(`Error: ${err.message}`);
        if(err.code === 1) { // PERMISSION_DENIED
            setPermissionStatus('denied');
        }
    };
    
    const watcher = navigator.geolocation.watchPosition(success, errorCallback, options);

    return () => {
        navigator.geolocation.clearWatch(watcher);
    };
  }, [permissionStatus, onLocationUpdate]);
  
  useEffect(() => {
    const updateInterval = setInterval(() => {
      // Only update if we have a location and are not already in the middle of an update
      if (location && !isUpdating.current && db) {
        isUpdating.current = true;
        updateBusLocation(db, busId, location)
          .catch(err => {
            console.error("Firestore update failed:", err);
            toast({
              variant: 'destructive',
              title: 'Sync Error',
              description: 'Failed to update location to the server.'
            });
          })
          .finally(() => {
            isUpdating.current = false;
          });
      }
    }, 5000); // Update every 5 seconds

    return () => clearInterval(updateInterval);
  }, [location, busId, toast, db]);

  const handleRequestPermission = () => {
     navigator.geolocation.getCurrentPosition(
        () => setPermissionStatus('granted'),
        (err) => {
            if (err.code === err.PERMISSION_DENIED) {
                setPermissionStatus('denied');
            }
        }
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          GPS Status
        </CardTitle>
        <CardDescription>Live location tracking for your vehicle.</CardDescription>
      </CardHeader>
      <CardContent>
        {permissionStatus === 'prompt' && (
             <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Location Permission Needed</AlertTitle>
                <AlertDescription>
                   This app needs access to your location to track the bus. 
                   <button onClick={handleRequestPermission} className="font-bold underline pl-1">Grant Permission</button>
                </AlertDescription>
            </Alert>
        )}
         {permissionStatus === 'denied' && (
             <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Permission Denied</AlertTitle>
                <AlertDescription>
                    Location access was denied. Please enable it in your browser settings to use the app.
                </AlertDescription>
            </Alert>
        )}
        {permissionStatus === 'granted' && (
          <div>
            <div className="flex items-center text-green-600 font-medium mb-4">
              <Wifi className="h-4 w-4 mr-2" />
              Tracking Active
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div>
                <span className="font-semibold text-foreground">Latitude:</span>{" "}
                {location ? location.lat.toFixed(6) : "Acquiring..."}
              </div>
              <div>
                <span className="font-semibold text-foreground">Longitude:</span>{" "}
                {location ? location.lng.toFixed(6) : "Acquiring..."}
              </div>
              {error && <p className="text-destructive text-xs pt-2">{error}</p>}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
