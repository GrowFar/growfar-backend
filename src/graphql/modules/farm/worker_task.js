class WorkerTask {
  constructor(farm_id, title, description, started_at, ended_at) {
    this.farm_id = farm_id;
    this.title = title;
    this.description = description;
    this.started_at = started_at;
    this.ended_at = ended_at;
  }
}

module.exports = WorkerTask;
