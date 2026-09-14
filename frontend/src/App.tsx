// frontend/src/App.tsx
import { RosterView } from "./RosterView";
import { ThemeToggle } from "./ThemeToggle";

export default function App() {
  return (
    <>
      <ThemeToggle />
      <RosterView />
    </>
  );
}