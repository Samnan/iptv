# IPTV

This is a very simple IPTV player and m3u file editor in one.

No flashy features, popups or drama. Just plain IPTV streaming and m3u file management.

## Pre-Requisite

Node 20+

## Running the application

Clone this repo

Open a terminal and run the development version

```

cd app/
npm install
npm run dev

```

Open http://localhost:5173, select either one of the sample m3u files provided in the `channels` folder in the repo.

## M3U file management

Once you open an m3u file, you can click the heart icon to mark channels as favourite.

Once you are done marking channels favourite, you can export only those channels into a new m3u file for your use.

Load the new file in the app next time to see only your favurite channels!

## Building static version

Build the static version of the app using the terminal command

```
npm run build
```

It will generate static html/js based site that you can run on any web server.
For a quick fire web server, you can install node `http-server` package and run the build on local machine quickly.

## Sample Screenshots

![./screenshots/screenshot-1.png](Screenshot 1)

![./screenshots/screenshot-2.png](Screenshot 2)