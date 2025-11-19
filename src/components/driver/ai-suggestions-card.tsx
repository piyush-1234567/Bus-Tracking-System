
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { BrainCircuit, Lightbulb, CheckCircle2 } from "lucide-react";

const mockSuggestions = [
    {
        shouldUpdate: true,
        reason: "Heavy traffic detected on your route. An update is recommended to maintain accuracy.",
        newEtaMinutes: 25
    },
    {
        shouldUpdate: false,
        reason: "Current ETA is accurate based on stable traffic and clear weather.",
        newEtaMinutes: 0
    },
    {
        shouldUpdate: true,
        reason: "Rainy conditions reported ahead, which may cause slowdowns. Consider adding 5 minutes.",
        newEtaMinutes: 18
    }
];


export default function AiSuggestionsCard({ busId }: { busId: string }) {
  const [suggestion, setSuggestion] = useState<(typeof mockSuggestions)[0] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    // Simulate a network call to fetch suggestions
    const timer = setTimeout(() => {
        // Cycle through mock suggestions based on the busId for variety
        const suggestionToShow = mockSuggestions[parseInt(busId.slice(-1), 10) % mockSuggestions.length];
        setSuggestion(suggestionToShow);
        setIsLoading(false);
    }, 1500); // Simulate a 1.5 second loading time

    return () => clearTimeout(timer);
  }, [busId]);


  if (isLoading) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                <BrainCircuit className="h-5 w-5 text-primary" />
                AI ETA Suggestions
                </CardTitle>
                <CardDescription>Real-time ETA analysis based on traffic and weather.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
            </CardContent>
        </Card>
    )
  }


  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BrainCircuit className="h-5 w-5 text-primary" />
          AI ETA Suggestions
        </CardTitle>
        <CardDescription>Real-time ETA analysis based on traffic and weather.</CardDescription>
      </CardHeader>
      <CardContent>
        {suggestion?.shouldUpdate ? (
            <Alert>
                <Lightbulb className="h-4 w-4"/>
                <AlertTitle>Update Recommended!</AlertTitle>
                <AlertDescription>
                    {suggestion.reason}
                </AlertDescription>
                <div className="mt-4">
                    <Badge>New Suggested ETA: {suggestion.newEtaMinutes} min</Badge>
                </div>
            </Alert>
        ) : (
            <Alert className="border-green-300 text-green-800">
                <CheckCircle2 className="h-4 w-4 text-green-600"/>
                <AlertTitle>ETA is Accurate</AlertTitle>
                <AlertDescription>
                    {suggestion?.reason || "No ETA update needed at this time. Current conditions are stable."}
                </AlertDescription>
            </Alert>
        )}
      </CardContent>
    </Card>
  );
}
