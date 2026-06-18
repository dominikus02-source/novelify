type SaveTask = {
  id: string;
  type: 'chapter' | 'scene';
  content: string;
  wordCount: number;
  sequence: number;
};

class SaveQueue {
  private pendingTasks: Map<string, SaveTask> = new Map();
  private inflightTasks: Map<string, Promise<any>> = new Map();
  private sequenceCounter = 0;

  async enqueue(task: Omit<SaveTask, 'sequence'>): Promise<void> {
    const sequence = ++this.sequenceCounter;
    const key = `${task.type}:${task.id}`;
    this.pendingTasks.set(key, { ...task, sequence });
    if (!this.inflightTasks.has(key)) {
      return this.processNext(key);
    }
  }

  private async processNext(key: string): Promise<void> {
    const task = this.pendingTasks.get(key);
    if (!task) return;
    this.pendingTasks.delete(key);
    const promise = this.executeSave(task);
    this.inflightTasks.set(key, promise);
    await promise;
    this.inflightTasks.delete(key);
    const nextTask = this.pendingTasks.get(key);
    if (nextTask) {
      return this.processNext(key);
    }
  }

  private async executeSave(task: SaveTask): Promise<void> {
    const endpoint = task.type === 'chapter' ? `/api/chapters/${task.id}` : `/api/scenes/${task.id}`;
    const body = task.type === 'chapter'
      ? JSON.stringify({ contentOriginal: task.content, wordCount: task.wordCount })
      : JSON.stringify({ content: task.content, wordCount: task.wordCount });

    const res = await fetch(endpoint, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body,
    });

    if (!res.ok) throw new Error(`Save failed: ${res.status}`);
  }
}

export const saveQueue = new SaveQueue();
