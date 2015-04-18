var mongoose = require('mongoose');
var findOrCreate = require('mongoose-findorcreate');


var userSchema = mongoose.Schema({
	"name" : { type: String },
    "full_name" : { type: String },
	"ig_id" : { type: String },
    "photo":{ type: String },
    "bio":{ type: String },
    "follower_count":{ type: String },
    "follows_count":{ type: String },
    "media_count":{ type: String },
	"access_token" : { type: String }
});

var fbUserSchema = mongoose.Schema({
   "first_name" : {type: String },
   "last_name" : {type: String },
   "link" : {type: String },
   "fb_id" : { type: String },
    "hometown": { type: String },
    "location": { type: String },
    "bio": { type: String },
    access_token : { type: String }
});

userSchema.plugin(findOrCreate);
fbUserSchema.plugin(findOrCreate);

exports.User = mongoose.model('User', userSchema);
exports.fbUser = mongoose.model('fbUser', fbUserSchema);


