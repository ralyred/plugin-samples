/*
 * kyotenn Plug-in
 * Copyright (c) 2015 Cybozu
 *
 * Licensed under the MIT License
*/
jQuery.noConflict();
(function($, PLUGIN_ID) {
    'use strict';
    // escape HTML
    function escapeHtml(str) {
        var string = str;
        string = string.replace(/&/g, '&amp;');
        string = string.replace(/</g, '&lt;');
        string = string.replace(/>/g, '&gt;');
        string = string.replace(/"/g, '&quot;');
        string = string.replace(/'/g, '&#39;');
        return string;
    }
    // checking app in guest space
    function appIsGuest() {
        if (location.pathname.match(/guest/) !== null) {
            return true; // guest
        }
        return false; // not guest
    }
    // add option in select box
    function addSelectOption(elementId, label, value) {
        var option = $('<option>')
            .html(escapeHtml(label))
            .val(escapeHtml(value));
        $(elementId).append(option);
    }
    // get currend config
    function getCurrentConf() {
        var CONF = kintone.plugin.app.getConfig(PLUGIN_ID);
        if (!CONF.options) {return; }
        var config = JSON.parse(CONF.options);
        if (config.apikey) {
            $('#itsunavi-api-key').val(config.apikey);
        }
        if (config.addressField) {
            $('#itsunavi-address-feeld').val(config.addressField);
        }
        if (config.latField) {
            $('#itsunavi-lat-feeld').val(config.latField);
        }
        if (config.lonField) {
            $('#itsunavi-lon-feeld').val(config.lonField);
        }
        if (config.detailMapField) {
            $('#itsunavi-space-feeld').val(config.detailMapField);
        }
        if (config.tooltipTitle) {
            $('#itsunavi-tooltip-title').val(config.tooltipTitle);
        }
        if (config.indexMapAvailable) {
            $('#itsunavi-index-map-available').prop('checked', true);
        }
        if (config.detailMapAvailable) {
            $('#itsunavi-detail-map-available').prop('checked', true);
        }
        if (config.dispalyRootAvailable) {
            $('#itsunavi-display-root-available').prop('checked', true);
        }
        if (config.mobileMapAvailable) {
            $('#itsunavi-mobile-map-available').prop('checked', true);
        }
        if (config.indexMapHeight) {
            $('#itsunavi-index-map-height').val(config.indexMapHeight);
        }
        if (config.indexCenterLat) {
            $('#itsunavi-index-map-lat').val(config.indexCenterLat);
        }
        if (config.indexCenterLon) {
            $('#itsunavi-index-map-lon').val(config.indexCenterLon);
        }
        if (config.indexZoomSize) {
            $('#itsunavi-index-map-zoom').val(config.indexZoomSize);
        }
        if (config.detailMapHeight) {
            $('#itsunavi-detail-map-height').val(config.detailMapHeight);
        }
        if (config.detailMapWidth) {
            $('#itsunavi-detail-map-width').val(config.detailMapWidth);
        }
        if (config.mobileMapHeight) {
            $('#itsunavi-mobile-map-height').val(config.mobileMapHeight);
        }
        if (config.domain) {
            $('#itsunavi-api-domain').val(config.domain);
        }
    }
    // add single_line_text and number field to option
    function setTextAndNumField(resp) {
        var properties = resp.properties;
        for (var key in resp.properties) {
            if (!resp.properties.hasOwnProperty(key)) {continue; }
            var property = properties[key];
            switch (property.type) {
                case 'SINGLE_LINE_TEXT':
                    // add option in select Box
                    addSelectOption('#itsunavi-address-feeld', property.label, property.code);
                    addSelectOption('#itsunavi-lat-feeld', property.label, property.code);
                    addSelectOption('#itsunavi-lon-feeld', property.label, property.code);
                    addSelectOption('#itsunavi-tooltip-title', property.label, property.code);
                    break;
                case 'NUMBER':
                    // add option in select Box
                    addSelectOption('#itsunavi-lat-feeld', property.label, property.code);
                    addSelectOption('#itsunavi-lon-feeld', property.label, property.code);
                    addSelectOption('#itsunavi-tooltip-title', property.label, property.code);
                    break;
                default:
            }
        }
    }
    // add space field to option
    function setSpaceField(response) {
        var layout = response.layout;
        for (var i = 0; i < layout.length; i++) {
            if (layout[i].type === 'ROW') {
                var fields = layout[i].fields;
                for (var y = 0; y < fields.length; y++) {
                    var pr = fields[y];
                    if (pr.type === 'SPACER') {
                        addSelectOption('#itsunavi-space-feeld', pr.elementId, pr.elementId);
                    }
                }
            }
        }
    }
    // getFieldList and add select option
    function getFieldList() {
        var appId = kintone.app.getId();
        // add single_line_text and number field
        kintone.api(
            kintone.api.url('/k/v1/preview/app/form/fields', appIsGuest()),
            'GET',
            {app: appId},
            function(resp) { // success
                setTextAndNumField(resp);
                getCurrentConf();
            }
        );

        // add space field
        kintone.api(
            kintone.api.url('/k/v1/preview/app/form/layout', appIsGuest()),
            'GET',
            {app: appId},
            function(response) { // success
                setSpaceField(response);
                getCurrentConf();
            }
        );

    }

    // set new config
    function setConf() {
        var config = {};
        config.apikey = escapeHtml($('#itsunavi-api-key').val());
        config.addressField = escapeHtml($('#itsunavi-address-feeld').val());
        config.latField = escapeHtml($('#itsunavi-lat-feeld').val());
        config.lonField = escapeHtml($('#itsunavi-lon-feeld').val());
        config.detailMapField = escapeHtml($('#itsunavi-space-feeld').val());
        config.tooltipTitle = escapeHtml($('#itsunavi-tooltip-title').val());
        config.indexMapAvailable = $('#itsunavi-index-map-available:checked').val() && true || false;
        config.detailMapAvailable = $('#itsunavi-detail-map-available:checked').val() && true || false;
        config.dispalyRootAvailable = $('#itsunavi-display-root-available:checked').val() && true || false;
        config.mobileMapAvailable = $('#itsunavi-mobile-map-available:checked').val() && true || false;
        config.indexMapHeight = escapeHtml($('#itsunavi-index-map-height').val());
        config.indexCenterLat = escapeHtml($('#itsunavi-index-map-lat').val());
        config.indexCenterLon = escapeHtml($('#itsunavi-index-map-lon').val());
        config.indexZoomSize = escapeHtml($('#itsunavi-index-map-zoom').val());
        config.detailMapHeight = escapeHtml($('#itsunavi-detail-map-height').val());
        config.detailMapWidth = escapeHtml($('#itsunavi-detail-map-width').val());
        config.mobileMapHeight = escapeHtml($('#itsunavi-mobile-map-height').val());
        config.domain = escapeHtml($('#itsunavi-api-domain').val());

        // checking required
        if (config.apikey === ''
            || config.addressField === ''
            || config.latField === ''
            || config.lonField === ''
            || config.domain === '') {
            alert('未入力項目があります。\n必須項目を入力してください。');
            return false;
        }
        kintone.plugin.app.setConfig({options: JSON.stringify(config)});
    }
    // cansel
    function browserBack() {
        history.back();
    }
    // set button onclick event
    function setEvent() {
        $('#plugin_submit').click(setConf);
        $('#plugin_cancel').click(browserBack);
    }
    // initialize
    $(document).ready(function() {
        getFieldList();
        setEvent();
    });
})(jQuery, kintone.$PLUGIN_ID);
