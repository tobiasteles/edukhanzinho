"use client";

import { useCallback, useEffect, useState } from "react";

const KEY = "edu:autoread";

// Liga/desliga a leitura automática da pergunta (lembra a escolha neste aparelho). Começa ligada.
export const useAutoRead = () => {
  const [autoRead, setAutoRead] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved !== null) setAutoRead(saved === "1");
    } catch {
      // sem acesso ao armazenamento: segue ligada
    }
  }, []);

  const toggleAutoRead = useCallback(() => {
    const next = !autoRead;
    setAutoRead(next);
    try {
      localStorage.setItem(KEY, next ? "1" : "0");
    } catch {
      // ignora
    }
  }, [autoRead]);

  return { autoRead, toggleAutoRead };
};
