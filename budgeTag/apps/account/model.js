var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.Types.ObjectId,
    tagModel = require('../tag/model'),
    passportLocalMongoose = require('passport-local-mongoose');

var Service = tagModel.Service,
    Issue = tagModel.Issue;

var userSchema = new Schema({
    checked: [{
        service: {type: ObjectId, ref: 'Service'},
        issue: {type: ObjectId, ref: 'Issue'},
        type: {type: Number}
    }],
    _checked: [{
        service: String,
        issue: String
    }],
    type: {type: Number}
});

userSchema.plugin(passportLocalMongoose);

var User = mongoose.model('User', userSchema);

module.exports = {
    User: User,
    userSchema: userSchema
};
