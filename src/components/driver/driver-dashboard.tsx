
"use client";

import { Button } from "@/components/ui/button";
import { Bus, LogOut } from "lucide-react";
import GpsStatusCard from "@/components/driver/gps-status-card";
import DataSyncCard from "@/components/driver/data-sync-card";
import VehicleStatusCard from "@/components/driver/vehicle-status-card";
import AiSuggestionsCard from "@/components/driver/ai-suggestions-card";
import { useState } from "react";
import type { LatLng } from "@/lib/types";
import { logout } from "@/app/driver/dashboard/actions";

export default function DriverDashboard({ busId }: { busId: string }) {
  const [location, setLocation] = useState<LatLng | null>(null);

  return (
    <div className="flex flex-col w-full min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 flex items-center justify-between p-4 border-b bg-card">
        <div className="flex items-center gap-3">
          <Bus className="h-7 w-7 text-primary" />
          <h1 className="text-xl md:text-2xl font-bold">
            Safar Saathi <span className="font-normal text-muted-foreground">Driver</span>
          </h1>
        </div>
        <form action={logout}>
          <Button type="submit" variant="outline">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </form>
      </header>

      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          <GpsStatusCard busId={busId} onLocationUpdate={setLocation} />
          <DataSyncCard />
          <VehicleStatusCard busId={busId} location={location} />
          <AiSuggestionsCard busId={busId} />
        </div>
      </main>
    </div>
  );
}
