import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);
  const [flipping, setFlipping] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
  }, [dark]);

  const handleClick = () => {
    setFlipping(true);
    // Swap the underlying canvas at the halfway point of the flip,
    // so the new theme is what's "revealed" as the corner turns past 90deg,
    // matching the CSS transition duration in theme.css.
    setTimeout(() => setDark(d => !d), 275);
    setTimeout(() => setFlipping(false), 550);
  };

  return (
    <div
      className={`dog-ear${flipping ? " flipped" : ""}`}
      onClick={handleClick}
      role="button"
      aria-label="Toggle dark mode"
    >
      <div className="dog-ear-fold" />
    </div>
  );
}