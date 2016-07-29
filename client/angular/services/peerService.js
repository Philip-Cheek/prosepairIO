angular.module('prosePair').service('peerService', function(){
	var peers = [];
	var service = {};
	var me;

	service.addPeers = function(list){
		for (peer in list){
			if (list[peer] != me){
				peers.push(list[peer]);
			}
		}
	}

	service.addPeer = function(peer){
		peers.push(peer);
	}

	service.getPeers = function(){
		return peers;
	}

	service.informMyself = function(mineSelf){
		me = mineSelf;
	}

	return service
});