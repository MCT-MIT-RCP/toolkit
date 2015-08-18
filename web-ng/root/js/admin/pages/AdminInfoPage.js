// make sure jquery, Dispatcher, TestStore, TestResultsComponent, 
// HostStore, HostServicesComponent and HostInfoComponent all load before this.

var AdminInfoPage = { 
    adminInfoTopic: 'store.change.host_info',
};

AdminInfoPage.initialize = function() {
    $('#loading-modal').foundation('reveal', 'open');
    //Dispatcher.subscribe(AdminInfoPage.adminInfoTopic, AdminInfoPage._dataStoreReturned);
    $("#adminInfoForm").submit(function(e){
            AdminInfoUpdateComponent.save();
            CommunityUpdateComponent.save();
            e.preventDefault();
    });
};

//AdminInfoPage._dataStoreReturned = function(topic, data) {
//}

AdminInfoPage.initialize();
