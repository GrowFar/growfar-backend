module.exports = {
  slug: (value) => {
    return value
      .trim()
      .replace(/\s/g, '-')
      .toLowerCase();
  },
  capitalize: (value) => {
    return value
      .trim()
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  },
};
