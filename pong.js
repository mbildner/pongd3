var pong = angular.module('pong', []);

pong.factory('pongService', function() {
  window.addEventListener('keydown', onKeyDown, false);
  window.addEventListener('keyup', onKeyUp, false);

  var allGames = {};
  var nextId = 0;
  var upPressed = false;
  var downPressed = false;

  requestAnimationFrame(nextFrame);

  function onKeyDown(event) {
    if (event.which === 38) {
      event.preventDefault();
      upPressed = true;
      return false;
    } else if (event.which === 40) {
      event.preventDefault();
      downPressed = true;
      return false;
    }
  }

  function onKeyUp(event) {
    if (event.which === 38) {
      event.preventDefault();
      upPressed = false;
      return false;
    } else if (event.which === 40) {
      event.preventDefault();
      downPressed = false;
      return false;
    }
  }

  function nextFrame() {
    for (var id in allGames) {
      var game = allGames[id]
      game.update();
      game.draw();
    }

    requestAnimationFrame(nextFrame);
  }

  function PongGame(canvas) {
    this.id = nextId++;
    this.games = [];

    this.canvas = canvas;
    this.context = canvas.getContext("2d");
    this.onGameOver = function(){};

    this.paddingX = canvas.width * 0.04;
    this.paddingY = canvas.height * 0.04;
    this.paddleWidth = canvas.width * 0.08;
    this.paddleHeight = canvas.height * 0.25;
    this.ballRadius = canvas.height * 0.08;
    this.paddleSpeed = canvas.height * 0.02;

    allGames[this.id] = this;

    this.restart();
  }

  PongGame.prototype.restart = function() {
    this.startDate = new Date();
    this.playerY = this.canvas.height / 2 - this.paddleHeight / 2;
    this.aiY = this.playerY;
    this.ballPosX = this.canvas.width / 2;
    this.ballPosY = this.canvas.height / 2;
    var ballAngle = Math.PI * 2 * Math.random();
    var ballSpeed = 0.7 + Math.random() * 4;
    this.ballVelX = Math.cos(ballAngle) * ballSpeed;
    this.ballVelY = Math.sin(ballAngle) * ballSpeed;

    this.aiWantPosY = this.ballPosY;
  };

  PongGame.prototype.update = function() {
    this.ballPosX += this.ballVelX;
    this.ballPosY += this.ballVelY;

    if (upPressed && !downPressed) {
      this.playerY -= this.paddleSpeed;
      if (this.playerY < 0) this.playerY = 0;
    } else if (downPressed && !upPressed) {
      this.playerY += this.paddleSpeed;
      if (this.playerY + this.paddleHeight > this.canvas.height) {
        this.playerY = this.canvas.height - this.paddleHeight;
      }
    }

    var dist = this.aiWantPosY - (this.aiY + this.paddleHeight / 2);
    if (dist > this.paddleSpeed * 2) {
      this.aiY += this.paddleSpeed;
      if (this.aiY + this.paddleHeight > this.canvas.height) {
        this.aiY = this.canvas.height - this.paddleHeight;
      }
    } else if (dist < -this.paddleSpeed * 2) {
      this.aiY -= this.paddleSpeed;
      if (this.aiY < 0) this.aiY = 0;
    }
    dist = this.ballPosY - (this.aiY + this.paddleHeight / 2);
    if (Math.abs(dist) > this.paddleHeight) {
      this.aiWantPosY = this.ballPosY;
    }

    if (this.ballPosY - this.ballRadius < 0) {
      this.ballVelY = Math.abs(this.ballVelY);
    }
    if (this.ballPosY + this.ballRadius >= this.canvas.height) {
      this.ballVelY = -Math.abs(this.ballVelY);
    }

    if (this.ballPosX - this.ballRadius < this.paddingX + this.paddleWidth) {
      dist = this.ballPosY - (this.playerY + this.paddleHeight / 2);
      if (Math.abs(dist) > this.paddleHeight / 2 + this.ballRadius) {
        this.lose();
        return;
      }
      // hit player's paddle
      this.ballVelX = Math.abs(this.ballVelX);
    }
    if (this.ballPosX + this.ballRadius > this.canvas.width - this.paddingX - this.paddleWidth) {
      dist = this.ballPosY - (this.aiY + this.paddleHeight / 2);
      if (Math.abs(dist) > this.paddleHeight / 2 + this.ballRadius) {
        this.win();
        return;
      }
      // hit ai's paddle
      this.ballVelX = -Math.abs(this.ballVelX);
    }
  };

  PongGame.prototype.draw = function() {
    this.context.fillStyle = '#000000';
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // paddles
    this.context.strokeStyle = '#ffffff';
    this.context.strokeRect(this.paddingX, this.playerY,
        this.paddleWidth, this.paddleHeight);
    this.context.strokeRect(this.canvas.width - this.paddingX - this.paddleWidth, this.aiY,
        this.paddleWidth, this.paddleHeight);

    // circle for ball
    this.context.beginPath();
    this.context.arc(this.ballPosX, this.ballPosY, this.ballRadius, 0, 2 * Math.PI);
    this.context.closePath();
    this.context.strokeStyle = '#ffffff';
    this.context.stroke();

  };


  PongGame.prototype.lose = function() {
    this.games.push({
      win: false,
      duration: (new Date()) - this.startDate,
    });
    this.onGameOver();
    this.restart();
  };

  PongGame.prototype.win = function() {
    this.games.push({
      win: true,
      duration: (new Date()) - this.startDate,
    });
    this.onGameOver();
    this.restart();
  };

  return {PongGame: PongGame};
});

pong.directive('game', ['pongService', function(pongService) {
  return {
    template: '<canvas width="200" height="200"></canvas>',
    link: function(scope, element, attrs) {
      var canvas = element.children()[0];
      var game = new pongService.PongGame(canvas);
    },
  };
}]);

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







