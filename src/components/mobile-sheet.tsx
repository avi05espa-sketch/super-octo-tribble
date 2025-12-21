
import Link from 'next/link';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import {
  Menu,
  Home,
  User,
  LayoutGrid,
  MessageSquare,
  Heart,
  Settings,
  HelpCircle,
  LogOut,
  LogIn,
  UserPlus
} from 'lucide-react';
import { Logo } from './logo';
import { Separator } from './ui/separator';
import { useUser } from '@/firebase';
import { getAuth, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export function MobileSheet() {
    const { user, loading } = useUser();
    const auth = getAuth();
    const router = useRouter();

  const menuItems = [
    { href: '/', label: 'Inicio', icon: Home, requiresAuth: false },
    { href: user ? `/profile/${user.uid}` : '/auth', label: 'Perfil', icon: User, requiresAuth: true },
    { href: '/account/listings', label: 'Mis Artículos', icon: LayoutGrid, requiresAuth: true },
    { href: '/account/messages', label: 'Mensajes', icon: MessageSquare, requiresAuth: true },
    { href: '/account/favorites', label: 'Favoritos', icon: Heart, requiresAuth: true },
  ];

  const secondaryMenuItems = [
    { href: '/account/settings', label: 'Ajustes', icon: Settings, requiresAuth: true },
    { href: '/help', label: 'Ayuda', icon: HelpCircle, requiresAuth: false },
  ];

  const authMenuItems = [
      { href: '/auth', label: 'Iniciar Sesión', icon: LogIn },
      { href: '/auth?tab=register', label: 'Crear Cuenta', icon: UserPlus },
  ]


  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Abrir menú</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex flex-col w-72 sm:w-80 p-0">
        <SheetHeader className="p-4 border-b">
            <SheetTitle className="sr-only">Menú Principal</SheetTitle>
            <SheetDescription className="sr-only">Navegación principal de la aplicación y opciones de cuenta.</SheetDescription>
            <Logo />
        </SheetHeader>
        <nav className="flex-1 px-2 py-4 space-y-1">
          {menuItems.filter(item => !item.requiresAuth || !!user).map(({ href, label, icon: Icon }) => (
            <SheetClose asChild key={label}>
              <Link href={href} passHref>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-base"
                >
                  <Icon className="mr-4 h-5 w-5" />
                  {label}
                </Button>
              </Link>
            </SheetClose>
          ))}
        </nav>
        <Separator />
        <div className="px-2 py-4 space-y-1">
          {secondaryMenuItems.filter(item => !item.requiresAuth || !!user).map(({ href, label, icon: Icon }) => (
             <SheetClose asChild key={label}>
                <Link href={href} passHref>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-base"
                  >
                    <Icon className="mr-4 h-5 w-5" />
                    {label}
                  </Button>
                </Link>
              </SheetClose>
          ))}
           {user ? (
                 <SheetClose asChild>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-base"
                        onClick={() => {
                            signOut(auth);
                            router.push('/');
                        }}
                    >
                        <LogOut className="mr-4 h-5 w-5" />
                        Cerrar sesión
                    </Button>
                 </SheetClose>
            ) : (
                authMenuItems.map(({ href, label, icon: Icon }) => (
                     <SheetClose asChild key={label}>
                        <Link href={href} passHref>
                        <Button
                            variant="ghost"
                            className="w-full justify-start text-base"
                        >
                            <Icon className="mr-4 h-5 w-5" />
                            {label}
                        </Button>
                        </Link>
                    </SheetClose>
                ))
            )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
