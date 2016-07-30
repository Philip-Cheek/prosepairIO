module.exports = function(app){
	app.get('/', function(req, res){
		return res.sendFile('../../client/index.html')
	})
}