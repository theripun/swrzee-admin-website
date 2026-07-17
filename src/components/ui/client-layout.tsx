'use client';

import { useEffect, useState } from 'react';
import MobileRestriction from './mobile-restriction';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Initialize with null to avoid hydration mismatch
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Return children while isMobile is null (during initial render)
  if (isMobile === null) {
    return <>{children}</>;
  }

  if (isMobile) {
    return <MobileRestriction />;
  }

  return <>{children}</>;
} 