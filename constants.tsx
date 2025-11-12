import React from 'react';

const GamepadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="6" y1="12" x2="18" y2="12" /><line x1="12" y1="6" x2="12" y2="18" /><path d="M17.23 5.25a7.5 7.5 0 0 0-10.46 0" /><path d="M17.23 18.75a7.5 7.5 0 0 0-10.46 0" /><path d="M5.25 17.23a7.5 7.5 0 0 0 0-10.46" /><path d="M18.75 17.23a7.5 7.5 0 0 0 0-10.46" /></svg>
);

const SoccerBallIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="m15.6 15.6-3.6-1.6-3.6 1.6" /><path d="M12 2v4" /><path d="m4.2 4.2 2.8 2.8" /><path d="M2 12h4" /><path d="m4.2 19.8 2.8-2.8" /><path d="M12 22v-4" /><path d="m19.8 19.8-2.8-2.8" /><path d="M22 12h-4" /><path d="m19.8 4.2-2.8 2.8" /><path d="M9.4 14 6 15.9" /><path d="m14.6 14 3.6 1.9" /><path d="M8.4 8.4 6 5.9" /><path d="m15.6 8.4 2.4-2.5" /></svg>
);

const VolleyballIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 12a10 10 0 0 0 8.9-5.1" /><path d="M3.1 7.1a10 10 0 0 1 8.8-5.1" /><path d="M12 22a10 10 0 0 1-8.9-5.1" /><path d="M20.9 16.9a10 10 0 0 0-8.8-5.1" /><path d="M3.1 7.1A10 10 0 0 0 12 12" /><path d="M12 12a10 10 0 0 1 8.9 4.9" /></svg>
);

const SwimmerIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="1" /><path d="m9 10-1.5 6" /><path d="m15 10 1.5 6" /><path d="M2.5 8.5c1.4-1 3.5-1.5 5.5-1.5 4 0 6.5 2 8.5 3.5" /><path d="M21.5 11.5c-1.4 1-3.5 1.5-5.5 1.5-4 0-6.5-2-8.5-3.5" /></svg>
);

export const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
);

export const ICONS: { [key: string]: React.ComponentType } = {
  gamepad: GamepadIcon,
  soccer: SoccerBallIcon,
  volleyball: VolleyballIcon,
  swimmer: SwimmerIcon,
};