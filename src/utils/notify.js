/** Create a notification object for the notifs state array */
export function createNotif(type, text) {
  return {
    id: `n-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    type,
    read: false,
    text,
    ts: new Date().toISOString(),
  };
}
