 var app = angular.module('myApp',['ngRoute']);
        
        app.config(function($routeProvider) {
        $routeProvider
          .when("/", {
          templateUrl : 'index.html'
          })
          .when("/admin", {
          templateUrl : 'admin.html'
          })
          .when("/users",{
            templateUrl : 'users.html'
          })
        });
        
        app.controller('mainController', function($scope,$http){

          $scope.admin = function(){
            window.location = "http://localhost:3000/admin"
          }

          $scope.users = function(){
            window.location = "http://localhost:3000/users"
          }

        });