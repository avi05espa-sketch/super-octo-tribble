"use client";

import React, { useEffect } from "react";
import { usePathname } from "next/navigation";
import { logEventSafe } from "@/lib/firebaseClient";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    // Envío automático de page_view en cada cambio de ruta (App Router)
    (async () => {
      await logEventSafe("page_view", { page_path: pathname });
    })();
  }, [pathname]);

  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
