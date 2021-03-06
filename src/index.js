// net is needed for the socket connection
const net = require("net");

// those dependencies are needed for the communication between
// this server and the client's browser
const app = require("express")();
const http = require("http").Server(app);
const io = require("socket.io")(http);

// important variables
const config = {
  ip: process.env.IP || "localhost",
  port: process.env.PORT || 3000
};

// tell the user that only websockets are allowed
app.get("*", function(req, res) {
  res.redirect("https://github.com/marissa999/websocket-tcp-bridge");
});

io.on("connection", webSocket => {
  console.log("a user connected.");

  // the middle got information from the client about the middleware
  webSocket.on("endPointInformation", data => {
    // make endpoint socket
    let endPointSocket = new net.Socket();

    // connect endpoint socket to endpoint
    endPointSocket.connect(
      data.port,
      data.hostname
    );

    // close endPointSocket when websocket closes
    webSocket.on("disconnect", () => {
      try {
        endPointSocket.close();
      } catch (e) {
        console.log(e);
      }
    });

    // closes webSocket when when endPointSocket coses
    endPointSocket.on("end", () => {
      try {
        webSocket.disconnect();
      } catch (e) {
        console.log(e);
      }
    });

    // the client sent data to the middleware
    // forward the data to the endpoint
    webSocket.on("sendData", data => {
      if (endPointSocket === undefined) {
        console.log("didnt initialise connection to socket. do nothing");
      } else {
        console.log(
          "received data from middleware. forward it to the endpoint"
        );
        console.log(data);
        endPointSocket.write(data);
      }
    });

    // the endpoint sent data to the middleware
    // forward the data to the client
    endPointSocket.on("data", data => {
      const decodedString = String.fromCharCode.apply(
        null,
        new Uint8Array(data)
      );
      console.log(decodedString);
      webSocket.emit("data", decodedString);
    });
  });
});

http.listen(config.port, function() {
  console.log(`listening on *:${config.port}`);
});
