var clientManager = require('./../managers/clientManager.js')

module.exports = function(server){

	var io = require("socket.io").listen(server);

	io.sockets.on('connection', function(socket){
		console.log('User ' + socket.id + ' connected');

		socket.on('connectProse', function(data){
			console.log('incoming data via socket', data.name)
			clientManager.connectClient(data, socket, function(info){
				if (info.success){
					var nameList = [];
					for (var i in info.roomList){
						nameList.push(clientManager.allSocketsConnected[info.roomList[i]]);
					}

					io.sockets.in(info.room).emit('successConnect', nameList)
				}else{
					socket.emit('queued')
				}
			})
		});

	});

	return io
}