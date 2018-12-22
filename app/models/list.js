const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let listSchema = new Schema({
    userId: { type: String, default: '' },
    userEmail: { type: String, default: '' },
    listdetails:[{}],
})

mongoose.model('List', listSchema);

