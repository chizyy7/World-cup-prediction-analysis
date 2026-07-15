"use client";

import { motion } from "framer-motion";

export function PageHeader({ title, description }: { title: string; description: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mb-6">
      <h2 className="text-2xl font-bold">{title}</h2>
      <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
    </motion.div>
  );
}
