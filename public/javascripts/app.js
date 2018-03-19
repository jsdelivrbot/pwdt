// var chart = angular.module('chart', ['dx']);
var app = angular.module('pwdt', ['dx']);

app.controller('mainController', ($scope, $http) => {
  $scope.formData = {};
  $scope.todoData = {};
  $scope.proteinData = {};
  $scope.queryData = {};
  $scope.specificity = {};

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
  // Query proteins
  $scope.query = () => {
    var specificity = $scope.specificity.text;
    var proteinList = $scope.proteinData.text;
    $scope.proteinData.text = '';
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
    $http.get('/api/v1/update/' + specificity + '/' proteinList)
    .success((data) => {
      $scope.updateData = data;
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
  $scope.updateSpecificity = (specificity) => {
    $scope.specificity.text = specificity;
  };
});

// app.controller('chartController', function($scope) {
//   $scope.chartData = [1,2,3,4];
// });

// var chart = angular.module('chart', ['dx']);

app.controller('chartController', ($scope, $http) => {
    $scope.chartOptions = {
        dataSource : [{
            sensitivity: "Identified",
            undepleted: 171,
            u_query: 9.354,
            depleted: 301,
            d_query: 2.597,
            both: 285,
            b_query: 2.362,
            inconclusive: 0,
            i_query: 0
        }, {
            sensitivity: "Quantified",
            undepleted: 119,
            u_query: 5.793,
            depleted: 326,
            d_query: 4.67,
            both: 199,
            b_query: 5.462,
            inconclusive: 0,
            i_query: 0
        }, {
            sensitivity: "Good Linearity",
            undepleted: 113,
            u_query: 4.983,
            depleted: 320,
            d_query: 1.971,
            both: 155,
            b_query: 2.61,
            inconclusive: 0,
            i_query: 0
        }, {
            sensitivity: "Broader Linear Range",
            undepleted: 33,
            u_query: 4.363,
            depleted: 50,
            d_query: 1.105,
            both: 71,
            b_query: 1.501,
            inconclusive: 1,
            i_query: 1
        }],
        commonSeriesSettings: {
            argumentField: "sensitivity",
            type: "stackedBar"
        },
        series: [
            { valueField: "undepleted", name: "Undepleted", stack: "Undepleted", color: "#F44336" },
            { valueField: "u_query", name: "Undepleted: Query Proteins", stack: "Undepleted", color: "#B71C1C" },
            { valueField: "depleted", name: "Depleted", stack: "Depleted", color: "#8BC34A" },
            { valueField: "d_query", name: "Depleted: Query Proteins", stack: "Depleted", color: "#33691E" },
            { valueField: "both", name: "Both", stack: "Both", color: "#2196F3" },
            { valueField: "b_query", name: "Both: Query Proteins", stack: "Both", color: "#0D47A1" },
            { valueField: "inconclusive", name: "Inconclusive", stack: "Inconclusive", color: "#AB47BC" },
            { valueField: "i_query", name: "Inconclusive: Query Proteins", stack: "Inconclusive", color: "#6A1B9A" }
        ],
        legend: {
            horizontalAlignment: "right",
            position: "inside",
            border: { visible: true }
        },
        valueAxis: {
            title: {
                text: "Number of Proteins"
            }
        },
        title: "Plasma Distribution",
        "export": {
            enabled: true
        },
        tooltip: {
            enabled: true
        }
    };
});