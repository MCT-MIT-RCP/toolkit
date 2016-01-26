// assumes stores/DataStore has already been loaded

var TestConfigStore = new DataStore("store.change.test_config", "services/regular_testing.cgi?method=get_test_configuration");


//var TestConfigStore = new DataStore;
//TestConfigStore.initialize("store.change.test_config", "services/regular_testing.cgi");

// Raw/formatted test type names
// Could probably have used a hash with raw values as keys, but they may
// contain invalid keyname characters
TestConfigStore.testTypes = [
    { 
        raw: "pinger",
        formatted: "Ping (RTT)",
    },
    {
        raw: "bwctl/throughput",
        formatted: "Throughput",
    },
    {
        raw: "owamp",
        formatted: "One-way latency",
    },
    {
        raw: "traceroute",
        formatted: "Traceroute",
    },
];

Dispatcher.subscribe(TestConfigStore.topic, function() {
    console.log('received test data changed event');
    TestConfigStore.data = TestConfigStore.getData();
    console.log('data from dispatcher/testconfigstore', TestConfigStore.getData()); 
    TestConfigStore._setAdditionalVariables();
});

TestConfigStore._processData = function() {
};

TestConfigStore.getTestConfigurationFormatted = function() {
    return TestConfigStore.data.test_configuration_formatted;
};

TestConfigStore.getTestConfiguration = function() {
    return TestConfigStore.data.test_configuration;
};

TestConfigStore.getStatus = function() {
    return TestConfigStore.data.status;
};


TestConfigStore.getAllTestMembers = function() {
    var member_array = [];
    for(var i in TestConfigStore.data.test_configuration_formatted) {
        var test = TestConfigStore.data.test_configuration_formatted[i];
        for(var j in test.members) {
            var member = test.members[j];
            member_array.push(member.address);
        }
    }
    return member_array;
};


TestConfigStore.getTestsByHost = function() {
    var tests = {};
    var member_array = [];
    var host_id = 0;
    for(var i in TestConfigStore.data.test_configuration_formatted) {
        var test = TestConfigStore.data.test_configuration_formatted[i];
        for(var j in test.members) {
            var member = test.members[j];
            member.host_id = host_id;
            
            // This portion will need to happen in the get configuration section
            // or at least some of it
            tests = TestConfigStore.addHostToTest(tests, test, member);
            host_id++;
        }
    }
    var tests_sorted = [];
    var keys = Object.keys(tests);
    keys.sort();
    for(var i in keys) {
        tests_sorted.push(tests[ keys[i] ]);
    }
    return tests_sorted;
};

// Set additional variables for each test/member
TestConfigStore._setAdditionalVariables = function ( ) {
    console.log('setting additional variables');
    TestConfigStore.data.test_configuration_formatted = [];
    TestConfigStore.data.test_configuration_formatted = $.extend( true, [], TestConfigStore.data.test_configuration );
    var tests = TestConfigStore.data.test_configuration_formatted;

    for(var i in tests) {
        var test = tests[i];
        var type = test.type;
        var protocol = test.parameters.protocol;

        // set test.type_formatted
        var formattedType = TestConfigStore._formatTestType( type );
        if ( protocol != undefined ) {
            formattedType += " - " + protocol.toUpperCase(); 
        }
        test.type_formatted = formattedType;
        var udp_bandwidth = parseInt( test.parameters.udp_bandwidth );
        if ( test.parameters.protocol == "udp" && !isNaN(udp_bandwidth) ) {
            var formatted = udp_bandwidth / 1000000;
            formatted += "M";
            test.parameters.udp_bandwidth_formatted = formatted;
            test.type_formatted += ' (' + formatted + ')';
        }
        if ( type == 'pinger' ) {
            test.showPingParameters = true;
        }
        if ( type == 'bwctl/throughput' ) {
            test.showThroughputParameters = true;
            if ( test.parameters.window_size > 0 ) {
                test.showWindowSize = true;
            } else {
                test.showWindowSize = false;
            }
        }
        if ( type == 'owamp') {
            test.showOWAMPParameters = true;
            test.parameters.packet_size = test.parameters.packet_padding + 20;
            test.parameters.packet_rate = 1/test.parameters.packet_interval;
        }
        if ( type == 'traceroute') {
            test.showTracerouteParameters = true;

        }

        // Set test_interval_formatted
        var interval = test.parameters.test_interval;
        if ( interval != undefined ) {
            test.parameters.test_interval_formatted = SharedUIFunctions.getTime( interval );
        }
    }
    console.log('data after adding additional info', TestConfigStore.data);


};

TestConfigStore.setTestSettings = function ( testID, settings ) {
    var test = TestConfigStore.getTestByID( testID );
    if ( settings.enabled ) {
        test.disabled = 0;
    } else {
        test.disabled = 1;
    }
    if ( settings.description ) {
        test.description = settings.description;
    }
    if ( settings.interface ) {
        test.parameters.local_interface = settings.interface;
    } else {
        delete test.parameters.local_interface;
    }
    if ( test.type == 'bwctl/throughput') {
        if ( settings.protocol ) {
            test.parameters.protocol = settings.protocol;
        } else {
            delete test.parameters.protocol;
        }
        if ( settings.tos_bits ) {
            test.parameters.tos_bits = settings.tos_bits;
        } else {
            test.parameters.tos_bits = 0;
        }

        if ( settings.window_size && !settings.autotuning ) {
            test.parameters.window_size = settings.window_size;
        } else {
            test.parameters.window_size = 0;
        }
    }

};

// Given a test config, this function generates and returns 
// a new, integer unique id that doesn't conflict with any of 
// the existing member ids
TestConfigStore.generateMemberID = function( test ) {
    var min = 2000000;
    var max = 3000000;
    var ids = {};
    for(var i in test.members) {
        var member_id = test.members[i].member_id;
        ids[ test.members[i].member_id ] = 1;

    }    
    var rand = SharedUIFunctions.generateRandomIntInRange( min, max );
    var i = 0;
    while ( rand in ids ) {
        rand = SharedUIFunctions.generateRandomIntInRange( min, max );
        i++;

        // If we've tried 100 times and haven't found any 
        // usable ids, give up. This shouldn't happen
        if ( i > 100 ) {
            return false;
        }
    }
    return rand;

};


// Sets whether the test is enabled
// Note that in the backend config, this is counter-intuitively
// stored as "disabled" that's true if the test is disabled.
TestConfigStore.setTestEnabled = function ( test, testStatus ) {
    var disabledStatus = !testStatus;
    if ( disabledStatus ) {
        disabledStatus = 1;
    } else {
        disabledStatus = 0;
    }
    test.disabled = disabledStatus;
    console.log('test after setTestEnabled', test);
};

TestConfigStore.setTestDescription = function ( test, testDescription ) {
    test.description = testDescription;
    console.log('test after setTestDescription', test);
};

TestConfigStore.setInterface = function ( test, interface ) {
    test.parameters.local_interface = interface;
    console.log('test after setInterface', test);
};

TestConfigStore.getTestByID = function ( testID ) {
    var data = TestConfigStore.data.test_configuration;
    for(var i in data) {
        var test = data[i];
        if ( testID == test.test_id ) {
            return test;
        }
    }
    return {};
};

// TestConfigStore.addHostToTest
// Adds a host to a test in the Host-centric view
TestConfigStore.addHostToTest = function (tests, test, member) {
    var address = member.address;
    var type = test.type;   
    var host_id = member.host_id;
    var protocol = test.parameters.protocol;
    var type_count_name = type + "_count";

    type_count_name = type_count_name.replace('/', '_');
    if ( !(address in tests) ) {
        tests[address] = {};
        tests[address].tests = [];
    }

    tests[address].tests.push(test);
    tests[address].address = address;
    tests[address].host_id = host_id;

    if ( test[type_count_name] ) {
        tests[address][type_count_name]++;
    } else {
        tests[address][type_count_name] = 1;
    }
    return tests;

};

// Gets the configuration for the one test that matches
// the provided testID
TestConfigStore.getTestConfig = function ( testID ) {
    var ret;
    var data = TestConfigStore.data.test_configuration_formatted;
    for(var i in data) {
        var test = data[i];
        if ( test.test_id == testID ) {
            return test;
        }
    }
    return;
};

// Given the raw test type name as returned by esmond, return a formatted version
TestConfigStore._formatTestType = function ( rawName ) {
    var types = TestConfigStore.testTypes;
    if ( rawName == undefined ) {
        return;
    }
    for(var i in types) {
        var type = types[i];
        var raw = type.raw;
        var formatted = type.formatted;
        if ( raw == rawName) {
            return formatted;
        }
    }
};
