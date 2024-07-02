import { useClickOutside } from '@hooks/useClickOutside';
import { useLockScroll } from '@hooks/useLockScroll';
import { FC, useCallback, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import styles from './Modal.module.scss';

interface IModalProps {
   isOpenModal: boolean;
   onClose: () => void;
}

const closeButtonsCodes = ['Escape'];

export const Modal: FC<React.PropsWithChildren & IModalProps> = ({ isOpenModal, onClose, children }) => {
   const modalRef = useRef(null);
   const bodyRef = useRef(document.body);
   const modalRoot = useMemo(() => {
      const element = document.createElement('div');

      element.classList.add(styles.modal);
      return element;
   }, []);
   const keydownHandler = useCallback(
      (e: KeyboardEvent) => {
         e.stopPropagation();

         if (closeButtonsCodes.includes(e.code)) {
            onClose();
         }
      },
      [onClose]
   );

   useClickOutside(modalRef, onClose);
   useLockScroll(isOpenModal);

   useEffect(() => {
      const { current: body } = bodyRef;

      if (isOpenModal) {
         body.append(modalRoot);
         body.addEventListener('keydown', keydownHandler);
      }

      return () => {
         if (isOpenModal) {
            modalRoot.remove();
            body.removeEventListener('keydown', keydownHandler);
         }
      };
   });

   if (isOpenModal) {
      return createPortal(
         <div className={styles.modalBody} ref={modalRef}>
            {children}
         </div>,
         modalRoot
      );
   }

   return null;
};
