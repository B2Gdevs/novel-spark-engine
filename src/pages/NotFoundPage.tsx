
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="text-center space-y-6">
        <div className="h-32 w-32 bg-novel-purple/10 flex items-center justify-center rounded-full mx-auto">
          <span className="text-6xl">✨</span>
        </div>
        <h1 className="text-4xl font-bold text-novel-purple">Page Not Found</h1>
        <p className="text-xl text-muted-foreground max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Button asChild className="bg-novel-purple hover:bg-novel-purple/90">
          <Link to="/">Return Home</Link>
        </Button>
      </div>
    </div>
  );
}
