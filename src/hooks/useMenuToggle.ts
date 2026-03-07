import { useState, useCallback } from "react";

export function useMenuToggle(initialState = false) {
  const [visible, setVisible] = useState(initialState);
  const open = useCallback(() => setVisible(true), []);
  const close = useCallback(() => setVisible(false), []);
  const toggle = useCallback(() => setVisible(v => !v), []);
  return { visible, open, close, toggle };
}
