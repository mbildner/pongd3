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
			// template: '<p>Add Game:<input ng-model="dataset.games">{{dataset.games}}.</input></p>',

			link: function (scope, element, attrs) {

				var height = attrs['h'];
				var width = attrs['w'];

				var dataset = [
					{game_id: 1, wins: 10, losses: 5},
					{game_id: 1, wins: 4, losses: 3},
					{game_id: 2, wins: 10, losses: 8},
					{game_id: 3, wins: 3, losses: 1},
					{game_id: 4, wins: 5, losses: 4},
					{game_id: 5, wins: 1, losses: 15},
					{game_id: 6, wins: 17, losses: 3},
					{game_id: 7, wins: 14, losses: 5}
				];

				d3Service.d3()
					.then(function (d3) {

						var barWidth = (width / dataset.length);

						var maxBarHeight = d3.max(dataset, function (game) {
							return Math.max(game.wins, game.losses);
						});

						var barHeightScale = d3.scale.linear()
								.domain([0, maxBarHeight])
								.range([0, height]);


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
										return i * barWidth;
									})

									.attr('y', function (d, i) {
										var y = height - barHeightScale(d.wins);
										return y;
									})
									.attr('width', function (d, i) {
										return barWidth / 2;
									})
									.attr('height', function (d, i) {
										var height = d.wins;
										var scaledHeight = barHeightScale(height);
										return scaledHeight;
									})
									.style('fill', function (d, i) {
										var color = 'blue';
										return color;
									});

									// losses
									groups.append('rect')
										.attr('x', function (d, i) {
											return (i + .5) * barWidth;
										})
										.attr('y', function (d, i) {
											var x = height - barHeightScale(d.losses);
											return x;
										})
										.attr('width', function (d, i) {
											return barWidth / 2;
										})
										.attr('height', function (d, i) {
											return barHeightScale(d.losses);
										})
										.style('fill', function (d, i) {
											var color = 'red';
											return color;
										});

					});
			},
			restrict: 'A'
		};
}]);







