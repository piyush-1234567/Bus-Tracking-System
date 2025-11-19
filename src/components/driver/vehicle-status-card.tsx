
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Wrench, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { LatLng } from "@/lib/types";
import { reportBusStatus } from "@/ai/flows/driver/reportBusStatus";


type VehicleStatus = "OPERATIONAL" | "BROKEN DOWN";

type VehicleStatusCardProps = {
    busId: string;
    location: LatLng | null;
};

export default function VehicleStatusCard({ busId, location }: VehicleStatusCardProps) {
  const [status, setStatus] = useState<VehicleStatus>("OPERATIONAL");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleToggleStatus = async () => {
    if (!location) {
        toast({
            variant: "destructive",
            title: "Location Missing",
            description: "Cannot report status without a valid GPS location.",
        });
        return;
    }

    setIsLoading(true);
    const newStatus: VehicleStatus = status === "OPERATIONAL" ? "BROKEN DOWN" : "OPERATIONAL";
    
    try {
        const result = await reportBusStatus({
            busId: busId,
            status: newStatus,
            location: location,
        });

        if (result.success) {
            setStatus(newStatus);
            toast({
                title: "Status Updated",
                description: `Vehicle status changed to ${newStatus}.`,
            });
        } else {
            throw new Error(result.message);
        }

    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Update Failed",
            description: error.message || "Could not update status. Please try again.",
        });
    } finally {
        setIsLoading(false);
    }
  };

  const isOperational = status === "OPERATIONAL";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            {isOperational ? <ShieldCheck className="h-5 w-5 text-green-500"/> : <Wrench className="h-5 w-5 text-red-500" />}
          Vehicle Status
        </CardTitle>
        <CardDescription>Report vehicle breakdowns or issues.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Current Status:</span>
          <Badge variant={isOperational ? "default" : "destructive"} className={isOperational ? "bg-green-600" : ""}>
            {status}
          </Badge>
        </div>
        <Button 
            onClick={handleToggleStatus}
            variant={isOperational ? "destructive" : "default"}
            className="w-full"
            disabled={isLoading || !location}
        >
            {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : isOperational ? (
                <Wrench className="mr-2 h-4 w-4" />
            ) : (
                <ShieldCheck className="mr-2 h-4 w-4" />
            )}
            {isLoading ? "Updating..." : isOperational ? "Report Breakdown" : "Report as Operational"}
        </Button>
      </CardContent>
    </Card>
  );
}
