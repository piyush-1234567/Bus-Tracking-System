
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { MapPin, Cpu, Clock, HardHat } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useAuth } from "@/firebase";

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <h1 className="text-xl md:text-2xl font-bold">Sadda <span className="text-primary">Safar</span></h1>
        </div>
        <nav className="flex items-center gap-2 md:gap-4">
          {user ? (
            <Link href="/map" passHref>
              <Button variant="ghost">Live Map</Button>
            </Link>
          ) : (
            <Link href="/login" passHref>
              <Button variant="ghost">Login</Button>
            </Link>
          )}
          <Link href="/admin" passHref>
            <Button variant="ghost">Admin</Button>
          </Link>
          <Link href="/driver/dashboard" passHref>
            <Button>Driver App</Button>
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        <section className="relative w-full h-[60vh] flex items-center justify-center text-center text-white">
          <Image
            src="https://picsum.photos/seed/bus/1200/800"
            alt="Map with a bus route"
            fill
            className="object-cover"
            data-ai-hint="map bus"
          />
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative z-10 p-4">
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight">Welcome to Sadda Safar</h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-primary-foreground/80">
              Real-time local bus tracking with AI-powered predictions. Never miss your bus again.
            </p>
            <div className="mt-8">
              <Link href="/map" passHref>
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  View Live Map
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-20 bg-background">
          <div className="container mx-auto px-4">
            <h3 className="text-3xl font-bold text-center mb-10">Why Choose Sadda Safar?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="text-center bg-card">
                <CardHeader>
                  <div className="mx-auto bg-primary/20 p-3 rounded-full w-max mb-4">
                    <MapPin className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle>Real-time Tracking</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Pinpoint the exact location of your bus on a live map. No more guessing, no more waiting in uncertainty.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card className="text-center bg-card">
                <CardHeader>
                   <div className="mx-auto bg-primary/20 p-3 rounded-full w-max mb-4">
                    <Cpu className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle>AI Predictions</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Our smart AI predicts bus arrival times with high accuracy, even accounting for traffic and delays.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card className="text-center bg-card">
                <CardHeader>
                   <div className="mx-auto bg-primary/20 p-3 rounded-full w-max mb-4">
                    <Clock className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle>Save Time</CardTitle>
                </CardHeader>
                 <CardContent>
                   <CardDescription>
                    Plan your journey better and reduce waiting times. Get alerts and reminders so you can leave just in time.
                  </CardDescription>
                </CardContent>
              </Card>
               <Card className="text-center bg-card">
                <CardHeader>
                   <div className="mx-auto bg-primary/20 p-3 rounded-full w-max mb-4">
                    <HardHat className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle>Driver App</CardTitle>
                </CardHeader>
                 <CardContent>
                   <CardDescription>
                    A dedicated dashboard for drivers to provide live location and status updates, ensuring data accuracy.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <footer className="p-4 border-t border-border text-center text-muted-foreground">
        © {new Date().getFullYear()} Sadda Safar. All rights reserved.
      </footer>
    </div>
  );
}
