import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GridBackground } from "@/components/ui/grid-background";
import { AlertCircle, ArrowLeft } from "lucide-react";

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; error_description?: string }>;
}) {
  const params = await searchParams;
  const error = params.error || "Unknown error";
  const errorDescription = params.error_description || "An authentication error occurred.";

  return (
    <div className="min-h-screen relative flex items-center justify-center">
      <GridBackground />
      
      <div className="relative z-10 w-full max-w-md mx-auto px-4">
        <div className="bg-card border border-border rounded-xl p-8 shadow-2xl text-center">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Authentication Error
          </h1>
          <p className="text-muted-foreground mb-2">
            {errorDescription}
          </p>
          <p className="text-xs text-muted-foreground/60 mb-6">
            Error code: {error}
          </p>
          <div className="flex flex-col gap-3">
            <Link href="/auth/login">
              <Button className="w-full">
                Try again
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="w-full gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
