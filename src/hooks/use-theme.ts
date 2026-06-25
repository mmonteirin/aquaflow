import { useState, useCallback } from "react";

export function useTheme() {
  const [dark, setDark] = useState(true);

  const toggle = useCallback(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.remove("dark");
      root.classList.add("light");
    } else {
      root.classList.remove("light");
      root.classList.add("dark");
    }
    setDark(!dark);
  }, [dark]);

  return { dark, toggle };
}
