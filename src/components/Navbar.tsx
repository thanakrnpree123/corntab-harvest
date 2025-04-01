
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bell, Search, Menu, X, Users, Layout, FileText, Settings } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="border-b bg-white sticky top-0 z-10">
      <div className="container flex h-14 items-center px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 mr-4">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
          <Link to="/" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-sm">CT</span>
            </div>
            <span className="hidden md:block text-lg font-medium">CronTab</span>
          </Link>
        </div>
        
        <div className="hidden md:flex items-center space-x-1 flex-1">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <Link to="/">
                  <NavigationMenuLink 
                    className={cn(
                      navigationMenuTriggerStyle(), 
                      "px-3 py-1 h-9",
                      isActive("/") && "bg-accent text-accent-foreground"
                    )}
                  >
                    <Layout className="h-4 w-4 mr-2" />
                    <span className="text-sm">Dashboard</span>
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link to="/jobs">
                  <NavigationMenuLink 
                    className={cn(
                      navigationMenuTriggerStyle(), 
                      "px-3 py-1 h-9",
                      isActive("/jobs") && "bg-accent text-accent-foreground"
                    )}
                  >
                    <span className="text-sm">Jobs</span>
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link to="/logs">
                  <NavigationMenuLink 
                    className={cn(
                      navigationMenuTriggerStyle(), 
                      "px-3 py-1 h-9",
                      isActive("/logs") && "bg-accent text-accent-foreground"
                    )}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    <span className="text-sm">Logs</span>
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link to="/users">
                  <NavigationMenuLink 
                    className={cn(
                      navigationMenuTriggerStyle(), 
                      "px-3 py-1 h-9",
                      isActive("/users") && "bg-accent text-accent-foreground"
                    )}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    <span className="text-sm">Users</span>
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link to="/settings">
                  <NavigationMenuLink 
                    className={cn(
                      navigationMenuTriggerStyle(), 
                      "px-3 py-1 h-9",
                      isActive("/settings") && "bg-accent text-accent-foreground"
                    )}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    <span className="text-sm">Settings</span>
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        
        <div className="flex items-center gap-4">
          <form className="hidden md:block">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                className="w-44 pl-8 bg-background h-9 text-sm"
              />
            </div>
          </form>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Bell className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {isMenuOpen && (
        <div className="md:hidden border-t p-4">
          <nav className="grid gap-2">
            <Link 
              to="/" 
              className={cn(
                "flex items-center gap-2 p-2 rounded-md hover:bg-accent hover:text-accent-foreground",
                isActive("/") ? "bg-accent text-accent-foreground" : "text-foreground"
              )}
              onClick={() => setIsMenuOpen(false)}
            >
              <Layout className="h-4 w-4" />
              Dashboard
            </Link>
            <Link 
              to="/jobs" 
              className={cn(
                "flex items-center gap-2 p-2 rounded-md hover:bg-accent hover:text-accent-foreground",
                isActive("/jobs") ? "bg-accent text-accent-foreground" : "text-muted-foreground"
              )}
              onClick={() => setIsMenuOpen(false)}
            >
              Jobs
            </Link>
            <Link 
              to="/logs" 
              className={cn(
                "flex items-center gap-2 p-2 rounded-md hover:bg-accent hover:text-accent-foreground",
                isActive("/logs") ? "bg-accent text-accent-foreground" : "text-muted-foreground"
              )}
              onClick={() => setIsMenuOpen(false)}
            >
              <FileText className="h-4 w-4 mr-1" />
              Logs
            </Link>
            <Link 
              to="/users" 
              className={cn(
                "flex items-center gap-2 p-2 rounded-md hover:bg-accent hover:text-accent-foreground",
                isActive("/users") ? "bg-accent text-accent-foreground" : "text-muted-foreground"
              )}
              onClick={() => setIsMenuOpen(false)}
            >
              <Users className="h-4 w-4 mr-1" />
              Users
            </Link>
            <Link 
              to="/settings" 
              className={cn(
                "flex items-center gap-2 p-2 rounded-md hover:bg-accent hover:text-accent-foreground",
                isActive("/settings") ? "bg-accent text-accent-foreground" : "text-muted-foreground"
              )}
              onClick={() => setIsMenuOpen(false)}
            >
              <Settings className="h-4 w-4 mr-1" />
              Settings
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
