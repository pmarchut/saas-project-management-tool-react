import { useState, useEffect } from "react";

const styles = getComputedStyle(document.documentElement);

// Domyślne breakpointy Tailwind (z dokumentacji)
const breakpoints: Record<string, number> = {
    sm: parseInt(styles.getPropertyValue("--tw-screen-sm")),
    md: parseInt(styles.getPropertyValue("--tw-screen-md")),
    lg: parseInt(styles.getPropertyValue("--tw-screen-lg")),
    xl: parseInt(styles.getPropertyValue("--tw-screen-xl")),
    "2xl": parseInt(styles.getPropertyValue("--tw-screen-2xl")),
};

const getCurrentBreakpoint = (): string => {
  let current = "sm";
  let max = 0;
  const app = document.getElementById("root") as HTMLElement;

  for (const [name, size] of Object.entries(breakpoints)) {
    if (app.clientWidth >= size && size > max) {
      max = size;
      current = name;
    }
  }

  //test
  //console.log(current)

  return current;
};

export const useBreakpoint = () => {
  const [breakpoint, setBreakpoint] = useState(getCurrentBreakpoint());

  useEffect(() => {
    const handleResize = async () => {
      setBreakpoint(getCurrentBreakpoint())
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return breakpoint;
};
