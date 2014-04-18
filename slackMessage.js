var strftime = require('strftime');

var findStatus = function(categories) {
  return categories.filter(function(c) {
    return c === 'passed' || c === 'failed'
  })[0];
}

var findStage = function(title) {
  var matches = title.match(/stage (\w+)/);

  if (matches) {
    return matches[1] + ' ';
  } else {
    return '';
  }
};

// Convert a feed item into a slack message
var message = function(item) {

  var decorator = {
    passed: ':thumbsup:',
    failed: ':poop:',
    unknown: ':horse:'
  }

  var title, stage, status, link, date, author;

  title = item.meta.title || item.title;
  stage = findStage(item.title);
  status = findStatus(item.categories) || "unknown";
  link = item.link;
  date = strftime("%H:%M %b %d", item.date);
  author = item.author;

  return '<' + link + '|' +
    'Build for ' + title + '>: ' + stage +
    decorator[status] + ' ' + status + ' (' + date + ")\n" + author;
};

module.exports = message;
