"use client";

import { useEffect } from "react";

export function MotionSetup() {
  useEffect(() => {
    document.documentElement.classList.add("motion-ready");
    return () => document.documentElement.classList.remove("motion-ready");
  }, []);
  return null;
}
