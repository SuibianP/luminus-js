const luminus = require('../').default;
let client = new luminus();
it('Test login token', function() {
	return client.login("", "");
});
