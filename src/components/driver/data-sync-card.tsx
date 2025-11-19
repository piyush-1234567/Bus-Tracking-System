
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Cloud, Wifi, WifiOff, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type SyncStatus = "Awaiting GPS Lock..." | "Syncing data..." | "Synced Successfully" | "Sync Error";

export default function DataSyncCard() {
  const [status, setStatus] = useState<SyncStatus>("Awaiting GPS Lock...");

  useEffect(() => {
    const interval = setInterval(() => {
        // Simulate the sync process for demonstration
        setStatus("Syncing data...");
        setTimeout(() => {
            const success = Math.random() > 0.1; // 90% success rate
            setStatus(success ? "Synced Successfully" : "Sync Error");
        }, 1000);

    }, 5000); // Sync every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    switch(status) {
        case "Synced Successfully": return "bg-green-100 text-green-800";
        case "Sync Error": return "bg-red-100 text-red-800";
        case "Syncing data...": return "bg-blue-100 text-blue-800";
        default: return "bg-yellow-100 text-yellow-800";
    }
  }

  const getStatusIcon = () => {
    switch(status) {
        case "Synced Successfully": return <Wifi className="h-4 w-4" />;
        case "Sync Error": return <WifiOff className="h-4 w-4" />;
        case "Syncing data...": return <Loader2 className="h-4 w-4 animate-spin" />;
        default: return <Loader2 className="h-4 w-4 animate-spin" />;
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cloud className="h-5 w-5 text-primary" />
          Data Synchronization
        </CardTitle>
        <CardDescription>Status of your connection to the main server.</CardDescription>
      </CardHeader>
      <CardContent>
         <div className="flex items-center gap-2">
            <Badge className={getStatusColor()}>
                {getStatusIcon()}
                <span className="ml-2">{status}</span>
            </Badge>
         </div>
      </CardContent>
    </Card>
  );
}
