angular.module('prosePair').service('peerService', function(){
	var roomies = {};

	var instanceTag;
	var me;
	var personWhoseTurn;
	var sampleFair;

	var service = {};

	service.setNextTurn = function(person, callback){
		personWhoseTurn = person;
		return personWhoseTurn == me;
	};

	service.getSampleFair = function(){
		return sampleFair;
	}

	service.setSampleFair = function(person){
		sampleFair = findNextPersonFrom(person);
	}

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
		setNewRoom();
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
		personWhoseTurn = findNextPersonFrom(personWhoseTurn);

		for(peer in roomies){
			roomies[peer] = peer == personWhoseTurn;
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
	};

	service.revealMyself = function(){
		return me; 
	};

	service.clearFair = function(){
		sampleFair = "";
	}

	service.getMyInitTurn = function(){
		return roomies[me];
	};

	function setNewRoom(){
		var roomies = {};

		var instanceTag = "";
		var personWhoseTurn = "";
		var sampleFair;
	}

	function findNextPersonFrom(person){

		var roomieArr = Object.keys(roomies);
		var pIndex = roomieArr.indexOf(person);
	
		if (pIndex == roomieArr.length - 1){
			return roomieArr[0];
		}else{
			return roomieArr[pIndex + 1];
		}
	}

	return service
});