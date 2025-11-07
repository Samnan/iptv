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

Open http://localhost:5173, select either one of the sample m3u files provided in the `channels` folder in the repo (or any other valid m3u channel list).

## M3U file management

Once you open an m3u file, you can click the heart icon to mark channels as favourite.

Once you are done marking channels favourite, you can export only those channels into a new m3u file for your use.

Load the new file in the app next time to see only your favourite channels!

## Building static version

Build the static version of the app using the terminal command

```
npm run build
```

It will generate static html/js based site that you can run on any web server.
For a quick fire web server, you can install node `http-server` package and run the build on local machine quickly.


## License

This project is released under [Apache 2.0 License](LICENSE)

## Sample Screenshots

<img width="689" height="377" alt="image" src="https://github.com/user-attachments/assets/33a13e87-1249-46b3-9b87-b28087cc6915" />


<img width="689" height="377" alt="image" src="https://github.com/user-attachments/assets/8cb4a137-283b-42ea-925f-90867389606e" />
