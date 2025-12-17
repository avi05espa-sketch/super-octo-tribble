
/**
 * @fileoverview A simple, global event emitter for handling specific app-wide events.
 * This is used to decouple error reporting from the data layer.
 */

type EventMap = {
  "permission-error": (error: Error) => void;
};

type EventName = keyof EventMap;

class EventEmitter {
  private listeners: { [K in EventName]?: Array<EventMap[K]> } = {};

  on<E extends EventName>(event: E, listener: EventMap[E]): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event]!.push(listener);
  }

  off<E extends EventName>(event: E, listener: EventMap[E]): void {
    if (!this.listeners[event]) {
      return;
    }
    const index = this.listeners[event]!.indexOf(listener);
    if (index > -1) {
      this.listeners[event]!.splice(index, 1);
    }
  }

  emit<E extends EventName>(event: E, ...args: Parameters<EventMap[E]>): void {
    if (!this.listeners[event]) {
      return;
    }
    this.listeners[event]!.forEach((listener) => {
      try {
        // @ts-ignore
        listener(...args);
      } catch (e) {
        console.error(`Error in event listener for ${event}:`, e);
      }
    });
  }
}

// Export a singleton instance to be used throughout the app.
export const errorEmitter = new EventEmitter();
