var TestResultsComponent = {
    test_list: null,
    test_list_topic: 'store.change.test_list',
    tests_topic: 'store.change.tests',
    inactive_threshold: (new Date() / 1000) - 86400 * 7, // now minus 7 days
    ma_url: 'http://localhost/esmond/perfsonar/archive/'
};

$.urlParam = function(name){
    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
    if (results==null){
       return null;
    }
    else{
       return results[1] || 0;
    }
};

TestResultsComponent.initialize = function() {
    var ma_url = TestStore.getMAURL();
    //var ma_url = $.urlParam('url') || TestResultsComponent.ma_url;
    TestResultsComponent.ma_url = ma_url;
    $('#loading-modal').foundation('reveal', 'open');
    TestResultsComponent._registerHelpers();
    Dispatcher.subscribe(TestResultsComponent.tests_topic, TestResultsComponent._setTestResults);
};

TestResultsComponent._setTestResults = function( topic ) {
    var data = {};
    data.test_results = TestStore.getTests();
    data.ma_url = encodeURIComponent(TestResultsComponent.ma_url);
    data.num_test_results = data.test_results.length || 'None';
    $('#loading-modal').foundation('reveal', 'close');
    $('#num_test_results').html(data.num_test_results);
    $('#num_test_results_holder').show();
    console.log('url: ' + data.ma_url);


    var test_results_template = $("#test-results-template").html();
    var template = Handlebars.compile(test_results_template);
    var test_results = template(data);
    $("#test_results").html(test_results);

};

TestResultsComponent._registerHelpers = function() {
    Handlebars.registerHelper ("formatValue", function (value, type) {
       return TestResultUtils.formatValue(value, type);
    });
};

TestResultsComponent.initialize();

