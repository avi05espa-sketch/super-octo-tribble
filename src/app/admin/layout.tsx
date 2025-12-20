
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useFirebase, useUser } from '@/firebase';
import { getUser } from '@/lib/data';
import { Loader2, Home, Settings, Shield, PanelLeft, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/logo';

// Hardcoded Admin UID for development purposes.
const ADMIN_UID = "s0O2t5yTLYh4VnSgxjS13iK1xay1";

function AdminNav() {
    const pathname = usePathname();
    const navItems = [
        { href: '/admin', label: 'Dashboard', icon: Home },
        { href: '/admin/users', label: 'Usuarios', icon: Users },
        { href: '/admin/settings', label: 'Ajustes', icon: Settings },
    ];

    return (
        <nav className="grid items-start gap-2 text-sm font-medium">
            {navItems.map(item => (
                <Link
                    key={item.label}
                    href={item.href}
                    className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                        pathname.startsWith(item.href) && item.href !== '/' && "bg-muted text-primary",
                        pathname === '/' && item.href === '/' && "bg-muted text-primary"
                    )}
                >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                </Link>
            ))}
        </nav>
    );
}


export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { firestore } = useFirebase();
  const { user, loading: authLoading } = useUser();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthorization = async () => {
      if (authLoading) return;
      if (!user) {
        router.replace('/auth');
        return;
      }
      
      if (user.uid === ADMIN_UID) {
        setIsAuthorized(true);
        setLoading(false);
        return;
      }
      
      if (firestore) {
        const userDoc = await getUser(firestore, user.uid);
        if (userDoc && userDoc.role === 'admin') {
          setIsAuthorized(true);
        } else {
          router.replace('/');
        }
      } else {
         router.replace('/');
      }
      setLoading(false);
    };

    checkAuthorization();
  }, [user, authLoading, firestore, router]);

  if (loading || !isAuthorized) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <p className="text-muted-foreground">Verificando autorización...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <aside className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-16 items-center border-b px-6">
            <Link href="/admin" className="flex items-center gap-2 font-semibold">
              <Shield className="h-6 w-6 text-primary" />
              <span>Panel de Admin</span>
            </Link>
          </div>
          <div className="flex-1 overflow-auto py-2">
             <AdminNav />
          </div>
        </div>
      </aside>
      <div className="flex flex-col">
        <header className="flex h-16 items-center gap-4 border-b bg-background px-4 lg:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                <PanelLeft className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col p-0 w-64">
              <div className="flex h-16 items-center border-b px-4">
                 <Link href="/admin" className="flex items-center gap-2 font-semibold">
                  <Shield className="h-6 w-6 text-primary" />
                  <span>Panel de Admin</span>
                </Link>
              </div>
              <nav className="grid gap-2 text-lg font-medium p-4">
                 <AdminNav />
              </nav>
            </SheetContent>
          </Sheet>
          <div className="flex-1">
             <h1 className="font-semibold text-xl">Dashboard</h1>
          </div>
           <Button variant="outline" size="sm" asChild>
             <Link href="/">Volver a la tienda</Link>
           </Button>
        </header>
        <main className="flex-1 bg-muted/20 p-4 md:p-6 lg:p-8">
            {children}
        </main>
      </div>
    </div>
  );
}
