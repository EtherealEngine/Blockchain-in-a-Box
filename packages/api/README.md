# Webaverse API backend

Node server hosted on AWS, mainly used for REST endpoints.

## Dev Setup

1. `npm install`

2. Create a `config.json` and paste this in: 

```
{
    "AWS_ACCESS_KEY_ID": "<ACCESS_KEY_ID>",
    "AWS_SECRET_ACCESS_KEY": "<SECRET_ACCESS_KEY>"
}
```

You can get these credentials from Avaer.

3. Create a `cert/` folder. Create 2 new files inside: `fullchain.pem` and `privkey.pem`. Ask Avaer for the certificates.

4. `npm run start` (forever) or `npm run dev` (nodemon).

## API Docs

### worlds.exokit.org

`GET` worlds.exokit.org/{worldId}

*Returns an object with: Host, World Name and Uptime of server.*

`POST` worlds.exokit.org/create

*Returns an object with: Host, World Name and Uptime of server.*

`DELETE` worlds.exokit.org/{worldId}

*Terminates the ec2 associated with world.*

## How to deploy new world-server code.

1.) Make sure your `dialog` repo changes are commited to the `dialog/worlds` branch.

2.) Go to `world-server` repo and bump the `package.json` version number. (this triggers the GH action to execute and create a new release, it will pull `dialog/worlds`)

3.) After the GH action is done, copy the hash of the release and paste it into `exokit-backend/routes/worlds.js` in the `updateZipFile()` fetch url.

4.) SSH into `exokit-backend` EC2 server (can get the IP from AWS dashboard), and delete the `world-server.zip` file. (it exists inside `~/exokit-backend/`)

5.) `npm run start` inside of `exokit-backend`. (this will start a forever process and start downloading the new ZIP file from the Github release.

6.) After it is done, verify the logs. (`sudo forever list`, `sudo forever logs [index]`) The server is up and running and will create new world-servers with the fresh codebase.

P.S. To truly wipe the old servers and start fresh, you need to login to AWS and terminate the old world servers OR you can use the DELETE API for worlds.

