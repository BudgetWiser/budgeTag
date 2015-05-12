var mongoose = require('mongoose');

var Schema = mongoose.Schema,
    ObjectId = Schema.Types.ObjectId,
    Mixed = Schema.Types.Mixed;

/*
 * Tag schema
 */

var issueSchema = new Schema({
    keyword: String,
    sum: Number,
    services: [{
        _id: String,
        name: String,
        sum: Number,
        categories: [String],
        agree: Number,
        disagree: Number,
        noidea: Number
    }]
});

/*
 * Budget schema
 */

var serviceSchema = new Schema({
    name: String,
    sum: [Number],
    categories: [String]
});

/*
 * Initialize Db models
 */

var Issue = mongoose.model('Issue', issueSchema),
    Service = mongoose.model('Service', serviceSchema);

/*
 * Export DB models
 */

module.exports = {
    Issue: Issue,
    Service: Service
};
