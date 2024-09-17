"use client";

import { useTheme } from "next-themes";
import { Moon, SunMedium } from "lucide-react";
import { useClient } from "@/lib/useClient";
import { Switch } from "./ui/switch";

export function ThemeSwitcher() {
  const { isClient } = useClient();
  const { theme, systemTheme, setTheme } = useTheme();

  const currentTheme = theme === "system" ? systemTheme : theme;

  if (!isClient) return null;

  return (
    <Switch
      thumbIcon={
        currentTheme === "dark" ? (
          <SunMedium fill="currentColor" size={12} />
        ) : (
          <Moon fill="currentColor" size={12} />
        )
      }
      onCheckedChange={(e) => setTheme(e ? "dark" : "light")}
      checked={currentTheme === "dark"}
    />
  );
}
