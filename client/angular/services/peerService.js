angular.module('prosePair').service('peerService', function(){
	var roomies = {};

	var instanceTag;
	var me;
	var personWhoseTurn;

	var service = {};

	service.setNextTurn = function(person, callback){
		personWhoseTurn = person;
		return personWhoseTurn == me;
	};

	service.whoseTurn = function(){
		return personWhoseTurn;
	}

	service.myTurn = function(){
		personWhoseTurn = me;
	};

	service.isMyTurn = function(){
		return personWhoseTurn == me;
	};

	service.isTurn = function(person){
		return person == personWhoseTurn;
	};

	service.addPeersNTag = function(list, tag){
		roomies = list;
		instanceTag = tag;
		for (var turn in roomies){
			if (roomies[turn]){
				personWhoseTurn = turn;
			}
		}
	};

	service.addPeer = function(peer, turnStatus){
		roomies[peer] = turnStatus;
	};

	service.removePeer = function(peerName){
		for (var peer in roomies){
			if (peer == peerName){
				delete roomies[peer];
			}
		}
	};

	service.turnChange = function(callback){
		var roomiesArr = Object.keys(roomies);
		var mIndex = roomiesArr.indexOf(me);
	
		if (mIndex == roomiesArr.length - 1){
			personWhoseTurn = roomiesArr[0];
		}else{
			personWhoseTurn = roomiesArr[mIndex + 1];
		}

		for(peer in roomies){
			if (peer = personWhoseTurn){
				roomies[peer] = true;
			}else{
				roomies[peer] = false;
			}

		}

		callback(personWhoseTurn, instanceTag)
	}

	service.showTag = function(){
		return instanceTag;
	}

	service.getPeers = function(){
		var peers = [];

		for (var peer in roomies){
			if (me && peer != me){
				peers.push(peer)
			}
		};

		return peers;
	}

	service.informMyself = function(mineSelf){
		me = mineSelf;
	}

	service.revealMyself = function(){
		return me; 
	}

	service.getMyInitTurn = function(){
		return roomies[me];
	}

	return service
});