class User {
  constructor(fullname, email, password, phone, role) {
    this.fullname = fullname;
    this.email = email;
    this.password = password;
    this.phone = phone;
    this.role = role;
  }
}

module.exports = User;
