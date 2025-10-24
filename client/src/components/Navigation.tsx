import { Link, useLocation } from "wouter";
import { BarChart3, Database, Lightbulb, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navigation() {
  const [location] = useLocation();

  const navItems = [
    { path: "/", label: "Dashboard", icon: Activity },
    { path: "/explorer", label: "Data Explorer", icon: Database },
    { path: "/insights", label: "Insights", icon: Lightbulb },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-8 max-w-7xl">
        <div className="flex h-16 items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-3 hover-elevate rounded-lg px-3 py-2 -ml-3 transition-all cursor-pointer" data-testid="link-home">
              <BarChart3 className="h-6 w-6 text-primary" />
              <div className="flex flex-col">
                <span className="font-bold text-lg leading-none">NYC Taxi Explorer</span>
                <span className="text-xs text-muted-foreground leading-none mt-0.5">Urban Mobility Analytics</span>
              </div>
            </div>
          </Link>

          <nav className="flex items-center gap-2">
            {navItems.map((item) => {
              const isActive = location === item.path;
              const Icon = item.icon;
              
              return (
                <Link key={item.path} href={item.path}>
                  <div className={`inline-flex items-center justify-center gap-2 h-10 px-4 rounded-md font-medium transition-all cursor-pointer ${isActive ? 'bg-secondary text-secondary-foreground' : 'bg-transparent hover-elevate active-elevate-2'}`} data-testid={`nav-${item.label.toLowerCase().replace(/\s/g, '-')}`}>
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
