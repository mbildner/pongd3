/*var partialDerp = angular.module('pong', [], function ($provide) {
	$provide.factory('indexedDBService', ['$q', '$scope', function ($q, $scope) {

	// var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
	// var IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
	// var IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;

	// var serviceInstance = {};

	// var open = function (dbname, version) {
	// 	var database = dbname;

	// 	var handleUpgrade = function (db) {
	// 		var donorObjectStore = db.createObjectStore("donor", {
	// 			autoIncrement: true
	// 		});
	// 		donorObjectStore.createIndex("name", "ContributorName");
	// 		donorObjectStore.createIndex("amount", "AggregateContribution");
	// 		donorObjectStore.createIndex("recipient", "RecipientName");
	// 	};

	// 	var deferred = $q.defer();

	/ 	var request = indexedDB.open(dbname, version);

	// 	var requestEvents = {};
	// 	requestEvents['success'] = request.addEventListener('success', function (event) {
	// 		var db = event.target.result;
	// 		deferred.resolve(db);
	// 	});

	// 	requestEvents['upgradeneeded'] = request.addEventListener('upgradeneeded', function (event) {
	// 		var db = event.target.result;
	// 		// where does db upgrade code go?
	// 		handleUpgrade(db);			
	// 	});
	// 	return deferred.promise;
	// };

	// var read = function (db, objectStoreName) {
	// 	var objectStore = db.transaction(database).objectStore(objectStoreName);
	// 	// tk
	// }


	return serviceInstance;
	}])
});


partialDerp.controller('cacheController', function ($scope, indexedDBService) {

	$scope.workingTest = "yup this shit fucking works";
});*/

var pong = angular.module('pong', []);
	pong.factory('d3Service', ['$document', '$q', '$rootScope',
		function ($document, $q, $rootScope) {
			var deferred = $q.defer();

			function onScriptLoad () {
				$rootScope.$apply(function () {
					deferred.resolve(window.d3);
				});
			}

			var scriptTag = $document[0].createElement('script');
			scriptTag.type = 'text/javascript';
			scriptTag.async = true;
			scriptTag.src = 'http://d3js.org/d3.v3.min.js';
			scriptTag.onreadystatechange = function () {
				if (this.readystate === 'complete') {
					onScriptLoad();
				}
			}

			scriptTag.onload = onScriptLoad;

			var s = $document[0].getElementsByTagName('body')[0];
			s.appendChild(scriptTag);

			return {
				d3: function () {
					return deferred.promise;
				}
			};

		}]);


pong.directive('barChart', ['d3Service', function (d3Service) {
		return {
			scope: {
				dataset: '='
			},
			template: '<p>{{gameLabel}}</p>',

			link: function (scope, element, attrs) {
				var height = 50;
				var width = 500;

				var dataset = [
					{game_id: 0, wins: 10, losses: 5},
					{game_id: 1, wins: 0, losses: 3},
					{game_id: 2, wins: 10, losses: 8},
					{game_id: 3, wins: 3, losses: 1},
					{game_id: 4, wins: 5, losses: 0},
					{game_id: 5, wins: 1, losses: 15},
					{game_id: 6, wins: 17, losses: 3},
					{game_id: 7, wins: 14, losses: 5}
				];

				d3Service.d3()
					.then(function (d3) {

						var maxBarHeight = d3.max(dataset, function (game) {
							return Math.max(game.wins, game.losses);
						});


						var barScale = d3.scale.linear()
															.domain([0, maxBarHeight])
															.range([0,height]);


						var svg = d3.select(element[0])
							.append('svg')
							.attr('height', height)
							.attr('width', width);

						var groups = svg.selectAll('g')
							.data(dataset)
								.enter()
								.append('g');

						
								// wins
								groups.append('rect')
									.attr('x', function (d, i) {
										return i * width / dataset.length;
									})

									.attr('y', function (d, i) {
										var y = height - barScale(d.wins);
										return y;
									})
									.attr('width', function (d, i) {
										return (width / dataset.length) / 2;
									})
									.attr('height', function (d, i) {
										var height = d.wins;
										var scaledHeight = barScale(height);
										return scaledHeight;
									})
									.style('fill', function (d, i) {
										var color = 'blue';
										return color;
									});

									// losses
									groups.append('rect')
										.attr('x', function (d, i) {
											return i * (width / dataset.length);
										})
										.attr('y', function (d, i) {
											var x = height - barScale(d.losses);
											return x;
										})
										.attr('width', function (d, i) {
											return (width / dataset.length) / 2;
										})
										.attr('height', function (d, i) {
											return barScale(d.losses);
										})
										.style('fill', function (d, i) {
											var color = 'red';
											return color;
										});

					});
			},
			restrict: 'EA'
		};
}]);







