const mongoose = require('mongoose'), 
      Schema = mongoose.Schema;

const recentSearchesSchema = new Schema({
  term: String,
  when: String
});

module.exports = mongoose.model('recent', recentSearchesSchema);