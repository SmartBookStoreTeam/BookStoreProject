import { useEffect, useState } from "react";

export const useTheme = () => {
  const [theme, setTheme] = useState(()=>{
    if(typeof window !=="undefined"){
      return localStorage.getItem("theme") || "system";
    }
    return "system";
  })

  useEffect(() => {
    const root = window.document.documentElement;
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');

    if (theme === "dark") {
      root.classList.add("dark");
      if (metaThemeColor) {
        metaThemeColor.setAttribute("content", "#18181b"); // zinc-900
      }
      if(typeof window !=="undefined"){
        localStorage.setItem("theme", "dark");
      }
    } else if (theme === "light") {
      root.classList.remove("dark");
      if (metaThemeColor) {
        metaThemeColor.setAttribute("content", "#e4e4e7"); // zinc-200
      }
      if(typeof window !=="undefined"){
        localStorage.setItem("theme", "light");
      }
    } else {
      // system mode
      const systemPrefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;

      if (systemPrefersDark) {
        root.classList.add("dark");
        if (metaThemeColor) {
          metaThemeColor.setAttribute("content", "#18181b"); // zinc-900
        }
      } else {
        root.classList.remove("dark");
        if (metaThemeColor) {
          metaThemeColor.setAttribute("content", "#e4e4e7"); // zinc-200
        }
      }
      if(typeof window !=="undefined"){
        localStorage.setItem("theme", "system");
      }
    }
  }, [theme]);

  return { theme, setTheme };
};