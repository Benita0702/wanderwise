import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X } from "lucide-react";
import BudgetOptimizer from "./BudgetOptimizer";

const FloatingBudgetOptimizer = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Button */}
      <motion.button
        className="fixed bottom-24 right-6 z-[9998] bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 focus:outline-none text-2xl"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {isOpen ? <X size={24} /> : "💰"}
    </motion.button>


      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              className="fixed bottom-20 right-6 w-[420px] bg-white rounded-2xl shadow-2xl z-[9999] p-4 max-h-[85vh] overflow-y-auto"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ type: 'spring', stiffness: 150, damping: 20 }}
            >
              <BudgetOptimizer />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingBudgetOptimizer;
