(function () {
  angular
    .module('chat', ['ngRoute'])

    .provider('deepstream', function () {
      var client = null;
      var _host = 'localhost';
      var _port = 6020;

      return {
        setHost: function (hostname) {
          _hostname = hostname;
        },
        setPort: function (port) {
          _port = port;
        },
        getAddress: function () {
          return _hostname + ':' + _port;
        },
        $get: function () {
          return deepstream(this.getAddress());
        }
      };
    })

    .factory('user', function () {
      var user = null;

      return {
        set: function (username) {
          user = username;
        },
        getUsername: function () {
          return user;
        }
      };
    })

    .factory('login', function ($http, $q, deepstream, user) {
      return function login (uname, psswd) {
        var auth = $q.defer();
        
        var authData = {
          username: uname || 'Guest',
          password: psswd || 'Guest'
        };
        var loginCallback = function (success, errCode, errMsg) {
          if (errCode && errMsg) {
            auth.reject(errMsg);
          } else {
            user.set(authData.username);
            auth.resolve(authData.username);
          }
        };
        deepstream.login(authData, loginCallback);

        return auth.promise;
      };
    })

    .factory('tmpl', function () { return tmpl; })

    .directive('authForm', function ($http, $location, tmpl, login) {
      return {
        restrict: 'E',
        replace: 'true',
        templateUrl: tmpl('auth-form'),
        link: function ($scope, $elem, attrs) {
          $elem.on('submit', function (e) {
            e.preventDefault();
            var uname = $elem[0].querySelector('[name=username]').value;
            var psswd = $elem[0].querySelector('[name=password]').value;
            login(uname, psswd).then(function () {
              $location.path('/home');
            }, function (errMsg) {
              alert(errMsg);
            });
          });
          $scope.$on('$destroy', function () {
            $elem.off('submit');
          });
        }
      };
    })

    .config(function backendSetup (deepstreamProvider) {
      deepstreamProvider.setHost('deepstream');
    })

    .config(function routesSetup ($routeProvider) {
      $routeProvider.otherwise('/');

      $routeProvider.when('/auth', {
        templateUrl: tmpl('auth')
      });

      $routeProvider.when('/home', {
        templateUrl: tmpl('home'),
        controllerAs: 'page',
        controller: function (user) {
          this.username = user.getUsername();
        }
      });

      $routeProvider.when('/', {
        redirectTo: '/home'
      });
    })

    .run(function ($rootScope, $location, user) {
      $rootScope.$on('$routeChangeStart', function (event, next) {
        var username = user.getUsername();
        var isAuthorized = (
          next.$$route.originalPath === '/auth'
          || username
        );

        if (!isAuthorized) { $location.path('/auth'); }
      });
    });
  ;

  function tmpl (templateName) {
    return 'templates/' + templateName + '.html';
  }
})();
