import fs from "fs";
import { transactionSubmitter } from "./helpers";

const TRANSACTIONS_FILE = "./crafted-transactions.txt";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

type QueueItem = {
  tx: string;
  id: number;
};

// Simple queue implementation
class SimpleQueue {
  isProcessing = false;
  queue: QueueItem[] = [];

  enqueue(item: QueueItem) {
    this.queue.push(item);
    this.processQueue();
  }

  async processQueue() {
    if (this.isProcessing || this.queue.length === 0) return;
    this.isProcessing = true;
    const item = this.queue.shift();

    if (item == undefined) {
      return;
    }

    await this.processItem(item);
    this.isProcessing = false;
    this.processQueue(); // Recursively process the next item
  }

  async processItem(item: QueueItem) {
    await new Promise((resolve) => setTimeout(resolve, 350));
    const data = await transactionSubmitter(item.tx);
    console.log(
      `Transaction [${item.id}] ::`,
      data,
      `${new Date().toLocaleTimeString()}`
    );
    await sleep(100);
  }
}

export function relayer() {
  const queue = new SimpleQueue();

  const transactions = fs.readFileSync(TRANSACTIONS_FILE, "utf8").split("\n");

  transactions.forEach((tx, id) => {
    queue.enqueue({ tx, id });
  });
}
