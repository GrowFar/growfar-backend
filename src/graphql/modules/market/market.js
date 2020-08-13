class Market {
  constructor(submit_at, price, farm_id, commodity_id) {
    this.submit_at = submit_at;
    this.price = price;
    this.farm_id = farm_id;
    this.commodity_id = commodity_id;
  }
}

module.exports = Market;
