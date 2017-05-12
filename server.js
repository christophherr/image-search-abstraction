'use strict';

const express = require('express'),
mongo = require('mongodb'),
path = require('path'),
mongoose = require('mongoose'),
mongoPath = process.env.MONGOLAB_URI || 'mongodb://localhost:27017/',
db = mongoose.connection,
RecentSearches = require('./schema'),
BingSearch = require('node-bing-api') ({ accKey: process.env.BING_API_KEY }),
app = express();

app.set('port', process.env.PORT);

mongoose.connect(mongoPath);

db.on('error', (err) => {
    console.error(`${err.message}`);
});

app.listen(app.get('port'), () => {
      console.log('Node.js Server is listening on port ' + app.get('port'));
});

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/views/index.html');
});

 app.route('/api/latest/imagesearch').get((req, res) =>{
    RecentSearches.find({}, null, {
      "limit": 10,
      "sort": {
        "when": -1
      }
    }, (err, searchHistory) => {
      if (err) { 
        return console.error(err)
      };
      console.log(searchHistory);
      res.send(searchHistory.map((item) => {
         return {
          term: item.term,
          when: item.when
        };
      }));
    });
  });

  app.get('/api/imagesearch/:query', (req, res) => {
  let query = req.params.query,
    resultNumber= req.query.offset || 10,
    searchHistory = {
      "term": query,
      "when": new Date().toLocaleString()
    };
    
    if (query !== 'favicon.ico') {
      saveSearches(searchHistory);
    }
    BingSearch.images(query, {top: 10, skip: resultNumber}, (err, response, body) => {
		if (err) {
			console.error(err);
			return res.status(500).end(err.message);
		}
		res.json(body.value.map((result) => {
			return {
				Name: result.name,
				Image: result.thumbnailUrl,
				Website: result.hostPageDisplayUrl
      };
		}));
	});
  });

   function saveSearches(search) {
    let recentSearches = new RecentSearches(search);
    recentSearches.save((err, searchHistory) => {
      if (err) {
        throw err;
      }
      console.log('Saved ' + searchHistory);
    });
  }
