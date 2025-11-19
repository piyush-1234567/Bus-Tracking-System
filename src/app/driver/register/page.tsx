
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { register } from "./actions";

export default function DriverRegisterPage() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Driver Registration</CardTitle>
        <CardDescription>
          Create a new account to start tracking your bus.
        </CardDescription>
      </CardHeader>
      <form action={register}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="busId">Bus ID</Label>
            <Input
              id="busId"
              name="busId"
              type="text"
              placeholder="e.g., DL5C1234"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full">
            Create Account
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            Already have an account?{" "}
            <Link href="/driver/login" className="underline hover:text-primary">
              Login here
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
