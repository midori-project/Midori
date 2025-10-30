"use client";

import { useState, useEffect } from "react";
import TokenDashboardModal from "./TokenDashboardModal";

export default function TokenDashboardProvider() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // ฟัง event จาก Navbar
    const handleOpenTokenDashboard = () => {
      setIsOpen(true);
    };

    // ฟัง event จาก window
    window.addEventListener('openTokenDashboard', handleOpenTokenDashboard);

    return () => {
      window.removeEventListener('openTokenDashboard', handleOpenTokenDashboard);
    };
  }, []);

  return (
    <TokenDashboardModal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
    />
  );
}




