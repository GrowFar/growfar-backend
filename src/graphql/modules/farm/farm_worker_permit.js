class FarmWorkerPermit {
  constructor(category, description, duration, farm_id, user_id) {
    this.category = category;
    this.description = description;
    this.duration = duration;
    this.farm_id = farm_id;
    this.user_id = user_id;
  }
}

module.exports = FarmWorkerPermit;
