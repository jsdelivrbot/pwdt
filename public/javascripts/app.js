// var chart = angular.module('chart', ['dx']);
var app = angular.module('pwdt', ['dx', 'angularUtils.directives.dirPagination']);

app.controller('mainController', ($scope, $http) => {
  $scope.formData = {};
  $scope.todoData = {};
  $scope.proteinData = {};
  $scope.queryData = {};
  $scope.specificity = {};
  $scope.querySpecificity = {};
  $scope.p = 5;

  $scope.sort = function(keyname){
    $scope.sortKey = keyname;   //set the sortKey to the param passed
    $scope.reverse = !$scope.reverse; //if true make it false and vice versa
  };

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
    // reset values
    $scope.querySpecificity = {
      identified: {
        Undepleted: [],
        Depleted: [],
        Both: [],
        NA: []
      },
      quantified: {
        Undepleted: [],
        Depleted: [],
        Both: [],
        NA: []
      },
      good_linearity: {
        Undepleted: [],
        Depleted: [],
        Both: [],
        NA: []
      },
      broader_linear_range: {
        Undepleted: [],
        Depleted: [],
        Same: [],
        NA: []
      }
    };
    console.log('query');
    var specificity = $scope.specificity.text;
    console.log($scope.specificity.text);
    console.log('again');
    var proteinList = $scope.proteinData.text.toUpperCase();
    $scope.proteinData.text = '';
    //proteinList = proteinList.replace(new RegExp(', ', 'g'), ",").replace(new RegExp('\n', 'g'), ",");
    proteinList = proteinList.replace(new RegExp(', ', 'g'), ",").replace(/\s+/g, ',');
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
      data.map(function(protein) {
        $scope.querySpecificity.identified[protein.identified].push(protein.swiss_prot_id);
        if (protein.quantified == "#N/A") {
          $scope.querySpecificity.quantified["NA"].push(protein.swiss_prot_id);
        }
        else {
          $scope.querySpecificity.quantified[protein.quantified].push(protein.swiss_prot_id);
        }
        if (protein.good_linearity == "#N/A") {
          $scope.querySpecificity.good_linearity["NA"].push(protein.swiss_prot_id);
        }
        else {
          $scope.querySpecificity.good_linearity[protein.good_linearity].push(protein.swiss_prot_id);
        }
        if (protein.broader_linear_range == "#N/A" || protein.broader_linear_range == "Inconclusive") {
          $scope.querySpecificity.broader_linear_range["NA"].push(protein.swiss_prot_id);
        }
        else {
          $scope.querySpecificity.broader_linear_range[protein.broader_linear_range].push(protein.swiss_prot_id);
        }
      });
      console.log($scope.querySpecificity);
      if (specificity == 'good_linearity') {
        console.log('HERE');
        $scope.updateChartLinearity(specificity);
      }
      else {
        $scope.updateChart(specificity);
      }
    })
    .error((error) => {
      console.log('Error: ' + error);
    });
    // $http.get('/api/v1/update/' + specificity + '/' + proteinList)
    // .success((data) => {
    //   $scope.updateData = data;
    //   $scope.updateIdentified(specificity, 1000);
    //   console.log(data[0][specificity]);
    //   console.log('here');
    // })
    // .error((error) => {
    //   console.log('Error: ' + error);
    // });
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
  $scope.updatePageSize = (size) => {
    $scope.p = size;
  };

  $scope.updateChart = (specificity) => {
    if ($scope.querySpecificity[specificity] == undefined) {
      console.log('undefined');
      return;
    }
    var spec = '';
    var store = dataSource.store();
    if (specificity == 'identified') {
      spec = 'Identified';
      store.update('Quantified', {undepleted: 119});
      store.update('Quantified', {u_query: 0});
      store.update('Quantified', {depleted: 326});
      store.update('Quantified', {d_query: 0});
      store.update('Quantified', {both: 199});
      store.update('Quantified', {b_query: 0});
      store.update('Quantified', {na: 113});
      store.update('Quantified', {na_query: 0});
    }
    else if (specificity == 'quantified') {
      spec = 'Quantified';
      store.update('Identified', {undepleted: 171});
      store.update('Identified', {u_query: 0});
      store.update('Identified', {depleted: 301});
      store.update('Identified', {d_query: 0});
      store.update('Identified', {both: 285});
      store.update('Identified', {b_query: 0});
      store.update('Identified', {na: 0});
      store.update('Identified', {na_query: 0});
    }
    // var store = dataSource.store();
    store.byKey(spec).done(function (dataItem) {
      store.update(spec, { u_query : $scope.querySpecificity[specificity].Undepleted.length});
      store.update(spec, { undepleted : dataItem.undepleted - $scope.querySpecificity[specificity].Undepleted.length});
      store.update(spec, { d_query : $scope.querySpecificity[specificity].Depleted.length});
      store.update(spec, { depleted : dataItem.depleted - $scope.querySpecificity[specificity].Depleted.length});
      store.update(spec, { b_query : $scope.querySpecificity[specificity].Both.length});
      store.update(spec, { both : dataItem.both - $scope.querySpecificity[specificity].Both.length});
      store.update(spec, { na_query : $scope.querySpecificity[specificity].NA.length});
      store.update(spec, { na : dataItem.na - $scope.querySpecificity[specificity].NA.length});
    });

    store.update('Good Linearity', { u_query : 0});
    store.update('Good Linearity', { undepleted : 113});
    store.update('Good Linearity', { d_query : 0});
    store.update('Good Linearity', { depleted : 320});
    store.update('Good Linearity', { b_query : 0});
    store.update('Good Linearity', { both : 155});
    store.update('Good Linearity', { na_query : 0});
    store.update('Good Linearity', { na : 169});
    store.update('Broader Linear Range', { u_query : 0});
    store.update('Broader Linear Range', { undepleted : 33});
    store.update('Broader Linear Range', { d_query : 0});
    store.update('Broader Linear Range', { depleted : 50});
    store.update('Broader Linear Range', { b_query :0});
    store.update('Broader Linear Range', { both : 72});
    dataSource.load();
  };
  $scope.updateChartLinearity = (specificity) => {
    if ($scope.querySpecificity[specificity] == undefined) {
      console.log('undefined');
      return;
    }
    var store = dataSource.store();
    store.update('Good Linearity', { u_query : $scope.querySpecificity[specificity].Undepleted.length});
    store.update('Good Linearity', { undepleted : 113 - $scope.querySpecificity[specificity].Undepleted.length});
    store.update('Good Linearity', { d_query : $scope.querySpecificity[specificity].Depleted.length});
    store.update('Good Linearity', { depleted : 320 - $scope.querySpecificity[specificity].Depleted.length});
    store.update('Good Linearity', { b_query : $scope.querySpecificity[specificity].Both.length});
    store.update('Good Linearity', { both : 155 - $scope.querySpecificity[specificity].Both.length});
    store.update('Good Linearity', { na_query : $scope.querySpecificity[specificity].NA.length});
    store.update('Good Linearity', { na : 169 - $scope.querySpecificity[specificity].NA.length});
    store.update('Broader Linear Range', { u_query : $scope.querySpecificity.broader_linear_range.Undepleted.length + $scope.querySpecificity[specificity].Undepleted.length});
    store.update('Broader Linear Range', { undepleted : 33 - $scope.querySpecificity.broader_linear_range.Undepleted.length});
    store.update('Broader Linear Range', { d_query : $scope.querySpecificity.broader_linear_range.Depleted.length + $scope.querySpecificity[specificity].Depleted.length});
    store.update('Broader Linear Range', { depleted : 50 - $scope.querySpecificity.broader_linear_range.Depleted.length});
    store.update('Broader Linear Range', { b_query : $scope.querySpecificity.broader_linear_range.Same.length});
    store.update('Broader Linear Range', { both : 72 - $scope.querySpecificity.broader_linear_range.Same.length});
    store.update('Identified', {undepleted: 171});
    store.update('Identified', {u_query: 0});
    store.update('Identified', {depleted: 301});
    store.update('Identified', {d_query: 0});
    store.update('Identified', {both: 285});
    store.update('Identified', {b_query: 0});
    store.update('Identified', {na: 0});
    store.update('Identified', {na_query: 0});
    store.update('Quantified', {undepleted: 119});
    store.update('Quantified', {u_query: 0});
    store.update('Quantified', {depleted: 326});
    store.update('Quantified', {d_query: 0});
    store.update('Quantified', {both: 199});
    store.update('Quantified', {b_query: 0});
    store.update('Quantified', {na: 113});
    store.update('Quantified', {na_query: 0});
    dataSource.load();
  }
});

// var chart = angular.module('chart', ['dx']);

var dataSource = new DevExpress.data.DataSource({
  store: {
    type: 'array',
    key: 'sensitivity',
    data: [{
        sensitivity: "Identified",
        undepleted: 171,
        u_query: 0,
        depleted: 301,
        d_query: 0,
        both: 285,
        b_query: 0,
        na: 0,
        na_query: 0
    }, {
        sensitivity: "Quantified",
        undepleted: 119,
        u_query: 0,
        depleted: 326,
        d_query: 0,
        both: 199,
        b_query: 0,
        na: 113,
        na_query: 0
    }, {
        sensitivity: "Good Linearity",
        undepleted: 113,
        u_query: 0,
        depleted: 320,
        d_query: 0,
        both: 155,
        b_query: 0,
        na: 169,
        na_query: 0
    }, {
        sensitivity: "Broader Linear Range",
        undepleted: 33,
        u_query: 0,
        depleted: 50,
        d_query: 0,
        both: 72,
        b_query: 0,
        // na: 602,
        na_query: 0
    }]
  }
});

app.controller('chartController', ($scope, $http) => {
    $scope.test = {};
    $scope.test.text = 'hello again';

    $scope.chartOptions = {
        dataSource : dataSource,
        commonSeriesSettings: {
            argumentField: "sensitivity",
            type: "stackedBar", 
            ignoreEmptyPoints: true,
            label: {
              showForZeroValues: false,
              position: 'outside',
              // format: {type: 'percent', percentPrecision: 2},
              customizeText: function() {
                return this.percent.toFixed(3) + "%";
              }
            }
        },
        series: [
            { valueField: "undepleted", name: "Undepleted", stack: "Undepleted", color: "#EF9A9A"},
            { valueField: "depleted", name: "Depleted", stack: "Depleted", color: "#A5D6A7" },
            { valueField: "both", name: "Both", stack: "Both", color: "#90CAF9" },
            { valueField: "na", name: "N/A", stack: "N/A", color: "#CE93D8" },
            { valueField: "u_query", name: "Undepleted: Query Proteins", stack: "Undepleted", color: "#B71C1C", showInLegend: false, label:{ visible: true} },
            { valueField: "d_query", name: "Depleted: Query Proteins", stack: "Depleted", color: "#33691E", showInLegend: false, label:{ visible: true} },
            { valueField: "b_query", name: "Both: Query Proteins", stack: "Both", color: "#0D47A1", showInLegend: false, label:{ visible: true} },
            { valueField: "na_query", name: "N/A: Query Proteins", stack: "N/A", color: "#6A1B9A", showInLegend: false, label:{ visible: true} }
        ],
        legend: {
            // horizontalAlignment: "right",
            // position: "inside",
            // border: { visible: true }
            verticalAlignment: "bottom",
            horizontalAlignment: "center",
            itemTextPosition: "right",
            // rowItemSpacing: 6, 
            columnItemSpacing: 8
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
  // $scope.updateIdentified = () => {
  //   console.log('button clicked');
  //   var store = dataSource.store();
  //   store.byKey('Identified').done(function (dataItem) {
  //     store.update('Identified', { u_query: 1000});
  //   });
  //   dataSource.load();
  // };
});