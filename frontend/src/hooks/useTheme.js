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

    if (theme === "dark") {
      root.classList.add("dark");
      if(typeof window !=="undefined"){
        localStorage.setItem("theme", "dark");
      }
    } else if (theme === "light") {
      root.classList.remove("dark");
      if(typeof window !=="undefined"){
        localStorage.setItem("theme", "light");
      }
    } else {
      // system mode
      const systemPrefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;

      if (systemPrefersDark) root.classList.add("dark");
      else root.classList.remove("dark");
      if(typeof window !=="undefined"){
        localStorage.setItem("theme", "system");
      }
    }
  }, [theme]);

  return { theme, setTheme };
};
