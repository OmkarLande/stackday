'use client';

import { useRouter } from 'next/navigation';
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
import { User } from 'lucide-react';

export interface HeaderProps {
  userName?: string;
  email?: string;
}

export function Header({ userName = 'User', email = '' }: HeaderProps) {
  const router = useRouter();

  const handleLogout = async () => {
    const result = await logoutAction();
    if (result.success) {
      toast.success('Logged out successfully');
      router.push('/auth/login');
    } else {
      toast.error('Logout failed');
    }
  };

  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">Stackday</h1>
        </Link>

        <nav className="flex items-center gap-2">
          <Link href="/" className="text-sm hover:text-primary">
            Today
          </Link>
          <Link href="/goals" className="text-sm hover:text-primary">
            Goals
          </Link>
          <Link href="/plan" className="text-sm hover:text-primary">
            Plan
          </Link>
          <Link href="/logs" className="text-sm hover:text-primary">
            Logs
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{userName}</DropdownMenuLabel>
              <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                {email}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </div>
    </header>
  );
}
