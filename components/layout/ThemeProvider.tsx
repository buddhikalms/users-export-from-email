"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

type Theme = "light" | "dark" | "system";

const ThemeContext = createContext<{
  resolvedTheme: "light" | "dark";
  theme: Theme;
  setTheme: (theme: Theme) => void;
}>({
  resolvedTheme: "light",
  theme: "system",
  setTheme: () => undefined,
});

function resolveTheme(theme: Theme) {
  if (theme === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  return theme;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const storedTheme = window.localStorage.getItem("dashboard-theme") as Theme | null;
    if (storedTheme) {
      setThemeState(storedTheme);
    }
  }, []);

  useEffect(() => {
    const apply = () => {
      const nextTheme = resolveTheme(theme);
      setResolvedTheme(nextTheme);
      document.documentElement.classList.toggle("dark", nextTheme === "dark");
    };

    apply();
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener("change", apply);

    return () => media.removeEventListener("change", apply);
  }, [theme]);

  const value = useMemo(
    () => ({
      resolvedTheme,
      theme,
      setTheme: (nextTheme: Theme) => {
        window.localStorage.setItem("dashboard-theme", nextTheme);
        setThemeState(nextTheme);
      },
    }),
    [resolvedTheme, theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
