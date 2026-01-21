import React from "react";

const Skeleton = ({ className }) => {
  return (
    <div className={`relative overflow-hidden w-full ${className}`}>
      <div className="h-full bg-gradient-to-r from-surface via-violet-500/20 to-surface w-full rounded-2xl"></div>
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
    </div>
  );
};

export default Skeleton;
