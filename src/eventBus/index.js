import { EventEmitter } from 'events';

const eventBus = new EventEmitter();
eventBus.setMaxListeners(50);

const origEmit = eventBus.emit.bind(eventBus);
eventBus.emit = (event, ...args) => {
  setImmediate(() => origEmit(event, ...args));
};

export default eventBus;
