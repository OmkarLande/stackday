'use client';

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { logoutAction } from '@/app/actions/auth';
import { User, Moon, Sun, LayoutDashboard, Target, Calendar, Timer, BookOpen } from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

export interface HeaderProps {
  userName?: string;
  email?: string;
}

export function Header({ userName = 'User', email = '' }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { setTheme, theme } = useTheme();

  const handleLogout = async () => {
    const result = await logoutAction();
    if (result.success) {
      toast.success('Logged out successfully');
      router.push('/auth/login');
    } else {
      toast.error('Logout failed');
    }
  };

  const navItems = [
    { name: 'Today', href: '/', icon: Calendar },
    { name: 'Focus', href: '/focus', icon: Timer },
    { name: 'Goals', href: '/goals', icon: Target },
    { name: 'Plan', href: '/plan', icon: LayoutDashboard },
    { name: 'Logs', href: '/logs', icon: BookOpen },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 h-16">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-green-600 dark:bg-green-500 p-1.5 rounded-lg shadow-lg shadow-green-500/20 group-hover:scale-110 transition-transform duration-300">
            <Target className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-xl font-black tracking-tighter">Stackday</h1>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-2",
                  isActive 
                    ? "bg-green-500/10 text-green-600 dark:text-green-500" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <item.icon className={cn("h-4 w-4", isActive ? "animate-pulse" : "")} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="rounded-full hover:bg-muted transition-colors"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                  <User className="h-4 w-4 text-primary" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2">
              <DropdownMenuLabel className="px-3 pt-3 pb-1">
                <p className="text-sm font-bold leading-none">{userName}</p>
                <p className="text-xs font-medium text-muted-foreground mt-1 truncate">{email}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="my-2" />
              <DropdownMenuItem 
                onClick={handleLogout}
                className="rounded-xl focus:bg-destructive/10 focus:text-destructive cursor-pointer font-semibold"
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
