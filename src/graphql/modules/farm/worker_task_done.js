class WorkerTaskDone {
  constructor(user_id, worker_task_id, submit_at) {
    this.user_id = user_id;
    this.worker_task_id = worker_task_id;
    this.submit_at = submit_at;
  }
}

module.exports = WorkerTaskDone;
