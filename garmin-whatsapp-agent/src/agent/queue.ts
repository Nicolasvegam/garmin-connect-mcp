type QueueSlot = {
  chains: Map<string, Promise<void>>;
  processed: Set<string>;
  processedOrder: string[];
};

const MAX_PROCESSED = 500;

function slot(): QueueSlot {
  const g = globalThis as { __agentQueue?: QueueSlot };
  g.__agentQueue ??= { chains: new Map(), processed: new Set(), processedOrder: [] };
  return g.__agentQueue;
}

export function isDuplicate(messageId: string): boolean {
  const s = slot();
  if (s.processed.has(messageId)) return true;
  s.processed.add(messageId);
  s.processedOrder.push(messageId);
  if (s.processedOrder.length > MAX_PROCESSED) {
    const oldest = s.processedOrder.shift();
    if (oldest) s.processed.delete(oldest);
  }
  return false;
}

export function enqueue(conversationKey: string, task: () => Promise<void>): void {
  const s = slot();
  const previous = s.chains.get(conversationKey) ?? Promise.resolve();
  const next = previous
    .catch(() => undefined)
    .then(task)
    .catch((error: unknown) => {
      console.error(`Agent task failed for ${conversationKey}:`, error);
    });
  s.chains.set(conversationKey, next);
}
