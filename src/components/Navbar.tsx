
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bell, Search, Menu, X, Users } from "lucide-react";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="border-b bg-white sticky top-0 z-10">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <a href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
              <span className="text-white font-bold">CT</span>
            </div>
            <span className="hidden md:block text-xl font-bold">CornTab</span>
          </a>
        </div>
        
        <div className="hidden md:flex items-center gap-6">
          <nav className="flex items-center gap-4">
            <a href="/" className="text-sm font-medium text-foreground">Dashboard</a>
            <a href="/jobs" className="text-sm font-medium text-muted-foreground hover:text-foreground">Jobs</a>
            <a href="/logs" className="text-sm font-medium text-muted-foreground hover:text-foreground">Logs</a>
            <a href="/users" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>Users</span>
              </div>
            </a>
            <a href="/settings" className="text-sm font-medium text-muted-foreground hover:text-foreground">Settings</a>
          </nav>
        </div>
        
        <div className="flex items-center gap-4">
          <form className="hidden md:block">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search jobs..."
                className="w-48 lg:w-64 pl-8 bg-background"
              />
            </div>
          </form>
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      {isMenuOpen && (
        <div className="md:hidden border-t p-4">
          <nav className="grid gap-2">
            <a href="/" className="flex items-center gap-2 p-2 text-foreground rounded-md hover:bg-accent">
              Dashboard
            </a>
            <a href="/jobs" className="flex items-center gap-2 p-2 text-muted-foreground rounded-md hover:bg-accent hover:text-foreground">
              Jobs
            </a>
            <a href="/logs" className="flex items-center gap-2 p-2 text-muted-foreground rounded-md hover:bg-accent hover:text-foreground">
              Logs
            </a>
            <a href="/users" className="flex items-center gap-2 p-2 text-muted-foreground rounded-md hover:bg-accent hover:text-foreground">
              <Users className="h-4 w-4 mr-1" />
              Users
            </a>
            <a href="/settings" className="flex items-center gap-2 p-2 text-muted-foreground rounded-md hover:bg-accent hover:text-foreground">
              Settings
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
