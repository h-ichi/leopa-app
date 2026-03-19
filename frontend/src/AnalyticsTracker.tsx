import { useEffect } from "react";
import { useLocation } from "react-router-dom";

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

const GA_ID = "G-QPK6Y5FKR2";

export default function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    const pagePath = location.hash || location.pathname;

    window.gtag("config", GA_ID, {
      page_path: pagePath,
    });
  }, [location]);

  return null;
}