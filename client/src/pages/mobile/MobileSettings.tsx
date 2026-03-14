import React from "react";
import { motion } from "framer-motion";
import { User, Bell, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/contexts/ThemeContext";

const MobileSettings: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 pb-24">
      <h1 className="font-display text-xl font-bold text-foreground">Settings</h1>

      <div className="glass-card overflow-hidden rounded-2xl p-4">
        <h2 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          <User className="h-3.5 w-3.5" /> Profile
        </h2>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Full Name</Label>
            <Input defaultValue="John Doe" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Email</Label>
            <Input defaultValue="john.doe@gmail.com" />
          </div>
          <Button size="sm" className="w-full">Save Changes</Button>
        </div>
      </div>

      <div className="glass-card overflow-hidden rounded-2xl p-4">
        <h2 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {theme === "dark" ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />} Appearance
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Dark Mode</p>
            <p className="text-xs text-muted-foreground">Toggle theme</p>
          </div>
          <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
        </div>
      </div>

      <div className="glass-card overflow-hidden rounded-2xl p-4">
        <h2 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          <Bell className="h-3.5 w-3.5" /> Notifications
        </h2>
        <div className="space-y-3">
          {["Breach alerts", "Scan results", "Weekly reports"].map((n) => (
            <div key={n} className="flex items-center justify-between">
              <span className="text-sm text-foreground">{n}</span>
              <Switch defaultChecked />
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default MobileSettings;
