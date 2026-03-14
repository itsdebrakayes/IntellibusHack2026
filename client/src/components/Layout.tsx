import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Shield,
  Sun,
  Moon,
  Bell,
  User,
  LogOut,
  LayoutDashboard,
  Link as LinkIcon,
  Image,
  Video,
  Mic,
  Mail,
  ShieldAlert,
} from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const navLinks = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Link Scanner", path: "/link-scanner", icon: LinkIcon },
  { label: "Image Detection", path: "/image-detection", icon: Image },
  { label: "Video Detection", path: "/video-detection", icon: Video },
  { label: "Audio Detection", path: "/audio-detection", icon: Mic },
  { label: "Email Analysis", path: "/email-analysis", icon: Mail },
  { label: "Breach Check", path: "/breach-check", icon: ShieldAlert },
];

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = () => {
    signOut();
    navigate("/login");
  };
  return (
    <div className="min-h-screen bg-background">
      {/* Ambient color splotches */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full bg-cyber-light-blue/15 blur-[120px] animate-[splotch-drift-1_12s_ease-in-out_infinite]" />
        <div className="absolute -right-24 top-1/4 h-[400px] w-[400px] rounded-full bg-cyber-teal/10 blur-[120px] animate-[splotch-drift-2_15s_ease-in-out_infinite]" />
        <div className="absolute bottom-0 left-1/3 h-[450px] w-[450px] rounded-full bg-cyber-blue/10 blur-[120px] animate-[splotch-drift-3_18s_ease-in-out_infinite]" />
        <div className="absolute -bottom-20 right-1/4 h-[350px] w-[350px] rounded-full bg-cyber-red/10 blur-[100px] animate-[splotch-drift-4_14s_ease-in-out_infinite]" />
      </div>
      {/* Top bar: nav center, actions right */}
      <div className="sticky top-0 z-50 px-4 pt-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          {/* Logo - left */}
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-md">
              <Shield className="h-4.5 w-4.5 text-primary-foreground" />
            </div>
            <span className="hidden font-display text-lg font-bold text-foreground sm:inline">
              CyberShield
            </span>
          </Link>

          {/* Center floating nav pill */}
          <nav className="nav-glass-pill hidden items-center gap-1 rounded-full px-2 py-1.5 md:flex">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              const Icon = link.icon;
              return (
                <Tooltip key={link.path}>
                  <TooltipTrigger asChild>
                    <Link
                      to={link.path}
                      className="relative flex h-9 w-9 items-center justify-center rounded-full transition-colors"
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeNav"
                          className="absolute inset-0 rounded-full bg-foreground/8 dark:bg-white/10"
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                      )}
                      <Icon
                        className={`relative z-10 h-[18px] w-[18px] transition-colors ${
                          isActive
                            ? "text-foreground"
                            : "text-muted-foreground/60 hover:text-foreground/80"
                        }`}
                      />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs">
                    {link.label}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="icon"
              className="relative h-9 w-9 rounded-full text-muted-foreground hover:text-foreground"
            >
              <Bell className="h-[18px] w-[18px]" />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-cyber-red" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground"
                >
                  <User className="h-[18px] w-[18px]" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {user && (
                  <div className="px-2 py-1.5 text-xs text-muted-foreground border-b border-border mb-1">
                    <div className="font-medium text-foreground">{user.fullName}</div>
                    <div>{user.email}</div>
                  </div>
                )}
                <DropdownMenuItem asChild>
                  <Link to="/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut} className="flex items-center gap-2 cursor-pointer">
                  <LogOut className="h-4 w-4" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme toggle - separate circle */}
            <button
              onClick={toggleTheme}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border/50 bg-card/60 text-muted-foreground shadow-sm backdrop-blur-md transition-colors hover:text-foreground"
            >
              {theme === "light" ? (
                <Moon className="h-[18px] w-[18px]" />
              ) : (
                <Sun className="h-[18px] w-[18px]" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile floating bottom nav */}
      <div className="fixed bottom-4 left-4 right-4 z-50 flex justify-center md:hidden">
        <nav className="nav-glass-pill flex gap-1 rounded-full px-2 py-1.5">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                className="relative flex h-9 w-9 items-center justify-center rounded-full"
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNavMobile"
                    className="absolute inset-0 rounded-full bg-foreground/8 dark:bg-white/10"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon
                  className={`relative z-10 h-4 w-4 ${
                    isActive ? "text-foreground" : "text-muted-foreground/60"
                  }`}
                />
              </Link>
            );
          })}
        </nav>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-6 pb-24 md:pb-6">{children}</main>
    </div>
  );
};

export default Layout;
