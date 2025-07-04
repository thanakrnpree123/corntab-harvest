import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { MenuIcon, User, Settings, LogOut, Icon, AlarmClock } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from './LanguageSwitcher';

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        setUser(userData);
      } catch (e) {
        console.error("Error parsing user data", e);
      }
    }
  }, []);

  const navLinks = [
    { name: t('common.dashboard'), href: "/" },
    { name: t('common.jobs'), href: "/jobs" },
    { name: t('common.logs'), href: "/logs" },
    { name: t('common.users'), href: "/users" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("user");
    toast({
      title: t('common.logout'),
      description: "คุณได้ออกจากระบบแล้ว",
    });
    navigate("/login");
  };

  return (
    <header className="border-b">
      <div className="container flex h-14 items-center">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl">
          <AlarmClock className="h-6 w-6" />
          <span>CornTab</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-4 lg:space-x-6 mt-[0.45%] ml-[1%]">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="outline" size="icon">
              <MenuIcon className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[240px] sm:w-[300px]">
            <nav className="flex flex-col space-y-4 mt-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="text-sm font-medium transition-colors hover:text-primary"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>

        <div className="flex items-center ml-auto space-x-4">
          <LanguageSwitcher />
          
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="rounded-full h-8 w-8 p-0">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} alt={user.name} />
                    <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/users")}>
                  <User className="mr-2 h-4 w-4" />
                  <span>{t('common.profile')}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/settings")}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>{t('common.settings')}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{t('common.logout')}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
