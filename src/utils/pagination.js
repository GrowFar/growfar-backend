class Pagination {
  constructor(limit = 10, page = 1) {
    this.limit = limit;
    this.page = page;
    this.offset = (page - 1) * limit;
  }
}

module.exports = Pagination;
