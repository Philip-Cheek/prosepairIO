var clientManager = require('./../managers/clientManager.js')

module.exports = function(server){

	var io = require("socket.io").listen(server);

	io.sockets.on('connection', function(socket){
		console.log('User ' + socket.id + ' connected');

		socket.on('connectProse', function(data){
			console.log('incoming data via socket', data.name)
			clientManager.connectClient(data, socket, function(info){
				if (info.success){
					var  reInfo = {
						'tag': info.roomTag,
						'nameList': {}
					};

					for (var i in info.roomList){
						var roomie = info.roomList[i];


						if (roomie == info.turn){
							reInfo.nameList[roomie] = true;
						}else{
							reInfo.nameList[roomie] = false;
						}
					}

					io.sockets.in(info.room).emit('successConnect', reInfo);
				}else{
					socket.emit('queued');
				}
			})
		});

		socket.on("trigger next turn", function(info){
			console.log("trigger next turn hit!", info.text)
			var roomForSure = clientManager.roomByTag[info.tag];
			io.sockets.in(roomForSure).emit('turnChange', info)
		});

		socket.on("userType", function(tag){
			var roomForSure = clientManager.roomByTag[tag];
			socket.broadcast.to(roomForSure).emit("otherUserIsTyping");
		});

		socket.on("titleBeingChanged", function(info){
			var roomForSure = clientManager.roomByTag[info.tag];
			socket.broadcast.to(roomForSure).emit("titleChangedByOther", info);
		});

		socket.on('titleUpdate', function(info){
			var roomForSure = clientManager.roomByTag[info.tag];
			socket.broadcast.to(roomForSure).emit('pollTitle', info)
		});

		socket.on('disconnect', function(){
			console.log('disconnect' + socket.id)

			if (socket.id in clientManager.allSocketsConnected){
				clientManager.scrubUser(socket.id, function(name, roomArr){
					for (var room = 0; room < roomArr.length; room++){
						socket.broadcast.to(roomArr[room]).emit('peerLeft', name);
					}
				})
			}
		});

	});

	return io
}