export interface PresenceMember {
  id: string;
  updatedAt: number;
}

type PresenceMessage =
  | { type: 'join'; id: string; roomId: string; ts: number }
  | { type: 'heartbeat'; id: string; roomId: string; ts: number }
  | { type: 'leave'; id: string; roomId: string; ts: number };

const HEARTBEAT_MS = 5000;
const EXPIRY_MS = 15000;

export function subscribePresence(
  roomId: string,
  onChange: (members: PresenceMember[]) => void
): () => void {
  if (typeof window === 'undefined' || typeof BroadcastChannel === 'undefined') {
    onChange([]);
    return () => undefined;
  }

  const memberId = crypto.randomUUID();
  const channel = new BroadcastChannel('promptblocks_presence');
  const members = new Map<string, PresenceMember>();

  const emit = (message: PresenceMessage) => {
    channel.postMessage(message);
  };

  const flush = () => {
    const now = Date.now();
    for (const [id, member] of members) {
      if (now - member.updatedAt > EXPIRY_MS) {
        members.delete(id);
      }
    }
    onChange(Array.from(members.values()).sort((a, b) => b.updatedAt - a.updatedAt));
  };

  const upsert = (id: string, ts: number) => {
    members.set(id, { id, updatedAt: ts });
    flush();
  };

  const onMessage = (event: MessageEvent<PresenceMessage>) => {
    const message = event.data;
    if (!message || message.roomId !== roomId) return;

    if (message.type === 'join' || message.type === 'heartbeat') {
      upsert(message.id, message.ts);
    }

    if (message.type === 'leave') {
      members.delete(message.id);
      flush();
    }
  };

  channel.addEventListener('message', onMessage);

  const sendHeartbeat = () => {
    const ts = Date.now();
    upsert(memberId, ts);
    emit({ type: 'heartbeat', id: memberId, roomId, ts });
  };

  const joinTs = Date.now();
  upsert(memberId, joinTs);
  emit({ type: 'join', id: memberId, roomId, ts: joinTs });

  const heartbeatTimer = window.setInterval(sendHeartbeat, HEARTBEAT_MS);
  const cleanupTimer = window.setInterval(flush, HEARTBEAT_MS);

  const leave = () => {
    const ts = Date.now();
    emit({ type: 'leave', id: memberId, roomId, ts });
  };

  window.addEventListener('beforeunload', leave);

  return () => {
    window.removeEventListener('beforeunload', leave);
    window.clearInterval(heartbeatTimer);
    window.clearInterval(cleanupTimer);
    leave();
    channel.removeEventListener('message', onMessage);
    channel.close();
  };
}
