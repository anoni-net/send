## Requirements

This document describes how to do a full deployment of Send on your own Linux server. You will need:

* NodeJS 22 or newer, and npm
* A redis server. Send keeps all file metadata and every expiry TTL in redis and
  will not start without one
* Git
* Apache webserver
* Optionally telnet, to be able to quickly check your installation

For example in Debian/Ubuntu systems:

```bash
sudo apt install git apache2 redis-server telnet
```

Check what `nodejs` your distribution ships before installing it from the
archive: several stable releases still carry a version older than 22. If it is
too old, install a current one from [NodeSource](https://github.com/nodesource/distributions)
or [nvm](https://github.com/nvm-sh/nvm) instead.

## Building

* We assume an already configured virtual-host on your webserver with an existing empty htdocs folder
* First, remove that htdocs folder - we will replace it with Send's version now
* git clone https://github.com/anoni-net/send.git htdocs
* Make now sure you are NOT root but rather the user your webserver is serving files under (e.g. "su www-data" or whoever the owner of your htdocs folder is)
* npm ci
* npm run build

## Configuration

Send reads its configuration from environment variables. Two of them matter for
any deployment behind a reverse proxy:

* `NODE_ENV=production`. The default is `development`, which switches off both
  the Content-Security-Policy headers and the per-IP rate limits. `npm run prod`
  does not set it for you. (The published Docker image does, but this document
  runs the server directly.)
* `TRUST_PROXY=1`, which is already the default and matches the single Apache
  proxy set up below. It tells Send how many proxies sit in front of it, so the
  rate limiter reads the visitor's address instead of `127.0.0.1`. Add a hop for
  each additional proxy or CDN.

`BASE_URL` should be the public HTTPS address, for example
`https://send.example.com`. See [server/config.js](../server/config.js) for the
rest.

## Running

To have a permanently running version of Send as a background process:

* Create a file `run.sh` with:

```bash
#!/bin/bash
# set the variables inside the command: su does not carry all of them across
nohup su www-data -c "NODE_ENV=production BASE_URL=https://send.example.com npm run prod" 2>/dev/null &
```

* Execute the script:

```bash
chmod +x run.sh
./run.sh
```

Now the Send backend should be running on port 1443. You can check with:

```bash
telnet localhost 1443
```

## Reverse Proxy

Of course, we don't want to expose the service on port 1443. Instead we want our normal webserver to forward all requests to Send ("Reverse proxy").

# Apache webserver

* Enable Apache required modules:

```bash
sudo a2enmod headers
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo a2enmod proxy_wstunnel
sudo a2enmod rewrite
```

* Edit your Apache virtual host configuration file, insert this:

```
# Enable rewrite engine
RewriteEngine on

# Make sure the original domain name is forwarded to Send
# Otherwise the generated URLs will be wrong
ProxyPreserveHost on

# Make sure the generated URL is https://
RequestHeader set X-Forwarded-Proto https

# If it's a normal file (e.g. PNG, CSS) just return it
RewriteCond %{REQUEST_FILENAME} -f
RewriteRule .* - [L]

# If it's a websocket connection, redirect it to a Send WS connection
RewriteCond %{HTTP:Upgrade} =websocket [NC]
RewriteRule /(.*) ws://127.0.0.1:1443/$1 [P,L]

# Otherwise redirect it to a normal HTTP connection
RewriteRule ^/(.*)$ http://127.0.0.1:1443/$1 [P,QSA]
ProxyPassReverse  "/" "http://127.0.0.1:1443"
```

* Test configuration and restart Apache:

```bash
sudo apache2ctl configtest
sudo systemctl restart apache2
```

## Checking the result

`mod_proxy` adds the `X-Forwarded-For` header Send needs, and the `RequestHeader`
line above supplies `X-Forwarded-Proto`, so with `TRUST_PROXY=1` the rate limiter
sees real client addresses.

Confirm the site came up in production mode:

```bash
curl -sI https://send.example.com/ | grep -i content-security-policy
```

An empty result means `NODE_ENV` did not reach the process, and the instance is
running without CSP or rate limiting.
