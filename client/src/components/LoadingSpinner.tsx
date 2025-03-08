import { motion } from "framer-motion";

interface LoadingSpinnerProps {
  size?: number;
}

export default function LoadingSpinner({ size = 48 }: LoadingSpinnerProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
      <motion.div
        className="relative"
        style={{ width: size, height: size }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="absolute inset-0 border-4 border-primary/20 rounded-full"
          style={{ borderTopColor: 'hsl(var(--primary))' }}
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute inset-2 border-4 border-primary/40 rounded-full"
          style={{ borderTopColor: 'hsl(var(--primary))' }}
          animate={{ rotate: -360 }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </motion.div>
    </div>
  );
}
