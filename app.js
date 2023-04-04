const express = require("express");
const qr = require("qrcode");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("QR Code Reader Example");
});

app.get("/scan", (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Scan QR Code</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
      </head>
      <body>
        <h1>Scan QR Code</h1>
        <div id="qrcode"></div>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcode/1.4.4/qrcode.min.js"></script>
        <script>
          var qrcode = new QRCode(document.getElementById("qrcode"), {
            text: "",
            width: 256,
            height: 256,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
          });
          function scanQRCode() {
            if ("mediaDevices" in navigator && "getUserMedia" in navigator.mediaDevices) {
              navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } }).then(function(stream) {
                var video = document.createElement("video");
                video.setAttribute("autoplay", "");
                video.setAttribute("playsinline", "");
                video.srcObject = stream;
                video.addEventListener("loadedmetadata", function() {
                  video.play();
                  var canvas = document.createElement("canvas");
                  canvas.width = video.videoWidth;
                  canvas.height = video.videoHeight;
                  var context = canvas.getContext("2d");
                  setInterval(function() {
                    context.drawImage(video, 0, 0, canvas.width, canvas.height);
                    try {
                      qrcode.decode();
                      navigator.mediaDevices.getUserMedia({ video: false }).then(function(stream) {
                        stream.getTracks().forEach(function(track) {
                          track.stop();
                        });
                      });
                    } catch (e) {}
                  }, 100);
                });
              }).catch(function(error) {
                console.error(error);
              });
            } else {
              alert("QR code scanning not supported in this browser");
            }
          }
          scanQRCode();
          qrcode.callback = function(result) {
            console.log(result);
            window.location.href = "/verify?code=" + encodeURIComponent(result);
          };
        </script>
      </body>
    </html>
  `);
});

app.get("/verify", (req, res) => {
  const code = req.query.code;
  if (code === "123456") {
    res.redirect("/hello-world.html");
  } else {
    res.send("Invalid code");
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
