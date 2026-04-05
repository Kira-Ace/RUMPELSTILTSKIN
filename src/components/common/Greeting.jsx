import { useMemo } from 'react';

/**
 * Greeting module for displaying rotating greetings.
 * Easy for developers to add more variations by updating the GREETINGS array.
 */
const GREETINGS = [
  "What's kirking,",
  "Ready to learn,",
  "Time to grow,",
];

export default function Greeting({ userName = "Rumpel" }) {
  // Select a random greeting on component mount
  const greeting = useMemo(() => {
    const index = Math.floor(Math.random() * GREETINGS.length);
    return GREETINGS[index];
  }, []);

  return (
    <h1 className="home-headline">{greeting}<br/>{userName}?</h1>
  );
}
