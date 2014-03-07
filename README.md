# goslack

Turn a Go CI server Atom feed into Slack chat room messages.

## Usage

Install Redis and node, and create a new `.env` file based on the `env.example`. Then:

    npm install
    node feed.js <pipeline>

You can find your Go pipeline name from the URI of any of the build result pages.
