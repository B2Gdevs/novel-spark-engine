
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

interface BookCardProps {
  title: string;
  genre: string;
  description: string;
  icon: string;
}

export function BookCard({ title, genre, description, icon }: BookCardProps) {
  return (
    <Card className="bg-zinc-900/50 border-zinc-800 hover:bg-zinc-800/50 transition-colors w-full max-w-md">
      <CardHeader className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{icon}</span>
          <div>
            <h2 className="text-xl font-semibold text-white">{title}</h2>
            <p className="text-sm text-zinc-400">{genre}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-zinc-300 mb-6">{description}</p>
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-zinc-200">Quick Actions:</h3>
          <ul className="space-y-2 text-sm text-zinc-400">
            <li>• Create a new character</li>
            <li>• Generate a chapter outline</li>
            <li>• Resume writing last scene</li>
          </ul>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" variant="secondary">
          Open Book
        </Button>
      </CardFooter>
    </Card>
  );
}
