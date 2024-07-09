import { Logger } from '@thanhhoajs/logger';
import { Database, Statement } from 'bun:sqlite';

const logger = Logger.get('THANHHOA MESSAGE QUEUE');

export class MessageQueue {
  private db: Database;
  private preparedStatements: {
    enqueue: Statement;
    dequeue: Statement;
    delete: Statement;
    getQueueLength: Statement;
  };

  constructor() {
    this.db = new Database('thanhhoa_message_queue.db');
    this.initializeDatabase();
    this.preparedStatements = this.prepareStatements();
  }

  private initializeDatabase() {
    this.db.exec(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_id TEXT,
        message TEXT,
        compress INTEGER,
        created_at INTEGER
      );
      CREATE INDEX IF NOT EXISTS idx_client_id ON messages (client_id, created_at);
    `);
    logger.success('Message queue initialized');
  }

  private prepareStatements() {
    try {
      return {
        enqueue: this.db.prepare(
          'INSERT INTO messages (client_id, message, compress, created_at) VALUES ($clientId, $message, $compress, $createdAt)',
        ),
        dequeue: this.db.prepare(
          'SELECT id, message, compress FROM messages WHERE client_id = $clientId ORDER BY created_at ASC LIMIT 1',
        ),
        delete: this.db.prepare('DELETE FROM messages WHERE id = $id'),
        getQueueLength: this.db.prepare(
          'SELECT COUNT(*) as count FROM messages WHERE client_id = $clientId',
        ),
      };
    } catch (error) {
      logger.error('Failed to prepare SQL statements:');
      logger.verbose(JSON.stringify(error));
      throw error;
    }
  }

  enqueue(
    clientId: string,
    message: string | Bun.BufferSource,
    compress: boolean,
  ) {
    const transaction = this.db.transaction(() => {
      this.preparedStatements.enqueue.run({
        $clientId: clientId,
        $message: message.toString(),
        $compress: compress ? 1 : 0,
        $createdAt: Date.now(),
      });
    });
    transaction();
  }

  dequeue(clientId: string): { message: string; compress: boolean } | null {
    return this.db.transaction(() => {
      const row = this.preparedStatements.dequeue.get({
        $clientId: clientId,
      }) as {
        id: number;
        message: string;
        compress: number;
      } | null;

      if (row) {
        this.preparedStatements.delete.run({ $id: row.id });
        return { message: row.message, compress: row.compress === 1 };
      }

      return null;
    })();
  }

  getQueueLength(clientId: string): number {
    const result = this.preparedStatements.getQueueLength.get({
      $clientId: clientId,
    }) as { count: number };
    return result.count;
  }
}
