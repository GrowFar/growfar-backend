/* eslint-disable no-empty-function */
const Absent = require('./components/absent');
const Attendance = require('./components/attendance');
const Task = require('./components/task');

class NotificationFactory {

  getNotification(type) {
    switch (type) {
      case 'ABSENT':
        return new Absent();
      case 'ATTENDANCE':
        return new Attendance();
      case 'TASK':
        return new Task();
    }
    return null;
  }
}

module.exports = NotificationFactory;
