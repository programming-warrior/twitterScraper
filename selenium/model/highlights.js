const mongoose = require('mongoose');

const { Schema } = mongoose;

const highlightSchema = new Schema({
    date: String,
    time: String,
    ip: String,
    trends: [{ title: String }]
})

const Highlight = mongoose.model('HighLight', highlightSchema);

module.exports = Highlight;