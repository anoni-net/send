# Deployment to AWS

This document describes how to do a deployment of Send in AWS

## AWS requirements

### Security groups (2)

* ALB:
  - inbound: allow traffic from anywhere on port 80 and 443
  - ountbound: allow traffic to the instance security group on port `8080`

* Instance:
  - inbound: allow SSH from your public IP or a bastion (changing the default SSH port is a good idea)
  - inbound: allow traffic from the ALB security group on port `8080`
  - ountbound: allow all traffic to anywhere

### Resources

* An S3 bucket (block all public access)

* A private EC2 instance running a current Ubuntu LTS (you can use the [Amazon EC2 AMI Locator](https://cloud-images.ubuntu.com/locator/ec2/) to find one)

  Attach an IAM role to the instance with the following inline policy:

  ```json
  {
      "Version": "2012-10-17",
      "Statement": [
          {
              "Action": [
                  "s3:ListAllMyBuckets"
              ],
              "Resource": [
                  "*"
              ],
              "Effect": "Allow"
          },
          {
              "Action": [
                  "s3:ListBucket",
                  "s3:GetBucketLocation",
                  "s3:ListBucketMultipartUploads"
              ],
              "Resource": [
                  "arn:aws:s3:::<s3_bucket_name>"
              ],
              "Effect": "Allow"
          },
          {
              "Action": [
                  "s3:GetObject",
                  "s3:GetObjectVersion",
                  "s3:ListMultipartUploadParts",
                  "s3:PutObject",
                  "s3:AbortMultipartUpload",
                  "s3:DeleteObject",
                  "s3:DeleteObjectVersion"
              ],
              "Resource": [
                  "arn:aws:s3:::<s3_bucket_name>/*"
              ],
              "Effect": "Allow"
          }
      ]
  }
  ```

* A public ALB:

  - Create a target group with the instance registered (HTTP on port `8080` and path `/`)
  - Configure HTTP (port 80) to redirect to HTTPS (port 443)
  - HTTPS (port 443) using the latest security policy and an ACM certificate like `send.mydomain.com`

* A Route53 public record, alias from `send.mydomain.com` to the ALB

## Software requirements

* Git
* NodeJS 22 or newer (see `engines` in [package.json](../package.json))
* Local Redis server

### Install required packages

```bash
sudo apt update
sudo apt install -y ca-certificates curl git redis-server telnet
```

Check the `nodejs` version your Ubuntu release ships. If it is older than 22,
install a current one following the
[NodeSource instructions](https://github.com/nodesource/distributions), which
are kept up to date for each release and use a signed keyring rather than the
removed `apt-key`.

```bash
node --version   # must be >= 22
```

### Redis server

#### Password (optional)

Generate a strong password:

```bash
makepasswd --chars=100
```

Edit Redis configuration file `/etc/redis/redis.conf`:

```bash
requirepass <redis_password>
```

_Note: documentation on securing Redis https://redis.io/topics/security_

#### Systemd

Enable and (re)start the Redis server service:

```bash
sudo systemctl enable redis-server
sudo systemctl restart redis-server
sudo systemctl status redis-server
```

## Website directory

Setup a directory for the data

```
sudo mkdir -pv /var/www/send
sudo chown www-data:www-data /var/www/send
sudo chmod 750 /var/www/send
```

### NodeJS

Update npm:

```bash
sudo npm install -g npm
```

Checkout current NodeJS and npm versions:

```bash
node --version
npm --version
```

Clone repository, install JavaScript packages and compiles the assets:

```bash
sudo su -l www-data -s /bin/bash
cd /var/www/send
git clone https://github.com/anoni-net/send.git .
npm ci
npm run build
# the S3 backend's SDK is not a production dependency, so install it alongside
npm install --no-save @aws-sdk/client-s3 @aws-sdk/lib-storage
exit
```

Without that last line, starting with `S3_BUCKET` set fails immediately with a
message naming the packages to install. The SDK is kept out of the default
install because it is large and a filesystem deployment never loads it.

Create the file `/var/www/send/.env` used by Systemd with your environment variables
(checkout [config.js](../server/config.js) for more configuration environment variables):

```
BASE_URL='https://send.mydomain.com'
NODE_ENV='production'
PORT='8080'
TRUST_PROXY='1'
REDIS_PASSWORD='<redis_password>'
S3_BUCKET='<s3_bucket_name>'
```

`NODE_ENV=production` is what enables the Content-Security-Policy headers and the
per-IP rate limits, and `TRUST_PROXY=1` accounts for the ALB, so the rate limiter
keys on the visitor's address rather than on the load balancer. Add a hop if you
put a CDN in front of the ALB.

The sweep that removes expired files runs on the filesystem backend only. On S3,
set a bucket lifecycle rule to expire objects after at least `MAX_EXPIRE_SECONDS`
instead, otherwise expired ciphertext accumulates in the bucket.

Lower files and folders permissions to user and group `www-data`:

```
sudo find /var/www/send -type d -exec chmod 750 {} \;
sudo find /var/www/send -type f -exec chmod 640 {} \;
sudo find -L /var/www/send/node_modules/.bin/ -exec chmod 750 {} \;
```

### Systemd

Create the file `/etc/systemd/system/send.service` with `root` user and `644` mode:

```
[Unit]
Description=Send
After=network.target
Requires=redis-server.service
Documentation=https://github.com/anoni-net/send

[Service]
Type=simple
ExecStart=/usr/bin/npm run prod
EnvironmentFile=/var/www/send/.env
WorkingDirectory=/var/www/send
User=www-data
Group=www-data
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

_Note: could be better tuner to secure the service by restricting system permissions,
check with `systemd-analyze security send`_

Enable and start the Send service, check logs:

```
sudo systemctl daemon-reload
sudo systemctl enable send
sudo systemctl start send
sudo systemctl status send
journalctl -fu send
```
