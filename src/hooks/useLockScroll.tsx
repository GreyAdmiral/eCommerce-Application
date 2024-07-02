import { useCallback, useEffect, useRef } from 'react';

const keyboardLockedCodes = ['ArrowUp', 'ArrowDown'];

export const useLockScroll = (isUseLock: boolean) => {
   const bodyRef = useRef(document.body);
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
      const { current: body } = bodyRef;

      if (isUseLock) {
         body.addEventListener('wheel', scrollLockHandler, { passive: false });
         body.addEventListener('touchmove', scrollLockHandler, { passive: false });
         body.addEventListener('keydown', scrollKeyLockHandler);
      }

      return () => {
         body.removeEventListener('wheel', scrollLockHandler);
         body.removeEventListener('touchmove', scrollLockHandler);
         body.removeEventListener('keydown', scrollKeyLockHandler);
      };
   });
};
