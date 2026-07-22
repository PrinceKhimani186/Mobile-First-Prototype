import { useEffect } from "react";
import Presentation from "@/pages/presentation";
import "./index.css";

export default function App() {
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.pathname.startsWith("/enrollment")) {
      const targetPort = "5173";
      const targetUrl = `${window.location.protocol}//${window.location.hostname}:${targetPort}${window.location.pathname}${window.location.search}`;
      console.info("[CloserPresentation] Redirecting /enrollment path to App Squad:", targetUrl);
      window.location.href = targetUrl;
    }
  }, []);

  return <Presentation />;
}
