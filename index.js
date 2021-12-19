const express = require("express");
const router = require("./routes");
const app = express();
const port = 3030;

app.use('/scripts', express.static(__dirname + '/static/scripts'));
app.use('/styles', express.static(__dirname + '/static/styles'));

app.use(express.static(__dirname + '/static/'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(router);

app.set('views', __dirname + '/static');
app.set('view engine', 'pug');

app.listen(port, () => {
    console.log(`Started express app at http://127.0.0.1:${port};`);
});
