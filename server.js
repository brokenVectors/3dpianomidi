const express = require('express');
const path = require('path');
const app = express();
const port = 9000;
app.use(express.static('client'));

app.use("/", (req,res) => {
    res.sendFile(path.join(__dirname + "/client/piano.html"));
})

app.listen(port, () => {
    console.log("App listening on port " + port)
});