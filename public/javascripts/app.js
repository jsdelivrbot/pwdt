angular.module('nodeTodo', [])
.controller('mainController', ($scope, $http) => {
  $scope.formData = {};
  $scope.todoData = {};
  $scope.proteinData = {};
  $scope.queryData = {};
  // Get all todos
  $http.get('/api/v1/todos')
  .success((data) => {
    $scope.todoData = data;
    console.log(data);
  })
  .error((error) => {
    console.log('Error: ' + error);
  });
  // Create a new todo
  $scope.createTodo = () => {
    $http.post('/api/v1/todos', $scope.formData)
    .success((data) => {
      $scope.formData = {};
      $scope.todoData = data;
      console.log(data);
    })
    .error((error) => {
      console.log('Error: ' + error);
    });
  };
  // Query todo
  $scope.queryTodo = () => {
    var proteinList = $scope.proteinData.text;
    proteinList = proteinList.replace(new RegExp('\n', 'g'), ",");
    $http.get('/api/v1/except/' + proteinList)
    .success((data) => {
      $scope.exceptData = data;
      console.log(data);
    })
    .error((error) => {
      console.log('Error: ' + error);
    });
    $http.get('/api/v1/query/' + proteinList)
    .success((data) => {
      $scope.queryData = data;
      console.log(data);
    })
    .error((error) => {
      console.log('Error: ' + error);
    });
  };
  // Delete a todo
  $scope.deleteTodo = (todoID) => {
    $http.delete('/api/v1/todos/' + todoID)
    .success((data) => {
      $scope.todoData = data;
      console.log(data);
    })
    .error((data) => {
      console.log('Error: ' + data);
    });
  };
});