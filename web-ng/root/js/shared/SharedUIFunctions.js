/* This library contains shared functions to be used in the GUI
 *
 * */
var SharedUIFunctions = {
    formChangeTopic: 'ui.form.change',
    formSuccessTopic: 'ui.form.success',
    formErrorTopic: 'ui.form.error',
    formCancelTopic: 'ui.form.cancel',
};

/*
 * SharedUIFunctions.setSelect2Values( allValues, selectedValues )
 * Description: Creates the datastructure to pass to a select2 box in the format
 * {id: 'idNameorNumber', text: 'text', selected: bool}
 * The 'selected' portion is optional'
 * Arguments:
 *      * allValues - an array of hashes containing all available values for the select2 box. 
 *          In the same format as the return but without the 'selected' field
 *      * selectedValues - an optional string containing one value to select, or an array containing
 *          all values to be selected.
 * Return value:
 *      * Returns an array of hashes in the format [ {id: 'idNameorNumber', text: 'text', selected: bool} ]
 *      * If no values, return an empty array
 */

SharedUIFunctions.getSelectedValues = function( allValues, selectedValues ) { 
    for(var i in allValues) {
        var currentName = allValues[i].id;
    
        if ( typeof selectedValues != 'undefined' ) {
            if ( typeof selectedValues == 'string' ) {
                selectedValues = [ selectedValues ];
            } 
            for (var j in selectedValues) {
                var selectedName = selectedValues[j];
                if ( selectedName == currentName ) {
                    allValues[i].selected = true;
                    continue;
                }
            }        
        }
    } 
    return allValues;
}; 


SharedUIFunctions._saveSuccess = function( topic, message ) {
    Dispatcher.publish(SharedUIFunctions.formSuccessTopic, message);
};

SharedUIFunctions._saveError = function( topic, message ) {
    Dispatcher.publish(SharedUIFunctions.formErrorTopic, message);
};

SharedUIFunctions._cancel = function() {
    Dispatcher.publish(SharedUIFunctions.formCancelTopic);
    Dispatcher.publish(SharedUIFunctions.info_topic);

};

SharedUIFunctions._showSaveBar = function() {
    Dispatcher.publish(SharedUIFunctions.formChangeTopic);
};

