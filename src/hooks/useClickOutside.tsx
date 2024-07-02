import { useEffect, useRef } from 'react';

export const useClickOutside = (ref: React.MutableRefObject<HTMLTemplateElement | null>, callback: () => void) => {
   const bodyRef = useRef(document.body);
   const handleClick = (e: Event) => {
      e.stopPropagation();
      const target = e.target as HTMLTemplateElement;

      if (ref.current && !ref.current.contains(target)) {
         callback();
      }
   };

   useEffect(() => {
      const { current: body } = bodyRef;

      body.addEventListener('click', handleClick);
      return () => {
         body.removeEventListener('click', handleClick);
      };
   });
};
