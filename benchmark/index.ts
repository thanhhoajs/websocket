import { ThanhHoaWebSocket } from '@thanhhoajs/websocket';
import { heapStats } from 'bun:jsc';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const NUM_CONNECTIONS = 100; // 100 connections
const NUM_MESSAGES = 1000; // 1,000 messages

const ws = new ThanhHoaWebSocket({
  port: 3001,
  websocket: {
    perMessageDeflate: true,
    idleTimeout: 60,
    maxPayloadLength: 1024 * 1024,
  },
});

ws.addRoute('/benchmark', {
  onMessage(ws, message) {
    ws.send(message);
  }, // Echo server
});

const server = ws.listen();

let results = '';

// Measure connection time
const startConnections = performance.now();
const connections = Array(NUM_CONNECTIONS)
  .fill(null)
  .map(() => new WebSocket('ws://localhost:3001/benchmark'));
await Promise.all(
  connections.map((conn) => new Promise((resolve) => (conn.onopen = resolve))),
);
const endConnections = performance.now();
const connectionTime = endConnections - startConnections;
results += `Time to connect ${NUM_CONNECTIONS} WebSockets: ${connectionTime.toFixed(2)}ms\n`;

// Measure message throughput
const startThroughput = performance.now();
let received = 0;
connections.forEach((conn) => {
  conn.onmessage = () => {
    received++;
    if (received === NUM_MESSAGES * NUM_CONNECTIONS) {
      const endThroughput = performance.now();
      const throughputTime = endThroughput - startThroughput;
      results += `Time to send and receive ${NUM_MESSAGES * NUM_CONNECTIONS} messages: ${throughputTime.toFixed(2)}ms\n`;

      // Measure heap stats after completion
      const stats = heapStats();
      results += `Heap Stats:\n${JSON.stringify(stats, null, 2)}\n`;

      // Write results to file
      try {
        mkdirSync('benchmark', { recursive: true });
        writeFileSync(join('benchmark', 'result.txt'), results);
        console.log('Results have been written to benchmark/result.txt');
      } catch (error) {
        console.error('Error writing file:', error);
      }

      // Close connections and stop server
      connections.forEach((conn) => conn.close());
      server.stop();

      // Ensure the program terminates
      setTimeout(() => {
        process.exit(0);
      }, 1000);
    }
  };
});

// Send messages
connections.forEach((conn) => {
  for (let i = 0; i < NUM_MESSAGES; i++) {
    conn.send('ping');
  }
});
