var strftime = require('strftime');

// Convert a feed item into a slack message
var message = function(item) {
  var findStatus = function(categories) {
    return categories.filter(function(c) {
      return c == 'passed' || c == 'failed'
    })[0];
  }

  var decorator = {
    passed: ':thumbsup:',
    failed: ':poop:',
    unknown: ':horse:'
  }

  var title, status, link, date, author;

  title = item.meta.title || item.title;
  status = findStatus(item.categories) || "unknown";
  link = item.link;
  date = strftime("%H:%M %b %d", item.date);
  author = item.author;

  return '<' + link + '|Build for ' + title + '>: ' +
    decorator[status] + ' ' + status + ' (' + date + ")\n" + author;
}

module.exports = message;
