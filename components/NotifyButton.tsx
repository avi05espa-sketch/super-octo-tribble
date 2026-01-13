"use client";

import React from "react";
import { logEventSafe } from "@/lib/firebaseClient";

export default function NotifyButton() {
  const handleClick = async () => {
    await logEventSafe("notification_received", { method: "button_click" });
    // Feedback visual simple
    alert("Evento enviado");
  };

  return <button onClick={handleClick}>Enviar evento</button>;
}
