export function subscribe(client: number, topicName: string): void {
  let topic = Memory.pubsub[topicName];

  if (!topic) {
    topic = {
      listeners: [],
      messages: []
    };
  } else if (topic.listeners.indexOf(client) !== -1) {
    // Already subscribed
    return;
  }

  topic.listeners.push(client);
}

export function unsubscribe(client: number, topicName: string): void {
  if (!Memory.pubsub[topicName]) {
    return;
  }

  // Remove client from listeners
  const topic = Memory.pubsub[topicName];
  const index = topic.listeners.indexOf(client);

  if (index !== -1) {
    topic.listeners.splice(index, 1);
  }

  // Delete topic if empty
  if (topic.listeners.length === 0) {
    delete Memory.pubsub[topicName];
  }
}

// TODO: option to latch
// eslint-disable-next-line @typescript-eslint/ban-types
export function Publisher<TMsg extends object>(
  client: number,
  topicName: string
): {
  publish(msg: TMsg): { type: "publish" };
} {
  if (!Memory.pubsub[topicName]) {
    Memory.pubsub[topicName] = {
      listeners: [],
      messages: []
    };
  }

  const topic = Memory.pubsub[topicName];

  return {
    publish(msg: TMsg) {
      topic.messages.push({
        source: client,
        data: msg as Record<string, unknown>
      });

      return {
        type: "publish"
      };
    }
  };
}
