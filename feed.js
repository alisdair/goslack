var
FeedParser = require('feedparser'),
request = require('request'),
redis = require('redis'),
dotenv = require('dotenv'),
slackMessage = require('./slackMessage');

dotenv.load();

var config = {
  go_uri: process.env.GO_URI,
  go_username: process.env.GO_USERNAME,
  go_password: process.env.GO_PASSWORD,
  slack_uri: process.env.SLACK_URI,
  slack_token: process.env.SLACK_TOKEN
}

// Read pipeline from command-line arguments
var pipeline = process.argv[2];
if (typeof pipeline === 'undefined') {
  console.log("Usage: " + process.argv[1] + " <pipeline>");
  process.exit(1);
}

// Prepare our redis key for the set of seen items
var redisKey = 'goslack.' + pipeline;

// Prepare URLs for feed and webhook
var feed = config.go_uri + '/go/api/pipelines/' + pipeline + '/stages.xml';
var webhook = config.slack_uri + '/services/hooks/incoming-webhook?token='
  + config.slack_token;

// Set up feed request and parser
var req = request(feed).auth(config.go_username, config.go_password);
var parser = new FeedParser();

var done = function(error) {
  console.error(error);
  process.exit(1);
};

req.on('error', done);
parser.on('error', done);

// Check the feed response and pipe to the parser
req.on('response', function(res) {
  if (res.statusCode != 200)
    return this.emit('error', new Error('Bad status code: ' + res.statusCode));

  req.pipe(parser);
});

// Process the feed items
parser.on('readable', function() {
  var build;
  var client = redis.createClient();
  client.on("error", done);

  while (build = parser.read()) {
    var guid = build.guid;
    var message = slackMessage(build);

    // For each item, check if the GUID is in our redis set for this pipeline
    client.sismember(redisKey, guid, function(err, reply) {
      // If it's there, do nothing
      if (reply == '1') {
        client.quit();
        return;
      }

      // Otherwise, add it, and if successful, post to Slack.
      client.sadd(redisKey, guid, function(err, reply) {
        var body = {
          text: message
        };
        if (!(/:thumbsup:/.test(message))) {
          body.channel = '#general';
        }
        request.post(webhook, { json: body });
        client.quit();
      });
    });
  }
});
