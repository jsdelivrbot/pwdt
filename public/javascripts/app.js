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
  $scope.results = {}

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

    $scope.results = {
      identified: [],
      quantified: [],
      good_linearity: []
    }

    console.log('query');
    var specificity = $scope.specificity.text;
    console.log($scope.specificity.text);
    console.log('again');
    var proteinList = $scope.proteinData.text.toUpperCase();
    $scope.proteinData.text = '';
    proteinList = proteinList.replace(/;\s+/g, ",").replace(/,\s+/g, ",").replace(/\s+/g, ',');
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
        $scope.results.identified.push({"swiss_prot_id": protein.swiss_prot_id, "gene_name": protein.gene_name, "entry_name": protein.entry_name, "protein_name": protein.protein_name, "specificity": protein.identified=='#N/A'? 'N/A' : protein.identified, "recommendation": protein.identified=='Both'? 'Undepleted' : protein.identified=='#N/A'? 'Cannot be identified in either' : protein.identified});
        $scope.results.quantified.push({"swiss_prot_id": protein.swiss_prot_id, "gene_name": protein.gene_name, "entry_name": protein.entry_name, "protein_name": protein.protein_name, "specificity": protein.quantified=='#N/A'? 'N/A' : protein.quantified, "recommendation": protein.quantified=='Both'? 'Undepleted' : protein.quantified=='#N/A'? 'Cannot be quantified in either' : protein.quantified});
        $scope.results.good_linearity.push({"swiss_prot_id": protein.swiss_prot_id, "gene_name": protein.gene_name, "entry_name": protein.entry_name, "protein_name": protein.protein_name, "specificity": protein.good_linearity=='#N/A'? 'N/A' : protein.good_linearity, "recommendation":  protein.good_linearity=='#N/A'? 'Outside linear range' : protein.good_linearity!='Both'? protein.good_linearity : protein.broader_linear_range=='Same'? 'Undepleted' : protein.broader_linear_range});

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
        else if (protein.good_linearity == "Undepleted" || protein.good_linearity == "Depleted") {
          $scope.querySpecificity.good_linearity[protein.good_linearity].push(protein.swiss_prot_id);
          $scope.querySpecificity.broader_linear_range[protein.good_linearity].push(protein.swiss_prot_id);
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
        $scope.updateChartLinearity(specificity);
      }
      else {
        $scope.updateChart(specificity);
      }
    })
    .error((error) => {
      console.log('Error: ' + error);
    });
  };

  $scope.export = function() {
    jQuery(function ($) {
      $('#export').tableExport({type:'csv', fileName: 'PlasmaPilot_Results'});
    });
  }

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
      spec = 'Identifiable';
      store.update('Identifiable', {undepleted: 171 - $scope.querySpecificity[specificity].Undepleted.length});
      //store.update('Identifiable', {u_query: 0});
      store.update('Identifiable', {depleted: 301 - $scope.querySpecificity[specificity].Depleted.length});
      //store.update('Identifiable', {d_query: 0});
      store.update('Identifiable', {both: 285 - $scope.querySpecificity[specificity].Both.length});
      //store.update('Identifiable', {b_query: 0});
      store.update('Identifiable', {na: 0 - $scope.querySpecificity[specificity].NA.length});
      //store.update('Identifiable', {na_query: 0});
      store.update('Quantifiable', {undepleted: 119});
      store.update('Quantifiable', {u_query: 0});
      store.update('Quantifiable', {depleted: 326});
      store.update('Quantifiable', {d_query: 0});
      store.update('Quantifiable', {both: 199});
      store.update('Quantifiable', {b_query: 0});
      store.update('Quantifiable', {na: 113});
      store.update('Quantifiable', {na_query: 0});
    }
    else if (specificity == 'quantified') {
      spec = 'Quantifiable';
      store.update('Quantifiable', {undepleted: 119 - $scope.querySpecificity[specificity].Undepleted.length});
      //store.update('Quantifiable', {u_query: 0});
      store.update('Quantifiable', {depleted: 326 - $scope.querySpecificity[specificity].Depleted.length});
      //store.update('Quantifiable', {d_query: 0});
      store.update('Quantifiable', {both: 199 - $scope.querySpecificity[specificity].Both.length});
      //store.update('Quantifiable', {b_query: 0});
      store.update('Quantifiable', {na: 113 - $scope.querySpecificity[specificity].NA.length});
      //store.update('Quantifiable', {na_query: 0});
      store.update('Identifiable', {undepleted: 171});
      store.update('Identifiable', {u_query: 0});
      store.update('Identifiable', {depleted: 301});
      store.update('Identifiable', {d_query: 0});
      store.update('Identifiable', {both: 285});
      store.update('Identifiable', {b_query: 0});
      store.update('Identifiable', {na: 0});
      store.update('Identifiable', {na_query: 0});
    }
    // var store = dataSource.store();
    store.byKey(spec).done(function (dataItem) {
      store.update(spec, { u_query : $scope.querySpecificity[specificity].Undepleted.length});
      //store.update(spec, { undepleted : dataItem.undepleted - $scope.querySpecificity[specificity].Undepleted.length});
      store.update(spec, { d_query : $scope.querySpecificity[specificity].Depleted.length});
      //store.update(spec, { depleted : dataItem.depleted - $scope.querySpecificity[specificity].Depleted.length});
      store.update(spec, { b_query : $scope.querySpecificity[specificity].Both.length});
      //store.update(spec, { both : dataItem.both - $scope.querySpecificity[specificity].Both.length});
      store.update(spec, { na_query : $scope.querySpecificity[specificity].NA.length});
      //store.update(spec, { na : dataItem.na - $scope.querySpecificity[specificity].NA.length});
    });

    store.update('Linearity (r\u00B2>0.8)', { u_query : 0});
    store.update('Linearity (r\u00B2>0.8)', { undepleted : 113});
    store.update('Linearity (r\u00B2>0.8)', { d_query : 0});
    store.update('Linearity (r\u00B2>0.8)', { depleted : 320});
    store.update('Linearity (r\u00B2>0.8)', { b_query : 0});
    store.update('Linearity (r\u00B2>0.8)', { both : 155});
    store.update('Linearity (r\u00B2>0.8)', { na_query : 0});
    store.update('Linearity (r\u00B2>0.8)', { na : 169});
    store.update('Broader Linear Range', { u_query : 0});
    store.update('Broader Linear Range', { undepleted : 146});
    store.update('Broader Linear Range', { d_query : 0});
    store.update('Broader Linear Range', { depleted : 370});
    store.update('Broader Linear Range', { b_query :0});
    store.update('Broader Linear Range', { both : 72});
    dataSource.load();
  };
  $scope.updateChartLinearity = (specificity) => {
    console.log(specificity + 'updating');
    if ($scope.querySpecificity[specificity] == undefined) {
      console.log('undefined');
      return;
    }
    var store = dataSource.store();
    store.update('Linearity (r\u00B2>0.8)', { u_query : $scope.querySpecificity[specificity].Undepleted.length});
    store.update('Linearity (r\u00B2>0.8)', { undepleted : 113 - $scope.querySpecificity[specificity].Undepleted.length});
    store.update('Linearity (r\u00B2>0.8)', { d_query : $scope.querySpecificity[specificity].Depleted.length});
    store.update('Linearity (r\u00B2>0.8)', { depleted : 320 - $scope.querySpecificity[specificity].Depleted.length});
    store.update('Linearity (r\u00B2>0.8)', { b_query : $scope.querySpecificity[specificity].Both.length});
    store.update('Linearity (r\u00B2>0.8)', { both : 155 - $scope.querySpecificity[specificity].Both.length});
    store.update('Linearity (r\u00B2>0.8)', { na_query : $scope.querySpecificity[specificity].NA.length});
    store.update('Linearity (r\u00B2>0.8)', { na : 169 - $scope.querySpecificity[specificity].NA.length});
    store.update('Broader Linear Range', { u_query : $scope.querySpecificity.broader_linear_range.Undepleted.length});
    store.update('Broader Linear Range', { undepleted : 146 - $scope.querySpecificity.broader_linear_range.Undepleted.length});
    store.update('Broader Linear Range', { d_query : $scope.querySpecificity.broader_linear_range.Depleted.length});
    store.update('Broader Linear Range', { depleted : 370 - $scope.querySpecificity.broader_linear_range.Depleted.length});
    store.update('Broader Linear Range', { b_query : $scope.querySpecificity.broader_linear_range.Same.length});
    store.update('Broader Linear Range', { both : 72 - $scope.querySpecificity.broader_linear_range.Same.length});
    store.update('Identifiable', {undepleted: 171});
    store.update('Identifiable', {u_query: 0});
    store.update('Identifiable', {depleted: 301});
    store.update('Identifiable', {d_query: 0});
    store.update('Identifiable', {both: 285});
    store.update('Identifiable', {b_query: 0});
    store.update('Identifiable', {na: 0});
    store.update('Identifiable', {na_query: 0});
    store.update('Quantifiable', {undepleted: 119});
    store.update('Quantifiable', {u_query: 0});
    store.update('Quantifiable', {depleted: 326});
    store.update('Quantifiable', {d_query: 0});
    store.update('Quantifiable', {both: 199});
    store.update('Quantifiable', {b_query: 0});
    store.update('Quantifiable', {na: 113});
    store.update('Quantifiable', {na_query: 0});
    dataSource.load();

    console.log(store);
  }
});

var dataSource = new DevExpress.data.DataSource({
  store: {
    type: 'array',
    key: 'sensitivity',
    data: [{
        sensitivity: "Identifiable",
        undepleted: 171,
        u_query: 0,
        depleted: 301,
        d_query: 0,
        both: 285,
        b_query: 0,
        na: 0,
        na_query: 0
    }, {
        sensitivity: "Quantifiable",
        undepleted: 119,
        u_query: 0,
        depleted: 326,
        d_query: 0,
        both: 199,
        b_query: 0,
        na: 113,
        na_query: 0
    }, {
        sensitivity: "Linearity (r\u00B2>0.8)",
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
        undepleted: 146, // 33 + 113
        u_query: 0,
        depleted: 370, // 50 + 320
        d_query: 0,
        both: 72,
        b_query: 0
        // na: 602,
        //na_query: 0
    }]
  }
});

app.controller('chartController', ($scope, $http) => {
    $scope.tooltipInstance = {};
    $scope.specDict = {
      'Identifiable': 'identified',
      'Quantifiable': 'quantified',
      'Linearity (r\u00B2>0.8)': 'good_linearity',
      'Broader Linear Range': 'broader_linear_range'
    };

    $scope.chartOptions = {
        dataSource : dataSource,
        commonSeriesSettings: {
            argumentField: "sensitivity",
            type: "stackedBar", 
            ignoreEmptyPoints: true,
            label: {
              showForZeroValues: false,
              position: 'outside',
              font: {
                color: '#000000'
              },
              backgroundColor: "rgba(100, 100, 100, 0.5);",
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
            { valueField: "u_query", name: "Undepleted: Query Proteins", stack: "Undepleted", color: "#B71C1C", showInLegend: false, label:{ visible: true, font:{color: "#B71C1C"}} },
            { valueField: "d_query", name: "Depleted: Query Proteins", stack: "Depleted", color: "#33691E", showInLegend: false, label:{ visible: true, font:{color: "#33691E"}} },
            { valueField: "b_query", name: "Both: Query Proteins", stack: "Both", color: "#0D47A1", showInLegend: false, label:{ visible: true, font:{color: "#0D47A1"}} },
            { valueField: "na_query", name: "N/A: Query Proteins", stack: "N/A", color: "#6A1B9A", showInLegend: false, label:{ visible: true, font:{color: "#6A1B9A"}} }
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
        argumentAxis: {
            label: {
                overlappingBehavior: "rotate",
                rotationAngle: -30
            }
        },
        valueAxis: {
            title: {
                text: "Number of Proteins"
            }
        },
        title: "Plasma Workflow Distribution",
        "export": {
            enabled: true,
            fileName: "Plasma_Workflow_Distribution",
            formats: ['PNG', 'PDF', 'JPEG']
        },
        tooltip: {
            enabled: true,
            customizeTooltip: function (arg) {
              console.log('here');
              console.log(arg);

              var specArg = $scope.specDict[arg.argumentText];

              // if (arg.value == 0) {
              //   return {
              //     text: ''
              //   }
              // }

              if (arg.seriesName == "Undepleted: Query Proteins") {
                return {
                  text: $scope.querySpecificity[specArg].Undepleted.toString().replace(new RegExp(',', 'g'), "\n")
                };
              }
              else if (arg.seriesName == "Depleted: Query Proteins") {
                return {
                  text: $scope.querySpecificity[specArg].Depleted.toString().replace(new RegExp(',', 'g'), "\n")
                };
              }
              else if (arg.seriesName == "Both: Query Proteins") {
                if (specArg == "broader_linear_range") {
                  return {
                    text: $scope.querySpecificity[specArg].Same.toString().replace(new RegExp(',', 'g'), "\n")
                  };
                }
                else {
                  return {
                    text: $scope.querySpecificity[specArg].Both.toString().replace(new RegExp(',', 'g'), "\n")
                  };
                }
              }
              else if (arg.seriesName == "N/A: Query Proteins") {
                return {
                  text: $scope.querySpecificity[specArg].NA.toString().replace(new RegExp(',', 'g'), "\n")
                };
              }
              else {
                return {
                    //text: arg.seriesName + ": " + arg.totalText
                    text: arg.seriesName + ": " + arg.value
                };
              }
            },
        }
    };
});