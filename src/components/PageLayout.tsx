
import { ReactNode } from "react";
import { Navbar } from "@/components/Navbar";

interface PageLayoutProps {
  children: ReactNode;
  title?: string;
}

export function PageLayout({ children, title }: PageLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />
      
      <main className="flex-1 container py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6">
          {title && <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>}
          {children}
        </div>
      </main>
    </div>
  );
}
