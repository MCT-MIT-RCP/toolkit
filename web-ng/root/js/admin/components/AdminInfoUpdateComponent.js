var AdminInfoUpdateComponent = {
    admin_info: null,
    info_topic: 'store.change.host_info',
    saveAdminInfoTopic: 'store.host_admin_info.save',
    saveAdminInfoErrorTopic: 'store.host_admin_info.save_error',
    formChangeTopic: 'ui.form.change',
    formSuccessTopic: 'ui.form.success',
    formErrorTopic: 'ui.form.error',
    formCancelTopic: 'ui.form.cancel',
    country_data_url: '/toolkit-ng/data/country_data.json',
    update_url: '/toolkit-ng/admin/services/host.cgi?method=update_info',
    countries: {},
    state_data_urls: {},
    state_sel: $("#admin_states"),
    state_text: $("#admin_state"),
    prev_state_sel: $("#previous_selected_state_val"),
    country_sel: $("#admin_country"),
};


AdminInfoUpdateComponent.initialize = function() {
    AdminInfoUpdateComponent._getCountries();
    AdminInfoUpdateComponent.state_data_urls['US'] = '/toolkit-ng/data/us_states_hash.json';
    Dispatcher.subscribe(AdminInfoUpdateComponent.info_topic, AdminInfoUpdateComponent._setInfo);
    $("#adminInfoForm").submit(function(e){
            AdminInfoUpdateComponent._save();
            e.preventDefault();
    });
    $('form#adminInfoForm input').change(AdminInfoUpdateComponent._showSaveBar);
    $('form#adminInfoForm select').change(AdminInfoUpdateComponent._showSaveBar);
    $('#admin_info_cancel_button').click( AdminInfoUpdateComponent._cancel);
    Dispatcher.subscribe(AdminInfoUpdateComponent.saveAdminInfoTopic, AdminInfoUpdateComponent._saveSuccess);
    Dispatcher.subscribe(AdminInfoUpdateComponent.saveAdminInfoErrorTopic, AdminInfoUpdateComponent._saveError);
    $('#loading-modal').foundation('reveal', 'open');
};

AdminInfoUpdateComponent._save = function() {
    var data = {};
    data.organization_name = $("#admin_organization_name").val();
    data.admin_name = $("#admin_name").val();
    data.admin_email = $("#admin_email").val();
    data.city = $("#admin_city").val();
    data.country = $("#admin_country").val();
    if ( $("#admin_states").is(":visible") ) {
        data.state = $("#admin_states").val();
    } else {
        data.state = $("#admin_state").val();
    }
    data.postal_code = $("#admin_postal_code").val();
    data.latitude = $("#admin_latitude").val();
    data.longitude = $("#admin_longitude").val();

    HostStore.saveAdminInfo(data);

};

AdminInfoUpdateComponent._getCountries = function( topic ) {
    var prev_state_sel = AdminInfoUpdateComponent.prev_state_sel;
    var country_sel = AdminInfoUpdateComponent.country_sel;

    country_sel.empty(); // remove old options
    country_sel.append($("<option></option>")
            .attr("value", "").text("-- Select Country --"));
    $.getJSON( AdminInfoUpdateComponent.country_data_url, function( data ) {
        var countries = {};
        $.each( data, function( key, country ) {
            countries[country.Code] = country.Name;
            country_sel.append($("<option></option>")
                .attr("value", country.Code).text(country.Name));
        });
        country_sel.on("change", function() {
                AdminInfoUpdateComponent._getStates(this.value);
        });
        AdminInfoUpdateComponent.countries = countries;

    });
};

AdminInfoUpdateComponent._getStates = function( countryCode, state ) {
    var state_sel = AdminInfoUpdateComponent.state_sel;
    var state_text = AdminInfoUpdateComponent.state_text;
    var prev_state_sel = AdminInfoUpdateComponent.prev_state_sel;

    state_sel.empty(); // remove old options
    state_sel.append($("<option></option>")
            .attr("value", "").text("-- Select State/Province --"));
    countryCode = countryCode.toUpperCase();
    //var states = [];
    if ( AdminInfoUpdateComponent.state_data_urls.hasOwnProperty(countryCode) ) {
        var url = AdminInfoUpdateComponent.state_data_urls[countryCode];

        $.getJSON( url, function( data ) {
                var states = {};
                $.each( data, function( abbr, name ) {
                    states[abbr] = name;
                    state_sel.append($("<option></option>")
                        .attr("value", abbr).text(name));
                });
                state_sel.on("change", function() {
                    prev_state_sel.val( this.value );
                });
                if (!$.isEmptyObject(states)) {
                    AdminInfoUpdateComponent.states = states;
                    AdminInfoUpdateComponent._showStateSelector();
                } else {
                    AdminInfoUpdateComponent._showStateTextInput();
                }
        })
        .fail(function() {
                AdminInfoUpdateComponent._showStateTextInput();
        });

    } else {
        AdminInfoUpdateComponent._showStateTextInput();
    }
};


AdminInfoUpdateComponent._setInfo = function( topic ) {
    var data = HostStore.getHostInfo();

    $("#admin_organization_name").val(data.administrator.organization);
    $("#admin_name").val(data.administrator.name);
    $("#admin_email").val(data.administrator.email);
    $("#admin_city").val(data.location.city);
    $("#admin_state").val(data.location.state);
    $("#admin_latitude").val(data.location.latitude);
    $("#admin_longitude").val(data.location.longitude);
    $("#admin_postal_code").val(data.location.zipcode);
   
    $("#previous_selected_state_val").val(data.location.state);

    AdminInfoUpdateComponent._setCountry(data.location.country);
    AdminInfoUpdateComponent._setState(data.location.country, data.location.state);

    $('#loading-modal').foundation('reveal', 'close');

};

AdminInfoUpdateComponent._setState = function(country, state) {
    AdminInfoUpdateComponent._getStates(country, state);
};

AdminInfoUpdateComponent._setCountry = function(country) {
    AdminInfoUpdateComponent.country_sel.val(country);
};

AdminInfoUpdateComponent._showStateSelector = function(abbr) {
    var state_sel = AdminInfoUpdateComponent.state_sel;
    var state_text = AdminInfoUpdateComponent.state_text;    
    var previous_state = $("#previous_selected_state_val").val();
    state_text.hide();
    state_sel.val(previous_state);
    state_sel.show();
};

AdminInfoUpdateComponent._showStateTextInput = function(abbr) {
    var state_sel = AdminInfoUpdateComponent.state_sel;
    var state_text = AdminInfoUpdateComponent.state_text;
    state_sel.hide();
    state_text.show();
};

AdminInfoUpdateComponent._saveSuccess = function( topic, message ) {
    Dispatcher.publish(AdminInfoUpdateComponent.formSuccessTopic, message);
};

AdminInfoUpdateComponent._saveError = function( topic, message ) {
    Dispatcher.publish(AdminInfoUpdateComponent.formErrorTopic, message);
};

AdminInfoUpdateComponent._cancel = function() {
    Dispatcher.publish(AdminInfoUpdateComponent.formCancelTopic);
    Dispatcher.publish(AdminInfoUpdateComponent.info_topic);

};

AdminInfoUpdateComponent._showSaveBar = function() {
    Dispatcher.publish(AdminInfoUpdateComponent.formChangeTopic);
};

AdminInfoUpdateComponent.initialize();

