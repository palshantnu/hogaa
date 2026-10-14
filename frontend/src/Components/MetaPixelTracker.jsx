import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { trackPixel } from "../utils/metaPixel";

// Fires a Meta Pixel PageView on every client-side route change.
// The first PageView is sent by the base code in index.html.
const MetaPixelTracker = () => {
  const { pathname, search } = useLocation();
  const isFirstLoad = useRef(true);

  useEffect(() => {
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      return;
    }
    trackPixel('PageView');
  }, [pathname, search]);

  return null;
};

export default MetaPixelTracker;
