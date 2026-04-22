"use client";

import { useState, useEffect } from "react";

export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    if (typeof Notification !== "undefined") {
      setPermission(Notification.permission);
    }
  }, []);

  async function subscribe() {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

    const reg = await navigator.serviceWorker.register("/sw.js");
    const permission = await Notification.requestPermission();
    setPermission(permission);
    if (permission !== "granted") return;

    const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidKey) return;

    const subscription = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidKey),
    });

    await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(subscription),
    });

    setSubscribed(true);
  }

  async function unsubscribe() {
    if (!("serviceWorker" in navigator)) return;

    const reg = await navigator.serviceWorker.getRegistration("/sw.js");
    const sub = await reg?.pushManager.getSubscription();
    if (sub) {
      await sub.unsubscribe();
      await fetch("/api/push/subscribe", { method: "DELETE" });
      setSubscribed(false);
    }
  }

  return { permission, subscribed, subscribe, unsubscribe };
}

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const output = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    output[i] = rawData.charCodeAt(i);
  }
  return output.buffer;
}
