// var chart = angular.module('chart', ['dx']);
//const path = require('path');
var app = angular.module('pwdt', ['dx', 'angularUtils.directives.dirPagination', 'ngSanitize']);

app.factory('spec', function(){
  return {
    specificity: {
      text: ''
    }
  };
});

app.directive('tooltip', function(){
    return {
        restrict: 'A',
        link: function(scope, element, attrs){
            element.hover(function(){
                // on mouseenter
                element.tooltip('show');
            }, function(){
                // on mouseleave
                element.tooltip('hide');
            });
        }
    };
});

app.controller('mainController', ($scope, $http, spec) => {
  if (window.performance) {
    console.info("window.performance works fine on this browser");
  }
    if (performance.navigation.type == 1) {
      console.info( "This page is reloaded" );
      sessionStorage.clear()
    } else {
      console.info( "This page is not reloaded");
    }

  $scope.formData = {};
  $scope.todoData = {};
  $scope.proteinData = {
    text: ''
  };
  console.log(sessionStorage)
  $scope.queryData = [];
  if (sessionStorage.getItem('queryData') != null) {
    $scope.queryData = JSON.parse(sessionStorage.getItem('queryData'))
  }

  $scope.specificity = spec.specificity;
  if (sessionStorage.getItem('specificity') != null) {
    $scope.specificity = JSON.parse(sessionStorage.getItem('specificity'))
  }

  $scope.querySpecificity = {};
  if (sessionStorage.getItem('querySpecificity') != null) {
     $scope.querySpecificity = JSON.parse(sessionStorage.getItem('querySpecificity'))
  }
  $scope.p = 5;
  $scope.results = {}
  
  if (sessionStorage.getItem('results') != null) {
    $scope.results = JSON.parse(sessionStorage.getItem('results'))
  }

  $scope.axisDict = {
    'identified': 'Identifiable',
    'quantified': 'Quantifiable',
    'good_linearity': 'Linearity (r\u00B2>0.8)',
    //'broader_linear_range': 'Broader Linear Range'
    'recommendation': 'Recommendation'
  };
  $scope.currProtein = {text: 'test'};
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

    var specificity = $scope.specificity.text;
    sessionStorage.setItem('specificity', JSON.stringify($scope.specificity))

    var proteinList = $scope.proteinData.text.toUpperCase();
    $scope.proteinData.text = '';
    $scope.currProtein = null;
    proteinList = proteinList.replace(/;\s+/g, ",").replace(/,\s+/g, ",").replace(/\s+/g, ',').replace(/,+/g, ',');
    if (proteinList == '') {
      $scope.exceptData = '';
      $scope.queryData = '';
      return;
    }
    // proteins not in DB
    $http.get('/api/v1/except/' + proteinList)
    .success((data) => {
      $scope.exceptData = data;
      console.log($scope.exceptData)
    })
    .error((error) => {
      console.log('Error: ' + error);
    });
    $http.get('/api/v1/query/' + proteinList)
    .success((data) => {
      $scope.queryData = data;
      console.log(data);
      sessionStorage.setItem('queryData', JSON.stringify($scope.queryData))

      idx = 0
      data.map(function(protein) {

        // parse results to display in table
        $scope.results.identified.push({"idx": idx, "swiss_prot_id": protein.swiss_prot_id, "gene_name": protein.gene_name, "entry_name": protein.entry_name, "protein_name": protein.protein_name, "specificity": protein.identified=='#N/A'? 'N/A' : protein.identified, "recommendation": protein.identified=='Both'? 'Undepleted' : protein.identified=='#N/A'? 'Cannot be identified in either' : protein.identified});
        $scope.results.quantified.push({"idx": idx, "swiss_prot_id": protein.swiss_prot_id, "gene_name": protein.gene_name, "entry_name": protein.entry_name, "protein_name": protein.protein_name, "specificity": protein.quantified=='#N/A'? 'N/A' : protein.quantified, "recommendation": protein.quantified=='Both'? 'Undepleted' : protein.quantified=='#N/A'? 'Cannot be quantified in either' : protein.quantified});
        $scope.results.good_linearity.push({"idx": idx, "swiss_prot_id": protein.swiss_prot_id, "gene_name": protein.gene_name, "entry_name": protein.entry_name, "protein_name": protein.protein_name, "specificity": protein.good_linearity=='#N/A'? 'N/A' : protein.good_linearity, "recommendation":  protein.good_linearity=='#N/A'? 'Outside linear range' : protein.good_linearity!='Both'? protein.good_linearity : protein.broader_linear_range=='Same'? 'Undepleted' : protein.broader_linear_range});
        idx += 1;

        sessionStorage.setItem('results', JSON.stringify($scope.results))

        // parse protein names queried by user
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
        if (protein.broader_linear_range == "#N/A") {
          $scope.querySpecificity.broader_linear_range["NA"].push(protein.swiss_prot_id);
        }
        else if (protein.broader_linear_range == "Same" || protein.broader_linear_range == "Inconclusive") {
          $scope.querySpecificity.broader_linear_range["Same"].push(protein.swiss_prot_id);
        }
        else {
          $scope.querySpecificity.broader_linear_range[protein.broader_linear_range].push(protein.swiss_prot_id);
        }
      });

      sessionStorage.setItem('querySpecificity', JSON.stringify($scope.querySpecificity))

      //update chart based on query
      // if (specificity == 'good_linearity') {
      //   $scope.updateChartLinearity(specificity);
      // }
      // else {
      $scope.updateChart(specificity);
      //}
    })
    .error((error) => {
      console.log('Error: ' + error);
    });
  };

  $scope.peptide = (idx) => {
    $scope.currProtein = $scope.queryData[idx];
    $scope.currProtein.format = $scope.format_sequence($scope.currProtein.sequence);
    sessionStorage.setItem('currProtein', JSON.stringify($scope.currProtein))
    //event.preventDefault();
    protein = $scope.currProtein.swiss_prot_id;
    var tooltips = {};
    $http.get('/api/v1/peptide/' + protein)
    //console.log('here')
    .success((data) => {
      console.log(data)
      data.map(function(peptide) {
        idx = $scope.currProtein.sequence.indexOf(peptide.peptide);
        if (idx in tooltips) {
          tooltips[idx].push([peptide.peptide, peptide.modified_peptide]);
        }
        else {
          tooltips[idx] = [[peptide.peptide, peptide.modified_peptide]];
        }
      });

      $scope.currProtein.formatted = addTooltips($scope.currProtein.sequence, tooltips)

      console.log(tooltips);
      console.log($scope.currProtein)
    })
    .error((error) => {
      console.log('Error: ' + error);
    });
  };

  $scope.format_sequence = (sequence) => {
    var start_pos = 0;
    var end_pos = 0;
    seq = []
    for (i = 10; i < sequence.length; i += 10) {
      end_pos = i;
      seq.push([sequence.slice(start_pos, end_pos)]);
      start_pos = end_pos;
    }
    seq.push([sequence.slice(end_pos)]);
    return seq.join(' &emsp; ');
  };

  function addTooltips(str, tooltips) {

    var char_arr = str.split('');
    var tooltips_list = []
    var formatted_str = ''

    for (i=0; i < str.length; i++) {
      if (i in tooltips) {
        for (j=0; j<tooltips[i].length; j++) {
          tooltips_list.push([i, i + tooltips[i][j][0].length, tooltips[i][j][1]]);
        }
      }
      tooltips_list = remove(tooltips_list, i);
      if (tooltips_list.length > 0) {
        formatted_str += format_tooltip(char_arr[i], tooltips_list)
      }
      else {
        formatted_str += char_arr[i]
      }
      if ((i+1)%10 == 0) {
        formatted_str += '&emsp;'
      }
    }

    function format_tooltip(str, tooltip) {
      //<a href="#0" title="My Tooltip!" data-toggle="tooltip" data-placement="top" tooltip>
      return '<a href="#0" title="' + tooltips_list.join('\u000A') + '" data-toggle="tooltip" data-placement="top" tooltip>' + str + '</a>';
      //return '<span class="tooltip" data-tooltip="' + tooltips_list.join('\u000A') + '">' + str + '</span>';
    }

    function remove(array, element) {
      return array.filter(e => e[1] !== element);
    }

    return formatted_str;

  }


  $scope.updateProtein = (gene) => {
    $scope.currProtein.text = gene;
    console.log($scope.currProtein.text)
  }

  $scope.export = function() {
    jQuery(function ($) {
      $('#export').tableExport({type:'csv', fileName: 'PlasmaPilot_Results'});
    });
  }

  $scope.updatePageSize = (size) => {
    $scope.p = size;
  };

  // reset chart values
  $scope.reset = (specificity, store) => {
    if (specificity == 'Identifiable') {
      store.update(specificity, {undepleted: 172});
      store.update(specificity, {u_query: 0});
      store.update(specificity, {depleted: 302});
      store.update(specificity, {d_query: 0});
      store.update(specificity, {both: 286});
      store.update(specificity, {b_query: 0});
      store.update(specificity, {na: 0});
      store.update(specificity, {na_query: 0});
    }
    else if (specificity == 'Quantifiable') {
      store.update(specificity, {undepleted: 120});
      store.update(specificity, {u_query: 0});
      store.update(specificity, {depleted: 327});
      store.update(specificity, {d_query: 0});
      store.update(specificity, {both: 200});
      store.update(specificity, {b_query: 0});
      store.update(specificity, {na: 114});
      store.update(specificity, {na_query: 0});
    }
    else if (specificity == 'Linearity (r\u00B2>0.8)') {
      store.update(specificity, { u_query : 0});
      store.update(specificity, { undepleted : 114});
      store.update(specificity, { d_query : 0});
      store.update(specificity, { depleted : 321});
      store.update(specificity, { b_query : 0});
      store.update(specificity, { both : 156});
      store.update(specificity, { na_query : 0});
      store.update(specificity, { na : 170});
    }
    // else if (specificity == 'Broader Linear Range') {
    //   store.update(specificity, { u_query : 0});
    //   store.update(specificity, { undepleted : 34});
    //   store.update(specificity, { d_query : 0});
    //   store.update(specificity, { depleted : 51});
    //   store.update(specificity, { b_query :0});
    //   store.update(specificity, { both : 73});
    // }
    else if (specificity == 'Recommendation') {
      store.update(specificity, { u_query : null});
      store.update(specificity, { undepleted : null});
      store.update(specificity, { d_query : null});
      store.update(specificity, { depleted : null});
      store.update(specificity, { b_query : null});
      store.update(specificity, { both : null});
    }

    return store;
  }

  $scope.updateChart = (specificity) => {

    console.log('specificity: ' + specificity)

    if ($scope.querySpecificity[specificity] == undefined) {
      console.log('undefined');
      return;
    }
    var spec = '';
    var store = dataSource.store();
    // if (specificity == 'identified') {
    //   spec = $scope.axisDict[specificity];
    //   store = $scope.reset('Quantifiable', store);
    //   store = $scope.reset('Identifiable', store);
    // }
    // else if (specificity == 'quantified') {
    //   spec = $scope.axisDict[specificity];
    //   store = $scope.reset('Quantifiable', store);
    //   store = $scope.reset('Identifiable', store);
    // }
    spec = $scope.axisDict[specificity];
    store = $scope.reset('Quantifiable', store);
    store = $scope.reset('Identifiable', store);
    store = $scope.reset("Linearity (r\u00B2>0.8)", store);
    // store = $scope.reset("Broader Linear Range", store);
    store = $scope.reset("Recommendation", store);

    // var store = dataSource.store();
    store.byKey(spec).done(function (dataItem) {
      val = $scope.querySpecificity[specificity].Undepleted.length;
      store.update(spec, { u_query : (val > 0 ? (val + 1) : 0)});
      store.update(spec, { undepleted : dataItem.undepleted - (val > 0 ? (val + 1) : 0)});
      val = $scope.querySpecificity[specificity].Depleted.length;
      store.update(spec, { d_query : (val > 0 ? (val + 1) : 0)});
      store.update(spec, { depleted : dataItem.depleted - (val > 0 ? (val + 1) : 0)});
      val = $scope.querySpecificity[specificity].Both.length;
      store.update(spec, { b_query : (val > 0 ? (val + 1) : 0)});
      store.update(spec, { both : dataItem.both - (val > 0 ? (val + 1) : 0)});
      val = $scope.querySpecificity[specificity].NA.length;
      store.update(spec, { na_query : (val > 0 ? (val + 1) : 0)});
      store.update(spec, { na : dataItem.na - (val > 0 ? (val + 1) : 0)});
    })
    store.byKey('Recommendation').done(function (dataItem) {
      val = $scope.querySpecificity[specificity].Undepleted.length;
      store.update('Recommendation', { u_query : (val > 0 ? (val + 1) : null)});
      //store.update(spec, { undepleted : dataItem.undepleted - (val > 0 ? (val + 1) : 0)});
      val = $scope.querySpecificity[specificity].Depleted.length;
      store.update('Recommendation', { d_query : (val > 0 ? (val + 1) : null)});
      //store.update(spec, { depleted : dataItem.depleted - (val > 0 ? (val + 1) : 0)});
      val = $scope.querySpecificity[specificity].Both.length;
      store.update('Recommendation', { b_query : (val > 0 ? (val + 1) : null)});
      //store.update(spec, { both : dataItem.both - (val > 0 ? (val + 1) : 0)});
      //val = $scope.querySpecificity[specificity].NA.length;
      //store.update(spec, { na_query : (val > 0 ? (val + 1) : 0)});
      //store.update(spec, { na : dataItem.na - (val > 0 ? (val + 1) : 0)});
    });
    dataSource.load();
  };
//   $scope.updateChartLinearity = (specificity) => {
//     if ($scope.querySpecificity[specificity] == undefined) {
//       console.log('undefined');
//       return;
//     }
//     spec = $scope.axisDict[specificity];

//     var store = dataSource.store();
//     val = $scope.querySpecificity[specificity].Undepleted.length;
//     store.update('Linearity (r\u00B2>0.8)', { u_query : (val > 0 ? (val + 1) : 0)});
//     store.update('Linearity (r\u00B2>0.8)', { undepleted : 114 - (val > 0 ? (val + 1) : 0)});
//     val = $scope.querySpecificity[specificity].Depleted.length;
//     store.update('Linearity (r\u00B2>0.8)', { d_query : (val > 0 ? (val + 1) : 0)});
//     store.update('Linearity (r\u00B2>0.8)', { depleted : 321 - (val > 0 ? (val + 1) : 0)});
//     val = $scope.querySpecificity[specificity].Both.length;
//     store.update('Linearity (r\u00B2>0.8)', { b_query : (val > 0 ? (val + 1) : 0)});
//     store.update('Linearity (r\u00B2>0.8)', { both : 156 - (val > 0 ? (val + 1) : 0)});
//     val = $scope.querySpecificity[specificity].NA.length 
//     store.update('Linearity (r\u00B2>0.8)', { na_query : (val > 0 ? (val + 1) : 0)});
//     store.update('Linearity (r\u00B2>0.8)', { na : 170 - (val > 0 ? (val + 1) : 0)});
//     val = $scope.querySpecificity.broader_linear_range.Undepleted.length;
//     store.update('Broader Linear Range', { u_query : (val > 0 ? (val + 1) : 0)});
//     //store.update('Broader Linear Range', { u_query : $scope.querySpecificity.broader_linear_range.Undepleted.length + $scope.querySpecificity[specificity].Undepleted.length});
//     store.update('Broader Linear Range', { undepleted : 34 - (val > 0 ? (val + 1) : 0)});
//     val = $scope.querySpecificity.broader_linear_range.Depleted.length;
//     store.update('Broader Linear Range', { d_query : (val > 0 ? (val + 1) : 0)});
//     //store.update('Broader Linear Range', { d_query : $scope.querySpecificity.broader_linear_range.Depleted.length + $scope.querySpecificity[specificity].Depleted.length});
//     store.update('Broader Linear Range', { depleted : 51 - (val > 0 ? (val + 1) : 0)});
//     val = $scope.querySpecificity.broader_linear_range.Same.length;
//     store.update('Broader Linear Range', { b_query : (val > 0 ? (val + 1) : 0)});
//     store.update('Broader Linear Range', { both : 73 - (val > 0 ? (val + 1) : 0)});
//     store = $scope.reset('Identifiable', store);
//     store = $scope.reset('Quantifiable', store);
//     dataSource.load();
//   }
});

var dataSource = new DevExpress.data.DataSource({
  store: {
    type: 'array',
    key: 'sensitivity',
    data: [{
        sensitivity: "Identifiable",
        undepleted: 172,
        u_query: 0,
        depleted: 302,
        d_query: 0,
        both: 286,
        b_query: 0,
        na: 0,
        na_query: 0
    }, {
        sensitivity: "Quantifiable",
        undepleted: 120,
        u_query: 0,
        depleted: 327,
        d_query: 0,
        both: 200,
        b_query: 0,
        na: 114,
        na_query: 0
    }, {
        sensitivity: "Linearity (r\u00B2>0.8)",
        undepleted: 114,
        u_query: 0,
        depleted: 321,
        d_query: 0,
        both: 156,
        b_query: 0,
        na: 170,
        na_query: 0
    // }, {
        // sensitivity: "Broader Linear Range",
        // undepleted: 34, // 33 + 113
        // u_query: 0,
        // depleted: 51, // 50 + 320
        // d_query: 0,
        // both: 73,
        // b_query: 0
    }, {
        sensitivity: "Recommendation",
        undepleted: null, // 33 + 113
        u_query: null,
        depleted: null, // 50 + 320
        d_query: null,
        both: null,
        b_query: null
    }]
  }
});

app.controller('chartController', ($scope, $http, spec) => {
    $scope.specificity = spec.specificity;
    if (sessionStorage.getItem('specificity') != null) {
      $scope.specificity = JSON.parse(sessionStorage.getItem('specificity'))
    }
  
    $scope.tooltipInstance = {};
    $scope.specDict = {
      'Identifiable': 'identified',
      'Quantifiable': 'quantified',
      'Linearity (r\u00B2>0.8)': 'good_linearity',
      //'Broader Linear Range': 'broader_linear_range',
      'Recommendation': 'recommendation'
    };

    $scope.chartOptions = {
        dataSource : dataSource,
        commonSeriesSettings: {
            argumentField: "sensitivity",
            type: "stackedBar", 
            ignoreEmptyPoints: true,
            label: {
              resolveLabelOverlapping: 'stack',
              //showForZeroValues: false,
              position: 'outside',
              font: {
                color: '#000000',
                size: 11
              },
              backgroundColor: "rgba(100, 100, 100, 0.5);",
              // format: {type: 'percent', percentPrecision: 2},
              customizeText: function() {
                if (this.argument == 'Recommendation') {
                  return this.value > 0? this.value - 1 : 0;
                }
                if (this.value > 0) {
                  var percent = ((this.value -1)/(this.total-1))*100; 
                  if (percent == 100) {
                    return percent.toFixed(0) + "%";
                  }
                  return percent.toFixed(1) + "%";
                }
                else {
                  return;
                }
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
                rotationAngle: -30,
                //showZero: false
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
              var specArg = $scope.specDict[arg.argumentText];

              if (arg.argumentText == 'Recommendation') {
                specArg = $scope.specificity.text
              }

              if (arg.value == 0) {
                return {
                  text: ''
                }
              }

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
                // if (specArg == "broader_linear_range") {
                //   return {
                //     text: $scope.querySpecificity[specArg].Same.toString().replace(new RegExp(',', 'g'), "\n")
                //   };
                // }
                // else {
                return {
                  text: $scope.querySpecificity[specArg].Both.toString().replace(new RegExp(',', 'g'), "\n")
                };
                //}
              }
              else if (arg.seriesName == "N/A: Query Proteins") {
                return {
                  text: $scope.querySpecificity[specArg].NA.toString().replace(new RegExp(',', 'g'), "\n")
                };
              }
              else {
                return {
                    text: arg.seriesName + ": " + (arg.totalText - 1)
                    //text: arg.seriesName + ": " + arg.value
                };
              }
            }
        }
    };
});