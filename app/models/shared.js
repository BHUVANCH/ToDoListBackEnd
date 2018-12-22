const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let sharedSchema = new Schema({
    // adminemail: { type: String, default: '' },
    // adminId: { type: String, default: '' },
    listid: { type: String, default: '' },
    listName: { type: String, default: '' },
    useremail: { type: String, default: '' },
    userId: { type: String, default: '' },
    // events: [{}],
    // seen: { type: Boolean, default: false },
    createdOn: { type: Date, default: Date.now() },
    modifiedOn: { type: Date, default: Date.now() },
})

mongoose.model('Shared', sharedSchema);