import { useRef, useEffect } from "react";
import type { ReactElement } from "react";
import { motion, AnimatePresence } from "framer-motion";

export const Collapsible = ({
  isOpen,
  children,
}: {
  isOpen: boolean;
  children: React.ReactNode;
}): ReactElement => {
  const ref = useRef<HTMLDivElement>(null);

  // Reset overflow to hidden when closing so exit animation clips content
  useEffect(() => {
    if (!isOpen && ref.current) {
      ref.current.style.overflow = "hidden";
    }
  }, [isOpen]);

  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          ref={ref}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          style={{ overflow: "hidden" }}
          onAnimationComplete={() => {
            // After open animation, allow overflow so nested sticky elements work
            if (ref.current && isOpen) {
              ref.current.style.overflow = "visible";
            }
          }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
