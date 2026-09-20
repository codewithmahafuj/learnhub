"use client";

import * as React from "react";
import { Sidebar } from "./sidebar";
import { Navbar } from "./navbar";
import { MobileNav } from "./mobile-nav";

interface AppShellProps {
  children: React.ReactNode;
  role: "student" | "admin";
}

export function AppShell({ children, role }: AppShellProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const openMobileMenu = () => setIsMobileMenuOpen(true);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <Sidebar role={role} />

      {/* Mobile Sidebar Navigation */}
      <MobileNav
        role={role}
        isOpen={isMobileMenuOpen}
        onClose={closeMobileMenu}
      />

      {/* Main Viewport Container */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <Navbar role={role} onMenuClick={openMobileMenu} />
        
        {/* Scrollable content view */}
        <main className="flex-1 overflow-y-auto flex flex-col">
          {children}
        </main>
      </div>
    </div>
  );
}
