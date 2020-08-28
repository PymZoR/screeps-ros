export function subscribe(client: number, topicName: string) {
  let topic = Memory.pubsub[topicName];

  if (!topic) {
    topic = {
      listeners: [],
      messages: []
    };
  } else if (topic.listeners.indexOf(client) != -1) {
    // Already subscribed
    return;
  }

  topic.listeners.push(client);
}

export function unsubscribe(client: number, topicName: string) {
  if (!Memory.pubsub[topicName]) {
    return;
  }

  // Remove client from listeners
  const topic = Memory.pubsub[topicName];
  const index = topic.listeners.indexOf(client);

  if (index != -1) {
    topic.listeners.splice(index, 1);
  }

  // Delete topic if empty
  if (topic.listeners.length === 0) {
    delete Memory.pubsub[topicName];
  }
}

// TODO: option to latch
export function Publisher<T>(client: number, topicName: string) {
  if (!Memory.pubsub[topicName]) {
    Memory.pubsub[topicName] = {
      listeners: [],
      messages: []
    };
  }

  const topic = Memory.pubsub[topicName];

  return {
    publish: function (msg: T) {
      topic.messages.push({
        source: client,
        data: msg
      });

      return {
        type: "publish"
      };
    }
  };
}
