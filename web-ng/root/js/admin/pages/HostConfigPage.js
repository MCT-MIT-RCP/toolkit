// make sure jquery, Dispatcher, 
// HostDetailStore all load before this.

var HostConfigPage = { 
    detailsTopic: 'store.change.host_details',
    adminServicesTopic: 'store.change.host_services',
    formChangeTopic: 'ui.form.change',
    formSuccessTopic: 'ui.form.success',
    formErrorTopic: 'ui.form.error',
    formCancelTopic: 'ui.form.cancel',
    saveServicesTopic: 'store.host_services.save',
    saveServicesErrorTopic: 'store.host_services.save_error',
    serviceList: ['bwctl', 'owamp', 'ndt', 'npad'],
    latencyServices: ['owamp'],
};

HostConfigPage.initialize = function() {
    $('#loading-modal').foundation('reveal', 'open');
    Dispatcher.subscribe(HostConfigPage.detailsTopic, HostConfigPage._setDetails);

    $('form#hostConfigForm input').change(HostConfigPage._showSaveBar);
    $('form#hostConfigForm select').change(HostConfigPage._showSaveBar);
    
    $('#admin_info_save_button').click(HostConfigPage._save);

};

HostConfigPage._setDetails = function(topic) {
    $('#loading-modal').foundation('reveal', 'close');
    var details = HostDetailsStore.getHostDetails();

};


HostConfigPage._save = function() {
    NTPConfigComponent.save();
};

HostConfigPage._saveSuccess = function( topic, message ) {
    Dispatcher.publish(HostConfigPage.formSuccessTopic, message);
};

HostConfigPage._saveError = function( topic, message ) {
    Dispatcher.publish(HostConfigPage.formErrorTopic, message);
};

HostConfigPage._cancel = function() {
    Dispatcher.publish(HostConfigPage.formCancelTopic);
    Dispatcher.publish(HostConfigPage.adminServicesTopic);
};

HostConfigPage._showSaveBar = function() {
    Dispatcher.publish(HostConfigPage.formChangeTopic);
};

HostConfigPage.initialize();
