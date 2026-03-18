import fs from "node:fs";
import path from "node:path";
import { Writable } from "node:stream";

type DailyLogStreamOptions = {
  dir: string;
  prefix: string;
  retentionDays: number;
};

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export class DailyLogStream extends Writable {
  private readonly dir: string;
  private readonly prefix: string;
  private readonly retentionDays: number;
  private currentDate: string;
  private stream: fs.WriteStream;

  constructor(options: DailyLogStreamOptions) {
    super();

    this.dir = options.dir;
    this.prefix = options.prefix;
    this.retentionDays = options.retentionDays;
    this.currentDate = formatDate(new Date());

    fs.mkdirSync(this.dir, { recursive: true });
    this.cleanupOldLogs();
    this.stream = this.createStream(this.currentDate);
  }

  _write(
    chunk: Buffer | string,
    encoding: BufferEncoding,
    callback: (error?: Error | null) => void,
  ) {
    try {
      const today = formatDate(new Date());
      if (today !== this.currentDate) {
        this.currentDate = today;
        this.stream.end();
        this.cleanupOldLogs();
        this.stream = this.createStream(today);
      }

      this.stream.write(chunk, encoding, callback);
    } catch (error) {
      callback(error as Error);
    }
  }

  override _final(callback: (error?: Error | null) => void) {
    this.stream.end(callback);
  }

  private createStream(date: string) {
    const filePath = path.join(this.dir, `${this.prefix}-${date}.log`);
    return fs.createWriteStream(filePath, { flags: "a" });
  }

  private cleanupOldLogs() {
    const cutoff = new Date();
    cutoff.setHours(0, 0, 0, 0);
    cutoff.setDate(cutoff.getDate() - this.retentionDays + 1);

    for (const fileName of fs.readdirSync(this.dir)) {
      const match = new RegExp(`^${this.prefix}-(\\d{4}-\\d{2}-\\d{2})\\.log$`).exec(
        fileName,
      );

      if (!match) {
        continue;
      }

      const logDate = new Date(`${match[1]}T00:00:00`);
      if (Number.isNaN(logDate.getTime()) || logDate >= cutoff) {
        continue;
      }

      fs.rmSync(path.join(this.dir, fileName), { force: true });
    }
  }
}
