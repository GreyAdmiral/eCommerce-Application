import { useCallback, useEffect } from 'react';

const keyboardLockedCodes = ['ArrowUp', 'ArrowDown'];

export const useLockScroll = (useLock: boolean) => {
   const scrollLockHandler = useCallback((e: Event) => {
      e.stopPropagation();
      e.preventDefault();
   }, []);

   const scrollKeyLockHandler = useCallback((e: KeyboardEvent) => {
      e.stopPropagation();

      if (keyboardLockedCodes.includes(e.code)) {
         e.preventDefault();
      }
   }, []);

   useEffect(() => {
      if (useLock) {
         document.body.addEventListener('wheel', scrollLockHandler, { passive: false });
         document.body.addEventListener('touchmove', scrollLockHandler, { passive: false });
         document.body.addEventListener('keydown', scrollKeyLockHandler);
      } else {
         document.body.removeEventListener('wheel', scrollLockHandler);
         document.body.removeEventListener('touchmove', scrollLockHandler);
         document.body.removeEventListener('keydown', scrollKeyLockHandler);
      }
   });
};
