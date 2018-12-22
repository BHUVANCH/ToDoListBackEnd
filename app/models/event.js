const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let eventSchema = new Schema({

    listId: { type: String, default: '' },
    listName: { type: String, default: '' },
    shared: [{}],
    taskArray: [[{}]],
    createdOn: { type: Date, default: Date.now() },
    modifiedOn: { type: Date, default: Date.now() },
})

mongoose.model('Event', eventSchema);

