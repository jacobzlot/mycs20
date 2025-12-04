// imports modules
var http = require('http');
var url = require('url');
var fs = require('fs');
const MongoClient = require('mongodb').MongoClient;

// connect to mongo
var connStr = "mongodb+srv://jacobzlot:FSL9qsJZnFMS1xYv@cs20.0p4pcxu.mongodb.net/?retryWrites=true&w=majority&appName=CS20";

// Create server
http.createServer(function (req, res) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    var urlObj = url.parse(req.url, true);
    var path = urlObj.pathname;

    // Shows search form on home page
    if (path == "/") {
        file = "home.html";
        fs.readFile(file, function (err, home) {
            res.write(home);
            res.end();
        });
    } else if (path == "/process") { // Form submission
        var search = urlObj.query.search;
        var searchType = urlObj.query.searchType;

        //Search database
        async function doSearch() {
            var client = new MongoClient(connStr);
            await client.connect();
            var dbo = client.db("Stock");
            var collection = dbo.collection("PublicCompanies");

            //determine query based on user imput
            var query = {};
            if (searchType === 'ticker') {
                query = { ticker: search.toUpperCase() };
            } else {
                query = { companyName: new RegExp(search, 'i') };
            }

            // search database
            var results = await collection.find(query).toArray();

            //display results (if there are any)
            if (results.length === 0) {
                console.log("No results found for:", search);
            } else {
                for (var i = 0; i < results.length; i++) {
                    console.log("Company:", results[i].companyName);
                    console.log("Ticker:", results[i].ticker);
                    console.log("Price: $" + results[i].price);
                }
            }

            // output to server
            res.write("Complete. Check Console.");
            res.end();
            await client.close();
        }

        doSearch();
    }
}).listen(8080);