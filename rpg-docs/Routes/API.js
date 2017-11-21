Router.map(function() {
	this.route("vmixCharacter", {
		path: "/vmix-character/:_id/",
		where: "server",
		action: function() {
			this.response.setHeader("Content-Type", "application/json");
			var query = this.params.query;
			var key = query && query.key;
			ifKeyValid(key, this.response, () =>
				this.response.end(vMixCharacter(this.params._id))
			);
		},
	});
	this.route("vmixParty", {
		path: "/vmix-party/:_id/",
		where: "server",
		action: function() {
			this.response.setHeader("Content-Type", "application/json");
			var query = this.params.query;
			var key = query && query.key;
			ifKeyValid(key, this.response, () =>
				this.response.end(vMixParty(this.params._id))
			);
		},
	});
});

var ifKeyValid = function(apiKey, response, callback){
	if (!apiKey){
		response.writeHead(403, "You must use an api key to access this api");
		response.end();
	} else if (!isKeyValid(apiKey)){
		response.writeHead(403, "API key is invalid");
		response.end();
	} else if (isRateLimited(apiKey)){
		response.writeHead(429, "Too many requests");
		response.end();
	} else {
		rateLimiter.increment({apiKey})
		callback();
	}
};

var isKeyValid = function(apiKey){
	return !!Meteor.users.findOne({apiKey});
};

var rateLimiter = new RateLimiter();
rateLimiter.addRule({apiKey: String}, 2, 10000);

var isRateLimited = function(apiKey){
	return !rateLimiter.check({apiKey}).allowed;
};
