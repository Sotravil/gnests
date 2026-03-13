/*
  Notification Lab service worker (v1)
  - Handles install/activate lifecycle
  - Receives page messages to display notifications
  - Handles notification clicks by focusing/opening a client route
  - Provides future push event handler for phase-2 backend integration
*/

const SW_VERSION = "notification-lab-sw-v3";
const ENABLE_ASSET_CACHE = true;
const CACHE_NAME = `${SW_VERSION}-static-cache`;
const STATIC_ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./queue.json"
];

self.addEventListener("install", (event) => {
  // Activate this worker as soon as install succeeds to simplify local testing.
  self.skipWaiting();
  event.waitUntil((async () => {
    if (!ENABLE_ASSET_CACHE) {
      return;
    }
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(STATIC_ASSETS);
  })());
});

self.addEventListener("activate", (event) => {
  // Take control of open pages immediately after activation.
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(
      names
        .filter((name) => name !== CACHE_NAME)
        .map((name) => caches.delete(name))
    );
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  if (!ENABLE_ASSET_CACHE || event.request.method !== "GET") {
    return;
  }

  // Navigation requests (HTML pages): network-first so the latest version is always shown.
  if (event.request.mode === "navigate") {
    event.respondWith((async () => {
      try {
        const response = await fetch(event.request);
        const cache = await caches.open(CACHE_NAME);
        cache.put(event.request, response.clone());
        return response;
      } catch (error) {
        const cached = await caches.match(event.request);
        if (cached) {
          return cached;
        }
        return new Response("Offline and not cached.", {
          status: 503,
          headers: { "Content-Type": "text/plain" }
        });
      }
    })());
    return;
  }

  // Other assets: stale-while-revalidate — serve cache immediately, update in background.
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(event.request);
    const fetchPromise = fetch(event.request).then((response) => {
      const requestUrl = new URL(event.request.url);
      if (requestUrl.origin === self.location.origin) {
        cache.put(event.request, response.clone());
      }
      return response;
    }).catch(() => null);

    if (cached) {
      return cached;
    }

    const response = await fetchPromise;
    if (response) {
      return response;
    }
    return new Response("Offline and not cached.", {
      status: 503,
      headers: { "Content-Type": "text/plain" }
    });
  })());
});

function sanitizePayload(input) {
  const safe = input && typeof input === "object" ? input : {};
  const rawActions = Array.isArray(safe.actions) ? safe.actions : [];
  const actions = rawActions
    .filter((action) => action && typeof action === "object")
    .slice(0, 2)
    .map((action) => ({
      action: String(action.action || "open"),
      title: String(action.title || "Open")
    }));

  return {
    id: String(safe.id || ""),
    title: String(safe.title || "Notification"),
    body: String(safe.body || ""),
    icon: safe.icon ? String(safe.icon) : "",
    badge: safe.badge ? String(safe.badge) : "",
    image: safe.image ? String(safe.image) : "",
    tag: safe.tag ? String(safe.tag) : "",
    targetUrl: safe.targetUrl ? String(safe.targetUrl) : "/",
    clientTarget: safe.clientTarget ? String(safe.clientTarget) : "all",
    responseTargetClientId: safe.responseTargetClientId ? String(safe.responseTargetClientId) : "",
    requireInteraction: Boolean(safe.requireInteraction),
    silent: Boolean(safe.silent),
    actions
  };
}

async function showSafeNotification(payload) {
  const data = sanitizePayload(payload);
  await self.registration.showNotification(data.title, {
    body: data.body,
    icon: data.icon || undefined,
    badge: data.badge || undefined,
    image: data.image || undefined,
    tag: data.tag || undefined,
    requireInteraction: data.requireInteraction,
    silent: data.silent,
    actions: data.actions,
    data: {
      id: data.id,
      targetUrl: data.targetUrl,
      clientTarget: data.clientTarget,
      responseTargetClientId: data.responseTargetClientId,
      swVersion: SW_VERSION
    }
  });
}

self.addEventListener("message", (event) => {
  const message = event.data;
  if (!message || typeof message !== "object") {
    return;
  }

  if (message.type === "SHOW_NOTIFICATION") {
    event.waitUntil(showSafeNotification(message.payload));
  }
});

self.addEventListener("push", (event) => {
  // Future phase-2: this event only fires when a backend push sender exists.
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch (_error) {
    payload = {
      title: "Push payload parse issue",
      body: "Push event received but payload could not be parsed."
    };
  }
  event.waitUntil(showSafeNotification(payload));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = event.notification && event.notification.data && event.notification.data.targetUrl
    ? String(event.notification.data.targetUrl)
    : "/";

  event.waitUntil((async () => {
    const noteData = event.notification && event.notification.data ? event.notification.data : {};
    const selectedAction = event.action ? String(event.action) : "default";
    let normalizedTarget = new URL(targetUrl, self.location.origin);

    if (selectedAction === "respond") {
      normalizedTarget.searchParams.set("replyToNotificationId", String(noteData.id || ""));
      if (noteData.responseTargetClientId) {
        normalizedTarget.searchParams.set("responseTargetClientId", String(noteData.responseTargetClientId));
      }
    }

    const windowClients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    const normalizedTargetUrl = normalizedTarget.toString();

    await Promise.all(windowClients.map((client) => client.postMessage({
      type: "NOTIFICATION_CLICKED",
      payload: {
        id: noteData.id || "",
        action: selectedAction,
        targetUrl: normalizedTargetUrl,
        responseTargetClientId: noteData.responseTargetClientId || "",
        clickedAt: new Date().toISOString()
      }
    })));

    for (const client of windowClients) {
      if ("focus" in client) {
        // Prefer focusing an existing same-origin window.
        if (client.url.startsWith(self.location.origin)) {
          await client.focus();
          if ("navigate" in client) {
            await client.navigate(normalizedTargetUrl);
          }
          return;
        }
      }
    }

    // If no window is available, open a new one to the target route.
    if (self.clients.openWindow) {
      await self.clients.openWindow(normalizedTargetUrl);
    }
  })());
});

self.addEventListener("notificationclose", (event) => {
  const noteData = event.notification && event.notification.data ? event.notification.data : {};
  event.waitUntil((async () => {
    const windowClients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    await Promise.all(windowClients.map((client) => client.postMessage({
      type: "NOTIFICATION_DISMISSED",
      payload: {
        id: noteData.id || "",
        dismissedAt: new Date().toISOString()
      }
    })));
  })());
});
