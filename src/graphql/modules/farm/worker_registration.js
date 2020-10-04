class WorkerRegistration {
  constructor(farm_id, generated_token, ended_at) {
    this.farm_id = farm_id;
    this.generated_token = generated_token;
    this.ended_at = ended_at;
  }
}

module.exports = WorkerRegistration;
