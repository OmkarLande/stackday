import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Target, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background px-4">
      <div className="flex flex-col items-center max-w-md text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
          <div className="relative bg-green-500 border border-border/50 p-6 rounded-3xl shadow-2xl shadow-primary/10">
            <Target className="h-16 w-16 text-primary" />
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-6xl font-black tracking-tighter text-foreground">404</h1>
          <h2 className="text-2xl font-bold tracking-tight text-foreground/80">Page Not Found</h2>
          <p className="text-muted-foreground font-medium">
            Looks like you've wandered off the path. Don't worry, even the best plans need a little recalibration sometimes.
          </p>
        </div>

        <Link href="/" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto h-12 px-8 rounded-xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
