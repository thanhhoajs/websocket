import { ThanhHoaWebSocket, RouterHandler } from '@thanhhoajs/websocket';
import { heapStats } from 'bun:jsc';

const NUM_CONNECTIONS = 16;
const NUM_MESSAGES = 62500;

let results = '';
let received = 0;

const routerHandler = new RouterHandler();
routerHandler.route('benchmark', {
  onMessage(ws, message) {
    ws.send(message);
    if (++received === NUM_MESSAGES * NUM_CONNECTIONS) {
      finishBenchmark();
    }
  },
});

const ws = new ThanhHoaWebSocket({
  port: 3001,
  websocket: {
    perMessageDeflate: false,
    idleTimeout: 60,
    maxPayloadLength: 1024 * 1024,
  },
});

ws.group('', routerHandler);

console.log('Server started. Running benchmark...');

const startConnections = performance.now();
const connections = Array(NUM_CONNECTIONS)
  .fill(null)
  .map(() => new WebSocket('ws://localhost:3001/benchmark'));
await Promise.all(
  connections.map(
    (conn) => new Promise((resolve) => conn.addEventListener('open', resolve)),
  ),
);
const endConnections = performance.now();
const connectionTime = endConnections - startConnections;
results += `Time to connect ${NUM_CONNECTIONS} WebSockets: ${connectionTime.toFixed(2)}ms\n`;

const startThroughput = performance.now();
connections.forEach((conn) => {
  const message = 'ping';
  for (let i = 0; i < NUM_MESSAGES; i++) {
    conn.send(message);
  }
});

async function finishBenchmark() {
  const endThroughput = performance.now();
  const throughputTime = endThroughput - startThroughput;
  results += `Time to send and receive ${NUM_MESSAGES * NUM_CONNECTIONS} messages: ${throughputTime.toFixed(2)}ms\n`;

  const stats = heapStats();
  results += `Stats Heap:\n${JSON.stringify(stats, null, 2)}\n`;

  try {
    await Bun.write('benchmark/result.txt', results);
    console.log('Results have been written to benchmark/result.txt');
  } catch (error) {
    console.error('Error writing file:', error);
  }

  connections.forEach((conn) => conn.close());
  ws.stop();

  setTimeout(() => process.exit(0), 1000);
}
