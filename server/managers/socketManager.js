var clientManager = require('./../managers/clientManager.js')

module.exports = function(server){

	var io = require("socket.io").listen(server);
	var i = 0;


	io.sockets.on('connection', function(socket){
		console.log('User ' + socket.id + ' connected');

		socket.on('connectProse', function(data){
			console.log('incoming data via socket', data.name)

			clientManager.connectClient(data, socket, function(info){
				if (info.success){
					var  reInfo = {
						'tag': info.roomTag,
						'nameList': {},
						'mode': data.type
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

		socket.on('memoBroadcast', function(info){
			var roomForSure = clientManager.roomByTag[info.tag];

			if (info.memo == "pollTitle"){
				i++;
				console.log('info.memo', info.memo)
				console.log('broadcast title polled' + i + 'times')
			}

			if ('body' in info){
				socket.broadcast.to(roomForSure).emit(info.memo, info.body);
			}else{
				socket.broadcast.to(roomForSure).emit(info.memo);
			}
		});

		socket.on('memoAll', function(info){
			if (info.memo == "pollTitle");{
				i++;
				console.log('all title polled' + i + 'times')
			}

			var roomForSure = clientManager.roomByTag[info.tag];

			if ('body' in info){
				io.sockets.in(roomForSure).emit(info.memo, info.body);
			}else{
				io.sockets.in(roomForSure).emit(info.memo);
			}
		})

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