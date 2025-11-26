import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);

// iframe height auto-resize for WordPress embedding
if (window.self !== window.top) {
  const sendHeight = () => {
    const height = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.offsetHeight
    );

    window.parent.postMessage({
      type: 'ateam-resize',
      height: height + 50 // Add padding for buffer
    }, '*');
  };

  // Send height on page load
  window.addEventListener('load', sendHeight);

  // Send height on DOM mutations (for expanding content)
  const observer = new ResizeObserver(() => {
    sendHeight();
  });
  observer.observe(document.body);

  // Send height on scroll (for content that expands dynamically)
  let debounceTimer: NodeJS.Timeout;
  window.addEventListener('scroll', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(sendHeight, 100);
  });

  // Send initial height after a short delay (ensures DOM is fully rendered)
  setTimeout(sendHeight, 500);

  console.log('[iframe] Height auto-resize enabled for WordPress embedding');
}
