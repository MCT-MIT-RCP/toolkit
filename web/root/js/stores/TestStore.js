// Make sure jquery loads first
// assues Dispatcher has already been declared (so load that first as well)

// TODO: Adapt for Test Results

// TODO: make ma_url changeable
var ma_url = 'http%3A%2F%2Flocalhost%2Fesmond%2Fperfsonar%2Farchive%2F';

var TestStore = {
    testList: null,
    testSummary: {}
};

TestStore.initialize = function() {
    TestStore._retrieveList();
    TestStore._createSummaryTopic();
    TestStore.testSummary.data = {};
    TestStore.testSummary.listSet = false;
    TestStore.testSummary.summarySet = false;
};

TestStore._retrieveList = function() {
        $.ajax({
            url: "/serviceTest/graphData.cgi?action=test_list&url=" + ma_url,
            type: 'GET',
            contentType: "application/json",
            dataType: "json",
            success: function (data) {
                TestStore.testList = data;
                console.log('testList');
                console.log(data);
                Dispatcher.publish('store.change.test_list');
            },
            error: function (jqXHR, textStatus, errorThrown) {
                alert(errorThrown);
            }
        });
};

TestStore._retrieveStatus = function() {
    $.ajax({
            url: "/toolkit-ng/services/host.cgi?method=get_status",
            type: 'GET',
            contentType: "application/json",
            dataType: "json",
            success: function (data) {
                TestStore.hostStatus = data;
                Dispatcher.publish('store.change.host_status');
            },
            error: function (jqXHR, textStatus, errorThrown) {
                alert(errorThrown);
            }
        });
};

TestStore._retrieveServices = function() {
    $.ajax({
            url: "/toolkit-ng/services/host.cgi?method=get_services",
            type: 'GET',
            contentType: "application/json",
            dataType: "json",
            success: function (data) {
                TestStore.hostServices = data;
                console.log("setting services: ");
                console.log(data);
                Dispatcher.publish('store.change.host_services');
            },
            error: function (jqXHR, textStatus, errorThrown) {
                alert(errorThrown);
            }
        });
};

TestStore._createSummaryTopic = function() {
    Dispatcher.subscribe('store.change.test_list', TestStore._setSummaryData);
};

TestStore._setSummaryData = function (topic, data) {
    if (topic == 'store.change.test_list') {
        var data = TestStore.getTestList();
        jQuery.extend(TestStore.testSummary.data, data);
        TestStore.testSummary.listSet = true;
    } 
    if (TestStore.testSummary.listSet) {
        TestStore.testSummary.summarySet = true;
        Dispatcher.publish('store.change.test_summary');
    }    
};

TestStore.getTestList = function() {
    return TestStore.testList;
};
TestStore.getHostSummary = function() {
    return TestStore.testSummary.data;
};

TestStore.initialize();
