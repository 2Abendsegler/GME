// ==UserScript==
// @name        Geocaching Map Enhancements
//--> $$001
// @version     0.8.2.2As.6
//<-- $$001
// @author      JRI; 2Abendsegler
// @description Adds extra maps and grid reference search to Geocaching.com, along with several other enhancements.
// @include     /^https:\/\/www.geocaching.com\/(geocache\/GC|seek\/cache_details\.aspx|seek\/cache_details2\.aspx|map\/|hide\/planning\.aspx|hide\/typelocation\.aspx|hide\/waypoints\.aspx|seek\/$|\/seek\/default\.aspx|track\/map_gm\.aspx)/
// @license     MIT License
// @namespace   https://github.com/2Abendsegler/GME
// @copyright   2011-2018 James Inge, 2022-2023 2Abendsegler
// @attribution GeoNames (http://www.geonames.org/)
// @attribution Postcodes.io (https://postcodes.io/)
// @attribution Chris Veness (http://www.movable-type.co.uk/scripts/latlong-gridref.html)
// @grant       GM_xmlhttpRequest
// @grant       GM.xmlHttpRequest
// @grant       GM_info
// @grant       GM.info
// @grant       GM_getValue
// @grant       GM.getValue
// @grant       GM_setValue
// @grant       GM.setValue
// @connect     github.com
// @connect     raw.githubusercontent.com
// @connect     geograph.org.uk
// @connect     channel-islands.geographs.org
// @connect     geo-en.hlipp.de
// @connect     api.geonames.org
// @connect     api.postcodes.io
// @connect     www.geocaching.com
// @uploadURL   https://raw.githubusercontent.com/2Abendsegler/GME/main/Geocaching_Map_Enhancements.user.js
// @downloadURL https://raw.githubusercontent.com/2Abendsegler/GME/main/Geocaching_Map_Enhancements.user.js
// @icon        https://github.com/2Abendsegler/GME/raw/main/images/gme_logo_48.png
// @icon64      https://github.com/2Abendsegler/GME/raw/main/images/gme_logo_64.png
// ==/UserScript==

/* jshint multistr: true */
/* global $, amplify, DMM, FileReader, GM, GM_xmlhttpRequest, Groundspeak, L, LatLon, mapLatLng, MapSettings */

(function() {
"use strict";

var gmeResources = {
    parameters: {
        // Defaults.
//--> $$002
        // Hier nur anpassen wenn die Version als nächstes Life geht.
        version: "0.8.2.2As.6",
        versionMsg: "\nFix further issues with the asynchronous or delayed loading of the minimap. Fix missing login check.",
//<-- $$002
        brightness: 1, // Default brightness for maps (0-1), can be overridden by custom map parameters.
        filterFinds: false, // True filters finds out of list searches.
        follow: false, // Locator widget follows current location (moving map mode).
        labels: "codes", // Label caches on the map with their GC code. Or "names" to use long name.
        measure: "metric", // Or "imperial" - used for the scale indicators.
        osgbSearch: true, // Enhance search box with OSGB grid references, zooming, etc. (may interfere with postal code searches).
        defaultMap: "OpenStreetMap",
        maps: [
        //  {alt: "Readable Name", tileUrl: "URL template including {s} (subdomain) and either {q} (quadkey) or {x},{y},{z} (Google/TMS tile coordinates + zoom)", subdomains: "0123", minZoom: 0, maxZoom: 24, attribution: "Copyright message (HTML allowed)", name: "shortname", overlay: false}
            {alt: "OpenStreetMap", tileUrl: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", name: "osm", subdomains: "abc"},
            {alt: "OpenCycleMap", tileUrl: "https://tile.thunderforest.com/cycle/{z}/{x}/{y}.png", name: "ocm"},
            {alt: "Bing Maps", tileUrl: "https://ecn.t{s}.tiles.virtualearth.net/tiles/r{q}?g=864&mkt=en-gb&lbl=l1&stl=h&shading=hill&n=z", subdomains: "0123", minZoom: 1, maxZoom: 20, attribution: "<a href=\'https://www.bing.com/maps/\'>Bing</a> map data copyright Microsoft and its suppliers", name: "bingmap", ignore: true},
            {alt: "Bing Aerial View", tileUrl: "https://ecn.t{s}.tiles.virtualearth.net/tiles/a{q}?g=737&n=z", subdomains: "0123", minZoom: 1, maxZoom: 20, attribution: "<a href=\'https://www.bing.com/maps/\'>Bing</a> map data copyright Microsoft and its suppliers", name: "bingaerial"},
            {alt: "Google Maps", tileUrl: "https://mt.google.com/vt?&x={x}&y={y}&z={z}", name: "googlemaps", attribution: "<a href=\'https://maps.google.com/\'>Google</a> Maps", subdomains: "1234", tileSize: 256, maxZoom: 22},
            {alt: "Google Satellite", tileUrl: "https://mt.google.com/vt?lyrs=s&x={x}&y={y}&z={z}", name: "googlemapssat", attribution: "<a href=\'https://maps.google.com/\'>Google</a> Maps Satellite", subdomains: "1234", tileSize: 256, maxZoom: 22},
            {alt: "Freemap Slovakia Hiking", tileUrl: "http://t{s}.freemap.sk/T/{z}/{x}/{y}.jpeg", attribution: "Map &copy; <a href='http://www.freemap.sk/'>Freemap Slovakia</a>, data &copy; <a href='http://openstreetmap.org'>OpenStreetMap</a> contributors", subdomains: "1234", minZoom: 8, maxZoom: 16, ignore: true},
            {alt: "Freemap Slovakia Bicycle", tileUrl: "http://t{s}.freemap.sk/C/{z}/{x}/{y}.jpeg", attribution: "Map &copy; <a href='http://www.freemap.sk/'>Freemap Slovakia</a>, data &copy; <a href='http://openstreetmap.org'>OpenStreetMap</a> contributors", subdomains: "1234", minZoom: 8, maxZoom: 16, ignore: true},
            {alt: "Freemap Slovakia Car", tileUrl: "http://t{s}.freemap.sk/A/{z}/{x}/{y}.jpeg", attribution: "Map &copy; <a href='http://www.freemap.sk/'>Freemap Slovakia</a>, data &copy; <a href='http://openstreetmap.org'>OpenStreetMap</a> contributors", subdomains: "1234", minZoom: 8, maxZoom: 16, ignore: true},
            {alt: "Hillshading", tileUrl: "http://{s}.tiles.wmflabs.org/hillshading/{z}/{x}/{y}.png", subdomains: "abc", attribution: "Hillshading by <a     href=\'https://wiki.openstreetmap.org/wiki/Hike_%26_Bike_Map\'>Colin Marquardt</a> from NASA SRTM data", overlay: true}
        ]
    },
    css: {
        main: '.leaflet-control-gme, .leaflet-control-zoomwarning {border-radius: 7px; filter: progid:DXImageTransform.Microsoft.gradient(startColorStr="#3F000000",EndColorStr="#3F000000"); padding: 5px; z-index: 8;}\
            .leaflet-control-gme {display: inline-block; padding: 0; background: rgba(0, 0, 0, 0.2); box-shadow: 0 0 8px rgba(0, 0, 0, 0.4);}\
            .gme-control-scale {bottom: 5em !important; margin-left: 13px !important; left: 385px;}\
            .gme-left {left: 385px; margin-left: 13px !important;}\
            div.gme-identify-layer {margin-top: -1em; margin-left: 1em; padding-left: 0.1em; font-weight: bold; background: rgba(255,255,255,0.57);}\
            #gme_caches table {margin-top: 0.5em;}\
            .GME_search_list {border: 1px solid #679300; border-radius: 7px; padding: 0.5em;}\
            div.GME_search_results {margin-right: -65px;}\
            .GME_search_results.hidden {display: none;}\
            .groundspeak-control-findmylocation {border: 1px solid #888; border-radius: 5px; box-shadow: 0 0 8px rgba(0, 0, 0, 0.4); padding: 0; background: rgba(255,255,255,0.8);}\
            .groundspeak-control-findmylocation a {padding: 3px;}\
            .gme-button {display: inline-block; box-sizing: content-box; -moz-box-sizing: content-box; padding: 2px; vertical-align: middle; background: no-repeat #eee; background-color: rgba(255,255,255,0.8); border: 1px solid #888; height: 22px; width: 22px; text-decoration: none;}\
            .gme-button-l {border-bottom-left-radius: 5px; border-top-left-radius: 5px;}\
            .gme-button-r {border-right: 1px solid #888; border-bottom-right-radius: 5px; border-top-right-radius: 5px; margin-right: 0.5em;}\
            .gme-button:hover {background-color: #fff;}\
            .gme-button-active {border: solid 3px #02b; padding: 0px; background-color: #fff;}\
            .gme-button-active:hover {border-color: #63f; filter: alpha(opacity=100);}\
            span.gme-button, .gme-button-wide {padding-left: 5px; padding-right: 5px; font-size: 12px; font-weight: bold; width: auto; background-image: none; color: #424242; font-family: inherit;}\
            span.gme-text {vertical-align: text-top;}\
            a.gme-text {display: inline; padding: 5px;}\
            a.gme-text-small {display: inline;}\
            #GME_brightness {margin: 0px; height: 14px;}\
            .GME_info {background-size: 26px 26px; background-position: center; background-image: url(https://github.com/2Abendsegler/GME/raw/main/images/GME_info.png)}\
            .GME_hide {background-size: 22px 22px; background-position: center; background-image: url(https://github.com/2Abendsegler/GME/raw/main/images/GME_hide.png)}\
            .GME_route {background-size: 21px 20px; background-position: center; background-image: url(https://github.com/2Abendsegler/GME/raw/main/images/GME_route.png)}\
            .GME_home {background-size: 23px 23px; background-position: center; background-image: url(https://github.com/2Abendsegler/GME/raw/main/images/GME_home.png)}\
            .GME_config {background-size: 24px 24px; background-position: center; background-image: url(https://github.com/2Abendsegler/GME/raw/main/images/GME_config.png)}\
            a.GME_ctoc {color: #4a4a4a; opacity: 0.8; text-decoration: none; padding-right: 4px;}\
            a.GME_ctoc svg {height: 14px; width: 14px; vertical-align: sub; transform: rotate(180deg);}\
            .gme-button-refresh-labels {background-position: -320px 4px;}\
            .gme-button-clear-labels {background-position: -69px 4px;}\
            span.gme-distance-container {display: none;}\
            span.gme-distance-container.show {display: inline-block;}\
            #GME_loc, a.gme-button.leaflet-active {outline: none;}\
            .leaflet-control-zoomwarning {top: 94px;}\
            .leaflet-control-zoomwarning a {filter: progid:DXImageTransform.Microsoft.gradient(startColorStr="#BFC80000",EndColorStr="#BFC80000"); background-color: rgba(200,0,0,0.75); margin-left: -4px; background-position: -502px 2px; height: 14px; width: 14px; border-color: #b00; box-shadow: 0 0 8px rgba(0, 0, 0, 0.4);}\
            .leaflet-control-zoomwarning a:hover {background-color: rgba(230,0,0,0.75);}\
            .gme-event {cursor: pointer;}\
            .gme-modalDialog {position: fixed; top: 0; right: 0; bottom: 0; left: 0; background: rgba(0,0,0,0.5); z-index: 1000; opacity: .5; -webkit-transition: opacity 400ms ease-in; -moz-transition: opacity 400ms ease-in; transition: opacity 400ms ease-in; pointer-events: none; display: none;}\
            .gme-modalDialog:target, .gme-modalDialog.gme-targetted {opacity: 1; display: block; pointer-events: auto;}\
            .gme-modalDialog > div {position: relative; margin: 4% 12.5%; height: 30em; max-height: 75%; padding: 0 0 13px 0; border: 1px solid #000; border-radius: 10px; background: #fff; background: -moz-linear-gradient(#fff, #999); background: -webkit-linear-gradient(#fff, #999); background: -o-linear-gradient(#fff, #999);}\
            .gme-modalDialog header {color: #eee; background: none #454545; font-size: 15px; text-align: center; border-top-left-radius: 10px; padding: 0.5em 0; font-weight: bold; text-shadow: none; height: auto; min-height: auto; min-width: auto !important;}\
            .gme-modalDialog select {appearance: auto; background-color: inherit; background-image: none; background-repeat: no-repeat; color: inherit; border: 1px solid #9b9b9b; border-radius: 4px; width: auto; display: inline; font-size: 14px; line-height: normal; pointer-events: auto; padding: 0px 7px; height: 26px; margin-right: 7px;}\
            .gme-modalDialog label {text-transform: none; font-size: inherit; margin-top: 0px;}\
            .gme-modal-content {position: absolute; top: 3.5em; left: 0.75em; right: 0.75em; bottom: 0.5em; overflow: auto;}\
            .gme-modal-content > .leaflet-control-gme {position: absolute; left: 0.5em; bottom: 0.5em; top: auto;}\
            .gme-close-dialog {background: #606061; color: #fff; line-height: 25px; position: absolute; right: -12px; text-align: center; top: -10px; width: 24px; text-decoration: none; font-weight: bold; -webkit-border-radius: 12px; -moz-border-radius: 12px; border-radius: 12px; -moz-box-shadow: 1px 1px 3px #000; -webkit-box-shadow: 1px 1px 3px #000; box-shadow: 1px 1px 3px #000;}\
            .gme-close-dialog:hover {background: #00d9ff;}\
            #searchtabs li a {padding: 1em 0.5em;}\
            @media print {#search {display: none !important}}\
            .tab-switcher {position: relative; font-family: Arial, sans-serif; font-size: 14px;}\
            .gme-tab {float: left;}\
            .gme-tab-label {border-radius: 8px 8px 0 0; border: 1px solid #ccc; color: #454545; background: #ddd; display: block; position: relative; margin-left: 15px; padding: 3px 0; font-weight: bold; z-index: 0;}\
            .gme-tab-label:after {border-bottom: 1px solid #ccc; border-bottom-left-radius: 8px; border-left: 1px solid #ccc; box-shadow: -2px 2px 0 #ddd; bottom: -8px; content: ""; display: inline-block; height: 8px; left: 9px; position: relative; width: 8px; z-index: 3;}\
            .gme-tab-label:before {border-bottom: 1px solid #ccc; border-bottom-right-radius: 8px; border-right: 1px solid #ccc; box-shadow: 2px 2px 0 #ddd; bottom: -8px; content: ""; display: inline-block; height: 8px; left: -9px; position: relative; width: 8px; z-index: 3;}\
            .gme-tab-label:hover {cursor: pointer;}\
            .gme-tab-content {position: absolute; top: 25px; bottom: 3.5em; left: 0; right: 0; padding: 0.5em; background: #000; border: 1px solid #ccc; border-radius: 8px; color: #555; z-index: 1; opacity: 0; overflow: auto;}\
            .gme-tab-content ul {margin: 0.5em 0;}\
            .gme-tab input[type=radio] {display: none;}\
            .gme-tab input[type=radio]:checked ~ .gme-tab-content {z-index: 2; opacity: 1; background: #fff; color: #454545;}\
            .gme-tab input[type=radio]:checked ~ .gme-tab-label {background: #fff; color: #454545; border-bottom: 1px solid #fff; z-index: 3;}\
            .gme-tab input[type=radio]:checked ~ .gme-tab-label:after {box-shadow: -2px 2px 0 #fff;}\
            .gme-tab input[type=radio]:checked ~ .gme-tab-label:before {box-shadow: 2px 2px 0 #fff;}\
            .gme-fieldgroup {position: relative; border: 1px solid #ccc; border-radius: 6px; background: #eee; margin: 0.5em 0 1.5em; padding: 0.5em;}\
            .gme-fieldgroup h3 {position: absolute; top: -0.7em; left: 0.5em; padding: 0 0.5em; background: #eee; border-top: 1px solid #ccc; border-radius: 6px; z-index:1; display: inline-block; font-weight: bold; font-size: 12px;}\
            .gme-fieldgroup ul {margin: 0.5em 0; padding: 0;}\
            .gme-fieldgroup li {display: inline-block; margin: 0 -1px -1px 0; background: #ddd; border: 1px solid #ccc; border-radius: 6px; padding: 0 0.5em; height: 28px;}\
            .gme-fieldgroup label {display: inline;}\
            .gme-fieldgroup input {margin: 7px 0; padding-bottom: 6px; padding-top: 3px; height: 16px;}\
            #GME_map_custom {width: 200px; box-sizing: inherit; border: 1px solid #9b9b9b; border-radius: 4px;}\
            .gme-xhair {cursor: crosshair;}\
            .map-button-container {margin-right: 5em;}\
            .leaflet-top.leaflet-right {z-index: 7;}\
            #centerMap {margin-right: 100px;}\
            #map_canvas .leaflet-control-layers-toggle, #map_canvas2 .leaflet-control-layers-toggle {background-image: url(/js/leaflet/0.5.1/images/layers.png)}\
            #map_canvas label, #map_canvas2 label {text-transform: unset; display: block;}\
            #map_canvas .leaflet-popup-content, #map_canvas2 .leaflet-popup-content {text-align: unset;}',
        drag: '#cacheDetails .cacheImage {border: solid 1px #ccc; border-radius: 7px; padding-left: 5px;}\
            .moveable {cursor: move; box-shadow: 0 1px 4px rgba(102, 51, 255, 0.3);}'
    },
    env: {
        dragdrop: (document.createElement('span').draggable !== undefined),
        geolocation: !!navigator.geolocation,
        init: [],
        page: "default",
        storage: false,
        xhr: (typeof GM_xmlhttpRequest === 'function') ? 'GM' : ((typeof GM === 'object' && typeof GM.xmlHttpRequest === 'function') ? 'GM4': '')
    },
    html: {
        config: '<section class="gme-tab">\
                <input type="radio" name="gme-tab-row" id="gme-tab-maps" checked />\
                <label class="gme-tab-label" for="gme-tab-maps">Map display</label>\
                <div class="gme-tab-content">\
                    <div class="gme-fieldgroup">\
                        <h3>Maps to show in selector widget</h3>\
                        <ul id="GME_mapfields"></ul>\
                        <label>Default map source: &nbsp;<select name="GME_map_default" id="GME_map_default"></select></label>\
                    </div>\
                </div>\
            </section>\
            <section class="gme-tab">\
                <input type="radio" name="gme-tab-row" id="gme-tab-manage" />\
                <label class="gme-tab-label" for="gme-tab-manage">Manage maps</label>\
                <div class="gme-tab-content">\
                    <div class="gme-fieldgroup">\
                        <h3>Add map sources</h3>\
                        <label>Mapsource: <input type="text" name="GME_map_custom" id="GME_map_custom">&nbsp;</label>\
                        <div class="leaflet-control-gme"><button type="button" id="GME_custom_add" class="gme-button gme-button-wide gme-button-l gme-button-r" title="Add custom map source">Add</button> <a href="#GME_format" title="Map source format info" class="gme-button gme-button-wide gme-button-l gme-text">Mapsource format info</a><button type="button" id="GME_custom_export" title="Export custom map source JSON" class="gme-button gme-button-wide gme-button-r">Export custom maps</button></div>\
                    </div>\
                    <div class="gme-fieldgroup">\
                        <h3>Remove map sources</h3>\
                        <ul id="GME_mapfields_del"></ul>\
                    </div>\
                </div>\
            </section>\
            <section class="gme-tab">\
                <input type="radio" name="gme-tab-row" id="gme-tab-other" />\
                <label class="gme-tab-label" for="gme-tab-other">Other</label>\
                <div class="gme-tab-content">\
                    <div class="gme-fieldgroup">\
                        <h3>Miscellaneous settings</h3>\
                        <ul>\
                            <li><label title="Only list unfound caches in search"><input type="checkbox" name="GME_filterFinds" id="GME_filterFinds" /> Filter finds</label></li>\
                            <li><label><input type="checkbox" checked="checked" name="GME_osgbSearch" id="GME_osgbSearch" /> Enhance search</label></li>\
                            <li><label title="Location widget constantly updates position"><input type="checkbox" name="GME_follow" id="GME_follow" /> FollowMe Mode</label></li>\
                        </ul>\
                        <label>Labels:\
                            <select name="GME_labelStyle" id="GME_labelStyle">\
                                <option value="names">Names</option>\
                                <option value="codes" selected="selected">Codes</option>\
                            </select>\
                        </label>\
                        <label>Scale:\
                            <select name="GME_measure" id="GME_measure">\
                                <option value="metric" selected="selected">Metric</option>\
                                <option value="imperial">Imperial</option>\
                            </select>\
                        </label>\
                        <label>Map brightness:\
                            <input type="range" name="GME_brightness" id="GME_brightness" value="100" min="0" max="100" />\
                        </label>\
                    </div>\
                </div>\
            </section>\
            <section class="gme-tab">\
                <input type="radio" name="gme-tab-row" id="gme-tab-about" />\
                <label class="gme-tab-label" for="gme-tab-about">About</label>\
                <div class="gme-tab-content">\
                    <div class="gme-fieldgroup">\
                        <h3>Geocaching Map Enhancements</h3><br />\
                        <p>v<span id="GME_version"></span> &copy; 2011-2018 James Inge; 2022-2023 2Abendsegler. Geocaching Map Enhancements is licensed under the <a target="_blank" rel="noopener noreferrer" href="https://raw.githubusercontent.com/2Abendsegler/GME/main/License">MIT License</a>.<br>A short description of the tool and FAQ can be found <a target="_blank" rel="noopener noreferrer" href="https://github.com/2Abendsegler/GME/tree/main#readme">here</a>. A documentation can be found <a target="_blank" rel="noopener noreferrer" href="http://geo.inge.org.uk/gme.htm">here</a>.</p>\
                        <p>Elevation and reverse geocoding data provided by <a target="_blank" rel="noopener noreferrer" href="http://www.geonames.org/">GeoNames</a> and used under a <a target="_blank" rel="noopener noreferrer" href="https://creativecommons.org/licenses/by/3.0/">Creative Commons Attribution 3.0</a> (CC-BY) License.</p>\
                        <p>Grid reference manipulation is adapted from code &copy; 2005-2014 Chris Veness (<a target="_blank" rel="noopener noreferrer" href="http://www.movable-type.co.uk/scripts/latlong-gridref.html">www.movable-type.co.uk/scripts/latlong-gridref.html</a>, used under a <a target="_blank" rel="noopener noreferrer" href="https://creativecommons.org/licenses/by/3.0/">Creative Commons Attribution 3.0</a> (CC-BY) License.</p>\
                        <p>Photos provided by Geograph are copyright their respective owners - hover mouse over thumbnails or click through for attribution details. They may be re-used under a <a target="_blank" rel="noopener noreferrer" href="https://creativecommons.org/licenses/by-sa/2.0/">Creative Commons Attribution-ShareAlike 2.0</a> (CC-BY-SA) License.</p>\
                    </div>\
                </div>\
            </section>\
            <div class="leaflet-control-gme">\
                <a href="#" class="gme-button gme-button-wide gme-button-l gme-text" rel="back" title="Cancel">Cancel</a><button type="button" class="gme-button gme-button-wide" id="GME_default" title="Reset to defaults">Defaults</button><button type="button" class="gme-button gme-button-wide gme-button-r" id="GME_set" title="Confirm settings">Save</button>\
            </div>',
        customInfo: '<p>Custom mapsources can be added by supplying entering a <a rel="external" href="http://www.json.org/">JSON</a> configuration string that tells GME what to call the map, where to find it, and how it is set up. e.g.</p>\
            <p><code>{"alt":"OS NPE (GB only)","tileUrl":"https://ooc.openstreetmap.org/npe/{z}/{x}/{y}.png", "minZoom":6, "maxZoom": 15, "attribution": "OpenStreetMap NPE"}</code></p>\
            <p>The <code>"alt"</code> and <code>"tileUrl"</code> parameters are mandatory. <code>"tileUrl"</code> can contain {x}, {y} and {z} for Google-style coordinate systems (also works with TMS systems like Eniro, but needs the <code>"scheme":"tms"</code> parameter), or {q} for Bing-style quadkeys. GME can also connect with WMS servers, in which case a <code>"layers"</code> parameter is required.</p>\
            <p>The other parameters are the same as those used by the <a rel="external" href="http://leafletjs.com/reference-versions.html">Leaflet API</a>, with the addition of a <code>"overlay":true</code> option, that makes the mapsource appear as a selectable overlay.</p>\
            <ul><li><a rel="external" href="http://geo.inge.org.uk/gme_config.htm">Detailed documentation</a></li><li><a rel="external" href="http://geo.inge.org.uk/gme_maps.htm">More mapsource examples</a></li></ul>',
        search: '<input type="text" placeholder="Address, coordinates, GC-code, keyword, etc." id="SearchBox_Text" title="Jump to a specific zoom level by typing zoom then a number. Zoom 1 shows the whole world, maxiumum zoom is normally 18-22. To search using a British National Grid reference, just type it in the search box and hit the button! You can use 2, 4, 6, 8 or 10-digit grid refs with the 2-letter prefix but no spaces in the number (e.g. SU12344225) or absolute grid refs with a comma but no prefix (e.g. 439668,1175316)." />\
            <button id="SearchBox_OS" title="Search">Search</button>\
            <div class="GME_search_results hidden">\
                <h3 class="GME_search_heading">GeoNames search results</h3>\
                <ul class="GME_search_list"></ul>\
                <p>Or try the <a href="#" class="GME_link_GSSearch">Geocaching.com search</a>\
            </div>'
    },
    script: {
        common: function() {
            var that = this, callbackCount = 0, load_count = 0, JSONP;
            var ctoc = false;
            var ctocActiv = false;
            var ctocPath = '<path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"></path><path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"></path>';
            function setEnv() {
                // The script waits for the Leaflet API to load, and will abort if it does not find it after a minute.
                var maxTries = 60,
                    wait = 1000;
                switch (gmeConfig.env.page) {
                case "seek":
                    if (typeof $ === "function") {
                        gmeInit(gmeConfig.env.init);
                        load();
                        return;
                    }
                    break;
                case "hide":
                    maxTries = Infinity;
                    wait = 3000;
                    if (window.map !== null && window.map !== undefined && typeof L === "object" && typeof $ === "function") {
                        gmeInit(gmeConfig.env.init);
                        window.setTimeout(load,500);
                        return;
                    }
                    break;
                case "type":
                    if (window.map !== null && window.map !== undefined && typeof L === "object" && typeof $ === "function") {
                        gmeInit(gmeConfig.env.init);
                        load();
                        reload();
                        $(".cache-type-selector button").click(reload);
                        return;
                    }
                    break;
                case "maps":
                    // Wait for the map to load and the default map selector to be added.
                    if (typeof L === "object" && typeof $ === "function" && window.MapSettings && window.MapSettings.Map && window.MapSettings.Map._loaded && $(".leaflet-control-layers").length > 0) {
                        gmeInit(gmeConfig.env.init);
                        window.setTimeout(load,500);
                        return;
                    }
                    break;
                default:
                    if (typeof L === "object" && typeof $ === "function") {
                        gmeInit(gmeConfig.env.init);
                        window.setTimeout(load,500);
                        return;
                    }
                    break;
                }
                if (load_count < maxTries) {
                    window.setTimeout(setEnv, wait);
                    load_count++;
                    console.log("GME: Waiting for map API to load: " + load_count + "...");
                }
            }
            function gmeInit(scriptArray) {
                // Init routines that need either JQuery or Leaflet API, so must be run from load() rather than on script insertion.
                var initScripts = {
                    "config": function() {
                        if (gmeConfig.env.storage) {
                            setConfig();
                            $("#GME_set").bind("click", storeSettings);
                            $("#GME_default").bind("click", setDefault);
                            $("#GME_custom_add").bind("click", addCustom);
                            $("#GME_custom_export").bind("click", exportCustom);
                            // Build config link in settings menu for old design or if GClh is running.
                            $("li.li-user ul").append("<li class='li-settings'><a class='icon-settings' id='gme-config-link' href='#GME_config' title='Configure Geocaching Map Enhancements extension'>Geocaching Map Enhancements</a></li>");
                            // Build config link in settings menu for new design.
                            function checkForUserNew(waitCount) {
                                if ($('.toggle-user-menu')[0] && !$('.gme_toggle-user-menu')[0]) {
                                    $('.toggle-user-menu')[0].addEventListener("click", function() {
                                        function checkForSettingsNew(waitCount) {
                                            if ($('ul.menu-user')[0] && !$('#gme-config-link-new')[0]) {
                                                $('ul.menu-user').append("<li class='li-settings'><a class='icon-settings' id='gme-config-link-new' href='#GME_config' title='Configure Geocaching Map Enhancements extension'>Geocaching Map Enhancements</a></li>");
                                            } else {waitCount++; if (waitCount <= 50) setTimeout(function(){checkForSettingsNew(waitCount);}, 100);}
                                        }
                                        checkForSettingsNew(0);
                                    });
                                } else {waitCount++; if (waitCount <= 100) setTimeout(function(){checkForUserNew(waitCount);}, 100);}
                            }
                            checkForUserNew(0);
                        }
                    },
                    "drop": function() {
                        $.fn.filterNode = function(name) {
                            return this.find("*").filter(function() {
                                return this.nodeName === name;
                            });
                        };
                        L.GME_dropHandler = L.Control.extend(dropHandlerObj);
                    },
                    "map": function() {
                        bounds_GB = new L.LatLngBounds(new L.LatLng(49,-9.5),new L.LatLng(62,2.3));
                        bounds_IE = new L.LatLngBounds(new L.LatLng(51.2,-12.2),new L.LatLng(55.73,-5.366));
                        bounds_NI = new L.LatLngBounds(new L.LatLng(54,-8.25),new L.LatLng(55.73,-5.25));
                        bounds_CI = new L.LatLngBounds(new L.LatLng(49.1,-2.8),new L.LatLng(49.8,-1.8));
                        bounds_DE = new L.LatLngBounds(new L.LatLng(47.24941,5.95459),new L.LatLng(55.14121,14.89746));
                        L.GME_DistLine = L.Polyline.extend(polylineObj);
                        L.GME_QuadkeyLayer = L.TileLayer.extend(quadkeyLayerObj);
                        L.GME_complexLayer = L.TileLayer.extend(complexLayerObj);
                        L.GME_genericLayer = genericLayerFn;
                    },
                    "widget": function() {
                        L.GME_Widget = L.Control.extend(widgetControlObj);
                        if (window.Groundspeak && Groundspeak.Map && Groundspeak.Map.Control && Groundspeak.Map.Control.FindMyLocation) {
                            L.GME_FollowMyLocationControl = Groundspeak.Map.Control.FindMyLocation.extend(locationControlObj);
                        }
                        L.GME_ZoomWarning = L.Control.extend(zoomWarningObj);
                        if (L.LatLng.prototype.toUrl === undefined) {
                            L.LatLng.prototype.toUrl = function() {return this.lat.toFixed(6) + "," + this.lng.toFixed(6); };
                        }
                        if ($.fancybox === undefined) {
                            console.info("GME: Fetching Fancybox.");
                            $("head").append("<link rel='stylesheet' type='text/css' href='https://cdnjs.cloudflare.com/ajax/libs/fancybox/2.1.5/jquery.fancybox.min.css'><script type='text/javascript' src='https://cdnjs.cloudflare.com/ajax/libs/fancybox/2.1.5/jquery.fancybox.min.js'></script>");
                        }
                    }
                },
                j;

                for (j = 0; j < scriptArray.length; j++) {
                    if (initScripts.hasOwnProperty(scriptArray[j]) && typeof initScripts[scriptArray[j]] === "function") {
                        initScripts[scriptArray[j]]();
                    }
                }
                console.log("GME: Init: " + scriptArray.join());
            }
            function b64encode(str) {
                if (typeof window.btoa === "function") {
                    return btoa(encodeURIComponent(str));
                } else {
                    return encodeURIComponent(str);
                }
            }
            function b64decode(str) {
                if (typeof window.atob === "function") {
                    return decodeURIComponent(window.atob(str));
                } else {
                    return decodeURIComponent(str);
                }
            }
            function DMM(ll) {
                var latDeg = ll.lat < 0 ? Math.ceil(ll.lat) : Math.floor(ll.lat),
                    lngDeg = ll.lng < 0 ? Math.ceil(ll.lng) : Math.floor(ll.lng);
                return (ll.lat < 0 ? "S" : "N") + Math.abs(latDeg) + " " + (60 * Math.abs((ll.lat - latDeg))).toFixed(3) + (ll.lng < 0 ? " W" : " E") + Math.abs(lngDeg) + " " + (60 * Math.abs((ll.lng - lngDeg))).toFixed(3);
            }
            function formatDistance(dist) {
                var formatted = 0;
                if (that.parameters.measure === "metric") {
                    if (dist > 10000) {
                        formatted = Math.round(dist/1000) + " km";
                    } else {
                        if (dist > 1000) {
                            formatted = (dist/1000).toFixed(1) + " km";
                        } else {
                            formatted = Math.round(dist)+" m";
                        }
                    }
                } else {
                    if (dist > 16093.44) {
                        formatted = Math.round(dist/1609.344) + " mi";
                    } else {
                        if (dist > 1609.344) {
                            formatted = (dist/1609.344).toFixed(1) + " mi";
                        } else {
                            formatted = Math.round(dist * 3.2808)+" ft";
                        }
                    }
                }
                return formatted;
            }
            function htmlEntities(text) {
                return text
                    .replace(/&/g, "&amp;")
                    .replace(/\"/g, "&quot;")
                    .replace(/'/g, "&apos;")
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;");
            }
            function validCoords(c1, c2) {
                var lat, lng;
                if (c1 === undefined) {
                    return false;
                }
                if (c1.hasOwnProperty("lat") && c1.hasOwnProperty("lng")) {
                    lat = c1.lat;
                    lng = c1.lng;
                } else {
                    if (c2 !== undefined) {
                        lat = c1;
                        lng = c2;
                    }
                }
                if (lat !== null && lng !== null && !isNaN(+lat) && !isNaN(+lng) && lat >= -90 && lat <= 90) {
                    return true;
                }
                return false;
            }
            function parseCoords(text) {
                var lat=0, lng=0, num=0,
                c = text.replace(/[^\-SsWw0-9\.\s]/g," ").trim().match(/^([S\-])?\s*(\d{1,2}(\.\d*){0,1}|\.\d*)(\s+(\d{0,2}(\.\d*){0,1})){0,1}(\s+(\d{0,2}(\.\d*){0,1})){0,1}\s*([S\-])?\s+([W\-])?\s*(\d{1,3}(\.\d*){0,1}|\.\d*)(\s+(\d{0,2}(\.\d*){0,1})){0,1}(\s+(\d{0,2}(\.\d*){0,1})){0,1}\s*([W\-])?$/i);
                if (c) {
                    num = (c[2]?1:0) + (c[5]?1:0) + (c[8]?1:0) + (c[12]?1:0) + (c[15]?1:0) + (c[18]?1:0);
                    switch(num) {
                        case 6:
                            break;
                        case 4:
                            if (c[15] === undefined) {c[15] = c[12]; c[12] = c[8]; c[8] = undefined;}
                            break;
                        case 2:
                            if (c[12] === undefined && c[5]) {c[12] = c[5]; c[5] = undefined;}
                            break;
                        default:
                            alert("Couldnt understand coordinates");
                            return false;
                    }
                    if (c[2] !== undefined) {lat = +c[2];}
                    if (c[5] !== undefined) {lat += c[5]/60;}
                    if (c[8] !== undefined) {lat += c[8]/3600;}
                    if (c[1] !== undefined || c[10] !== undefined) {lat *= -1;}
                    if (c[12] !== undefined) {lng = +c[12];}
                    if (c[15] !== undefined) {lng += c[15]/60;}
                    if (c[18] !== undefined) {lng += c[18]/3600;}
                    if (c[11] !== undefined || c[20] !== undefined) {lng *= -1;}
                }
                if (validCoords(lat, lng)) {
                    return {lat:lat,lng:lng};
                }
                alert("Invalid coordinates");
                return false;
            }
            function getHomeCoords() {
                var c, h = document.getElementById("ctl00_ContentBody_lnkPrintDirectionsSimple");
                if (window.MapSettings && MapSettings.User && validCoords(MapSettings.User.Home)) {
                    return new L.LatLng(MapSettings.User.Home.lat, MapSettings.User.Home.lng);
                }
                if (validCoords(window.homeLat, window.homeLon)) {
                    return new L.LatLng(window.homeLat, window.homeLon);
                }
                // Nur notwendig im Listing für Drag & Drop ausgehend vom Cache Typ und im Zusammenhang mit Directions Links zu Parking Area und Trailhead.
                if (h && h.href) {
                    c = h.href.match(/(?:saddr=)(-?\d{1,2}\.\d*),(-?\d{1,3}\.\d*)/);
                    if (c !== null && c.length === 3 && validCoords(c[1], c[2])) {
                        return new L.LatLng(c[1], c[2]);
                    }
                }
                return false;
            }
            function validURL(url) {
                return (/^(http|https|ftp)\:\/\/([a-zA-Z0-9\.\-]+(\:[a-zA-Z0-9\.&amp;%\$\-]+)*@)*((25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9])\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[0-9])|localhost|([a-zA-Z0-9\-]+\.)*[a-zA-Z0-9\-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(\:[0-9]+)*(\/($|[a-zA-Z0-9\.\,\?'\\\+&amp;%\$#\=~_\-]+))*$/).test(url);
            }

            if (window.console === undefined) {
                var logFn = function(text) {};
                window.console = {
                    error: logFn,
                    log: logFn,
                    info: logFn,
                    warn: logFn
                };
            }

            if (gmeConfig.env.xhr) {
                JSONP = function(url, id) {
                    console.log("GME: Using GM_xhr to fetch " + url);
                    var s = document.getElementById("gme_jsonp_node");
                    if (!s) {
                        s = document.createElement("script");
                        s.id = "gme_jsonp_node";
                        document.documentElement.firstChild.appendChild(s);
                    }
                    s.type = "text/x-gme-jsonp";
                    s.text = url;
                    s.setAttribute("data-gme-callback", id);
                    document.dispatchEvent(new Event("GME_XHR_event"));
                };
                document.addEventListener("GME_XHR_callback", function(e) {
                    var s = document.getElementById("gme_jsonp_node"),
                        callback = s.getAttribute("data-gme-callback");
                    if (typeof window[callback] === "function") {
                        try {
                            window[callback](JSON.parse(s.text));
                        } catch(e) {
                            console.error("GME: Error processing JSON callback " + callback + ": " + e);
                        }
                    } else {
                        console.erro("GME: Unexpected request to JSON callback handler: Couldn't find callback function " + callback);
                    }
                    return false;
                });
            } else {
                JSONP = function(url, id) {
                    console.log("GME: Using JSONP to fetch " + url);
                    if (validURL(url)) {
                        var s = document.createElement("script");
                        s.type = "text/javascript";
                        if (id) {s.id = id;}
                        s.src = url;
                        document.documentElement.firstChild.appendChild(s);
                    }
                };
            }

            gmeConfig.env.home = getHomeCoords();

            that.parameters = gmeConfig.parameters;
            that.getVersion = function() {return gmeConfig.parameters.version;};
            that.getGeograph = function(coords) {
                var callprefix = "GME_geograph_callback", call, host = "";
                function searchLink(coords) {
                    // URIs for website search pages.
                    if (coords === undefined) {return false;}
                    var host = "";
                    if (bounds_GB.contains(coords) || bounds_IE.contains(coords)) {
                        host = "https://geograph.org.uk/";
                    }
                    if (bounds_CI.contains(coords)) {
                        host = "https://www.geograph.org.gg/";
                    }
                    if (bounds_DE.contains(coords)) {
                        host = "https://geo-en.hlipp.de/";
                    }
                    return host?[host,"search.php?location=", coords.toUrl()].join(""):false;
                }
                function makeCallback(callname) {callbackCount++; return function(json) {
                    var html, i, p;
                    if (json.items && json.items.length>0) {
                        html = ["<h3>Geograph images near ", DMM(coords), "</h3><p>"].join("");
                        for (i = json.items.length-1; i >= 0; i--) {
                            p = json.items[i];
                            html += ["<a target='_blank' rel='noopener noreferrer' href='",encodeURI(p.link),"' style='margin-right:0.5em;' title='", htmlEntities(p.title) + " by " + htmlEntities(p.author), "'>",p.thumbTag,"</a>"].join("");
                        }
                        html += ["</p><p><a target='_blank' rel='noopener noreferrer' href='",searchLink(coords),"'>Search for more photos nearby on Geograph</a></p><p style='font-size:90%;'>Geograph photos are copyrighted by their owners and available under a <a href='https://creativecommons.org/licenses/by-sa/2.0/'>Creative Commons licence</a>. Hover mouse over thumbnails for more details, or click through for full images.</p>"].join("");
                        $.fancybox(html);
                    } else {
                        $.fancybox(["<p>No photos found nearby. <a target='_blank' rel='noopener noreferrer' href='",searchLink(coords),"'>Search on Geograph</a></p>"].join(""));
                    }
                    $("#"+callname).remove();
                    if (window[callname] !== undefined) {delete window[callname];}
                };}
                if (validCoords(coords) && that.isGeographAvailable(coords)) {
                    if (!bounds_CI.contains(coords) && (bounds_GB.contains(coords) || bounds_IE.contains(coords))) {
                        host = "https://api.geograph.org.uk/";
                        call = callprefix + callbackCount;
                        window[call] = makeCallback(call);
                        JSONP(host + "syndicator.php?key=geo.inge.org.uk&location=" + coords.toUrl() + "&format=JSON&callback=" + call, call);
                    } else {
                        window.open(searchLink(coords), "_blank");
                    }
                } else {
                    console.error("GME: Bad coordinates to getGeograph.");
                }
            };
            that.getHeight = function(coords) {
                var callprefix = "GME_height_callback",call;
                function makeCallback(callname) {callbackCount++; return function(json) {
                    if (typeof json.astergdem === "number" && typeof json.lat === "number" && typeof json.lng === "number") {
                        var h, m;
                        if (json.astergdem === -9999) {
                            m = "<p><strong>Spot Height</strong><br/>(Ocean)</p>";
                        } else {
                            h = that.parameters.measure === "metric" ? json.astergdem + " m" : Math.round(json.astergdem*3.2808) + " ft";
                            m = ["<p><strong>Spot Height</strong><br/>Approx ",h," above sea level</p>"].join("");
                        }
                        $.fancybox(m);
                    }
                    $("#"+callname).remove();
                    if (window[callname] !== undefined) {delete window[callname];}
                };}
                if (validCoords(coords)) {
                    call = callprefix + callbackCount;
                    window[call] = makeCallback(call);
                    JSONP(["http://api.geonames.org/astergdemJSON?lat=",coords.lat,"&lng=",coords.lng,"&username=gme&callback=",call].join(""), call);
                } else {
                    console.error("GME: Bad coordinates to getHeight.");
                }
            };
            that.isGeographAvailable = function(coords) {
                return bounds_GB.contains(coords) || bounds_DE.contains(coords) || bounds_IE.contains(coords) || bounds_CI.contains(coords);
            };
            that.isInUK = function(coords) {
                if (bounds_GB.contains(coords)) {
                    if (bounds_IE.contains(coords)) {
                        if (bounds_NI.contains(coords)) {
                            return true;
                        }
                        return false;
                    }
                    return true;
                }
                return false;
            };
            if (gmeConfig.env.geolocation) {
                that.seekHere = function() {
                    function hereCallback(pos) {
                        that.seekByLatLng({lat:pos.coords.latitude, lng:pos.coords.longitude});
                        $("#GME_hereSub").val("Go");
                    }
                    function hereError(err) {
                        if (err.code === 2) {
                            alert("Current location not available");
                        }
                        if (err.code === 3) {
                            alert("Timed out finding current location");
                        }
                        $("#GME_hereSub").val("Go");
                    }
                    $("#GME_hereSub").val("Waiting for location...");
                    navigator.geolocation.getCurrentPosition(hereCallback, hereError, {timeout: 60000, maximumAge: 30000});
                    return false;
                };
            }
            that.seekByLatLng = function(latlng) {
                if (validCoords(latlng)) {
                    var url = ["https://www.geocaching.com/seek/nearest.aspx?origin_lat=",latlng.lat,"&origin_long=",latlng.lng, that.parameters.filterFinds?"&f=1":""].join("");
                    window.open(url, "_blank");
                } else {
                    console.error("GME: Invalid coordinates for search.");
                }
            };
            document.addEventListener('copy', function(e){
                if (!ctocActiv) return;
                e.preventDefault();
                if (ctoc) e.clipboardData.setData('text/plain', ctoc);
                ctoc = false;
                ctocActiv = false;
            });
        },
        config: function() {
            function addSources(json) {
                function setSrc(src) {
                    if (src.alt && src.tileUrl) {
                        var m = that.parameters.maps.concat(src);
                        that.parameters.maps = m;
                        return 1;
                    }
                    alert("Map source must include at least \"alt\" and \"tileUrl\" parameters");
                    return 0;
                }
                var i,updated=0;
                if (json.length === undefined) {
                    updated += setSrc(json);
                } else {
                    for (i = 0; i < json.length; i++) {
                        updated += setSrc(json[i]);
                    }
                }
                if (updated > 0) {
                    setConfig();
                    $("#gme-tab-maps")[0].checked = true;
                }
            }
            function addCustom() {
                try{
                    var n = JSON.parse(document.getElementById("GME_map_custom").value);
                    addSources(n);
                } catch(e) {
                    alert("Map source string must be valid JSON.");
                    return;
                }
            }
            function exportCustom() {
                $.fancybox($("<p/>").text(JSON.stringify(that.parameters.maps)).html());
            }
            function setDefault() {
                if (localStorage.GME_custom) {delete localStorage.GME_custom;}
                if (localStorage.GME_parameters) {delete localStorage.GME_parameters;}
                if (localStorage.GME_cache) {delete localStorage.GME_cache;}
                refresh();
            }
            function refresh(config) {
                var dest = "https://www.geocaching.com/map/#",
                    mapLink = document.getElementById("map_linkto"),
                    uri;
                if (config) {
                    dest += "GME_config";
                }
                if (mapLink) {
                    uri = mapLink.value;
                    if (uri) {
                        dest += uri.replace(/^http:\/\/coord.info\/map/, "");
                    }
                    document.location.href = dest;
                } else {
                    document.location.hash = "";
                }
                window.location.reload(false);
                return false;
            }
            function setConfig() {
                var i, mapfields = "", mapfields_del = "", mapselect = "", alt = "", overlay, sel, allMaps = that.parameters.maps;
                for (i = 0; i < allMaps.length; i++) {
                    alt = allMaps[i].alt;
                    overlay = allMaps[i].overlay;
                    if (!overlay) {mapselect += "<option value='" + htmlEntities(alt) + "'>" + htmlEntities(alt) + "</option>";}
                    mapfields += "<li><label><input type='checkbox' " + (allMaps[i].ignore ? "" : "checked='checked' ") + "name='" + htmlEntities(alt) + "' id='checkbox-" + i + "' /> " + htmlEntities(alt) + (overlay ? " (Overlay)" : "") + "</label></li>";
                }
                if (allMaps.length > 0) {
                    for (i = 0; i < allMaps.length; i++) {
                        alt = allMaps[i].alt;
                        mapfields_del += "<li><label><input type='checkbox' name='" + htmlEntities(alt) + "' id='checkbox-del-" + i + "' /> " + htmlEntities(alt) + (allMaps[i].overlay ? " (Overlay)" : "") + "</label></li>";
                    }
                } else {
                    mapfields_del = "&lt; No custom maps installed &gt;";
                }
                $("#GME_mapfields").html(mapfields);
                $("#GME_mapfields_del").html(mapfields_del);
                $("#GME_map_default").html(mapselect);
                sel = $("#GME_map_default").children();
                for (i = sel.length - 1; i > -1; i--) {
                    if (sel[i].value === that.parameters.defaultMap) {
                        sel[i].selected = "selected";
                    }
                }
                $("#GME_filterFinds").attr("checked", that.parameters.filterFinds);
                $("#GME_osgbSearch").attr("checked", that.parameters.osgbSearch);
                $("#GME_follow").attr("checked", that.parameters.follow);
                $("#GME_labelStyle").val(that.parameters.labels);
                $("#GME_measure").val(that.parameters.measure);
                $("#GME_brightness").val(that.parameters.brightness * 100);
                $("#GME_version").html(that.parameters.version);
            }
            function storeSettings() {
                var i, j, list;
                that.parameters.defaultMap = $("#GME_map_default")[0].value;
                list = $("#GME_mapfields input");
                for (i = list.length - 1; i >= 0; i--) {
                    for (j = that.parameters.maps.length - 1; j >= 0; j--) {
                        if (that.parameters.maps[j].alt === list[i].name) {
                            that.parameters.maps[j].ignore = !list[i].checked;
                        }
                    }
                }
                for (j = that.parameters.maps.length - 1; j >= 0; j--) {
                    if (that.parameters.maps[j].alt === that.parameters.defaultMap) {
                        that.parameters.maps[j].ignore = false;
                    }
                }
                list = $("#GME_mapfields_del input");
                for (i = list.length - 1; i >= 0; i--) {
                    if (list[i].checked === true) {
                        for (j = that.parameters.maps.length - 1; j >= 0; j--) {
                            if (that.parameters.maps[j].alt === list[i].name) {
                                that.parameters.maps.splice(j,1);
                                break;
                            }
                        }
                    }
                }
                that.parameters.brightness = $("#GME_brightness").val() / 100;
                that.parameters.filterFinds = $("#GME_filterFinds")[0].checked ? true : false;
                that.parameters.follow = $("#GME_follow")[0].checked ? true : false;
                that.parameters.labels = $("#GME_labelStyle")[0].value;
                that.parameters.measure = $("#GME_measure")[0].value;
                that.parameters.osgbSearch = $("#GME_osgbSearch")[0].checked? true : false;
                localStorage.setItem("GME_parameters", JSON.stringify(that.parameters));
                refresh();
            }
        },
        cssTransitionsFix: function() {
            // Work around bug that breaks JQuery Mobile dialog boxes in Opera 12.
            if (window.$ && $.support) {
                $.support.cssTransitions = false;
            }
        },
        dist: function() {
            $("#lblDistFromHome").parent().append("<br/><span id='gme-dist'><a href='#' id='gme-dist-link'>Check distance from here</a></span>");
            $("#gme-dist-link").click(function() {
                var there = new LatLon(mapLatLng.lat, mapLatLng.lng),
                    rose = [[22.5,67.5,112.5,157.5,202.5,247.5,292.5,337.5],["N","NE","E","SE","S","SW","W","NW"]],
                    watcher;
                function found(pos) {
                    var here = new LatLon(pos.coords.latitude, pos.coords.longitude),
                    bearing = here.bearingTo(there),
                    dir = "N", i;
                    for (i = 0; i < 8; i++) {
                        if (bearing < rose[0][i]) {
                            dir = rose[1][i];
                            break;
                        }
                    }
                    $("#gme-dist").html("<img style='vertical-align:text-bottom' alt='" + dir + "' src='/images/icons/compass/" + dir + ".gif'> " + dir + " " + formatDistance(here.distanceTo(there)*1000) + " from here at bearing " + Math.round(bearing) + "&deg;");
                }
                function lost() {
                    if (watcher) {
                        navigator.geolocation.clearWatch(watcher);
                    }
                    alert("GME: Couldn't detect your location.\nDisable FollowMe mode in Geocaching Map Enhancements if this error pops up repeatedly.");
                }
                if (that.parameters.follow) {
                    watcher = navigator.geolocation.watchPosition(found, lost, {timeout: 60000, maximumAge: 30000});
                } else {
                    navigator.geolocation.getCurrentPosition(found, lost, {timeout: 60000, maximumAge: 30000});
                }
                return false;
            });
        },
        drag: function() {
            that.dragStart = function(event) {
                function GME_formatLOC(wpts) {
                    return wpts ? ['<?xml version="1.0" encoding="UTF-8"?>\n<loc version="1.0" src="Geocaching Map Enhancements v' + that.getVersion() + '">' + wpts.join('\n') + '</loc>'].join('\n'):null;
                }
                function GME_formatLOC_wpt(id, desc, coords, type, link) {
                    if (id && desc && coords) {
                        var t="Geocache",
                            l=link ? ('\n\t<link text="' + link.desc + '">' + link.href + '</link>') : "";
                        switch(type) {
                            case "Original Coordinates": t=type; break;
                            case 217: t="Parking Area"; break;
                            case 218: t="Question to Answer"; break;
                            case 219: t="Stages of a Multicache"; break;
                            case 220: t="Final Location"; break;
                            case 221: t="Trailhead"; break;
                            case 452: t="Reference Point"; break;
                        }
                        return ('<waypoint>\n\t<name id="' + id + '"><![CDATA[' + desc + ']]></name>\n\t<coord lat="' + coords.lat + '" lon="' + coords.lng + '"/>\n\t<type>' + t + '</type>' + l + '\n</waypoint>');
                    }
                    console.error("GME: Missing cache data - id:", id , "desc:", desc, "coords:", coords);
                    return null;
                }
                var c, dataURI, dt, i, locfmt,
                    id = $("#ctl00_ContentBody_CoordInfoLinkControl1_uxCoordInfoCode")[0].innerHTML,
                    loc = [GME_formatLOC_wpt(id, cache_coords.primary[0].name, cache_coords.primary[0], cache_coords.primary[0].type,{desc:"Cache Details",href:"https://coord.info/"+id})];
                for (i = cache_coords.additional.length-1; i >= 0; i--) {
                    c = cache_coords.additional[i];
                    loc.push(GME_formatLOC_wpt(c.pf + id.slice(2), [c.name,$("#awpt_"+c.pf).parent().parent().next().children()[2].innerHTML.trim()].join(" "), c, c.type));
                }
                if (cache_coords.primary[0].isUserDefined) {
                    loc.push(GME_formatLOC_wpt("GO"+id.slice(2), cache_coords.primary[0].name, {lat:cache_coords.primary[0].oldLatLng[0], lng:cache_coords.primary[0].oldLatLng[1]}, "Original Coordinates",{desc:"Cache Details",href:"https://coord.info/"+id}));
                }
                locfmt = GME_formatLOC(loc);
                dataURI = "data:application/xml-loc," + encodeURIComponent(locfmt);
                dt = event.originalEvent.dataTransfer;
                if (window.DataTransfer !== undefined && dt.constructor === window.DataTransfer) {
                    dt.setData("application/gme-cache-coords", JSON.stringify(cache_coords));
                    dt.setData("application/xml-loc", locfmt);
                    dt.setData("text/x-moz-url", dataURI + "\nGME_waypoints.loc");
                    dt.setData("DownloadURL", "application/xml-loc:GME_waypoints.loc:" + dataURI);
                }
                dt.setData("text/uri-list", dataURI);
                dt.setData("Text", locfmt);
                dt.effectAllowed = "copy";
                dt.setDragImage($('a[aria-label="About geocache types"]')[0],0,0);
            };
        },
        drop: function() {
            var dropHandlerObj = {
                onAdd: function(map) {
                    var container = $(map.getContainer());
                    this._map = map;
                    container.on("drop", this.drop(map));
                    container.on("dragover", this.dragOver);
                    return document.createElement("div");
                },
                onRemove: function(map) {
                    var container = $(map.getContainer());
                    container.off("drop", this.drop(map));
                    container.off("dragover", this.dragOver);
                },
                drop: function(map) {return function(e) {
                    function typeToIcon(t) {
                        var j, type = t;
                        for (j = wptTypes.length - 1; j >= 0; j--) {
                            type = type.replace(wptTypes[j][0],wptTypes[j][1]);
                        }
                        return type;
                    }
                    function parseLOC(text) {
                        var i, l, w, t, len, lat, lng, name, points = {primary:[], additional:[]}, wpts = $($.parseXML(text)).find("waypoint");
                        for (i = 0, len = wpts.length; i < len; i++) {
                            w = $(wpts[i]);
                            lat = w.find("coord").attr("lat");
                            lng = w.find("coord").attr("lon");
                            name = w.find("name").attr("id") + ": " + w.find("name").text().trim();
                            if (isNaN(+lat) || isNaN(+lng) || lat < -90 || lat > 90) {return false;}
                            t = w.find("type").text();
                            if (/Geocache/i.test(t)) {
                                points.primary.push({lat:lat, lng:lng, name:name, type:2});
                            } else {
                                l = points.primary.length;
                                if (l && /Original Coordinates/i.test(t)) {
                                    points.primary[l-1].oldLatLng = [lat, lng];
                                    points.primary[l-1].isUserDefined = true;
                                } else {
                                    points.additional.push({lat:lat, lng:lng, name:name, type:typeToIcon(t)});
                                }
                            }
                        }
                        return(points.additional.length + points.primary.length > 0)?points:false;
                    }
                    function readLOC(e) {
                        var data = e.target.result, pts = parseLOC(data);
                        if (pts) {
                            console.info("GME: Received LOC file.");
                            GME_displayPoints(pts, map, "dragdrop");
                        }
                    }
                    function parseGPX(text) {
                        var d, i, j, k, w, r, t, lat, lng, len, n, name = "", poly, type, points = {primary:[], additional:[], routes:[]}, gpx = $($.parseXML(text)), wpts = gpx.find("wpt"), tracks = gpx.find("trk"), segs, routes = gpx.find("rte");
                        for (i = 0, len = wpts.length; i < len; i++) {
                            w = $(wpts[i]);
                            lat = w.attr("lat");
                            lng = w.attr("lon");
                            n = w.filterNode("name");
                            d = w.filterNode("desc");
                            name = n.length > 0 ? n[0].textContent : "Point " + i;
                            name += (n.length > 0 && d.length > 0) ? " : " : "";
                            name += d.length > 0 ? d[0].textContent : "";
                            if (isNaN(+lat) || isNaN(+lng) || lat < -90 || lat > 90) {return false;}
                            t = w.find("sym").text();
                            if (/Geocache/i.test(t)) {
                                t = w.filterNode("groundspeak:type");
                                if (t.length > 0) {
                                    type = t[0].textContent;
                                } else {
                                    type = "Geocache";
                                }
                            } else {
                                type = t;
                            }
                            points[/Geocache/i.test(t)?"primary":"additional"].push({lat:lat, lng:lng, name:name, type:typeToIcon(type)});
                        }
                        for (i = routes.length-1; i >= 0; i--) {
                            poly = [];
                            r = $(routes[i]);
                            n = r.filterNode("name");
                            name = n.length > 0 ? n[0].textContent : "Route "+i;
                            wpts = r.find("rtept");
                            for (j = wpts.length-1; j >= 0; j--) {
                                w = $(wpts[j]);
                                poly.push(new L.LatLng(w.attr("lat"), w.attr("lon")));
                            }
                            points.routes.push({name:name, points:poly});
                        }
                        for (i = tracks.length-1; i >= 0; i--) {
                            poly = [];
                            r = $(tracks[i]);
                            segs = r.find("trkseg");
                            for (j = segs.length-1; j >= 0; j--) {
                                n = r.filterNode("name");
                                name = [(n.length > 0) ? n[0].textContent : "Track " + i, " segment ", j].join("");
                                wpts = $(segs[j]).find("trkpt");
                                for (k = wpts.length-1; k >= 0; k--) {
                                    w = $(wpts[k]);
                                    poly.push(new L.LatLng(w.attr("lat"), w.attr("lon")));
                                }
                                points.routes.push({name:name, points:poly});
                            }
                        }
                        return (points.additional.length + points.primary.length + points.routes.length > 0) ? points : false;
                    }
                    function readGPX(e) {
                        var data = e.target.result, pts = parseGPX(data);
                        if (pts) {
                            console.info("GME: Received GPX file.");
                            GME_displayPoints(pts, map, "dragdrop");
                        }
                    }
                    e.stopPropagation();
                    e.preventDefault();
                    var i, data, dt = e.originalEvent.dataTransfer, file, files = dt.files, pts, reader;
                    try {
                        data = dt.getData("application/gme-cache-coords");
                        if (data) {
                            console.info("GME: Received GME data.");
                            GME_displayPoints(JSON.parse(data), map, "dragdrop");
                            return;
                        }
                        data = dt.getData("text/plain");
                        if (data) {
                            pts = parseLOC(data);
                            if (pts) {
                                console.info("GME: Received LOC text.");
                                GME_displayPoints(pts, map, "dragdrop");
                                return;
                            }
                            pts = parseGPX(data);
                            if (pts) {
                                console.info("GME: Received GPX text.");
                                GME_displayPoints(pts, map, "dragdrop");
                                return;
                            }
                        }
                    } catch(e) {console.error("GME: Drop: " + e);}
                    for (i = files.length-1; i >= 0; i--) {
                        file = files[i];
                        if (/application\/xml-loc/.test(file.type) || /\.loc$/i.test(file.name)) {
                            reader = new FileReader();
                            reader.onload = readLOC;
                            reader.readAsText(file);
                        } else {
                            if (/application\/xml-gpx/.test(file.type) || /\.gpx$/i.test(file.name)) {
                                reader = new FileReader();
                                reader.onload = readGPX;
                                reader.readAsText(file);
                            } else {
                                console.error("GME: Dropped file not recognised: " + file.name + ", (type: " + file.type + ")");
                            }
                        }
                    }
                };},
                dragOver: function(e) {
                    var dt=e.originalEvent.dataTransfer;
                    function contains(array, value) {
                        if (array.indexOf) {
                            return array.indexOf(value) >= 0;
                        }
                        if (array.contains) {
                            return array.contains(value);
                        }
                        console.error("GME: couldn\'t determine type of dragged data. Accepting anyway.");
                        return true;
                    }
                    if (dt && dt.types) {
                        try {
                            if (contains(dt.types, "application/gme-cache-coords") || contains(dt.types,"application/xml-gpx") || contains(dt.types,"application/xml-loc") || contains(dt.types,"text/plain") || contains(dt.types,"Files")) {
                                e.preventDefault();
                                return false;
                            }
                        } catch(e) {
                            console.error("GME: dragOver: ", e);
                        }
                    }
                }
            };
        },
        loadDefault: function() {
            if (typeof window.$ === "function") {
                gmeInit(gmeConfig.env.init);
            }
        },
        labels: function() {
            function GME_load_labels(control, div) {
                function labelHandler() {
                    var action = this.getAttribute("data-gme-action"), cache = this.getAttribute("data-gme-cache");
                    switch (action) {
                        case "panTo":
                            if (control.labels.labels[cache]) {
                                control._map.panTo(control.labels.labels[cache][2]);
                            }
                            break;
                        case "refresh":
                            control.labels.refresh();
                            break;
                        case "clear":
                            control.labels.removeLabels();
                            break;
                        case "auto":
                            control.labels.toggleAuto();
                            break;
                        case "show":
                            control.labels.toggleShow();
                            break;
                    }
                    return false;
                }
                L.GME_identifyLayer = L.Class.extend({
                    initialize: function(latlng, options) {
                        L.Util.setOptions(this, options);
                        this._latlng = latlng;
                    },
                    onAdd: function(map) {
                        this._map = map;
                        this._el = L.DomUtil.create("div", "gme-identify-layer leaflet-zoom-hide");
                        this._el.innerHTML = this.options.label;
                        this._el.title = this.options.desc;
                        this._el.style.position = "absolute";
                        map.getPanes().overlayPane.appendChild(this._el);
                        map.on("viewreset", this._reset, this);
                        this._reset();
                    },
                    onRemove: function(map) {
                        map.getPanes().overlayPane.removeChild(this._el);
                        map.off("viewreset", this._reset, this);
                    },
                    options: {
                        label: "Cache",
                        desc: "Long cache name"
                    },
                    setPosition: function(ll) {
                        this._latlng = ll;
                        this._reset();
                    },
                    _reset: function() {
                        if (this._map) {
                            var pos = this._map.latLngToLayerPoint(this._latlng);
                            L.DomUtil.setPosition(this._el, pos);
                        }
                    }
                });
                control.labels = {
                    showLabels: false,
                    autoUpdate: false,
                    labels: {},
                    labelLayer: new L.LayerGroup(),
                    clearLabels: function() {
                        control._map.removeLayer(control.labels.labelLayer);
                    },
                    displayLabels: function() {
                        control._map.addLayer(control.labels.labelLayer);
                    },
                    refresh: function() {
                        if (!(window.MapSettings && MapSettings.MapLayers && MapSettings.MapLayers.UTFGrid)) {
                            return;
                        }
                        var i, coords, tiles = $(".leaflet-tile-pane .leaflet-layer img[src*='geocaching.com/map.png']");
                        for (i = tiles.length-1; i >= 0; i--) {
                            coords = tiles[i].src.match(/x=(\d+)&y=(\d+)&z=(\d+)/);
                            if (coords && !MapSettings.MapLayers.UTFGrid._cache.hasOwnProperty(([coords[3],coords[1],coords[2]].join("_")))) {
                                MapSettings.MapLayers.UTFGrid._loadTile(coords[3],coords[1],coords[2]);
                            }
                        }
                        setTimeout(control.labels.refreshLabels, 500);
                    },
                    refreshLabels: function() {
                        var c, p, q, r, tile, tilepos, tileref, gridref, zoom = control._map.getZoom();
                        if (!(window.MapSettings && MapSettings.MapLayers && MapSettings.MapLayers.UTFGrid)) {
                            return;
                        }
                        for (p in MapSettings.MapLayers.UTFGrid._cache) {
                            if (MapSettings.MapLayers.UTFGrid._cache.hasOwnProperty(p)) {
                                tileref = p.split("_");
                                if (tileref.length === 3) {
                                    tile = $("img[src*='x=" + tileref[1] + "&y=" + tileref[2] + "&z=" + tileref[0] + "']")[0];
                                    if (tile) {
                                        tilepos = L.DomUtil.getPosition(tile);
                                        if (MapSettings.MapLayers.UTFGrid._cache[p]) {
                                            for (q in MapSettings.MapLayers.UTFGrid._cache[p].data) {
                                                if (MapSettings.MapLayers.UTFGrid._cache[p].data.hasOwnProperty(q)) {
                                                    for (r in MapSettings.MapLayers.UTFGrid._cache[p].data[q]) {
                                                        if (MapSettings.MapLayers.UTFGrid._cache[p].data[q].hasOwnProperty(r)) {
                                                            c = MapSettings.MapLayers.UTFGrid._cache[p].data[q][r];
                                                            if (!control.labels.labels[c.i]) {
                                                                gridref = q.match(/\((\d+), (\d+)\)/);
                                                                if (gridref) {
                                                                    control.labels.labels[c.i] = [ c.i, c.n, control._map.layerPointToLatLng(tilepos.add(new L.Point(4*gridref[1], 4*gridref[2]))), zoom];
                                                                    control.labels.labels[c.i][4] = new L.GME_identifyLayer(control.labels.labels[c.i][2], (that.parameters.labels === "names") ? {label:c.n, desc:c.i} : {label:c.i, desc:c.n});
                                                                }
                                                            } else {
                                                                if (zoom > control.labels.labels[c.i][3]) {
                                                                    gridref = q.match(/\((\d+), (\d+)\)/);
                                                                    if (gridref) {
                                                                        control.labels.labels[c.i][2] = control._map.layerPointToLatLng(tilepos.add(new L.Point(4*gridref[1], 4*gridref[2])));
                                                                        control.labels.labels[c.i][3] = zoom;
                                                                        control.labels.labels[c.i][4].setPosition(control.labels.labels[c.i][2]);
                                                                    }
                                                                }
                                                            }
                                                            control.labels.labelLayer.addLayer(control.labels.labels[c.i][4]);
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        control.labels.updateCachePanel();
                        if (control.labels.showLabels) {
                            control.labels.clearLabels();
                            control.labels.displayLabels();
                        }
                    },
                    removeLabels: function() {
                        $("#gme_cachelist").html("");
                        control.labels.labelLayer.clearLayers();
                        control.labels.labels = {};
                    },
                    toggleAuto: function() {
                        if (control.labels.autoUpdate) {
                            control.labels.autoUpdate = false;
                            control._map.off("moveend",control.labels.refresh);
                            $(".gme-button-labels-auto").removeClass("gme-button-active");
                        } else {
                            control.labels.autoUpdate = true;
                            $(".gme-button-labels-auto").addClass("gme-button-active");
                            control._map.on("moveend",control.labels.refresh);
                            control.labels.refresh();
                        }
                    },
                    toggleShow: function() {
                        if (control.labels.showLabels) {
                            control.labels.showLabels = false;
                            $(".gme-button-labels-show").removeClass("gme-button-active");
                            control.labels.clearLabels();
                        } else {
                            control.labels.showLabels = true;
                            $(".gme-button-labels-show").addClass("gme-button-active");
                            control.labels.refresh();
                        }
                    },
                    updateCachePanel: function() {
                        var i, j, sortorder = [], html = "";
                        for (i in control.labels.labels) {
                            if (control.labels.labels.hasOwnProperty(i)) {
                                sortorder.push(i);
                            }
                        }
                        sortorder.sort();
                        j = sortorder.length;
                        for (i = 0; i < j; i++) {
                            html += "<tr><td><a href='https://coord.info/" + sortorder[i] + "' target='_blank' rel='noopener noreferrer'>" + control.labels.labels[sortorder[i]][1] + "</a></td><td class='gme-cache-code'>&nbsp;" + sortorder[i] + "</td><td><a class='gme-event' title='Pan map to cache location' data-gme-action='panTo' data-gme-cache='" + sortorder[i] + "'><img src='../images/silk/map.png' width='16' height='16' alt='Pan' /></a></td></tr>";
                        }
                        $("#gme_cachelist").html(html);
                    }
                };
                $("#searchtabs ul").append("<li id='gme_caches_button'><a href='#gme_caches' title='GME Cache Label List' id='gme_caches_link'>GME</a></li>");
                $("#searchtabs li").css("width", 100 / $("#searchtabs li").length + "%");
                $("#pqlink").html("PQs");
                $("#clistButton").html("GCVote");
                document.getElementById("pqlink").innerHTML = "PQs";
                $(div).append("<div id='gme_caches'>\
                    <div class='leaflet-control-gme'>\
                        <a title='Refresh cache labels' class='gme-event gme-button-wide gme-button-refresh-labels gme-button gme-button-l gme-text-small' data-gme-action='refresh'>Refresh</a><a title='Empty cache list and remove labels from map' class='gme-event gme-button-wide gme-button gme-button-clear-labels gme-text-small' data-gme-action='clear'>Clear</a><a class='gme-event gme-button gme-button-wide gme-button-labels-show gme-text-small' data-gme-action='show'>Show labels</a><a class='gme-event gme-button gme-button-r gme-button-wide gme-button-labels-auto gme-text-small' data-gme-action='auto'>Auto update</a>\
                    </div>\
                    <table><tbody id='gme_cachelist'><tr><td colspan='3'>Hit the refresh button above to populate the list.</td></tr></tbody></table></div>");
                $("#gme_caches").css("display","none").on("click", ".gme-event", labelHandler);
                $("#gme-labels-show").on("change", control.labels.toggleShow);
                $("#gme-labels-auto").on("change", control.labels.toggleAuto);
            }
        },
        loadHide: function() {
            function load() {
                window.GME_control = new L.GME_Widget().addTo(map);
                GME_control._layerControl = GME_load_map(map);
                if (gmeConfig.env.dragdrop) {
                    map.addControl(new L.GME_dropHandler());
                }
            }
            window.setTimeout(setEnv, 3000);
        },
        loadListing: function() {
            var cache_coords = {};
            var mapLink = '';
            function load() {
                mapLink = document.getElementById("ctl00_ContentBody_uxViewLargerMap");
                var parkUrl = "", label = "", i, parking, uri = "#&pop=";
                if (L.LatLng.prototype.toUrl === undefined) {
                    L.LatLng.prototype.toUrl = function() {var obj = this; if (!(obj instanceof L.LatLng)) {return false;} return [L.Util.formatNum(obj.lat,5),L.Util.formatNum(obj.lng,5)].join(",");};
                }
                $("#map_canvas").replaceWith("<div style=\'width: 325px; height: 325px; position: relative;\' id=\'map_canvas2\'></div>");
                if (gmeConfig.env.dragdrop) {
                    $("#cacheDetails .cacheImage").hover(function(e) {$("#cacheDetails .cacheImage").addClass("moveable");},function(e) {$("#cacheDetails .cacheImage").removeClass("moveable");});
                    $("#cacheDetails .cacheImage").attr("draggable","true").on("dragstart", that.dragStart);
                    $("#cacheDetails .cacheImage a").removeAttr("href");
                }
                window.GME_Map = new L.Map("map_canvas2",{center: new L.LatLng(mapLatLng.lat, mapLatLng.lng), zoom:14});
                GME_Map.addControl(new L.control.scale());
                GME_load_map(GME_Map);
                cache_coords = {primary:[mapLatLng], additional:[]};
                if (cmapAdditionalWaypoints && cmapAdditionalWaypoints.length > 0) {
                    cache_coords.additional = cmapAdditionalWaypoints;
                    if (gmeConfig.env.home) {
                        for (i = cmapAdditionalWaypoints.length-1; i >= 0; i--) {
                            if (cmapAdditionalWaypoints[i].hasOwnProperty("editurl")) {
                                delete cache_coords.additional[i].editurl;
                            }
                            parking = cmapAdditionalWaypoints[i];
                            if (parking.type === 217 || parking.type === 221) {
                                label = parking.type === 217 ? "Parking Area" : "Trailhead";
                                parkUrl = `https://www.google.com/maps/dir/${gmeConfig.env.home.toUrl()}/${parking.lat},${parking.lng}/`;
                                $("#awpt_" + parking.pf)[0].parentNode.parentNode.children[1].innerHTML +=
                                    `<a target="_blank" rel="noopener noreferrer" href="${parkUrl}"><img width="16" height="16" title="[GME] Directions to ${label}" alt="${label}" src="https://www.geocaching.com/images/icons/16/directions.png" /></a>`;
                            }
                        }
                    }
                }
                if (gmeConfig.env.dragdrop) {
                    GME_Map.addControl(new L.GME_dropHandler());
                }
                if (cache_coords.primary[0].oldLatLng || cache_coords.primary.length + cache_coords.additional.length > 1) {
                    uri += b64encode(JSON.stringify(cache_coords));
                    if (mapLink.href.match(/www.geocaching.com\/map\//)) {
                        mapLink.href = mapLink.href + uri;
                    }
                    $('#ctl00_ContentBody_MapLinks_MapLinks a[href*="www.geocaching.com/play/map"]').each(function() {
                        this.href = this.href.replace('www.geocaching.com/play/map', 'www.geocaching.com/map/');
                    });
                    $('#ctl00_ContentBody_MapLinks_MapLinks a[href*="www.geocaching.com/map/"]').attr("href", function(i, val) {return val + uri;});
                }
                GME_displayPoints(cache_coords, GME_Map, "listing");
            }
            setEnv();
        },
        loadMap: function() {
            function load() {
                function goSearch(e) {
                    if (e.type === "click" || (e.which || e.keyCode) === 13) {
                        e.preventDefault();
                        e.stopImmediatePropagation();
                        return GME_control.search($.trim($("#SearchBox_Text").val() || ""));
                    }
                }
                var jsonURI;
                GME_load_map(MapSettings.Map);
                if (gmeConfig.env.dragdrop) {
                    MapSettings.Map.addControl(new L.GME_dropHandler());
                }
                window.GME_control = GME_load_widget(MapSettings.Map);
                GME_load_labels(GME_control,"#scroller");
                if (gmeConfig.parameters.osgbSearch) {
                    $("#SearchBox_OS").on("click keypress", goSearch);
                    $(".SearchBox").on("keydown", goSearch);
                    $("#search p")[0].innerHTML = "Search by <span style='cursor:help;' title='Enhanced by Geonames'>Address</span>, Coordinates, GC-code,<br/><span style='cursor:help;' title='Jump to a specific zoom level by typing zoom then a number. Zoom 1 shows the whole world, maxiumum zoom is normally 18-22.'>zoom</span> or <span style='cursor:help;' title='To search using a British National Grid reference, just type it in the search box and hit the button! You can use 2, 4, 6, 8 or 10-digit grid refs with the 2-letter prefix but no spaces in the number (e.g. SU12344225) or absolute grid refs with a comma but no prefix (e.g. 439668,1175316).'>Grid Ref</span>";
                }
                if (window.pnlOpen === false) {
                    $(".leaflet-control-toolbar, .groundspeak-control-findmylocation, .leaflet-control-scale, .gme-left").css("left", "30px");
                }
                if (gmeConfig.env.storage) {
                    if (localStorage.GME_cache) {
                        try {
                            GME_displayPoints(JSON.parse(b64decode(localStorage.GME_cache)), GME_control._map, "clickthru");
                            delete localStorage.GME_cache;
                        } catch(e) {
                            console.error("GME: Can't pop cache: " + e);
                        }
                    }
                }
            }
            setEnv();
        },
        loadSeek: function() {
            function load() {
                function goGR(e) {
                    if (e.type === "click" || (e.type === "keypress" && (e.which || e.keyCode) === 13)) {
                        e.preventDefault();
                        e.stopImmediatePropagation();
                        that.seekGR($.trim($("#grRef").val()));
                        return false;
                    }
                }
                function goCoords(e) {
                    var c, coords;
                    if (e.type === "click" || (e.type === "keypress" && (e.which || e.keyCode) === 13)) {
                        e.preventDefault();
                        e.stopImmediatePropagation();
                        c=document.getElementById("gme_coords").value;
                        if (c) {
                            coords = parseCoords(c);
                            if (coords) {
                                that.seekByLatLng(coords);
                                return false;
                            }
                        }
                    }
                }
                function goGoogle(e) {
                    var q = document.getElementById("gme_google").value.trim(), url;
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    if (q) {
                        url = "https://www.google.co.uk/search?q=allintitle%3A" + encodeURIComponent(q) + "+site%3Awww.geocaching.com%2Fgeocache%2F+OR+site%3Awww.geocaching.com%2Fseek%2Fcache_details.aspx";
                        window.open(url, "_blank");
                    }
                    return false;
                }
                $("#grRef").keypress(goGR);
                $("#grSub").click(goGR);
                $("#gme_coords").keypress(goCoords);
                $("#gme_coords_sub").click(goCoords);
                $("#GME_hereSub").click(that.seekHere);
                $("#GME_googleSub").click(goGoogle);
            }
            setEnv();
        },
        loadType: function() {
            function load() {
                window.GME_control = new L.GME_Widget();
                GME_control._layerControl = GME_get_layerControl();
            }
            function reload() {
                $($(".leaflet-control-layers")[0]).remove();
                try {
                    GME_control.removeFrom(map);
                } catch(e) {}
                GME_control.addTo(map);
                GME_control._layerControl.addTo(map);
                if (gmeConfig.env.dragdrop) {
                    map.addControl(new L.GME_dropHandler());
                }
                setTimeout(function() {
                    map.eachLayer(function(layer) {
                        if (layer instanceof L.TileLayer) {
                            map.removeLayer(layer);
                        }
                    });
                    GME_control._layerControl.setDefault();
                }, 1000);
            }
            window.setTimeout(setEnv, 3000);
        },
        loadTrack: function() {
            function load() {
                var caches, coords, i, name;
                function getLogPoints (layer) {
                    if (layer._latlng && layer._popup && layer._popup._content && ~layer._popup._content.indexOf(name)) {
                        coords = layer._latlng;
                        $(caches[i].parentNode.parentNode.children[0]).append("<br/><a href='#GME_map_anchor'><img src='https://www.geocaching.com/images/silk/map.png' width='16' height='16' alt='Map' class='gme-action' data-gme-ref='" + coords.lat + "," + coords.lng + "' title='Centre map on this geocache'/></a> #" + layer._icon.innerHTML);
                        return;
                    }
                }
                GME_load_map(map);
                map.addControl(new L.GME_Widget());
                $("#ctl00_ContentBody_lbHeading").append("<a id=\'GME_map_anchor\'></a>");
                caches = $(".TrackableLogTable a[href*=cache_details]");
                for (i = caches.length - 1; i >= 0; i--) {
                    name = caches[i].textContent.trim();
                    map.eachLayer(getLogPoints, this);
                }
                $(".TrackableLogTable").on("click", ".gme-action", function(e) {map.panTo(L.latLng(this.getAttribute("data-gme-ref").split(",")));});
            }
            setEnv();
        },
        map: function() {
            var bounds_CI,
                bounds_DE,
                bounds_GB,
                bounds_IE,
                bounds_NI,
                icons = {
                    marker: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAZCAYAAADuWXTMAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAN1wAADdcBQiibeAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAOQSURBVDiNhdRPSCNXHAfw7xs1mc5MjP9itE5ISjVGQrGxKgu6FIzx1CCskKunsj1YKN68tRdPBQ89hdKLl8JmLRR6sGzAPXRB0VVML2Y3kpDBJkHNv3EmTZjx14tZdM3aHzx4vPf78OP9Hu8xIsJNMABfxuPx7xKJxMT5%2BXn3xcWF0NfXpzscjtL4%2BPjrYDD4I4BXTQAiAhF1xWKxg%2BHhYRoYGCCfz0d%2Bv58CgQD5%2FX7y%2BXw0ODhIY2NjFIvFdonITkRgRMQ2NjZO19fXPxkdHUVPTw8AQFVVqKoKm80Gm80GACgWi0gmk1hbW0uvrq5%2BynZ2dlaWlpZ%2BmpychNVqRalUwv7%2B%2FhUR%2FQPgbwCfMcY%2Bnpqakrq7u1Gv13FwcICtra1v2fLy8sHe3t4XIyMjKBQKdHh4eG4YxhMienc2xthMe3v7bxMTEw6n08lSqRSmp6dfc7lcThZFEYZh4Pj4%2BMowjMe34U1fXhmG8fhmH4IgIJfLyVw%2Bn%2B8SBAGKopBhGDEieoMWQURvDMOIKYpCgiCgUCjYuUKhYBEEAaqq1k3TfNEKNsM0zReqqtZvsJUTBKHRaDSgqqoJ4O1DGMBbVVXNRqMBnucbnNvtzpbLZYii2AZA%2Fh8si6LYVqlU4Ha7FW5oaGi3VqtBkiQrx3GPHpIcxz2SJMlaq9Ugy%2FIu19nZua3rOmRZZhaLZYUx1tcKMsb6LBbLiizLTNd1SJL0J5fJZLaq1eo1Ywxer1fkef4lY2zoPTjE8%2FxLr9crchyHSqVynUwmnzMiwsLCwmE%2Bnw94PB4oikInJye1tra2PzRN%2B0sUxVnTNL%2Fy%2BXwfuVwulslk0N%2FffxyPxz9vBwCXy%2FV9IpH43ePxwOVyMYfDIVxeXkY0TYuIooje3l7wPA8AuLi4QCAQ%2BAEAWPNJut3ufz0ej9Vut3%2BwYdVqFaenp3VFUXgA4Jobs7Ozz3K53IP3lMvlMDMz8%2Fxd95sTSZK%2BKZfLpqZpLaGu6ygWi6bFYnl6D0ejUX1%2Bfv7XbDbbEmezWczNzT3b3NzU7mEAsNlsTyuVinl1dXUHapqGUqlkWq3Wr2%2Bv38HRaFQPh8M%2Fp1KpOziVSiEcDv9yuypwq9u3IxAIlBljdlmWcXZ2huvr68rR0VHX%2B3ncPQkgFAotptNpVKtVpNNphEKhxVZ5zd%2Fz3ohEItsdHR0UiUS2P5TTsjIAOJ3OxWAwmHQ6na2rAvgPIb3JdHxMgbEAAAAASUVORK5CYII%3D',
                    tick:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAXCAYAAAAYyi9XAAAALHRFWHRDcmVhdGlvbiBUaW1lAFRodSAxNyBNYXkgMjAxMiAyMjoxMjo1MiAtMDAwMP%2F5zBkAAAAHdElNRQfcBREVNTVnAq5wAAAACXBIWXMAAAsSAAALEgHS3X78AAAABGdBTUEAALGPC%2FxhBQAAAnRJREFUeNq9lMlrFEEUh19VdU3P1j0koujFmYzE4B8gCaIXTx6SgODFBUTw4lkv4kHxKuLFs4JHEZQkF0GM%2B4KIATHE4DATBMmiSetktq7NVxM7DB4n03nQdHdtv%2FreRmAbrFAo%2BM4e55477Oad7RAkaTKmq%2FqYrMgE3Q464pJL7kGXAQMRu6ClAwEHUodSjlpUzVhdGtElR5IU6QC%2FF2IltHSEkP3%2BOZ833zQFSZKnsRFGdJnxjOPsciD8GoZA4X5shG06Rga9k14inAtxANbkgvwci%2BAm3WiG830c6k%2Fqkqboq0qlUo3FpZ10%2Bo%2BG1kxLgoRJO9dzwn90F%2F2zvsMHuY0d6HXdkEvyWSyClo56tJA9kXUxbtB43tCEk3nTMMt2vmuXIkkaXz4%2BSxgb00nnnfZSbDcDFIHmBywHTqZwjexaEA9m2Ixv6po%2BjkRvi35xAmP1kqTI4TbdeDZp14mSAPldShR%2BHO3tShBvq4peccY0zXm2k42xPDuCBwuMFfPObNBZw2SxrxVs3HNbErSGh9xl%2FWxEr%2BlT%2Fdf6d%2FA8B13Xmu%2Fl7bwwytj4CZqmL0qVUjXa13XSIGWoVtVlY8xscCOwbQsSQwmKbm3Pqx%2FKEiq82GTnvi1lKYoumqq5IMqiGtwOlBFmcy6cbXeXmvqlXvdM0Fr5W%2FkdGLi6%2FmBd1x7VNgZR13YXkiCf8G%2Bxp4LWMFnu0CSdCG4FYbvQA%2BwuH1sS4zgZlUxkrBeCQRCInJt7DxxGxbzIsT7GalO1lvltrgSrwXLnWtILwcgGhgaOYpE%2FpH3Uw5L5olbUMBLWe%2B7SyEzLTOOJ19VP1cLmPf2%2FmLW%2FylgqETpxl%2BsAAAAASUVORK5CYII%3D'
                },
                wptTypes = [[/Geocache/i,"2"], [/Traditional Cache/i,"2"], [/Multi-cache/i,"3"], [/Virtual Cache/i,"4"], [/Letterbox Hybrid/i,"5"], [/Event Cache/i,"6"], [/Unknown cache/i,"8"], [/Webcam Cache/i,"11"], [/Cache In Trash Out Event/i,"13"], [/Wherigo Cache/i,"1858"], [/Locationless \(Reverse\) Cache/i,"12"], [/Mega-Event Cache/i,"453"], [/GPS Adventures Exhibit/i,"1304"], [/Groundspeak Block Party/i,"4738"], [/Groundspeak HQ/i,"3773"], [/Groundspeak Lost and Found Celebration/i,"3774"], [/Lost and Found Event Cache/i,"3653"], [/Project APE Cache/i,"9"], [/Earthcache/i,"137"], [/Question to Answer/i,"218"], [/Parking Area/i,"217"], [/Stages of a Multicache/i,"219"], [/Final Location/i,"220"], [/Trailhead/i,"221"], [/Reference Point/i,"452"]],
                polylineObj = {
                    initialize: function(pts, ops) {
                        L.Polyline.prototype.initialize.call(this, pts, ops);
                        this._length = 0;
                        this._markers = L.layerGroup();
                        this._updateMarkers();
                    },
                    addLatLng: function(pt) {
                        L.Polyline.prototype.addLatLng.call(this, pt);
                        var len = this._latlngs.length;
                        this._addMarker(pt, len);
                        if (len > 1) {
                            this._length += this._latlngs[len-2].distanceTo(this._latlngs[len-1]);
                            this.fire("gme-length", {length: this._length});
                        }
                        return this;
                    },
                    getData: function() {
                        return ((typeof window.btoa === "function") ? "data:application/xml-gpx;base64," : "data:application/xml-gpx,") + b64encode(this.getGPX());
                    },
                    getGPX: function() {
                        var name = $(".CommonUsername").attr("title"),
                            author = name ?
                                (name + '</name>\r\n\t\t\t<link href="https://www.geocaching.com/profile/?u=' + name + '"><text>' + name + '\'s profile</text></link>\r\n') :
                                "Geocaching.com user</name>\r\n",
                            date = !!Date.prototype.toISOString ? ["\t\t<time>", new Date().toISOString(), "</time>\r\n"].join("") : "",
                            i, l,
                            gpx = ["<?xml version=\"1.0\" encoding=\"UTF-8\"?>\r\n<gpx creator=\"Geocaching Map Enhancements v", that.getVersion(), "\" xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" version=\"1.1\" xsi:schemaLocation=\"http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd\" xmlns=\"http://www.topografix.com/GPX/1/1\">\r\n\t<metadata>\r\n\t\t<name>GME Export</name>\r\n\t\t<desc>Route file exported from Geocaching.com using Geocaching Map Enhancements.</desc>\r\n\t\t<author>\r\n\t\t\t<name>", author, "\t\t</author>\r\n", date, "\t</metadata>\r\n"].join("");
                        for (i = 0, l = this._latlngs.length; i < l; i++) {
                            gpx += [ "\t<wpt lat=\"", this._latlngs[i].lat, "\" lon=\"", this._latlngs[i].lng, "\">\r\n\t\t<name>P", i, "</name>\r\n\t\t<type>Waypoint</type>\r\n\t</wpt>\r\n"].join("");
                        }
                        gpx += "\t<rte>\r\n\t\t<name>GME exported route</name>\r\n\t\t<src>Manual entry</src>\r\n\t\t<number>1</number>\r\n";
                        for (i = 0, l = this._latlngs.length; i < l; i++) {
                            gpx += [ "\t\t<rtept lat=\"", this._latlngs[i].lat, "\" lon=\"", this._latlngs[i].lng, "\">\r\n\t\t\t<name>P", i, "</name>\r\n\t\t\t<type>Waypoint</type>\r\n\t\t</rtept>\r\n"].join("");
                        }
                        gpx += "\t</rte>\r\n</gpx>";
                        return gpx;
                    },
                    getLength: function() {
                        return this._length;
                    },
                    onAdd: function(map) {
                        map.addLayer(this._markers);
                        this._markers.eachLayer(function(a) {a.dragging.enable();});
                        return L.Polyline.prototype.onAdd.call(this, map);
                    },
                    onRemove: function(map) {
                        map.removeLayer(this._markers);
                        return L.Polyline.prototype.onRemove.call(this, map);
                    },
                    removePt: function(num) {
                        this.spliceLatLngs(num-1,1);
                        this._updateMarkers();
                    },
                    setLatLngs: function(pts) {
                        L.Polyline.prototype.setLatLngs.call(this, pts);
                        this._updateMarkers();
                        return this;
                    },
                    _addMarker: function(pt, num) {
                        var mark = new L.Marker(pt, {
                            icon: new L.Icon({draggable: "true", iconUrl: icons.marker, iconSize: new L.Point(15, 25), iconAnchor: new L.Point(8,25)}),
                            zIndexOffset:99, title: "Route Point #"+num
                        });
                        mark._routeNum = num;
                        mark.bindPopup(["<p><strong>Route Point #", num, "</strong><br/>Centre: ", pt.toUrl(), "<br/><a class='gme-event GME_ctoc' title='Copy Coordinates to clipboard' data-gme-action='copyToClipboard' data-gme-ctoc='", DMM(pt), "' data-gme-ref='", num, "'><svg viewBox='0 0 16 16' fill='currentColor'>", ctocPath, "</svg></a><strong>", DMM(pt), "</strong><br/><span style='float:right;'><a class='gme-event' data-gme-action='removeDistMarker' data-gme-layer='", this._leaflet_id, "' data-gme-ref='", num, "'>Clear</a>, <a class='gme-event' data-gme-layer='", this._leaflet_id, "' data-gme-action='clearDist'>Clear All</a>, <a class='gme-event gme-draggable-gpx' data-gme-action='exportDist' data-gme-layer='", this._leaflet_id, "' draggable='true'>GPX</a></span></p>"].join(""));
                        mark.on("dragend", this._moveMarker, this);
                        this._markers.addLayer(mark);
                        if (mark.dragging) {
                            mark.dragging.enable();
                        }
                    },
                    _moveMarker: function(e) {
                        this.spliceLatLngs(e.target._routeNum - 1, 1, e.target.getLatLng());
                        this._updateLength();
                    },
                    _updateLength: function() {
                        var i;
                        this._length = 0;
                        for (i = 1; i < this._latlngs.length; i++) {
                            this._length += this._latlngs[i-1].distanceTo(this._latlngs[i]);
                        }
                        this.fire("gme-length", {length: this._length});
                        return this._length;
                    },
                    _updateMarkers: function() {
                        var i;
                        this._markers.clearLayers();
                        if (this._latlngs.length > 0) {
                            this._addMarker(this._latlngs[0],1);
                            for (i = 1; i < this._latlngs.length; i++) {
                                this._addMarker(this._latlngs[i], i + 1);
                            }
                        }
                        this._updateLength();
                    }
                },
                quadkeyLayerObj = {
                    tile2quad: function(x, y, z) {
                        var i, digit, mask, quad = "";
                        for (i = z; i > 0; i--) {
                            digit = 0;
                            mask = 1 << (i - 1);
                            if ((x & mask) !== 0) {digit += 1;}
                            if ((y & mask) !== 0) {digit += 2;}
                            quad = quad + digit;
                        }
                        return quad;
                    },
                    getTileUrl: function(tilePoint) {
                        return L.Util.template(this._url, L.extend({
                            s: this._getSubdomain(tilePoint),
                            q: this.tile2quad(tilePoint.x, tilePoint.y, this._getZoomForUrl()),
                            z: this._getZoomForUrl()
                        }, this.options));
                    }
                },
                complexLayerObj = {
                    getTileUrl: function(tilePoint) {
                        return L.Util.template(this._url, L.extend({
                            s4: tilePoint.x%4 + 4*(tilePoint.y%4),
                            x100: this._getZoomForUrl() <= 13 ? "" : Math.floor(tilePoint.x/100) + "/",
                            z: this._getZoomForUrl(),
                            x: tilePoint.x,
                            y: tilePoint.y
                        }, this.options));
                    }
                };

            function GME_displayPoints(plist, map, context) {
                var bounds = new L.LatLngBounds(), i, p, layers = L.featureGroup(), ll, op, PinIcon = L.Icon.extend({iconSize: new L.Point(20, 23),iconAnchor: new L.Point(10,23)});
                function checkType(t) {
                    var j;
                    for (j = wptTypes.length-1; j >= 0; j--) {
                        if (t == wptTypes[j][1]) {
                            return wptTypes[j][1];
                        }
                    }
                    return 452;
                }
                for (i = plist.primary.length-1; i >= 0; i--) {
                    p = plist.primary[i];
                    ll = L.latLng(p.lat, p.lng);
                    if (context === "listing" || context === "dragdrop" || p.isUserDefined) {
                        layers.addLayer(L.marker(ll, {icon: new PinIcon({iconUrl:"/images/wpttypes/pins/" + checkType(p.type) + ".png",iconAnchor: L.point(10,23)}),clickable: false, zIndexOffset:98, title: p.name + (p.isUserDefined?" (Corrected coordinates)":"")}));
                        if (p.isUserDefined) {
                            layers.addLayer(L.marker(ll, {icon: new PinIcon({iconSize: new L.Point(28,23), iconAnchor: L.point(10,23), iconUrl:icons.tick}),clickable: false, zIndexOffset:99, title: p.name + " (Corrected coordinates)"}));
                        }
                    } else {
                        bounds.extend(ll);
                    }
                    if (p.isUserDefined) {
                        op = L.latLng(p.oldLatLng[0], p.oldLatLng[1]);
                        layers.addLayer(L.polyline([op, ll], {clickable:false, weight:3}));
                        if (context === "listing") {
                            layers.addLayer(L.circleMarker(op, {clickable:false, weight:3, radius:6}));
                        }
                    }
                }
                for (i = plist.additional.length-1; i >= 0; i--) {
                    p = plist.additional[i];
                    ll = L.latLng(p.lat, p.lng);
                    layers.addLayer(L.marker(ll, {
                        icon: new PinIcon({iconUrl:"/images/wpttypes/pins/" + checkType(p.type) + ".png", iconAnchor: new L.Point(10,23)}),
                        title: p.name, clickable:false
                    }));
                }
                if (plist.routes) {
                    for (i = plist.routes.length-1; i >=0; i--) {
                        if (plist.routes[i].points && plist.routes[i].points.length > 0) {
                            layers.addLayer(L.polyline(plist.routes[i].points));
                        }
                    }
                }
                bounds.extend(layers.getBounds());
                if (bounds.isValid()) {
                    switch (context) {
                    case "listing":
                        map.fitBounds(bounds, {padding:[10, 10], maxZoom: 15});
                        break;
                    case "clickthru":
                        if (map.getBoundsZoom(bounds) > 15) {
                            map.panTo(bounds.getCenter()).setZoom(15);
                        } else {
                            map.fitBounds(bounds);
                        }
                        break;
                    default:
                        map.panTo(bounds.getCenter());
                    }
                }
                map.addLayer(layers);
                return bounds;
            }
            function genericLayerFn(url, options) {
                function filterOpts(opts) {
                    // Remove GME's internal options, so they don't get passed to servers (WMS in particular).
                    var opt, filtered = {}, exclude = ["tileUrl", "ignore", "alt"];
                    for (opt in opts) {
                        if (exclude.indexOf(opt) === -1) {
                            filtered[opt] = options[opt];
                        }
                    }
                    return filtered;
                }
                var filteredOpts = filterOpts(options);

                if (typeof url === "string") {
                    return (/\{q\}/).test(url) ? (new L.GME_QuadkeyLayer(url, filteredOpts)) : ((/\{s4\}|\{x100\}/).test(url) ? (new L.GME_complexLayer(url,filteredOpts)) : ((/\{x\}/).test(url) ? (new L.TileLayer(url, filteredOpts)) : (new L.TileLayer.WMS(url, filteredOpts))));
                }
                console.error("GME: Bad map source: " + JSON.stringify(options));
                return undefined;
            }
            function setBrightness(e) {
                var brightness = this.brightness || that.parameters.brightness;
                if (brightness < 1) {
                    $(".leaflet-container").css("backgroundColor", "#000");
                } else {
                    $(".leaflet-container").css("backgroundColor", "#ddd");
                }
                if (e.layer._url && /^http/.test(e.layer._url) && e.layer.options && !e.layer.options.overlay) {
                    e.layer.setOpacity(brightness);
                }
            }
            function switchLayer(e) {
                var layer = e.layer;
                if (layer.options && layer.options.tileUrl && !layer.options.overlay) {
                    this.layersMaxZoom = layer.options.maxZoom;
                    this.layersMinZoom = layer.options.minZoom;
                    if (isNaN(layer.options.maxZoom) || !isNaN(layer.options.minZoom)) {
                        this._zoomBoundLayers[L.stamp(layer)] = layer;
                        this._updateZoomLevels();
                    }
                    if (this.getZoom() > this.layersMaxZoom) {this.setZoom(this.layersMaxZoom);}
                    if (this.getZoom() < this.layersMinZoom) {this.setZoom(this.layersMinZoom);}
                    this.brightness = e.layer.options.brightness || that.parameters.brightness;
                }
            }
            function GME_get_layerControl(map) {
                var maps = {}, overlays = {}, allMaps = that.parameters.maps, baseMaps, control, i, layer, src;
                for (baseMaps = 0, i = 0; i < allMaps.length; i++) {
                    src = allMaps[i];
                    if (!src.ignore) {
                        layer = L.GME_genericLayer(src.tileUrl,src);
                        if (layer) {
                            if (src.overlay) {
                                overlays[src.alt] = layer;
                            } else {
                                if (src.alt === that.parameters.defaultMap) {
                                    layer.default = true;
                                }
                                maps[src.alt] = layer;
                                baseMaps++;
                            }
                        }
                    }
                }
                if (baseMaps > 0) {
                    // Only return a new control if we have some basemaps.
                    control = L.control.layers(maps, overlays);
                    control.setDefault = function() {
                        var defLayer, j;
                        for (j in this._layers) {
                            if (this._layers.hasOwnProperty(j) && this._layers[j].layer.default) {
                                defLayer = j;
                            }
                        }
                        if (!defLayer) {
                            defLayer = Object.keys(this._layers)[0];
                        }
                        if (this._map && defLayer !== undefined) {
                            this._map.addLayer(this._layers[defLayer].layer, true);
                        }
                        return defLayer;
                    };
                }
                return control;
            }
            function GME_load_map(map) {
                var control = GME_get_layerControl(),
                    layer;

                map.on("layeradd", switchLayer);
                if (document.createElement("div").style.opacity !== undefined) {
                    map.on("layeradd", setBrightness);
                }

                // If we're adding our own map selector control, we need to manually remove any pre-existing map layers. Otherwise, they persist in the background underneath
                // the layers provided by GME. We check for the _url or _google attribute to distinguish map layers from other Leaflet layers like controls or popups.
                if (control) {
                    if (gmeConfig.env.page === "maps" || gmeConfig.env.page === "track" || gmeConfig.env.page === "hide") {
                        $($(".leaflet-control-layers")[0]).remove();
                        for (layer in map._layers) {
                            if (map._layers[layer] instanceof L.TileLayer) {
                                if (window.MapSettings !== undefined && MapSettings.MapLayers !== undefined && MapSettings.MapLayers.Geocache === map._layers[layer]) {
                                    // Leave geocache layer in place.
                                } else {
                                    map.removeLayer(map._layers[layer]);
                                }
                            }
                        }
                    }
                    map.addControl(control);
                    control.setDefault();
                }
            }
        },
        osgb: function() {
            function OSGridToLatLng(E,N) {
                var a = 6377563.396,
                    b = 6356256.910,
                    F0 = 0.9996012717,
                    lat0 = 49*Math.PI/180,
                    lon0 = -2*Math.PI/180,
                    N0 = -100000,
                    E0 = 400000,
                    e2 = 1 - (b*b)/(a*a),
                    n = (a-b)/(a+b),
                    n2 = n * n,
                    n3 = n * n2,
                    lat = lat0,
                    lon,
                    M = 0,
                    Ma, Mb, Mc, Md, cosLat, sinLat, nu, nu3, nu5, nu7, rho, eta2, tanLat, tan2lat, tan4lat, tan6lat, secLat, VII, VIII, IX, X, XI, XII, XIIA, dE, dE2, dE3, dE4, dE5, dE6, dE7, tx, ty, tz, rx, ry, rz, s1, sinPhi, cosPhi, sinLambda, cosLambda, eSq, nu2, x1, y1, z1, x2, y2, z2, p, phi, phiP, precision, lambda;
                do {
                    lat = (N-N0-M)/(a*F0) + lat;
                    Ma = (1 + n + (5/4)*n2 + (5/4)*n3) * (lat-lat0);
                    Mb = (3*n + 3*n*n + (21/8)*n3) * Math.sin(lat-lat0) * Math.cos(lat+lat0);
                    Mc = ((15/8)*n2 + (15/8)*n3) * Math.sin(2*(lat-lat0)) * Math.cos(2*(lat+lat0));
                    Md = (35/24)*n3 * Math.sin(3*(lat-lat0)) * Math.cos(3*(lat+lat0));
                    M = b * F0 * (Ma - Mb + Mc - Md);
                } while (N-N0-M >= 0.01);
                cosLat = Math.cos(lat);
                sinLat = Math.sin(lat);
                nu = a*F0/Math.sqrt(1-e2*sinLat*sinLat);
                rho = a*F0*(1-e2)/Math.pow(1-e2*sinLat*sinLat, 1.5);
                eta2 = nu/rho-1;
                tanLat = Math.tan(lat);
                tan2lat = tanLat*tanLat;
                tan4lat = tan2lat*tan2lat;
                tan6lat = tan4lat*tan2lat;
                secLat = 1/cosLat;
                nu3 = nu*nu*nu;
                nu5 = nu3*nu*nu;
                nu7 = nu5*nu*nu;
                VII = tanLat/(2*rho*nu);
                VIII = tanLat/(24*rho*nu3)*(5+3*tan2lat+eta2-9*tan2lat*eta2);
                IX = tanLat/(720*rho*nu5)*(61+90*tan2lat+45*tan4lat);
                X = secLat/nu;
                XI = secLat/(6*nu3)*(nu/rho+2*tan2lat);
                XII = secLat/(120*nu5)*(5+28*tan2lat+24*tan4lat);
                XIIA = secLat/(5040*nu7)*(61+662*tan2lat+1320*tan4lat+720*tan6lat);
                dE = (E-E0);
                dE2 = dE*dE;
                dE3 = dE2*dE;
                dE4 = dE2*dE2;
                dE5 = dE3*dE2;
                dE6 = dE4*dE2;
                dE7 = dE5*dE2;
                lat = lat - VII*dE2 + VIII*dE4 - IX*dE6;
                lon = lon0 + X*dE - XI*dE3 + XII*dE5 - XIIA*dE7;
                tx = 446.448;
                ty = -125.157;
                tz = 542.060;
                rx = 7.2819014902652306237205098174164e-7;
                ry = 1.1974897923405539041670878328241e-6;
                rz = 4.0826160086234026020206666559563e-6;
                s1 = 0.9999795106;
                sinPhi = Math.sin(lat);
                cosPhi = Math.cos(lat);
                sinLambda = Math.sin(lon);
                cosLambda = Math.cos(lon);
                eSq = (a*a - b*b) / (a*a);
                nu2 = a / Math.sqrt(1 - eSq*sinPhi*sinPhi);
                x1 = nu2 * cosPhi * cosLambda;
                y1 = nu2 * cosPhi * sinLambda;
                z1 = (1-eSq)*nu2 * sinPhi;
                x2 = tx + x1*s1 - y1*rz + z1*ry;
                y2 = ty + x1*rz + y1*s1 - z1*rx;
                z2 = tz - x1*ry + y1*rx + z1*s1;
                a = 6378137;
                b = 6356752.3142;
                eSq = (a*a - b*b) / (a*a);
                p = Math.sqrt(x2*x2 + y2*y2);
                phi = Math.atan2(z2, p*(1-eSq));
                phiP = 2*Math.PI;
                precision = 4 / a;
                while (Math.abs(phi-phiP) > precision) {
                    nu = a / Math.sqrt(1 - eSq*Math.sin(phi)*Math.sin(phi));
                    phiP = phi;
                    phi = Math.atan2(z2 + eSq*nu*Math.sin(phi), p);
                }
                lambda = Math.atan2(y2, x2);
                return {lat: phi*180/Math.PI, lng:lambda*180/Math.PI};
            }
            function gridrefLetToNum(letters, numbers) {
                letters = letters.toUpperCase();
                var e, n,
                    l1 = letters.charCodeAt(0) - "A".charCodeAt(0),
                    l2 = letters.charCodeAt(1) - "A".charCodeAt(0);
                if (l1 > 7) {l1--;}
                if (l2 > 7) {l2--;}
                e = ((l1-2)%5)*5 + (l2%5);
                n = (19-Math.floor(l1/5)*5) - Math.floor(l2/5);
                e += numbers.slice(0, numbers.length/2);
                n += numbers.slice(numbers.length/2);
                switch (numbers.length) {
                    case 2: e += "5000"; n += "5000"; break;
                    case 4: e += "500"; n += "500"; break;
                    case 6: e += "50"; n += "50"; break;
                    case 8: e += "5"; n += "5"; break;
                }
                return [e, n];
            }
            function parseGR(searchVal) {
                var ngr, gr = searchVal.match(/^\s*([hnstHNST][A-Ha-hJ-Zj-z])\s*((?:\d\d){1,5})\s*$/);
                if (gr) {
                    if (gr.length === 3) {
                        if (2* Math.floor(gr[2].length / 2) === gr[2].length) {
                            ngr = gridrefLetToNum(gr[1], gr[2]);
                            return OSGridToLatLng(ngr[0], ngr[1]);
                        }
                    }
                    return null;
                }
                gr = searchVal.match(/^\s*(\d{3,6})\s*,\s*(\d{4,7})\s*$/);
                if (gr) {
                    if (gr.length === 3) {
                        return OSGridToLatLng(gr[1], gr[2]);
                    }
                }
                return null;
            }
        },
        seek: function() {
            this.seekGR = function(searchVal) {
                if (searchVal.length > 0) {
                    var coords = parseGR(searchVal);
                    if (coords !== null) {
                        that.seekByLatLng(coords);
                    } else {
                        alert("Could not recognise grid reference.");
                    }
                }
            };
        },
        widget: function() {
            var locationControlObj = {
                onAdd: function(map) {
                    var el, tracking = false, container = L.DomUtil.create("div", "leaflet-control-toolbar groundspeak-control-findmylocation gme-left");
                    function located(l) {
                        this.panTo(l.latlng);
                    }
                    function click(e) {
                        L.DomEvent.stopPropagation(e);
                        if (tracking) {
                            map.stopLocate();
                            map.off("locationfound", located);
                            tracking = false;
                            $(".groundspeak-control-findmylocation-lnk").removeClass("gme-button-active");
                            $("#GME_loc").attr("title", "Follow My Location");
                        } else {
                            map.on("locationfound", located);
                            map.locate({enableHighAccuracy: true, watch: true, timeout: 60000});
                            tracking = true;
                            $(".groundspeak-control-findmylocation-lnk").addClass("gme-button-active");
                            $("#GME_loc").attr("title", "Stop following");
                        }
                    }
                    function click_once(e) {
                        L.DomEvent.stopPropagation(e);
                        this.locate({setView: true, maxZoom: this.getZoom(), minZoom: this.getZoom(), enableHighAccuracy: true, timeout: 60000});
                    }
                    el = document.createElement("a");
                    el.id = "GME_loc";
                    el.title = that.parameters.follow ? "Follow My Location" : "Find My Location";
                    el.className = "groundspeak-control-findmylocation-lnk";
                    if (that.parameters.follow) {
                        L.DomEvent.addListener(el, "click", click, map);
                    } else {
                        L.DomEvent.addListener(el, "click", click_once, map);
                    }
                    container.appendChild(el);
                    return container;
                }
            },
            widgetControlObj = {
                options: {position: "bottomleft"},
                onAdd: function(contextmap) {
                    var elem, container = L.DomUtil.create("div","leaflet-control-gme"), control = this, html = "";
                    function onPopup(e) {
                        if (e.layer._container && /leaflet-popup/.test(e.layer._container.className)) {
                            $(e.layer._contentNode).on("click", ".gme-event", contextmap, mapHandler);
                            $(e.layer._contentNode).on("dragstart", ".gme-draggable-gpx", {line: control._dist_line}, dragGPXHandler);
                        }
                    }
                    function offPopup(e) {
                        if (e.layer._container && /leaflet-popup/.test(e.layer._container.className)) {
                            $(e.layer._contentNode).off("click", ".gme-event", contextmap, mapHandler);
                            $(e.layer._contentNode).off("dragstart", ".gme-draggable-gpx", {line: control._dist_line}, dragGPXHandler);
                        }
                    }
                    function mapHandler(e) {
                        var action = this.getAttribute("data-gme-action"),
                            c1 = this.getAttribute("data-gme-coords"),
                            c2, coords,
                            data = this.getAttribute("data-gme-ref"),
                            layer = this.getAttribute("data-gme-layer");
                        ctoc = this.getAttribute("data-gme-ctoc");
                        e.stopImmediatePropagation();
                        if (action !== "exportDist") {
                            e.preventDefault(e);
                        }
                        if (c1) {
                            c2 = c1.match(/(-?\d{1,2}(\.\d+)?),(-?\d{1,3}(\.\d+)?)/);
                            if (c2 && c2.length === 5 && validCoords(c2[1], c2[3])) {
                                coords = new L.LatLng(c2[1], c2[3]);
                            }
                        }
                        if (action === "clearDist") {control.clearDist();}
                        if (action === "clearMarkers") {control.clearMarkers();}
                        if (action === "dropDist" && coords) {control.dropDist(coords);}
                        if (action === "dropMarker" && coords) {control.dropMarker(coords);}
                        if (action === "exportDist") {control.exportDist(this);}
                        if (action === "getGeograph" && coords) {that.getGeograph(coords);}
                        if (action === "getHeight" && coords) {that.getHeight(coords);}
                        if (action === "getPostcode" && coords) {control.getPostcode(coords);}
                        if (action === "panTo" && coords) {e.data.panTo(coords);}
                        if (action === "removeMarker" && data) {control.removeMarker(data);}
                        if (action === "removeDistMarker" && data) {control.removeDistMarker(data);}
                        if (action === "toggleCaches") {control.toggleCaches();}
                        if (action === "copyToClipboard" && ctoc) {control.copyToClipboard(this);}
                        $(".leaflet-popup-close-button").each(function() {this.click();});
                    }
                    function dragGPXHandler(e) {
                        e.originalEvent.dataTransfer.effectAllowed = "copy";
                        var plain = e.data.line.getGPX(), data = e.data.line.getData();
                        e.originalEvent.dataTransfer.setData("application/xml-gpx", plain);
                        e.originalEvent.dataTransfer.setData("text/uri-list", data);
                        e.originalEvent.dataTransfer.setData("DownloadURL", "application/xml-gpx:gme-export.gpx:" + data);
                        e.originalEvent.dataTransfer.setData("text/plain", plain);
                    }
                    function widgetHandler(e) {
                        var action = this.getAttribute("data-gme-action");
                        e.stopPropagation();
                        if (action === "panToHome") {control.panToHome();}
                        if (action === "toggleInfo") {control.toggleTool("info");}
                        if (action === "toggleRoute") {control.toggleTool("route");}
                        if (action === "toggleCaches") {control.toggleCaches();}
                    }
                    this._map = contextmap;
                    this._map.infoMode = false;
                    this._map.routeMode = false;
                    this._markers = L.layerGroup().addTo(contextmap);
                    html = "<button type='button' class=\'GME_info gme-button gme-button-l\' title=\'Enable location info tool\' data-gme-action=\'toggleInfo\'></button>";
                    if (!document.location.pathname.match(/(\/hide\/|\/track\/map_gm\.aspx)/)) {
                        html += "<button type='button' class=\'GME_hide gme-button\' title=\'Hide caches\' data-gme-action=\'toggleCaches\'></button>";
                    }
                    html += "<button type='button' class=\'GME_route gme-button\' title=\'Enable route tool\' data-gme-action=\'toggleRoute\'></button>";
                    if (gmeConfig.env.home) {
                        html += "<button type='button' title=\'Go to home location\' class=\'GME_home gme-button\' data-gme-action=\'panToHome\'></button>";
                    }
                    if (gmeConfig.parameters.osgbSearch) {
                        $(".GME_search_results").on("click", ".gme-event", contextmap, mapHandler);
                    }
                    if (gmeConfig.env.storage) {
                        html += "<a class=\'GME_config gme-button\' title=\'Configure Geocaching Map Enhancements\' href=\'#GME_config\'></a>";
                    }
                    container.innerHTML = html;
                    $(container.lastChild).addClass("gme-button-r");
                    container.innerHTML += "<span class=\'gme-button gme-button-l gme-button-r gme-scale-container\' title=\'Approximate width of the full map view\' style=\'cursor:help;\'><span class=\'gme-text\'>Width: </span><span class=\'gme-scale gme-text\'>-</span></span><span class=\'gme-distance-container gme-button gme-button-r\' title=\'Measured distance\'><span class=\'gme-text\'>Route: </span><span class=\'gme-distance gme-text\'>" + formatDistance(0) + "</span></span>";
                    contextmap.addControl(new L.GME_ZoomWarning()).on("layeradd", onPopup).on("layerremove", offPopup).on("viewreset", this.updateScale, this);
                    $(container).on("click", ".gme-button", this, widgetHandler);
                    $(window).on("resize", this, (function(context) {var t = {timer: null}; return function() {context.updateScale(context._map, t);};} (this)));
                    return container;
                },
                clearDist: function() {
                    this._dist_line.off("gme-length");
                    this._map.removeLayer(this._dist_line);
                    delete this._dist_line;
                    $(".gme-distance-container").removeClass("show");
                    $(".gme-distance").html(formatDistance(0));
                    $(".gme-scale-container").addClass("gme-button-r");
                },
                clearMarkers: function() {
                    this._markers.clearLayers();
                },
                dropDist: function(ll) {
                    if (!validCoords(ll)) {return;}
                    var dist, formatted;
                    if (this._dist_line === undefined) {
                        this._dist_line = new L.GME_DistLine([ll], {clickable:false});
                        this._dist_line.on("gme-length", function(e) {$(this._map._container).find(".gme-distance").html(formatDistance(e.length));});
                        this._map.addLayer(this._dist_line);
                        $(this._map._container).find(".gme-distance-container").addClass("show");
                        $(this._map._container).find(".gme-scale-container").removeClass("gme-button-r");
                    } else {
                        this._dist_line.addLatLng(ll);
                    }
                },
                exportDist: function(e) {
                    if (!this._dist_line) {return;}
                    e.download = "ExportedRoute.gpx";
                    e.href = "data:application/xml-gpx," + encodeURIComponent(this._dist_line.getGPX());
                    return false;
                },
                dropMarker: function(ll, rad) {
                    if (!validCoords(ll)) {return;}
                    var circle,
                        defaultRadius = 0.161,
                        group,
                        label = "Marker",
                        m = 1000,
                        r, radius, raw,
                        unit = "km";
                    if (that.parameters.measure !== "metric") {
                        unit = "miles";
                        defaultRadius = 0.1;
                        m = 1609.344;
                    }
                    radius = defaultRadius;
                    if (!isNaN(rad)) {
                        radius = rad * 1;
                    } else {
                        raw = window.prompt("Radius in " + unit + " [, label]", defaultRadius).match(/([\d]*\.?[\d]*)\s*,?\s*(.*)/);
                        if (raw) {
                            if (raw.length === 3) {
                                radius = raw[1] * 1;
                                label = raw[2] || label;
                            } else {
                                label = raw;
                            }
                        }
                    }
                    if (radius) {
                        radius *= m;
                        if (isNaN(radius)) {radius = 161;}
                    } else {
                        radius = 161;
                    }
                    circle = new L.Circle(ll, radius, {weight:2});
                    group = new L.LayerGroup([circle, new L.CircleMarker(ll, {weight:2, radius:3})]);
                    this._markers.addLayer(group);
                    r = (radius / m).toFixed(3) + " " + unit;
                    circle.bindPopup("<p><strong>" + label + "</strong><br/>Radius: " + r + "<br/>Centre: decimal " + ll.toUrl() + "<br/><strong>" + DMM(ll) + "</strong><br/><span style='float:right;'><a class='gme-event' data-gme-action='removeMarker' data-gme-ref='" + group._leaflet_id + "'>Clear</a>, <a class='gme-event' data-gme-action='clearMarkers'>Clear All</a></span></p>");
                },
                getPostcode: function(coords) {
                    var that = this, callprefix = "GME_postcode_callback", call;
                    function makeCallback(callname) {callbackCount++; return function(json) {
                        var m;
                        if (json !== undefined && json.status === 200) {
                            if (json.result && json.result.length > 0) {
                                m = "<p>" + json.result[0].postcode + (json.result[0].parish ? (", " + json.result[0].parish) :     "") + (json.result[0].admin_ward ? (", " + json.result[0].admin_ward) :    "") + "</p>";
                            } else {
                                m = "<p>No postcode found for this location.<br />Is it within 500m of an occupied building?</p>";
                            }
                        } else {
                            m = "<p>Error fetching data from postcodes.io</p>";
                        }
                        if (json.result && !isNaN(json.result[0].latitude) && !isNaN(json.result[0].longitude)) {
                            L.popup().setLatLng({lat: json.result[0].latitude, lng: json.result[0].longitude}).setContent(m).openOn(that._map);
                        } else {
                            $.fancybox(m);
                        }
                        $("#" + callname).remove();
                        if (window[callname] !== undefined) {delete window[callname];}
                    };}
                    if (validCoords(coords)) {
                        call = callprefix + callbackCount;
                        window[call] = makeCallback(call);
                        JSONP("https://api.postcodes.io/postcodes/lon/" + coords.lng + "/lat/" + coords.lat + "?radius=500&limit=1&callback=" + call, call);
                    } else {
                        console.error("GME: Bad coordinates to getPostcode.");
                    }
                },
                panToHome: function() {
                    if (gmeConfig.env.home) {
                        this._map.panTo(gmeConfig.env.home);
                        return true;
                    }
                    return false;
                },
                copyToClipboard: function(icon) {
                    icon.animate({opacity: 0.3}, {duration: 200, direction: 'reverse'});
                    ctocActiv = true;
                    document.execCommand('copy');
                },
                removeDistMarker: function(mark) {
                    if (this._dist_line) {
                        this._dist_line.removePt(mark);
                        $(this._map._container).find(".gme-distance").html(formatDistance(this._dist_line.getLength()));
                    }
                },
                removeMarker: function(mark) {
                    this._markers.removeLayer(this._markers._layers[mark]);
                },
                removeMarkers: function(mark) {
                    this._markers.clearLayer(this._markers._layers[mark]);
                },
                showInfo: function(e) {
                    if ($(this).hasClass('leaflet-popup-pane')) {
                        L.DomEvent.stopPropagation(e);
                        return;
                    }
                    var control = this, popupContent = "<p>", popup = new L.Popup(), i;
                    for (i = 0; i < this.tools.length; i++) {
                        if (this.tools[i].isValid(e.latlng, control._map.getZoom())) {
                            popupContent += this.tools[i].getHTML(e.latlng, control._map.getZoom(), control._map) + " ";
                        }
                    }
                    popupContent += "</p>";
                    popup.setLatLng(e.latlng);
                    popup.setContent(popupContent);
                    control._map.addLayer(popup);
                },
                tools: [
                    {
                        name: "Coords",
                        getHTML: function(coords, zoom, map) {
                            var ll = coords.toUrl();
                            return "<strong>" + DMM(coords) + "</strong><br/>Dec: <a href='geo:" + ll + "?z=" + zoom + "'>" + ll + "</a></br>";
                        },
                        isValid: function(coords, zoom) {return true;}
                    },
                    {
                        name: "List caches",
                        getHTML: function(coords, zoom, map) {
                            return "<a title='List " + (that.parameters.filterFinds ? "unfound " : "") + "caches near point' href='https://www.geocaching.com/seek/nearest.aspx?lat=" + coords.lat + "&lng=" + coords.lng + (that.parameters.filterFinds ? "&f=1" : "") + "' target='_blank' rel='noopener noreferrer'>List caches</a>";
                        },
                        isValid: function(coords, zoom) {return true;}
                    },
                    {
                        name: "Geograph",
                        action: "getGeograph",
                        getHTML: function(coords, zoom, map) {
                            return "<a href='#' title='Show Geograph images near this point' class='gme-event' data-gme-action='getGeograph' data-gme-coords='" + coords.toUrl() + "'>Geograph</a>";
                        },
                        isValid: function(coords, zoom) {
                            return bounds_GB.contains(coords) || bounds_DE.contains(coords) || bounds_IE.contains(coords) || bounds_CI.contains(coords);
                        }
                    },
                    {
                        name: "Directions",
                        getHTML: function(coords, zoom, map) {
                            return "<a title='Launch Google Directions from home to this point' target='_blank' rel='noopener noreferrer' href='https://www.google.com/maps/dir/?api=1&origin=" + gmeConfig.env.home.toUrl() + "&destination=" + coords.toUrl() + "'>Directions</a>";
                        },
                        isValid: function(coords, zoom) {
                            return !!gmeConfig.env.home;
                        }
                    },
                    {
                        name: "Wikimapia",
                        getHTML: function(coords, zoom, map) {
                            var centre = map.getCenter();
                            return "<a title='Go to wikimapia' target='_blank' rel='noopener noreferrer' href='http://wikimapia.org/#lat=" + centre.lat + "&lon=" + centre.lng + "&z=" + zoom + "'>Wikimapia</a>";
                        },
                        isValid: function(coords, zoom) {
                            return true;
                        }
                    },
                    {
                        name: "Marker",
                        getHTML: function(coords, zoom, map) {
                            return "<a title='Drop route marker onto map' href='#' class='gme-event' data-gme-action='dropMarker' data-gme-coords='" + coords.toUrl() + "'>Marker</a>";
                        },
                        isValid: function(coords, zoom) {
                            return true;
                        }
                    },
                    {
                        name: "MAGIC",
                        getHTML: function(coords, zoom, map) {
                            var b = map.getBounds();
                            return "<a title='Show MAGIC map of environmentally sensitive areas' target='_blank' rel='noopener noreferrer' href='http://magic.defra.gov.uk/MagicMap.aspx?srs=WGS84&startscale=" + (Math.cos(map.getCenter().lat * L.LatLng.DEG_TO_RAD) * 684090188 * Math.abs(b.getSouthWest().lng - b.getSouthEast().lng)) / map.getSize().x +    "&layers=LandBasedSchemes,12,24:HabitatsAndSpecies,38:Designations,6,10,13,16,34,37,40,72,94&box=" + b.toBBoxString().replace(/,/g,":") + "'>MAGIC</a>";
                        },
                        isValid: function(coords, zoom) {
                            return that.isInUK(coords);
                        }
                    },
                    {
                        name: "Postcode",
                        getHTML: function(coords, zoom, map) {
                            return "<a title='Fetch location data from postcodes.io' href='#' class='gme-event' data-gme-action='getPostcode' data-gme-coords='" + coords.toUrl() + "'>Postcode</a>";
                        },
                        isValid: function(coords, zoom) {
                            return that.isInUK(coords);
                        }
                    },
                    {
                        name: "Height",
                        getHTML: function(coords, zoom, map) {
                            return "<a title='Height of point above sea level' href='#' class='gme-event' data-gme-action='getHeight' data-gme-coords='" + coords.toUrl() + "'>Height</a>";
                        },
                        isValid: function(coords, zoom) {
                            return (coords.lat > -65 && coords.lat < 83);
                        }
                    },
                    {
                        name: "StreetView",
                        getHTML: function(coords, zoom, map) {
                            return "<a title='Launch Google Streetview' target='_blank' rel='noopener noreferrer' href='https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=" + coords.toUrl() + "'>Streetview</a>";
                        },
                        isValid: function(coords, zoom) {
                            return true;
                        }
                    },
                    {
                        name: "MapApp",
                        getHTML: function(coords, zoom, map) {
                            // Open Bing Maps app if available, otherwise use a cross-platform Google Maps URI.
                            return "<a title='Launch Bing Maps' href='bingmaps:?cp=" + coords.lat + "~" + coords.lng + "' target='_blank' rel='noopener noreferrer'><a title='Launch Google Maps' href='https://www.google.com/maps/@?api=1&map_action=map&center=" + coords.toUrl() + "&zoom=" + zoom + "' target='_blank' rel='noopener noreferrer'>Maps</a></a>";
                        },
                        isValid: function(coords, zoom) {
                            return true;
                        }
                    }
                ],
                showRoute: function(e) {
                    if ($(this).hasClass('leaflet-popup-pane')) {
                        L.DomEvent.stopPropagation(e);
                        return;
                    }
                    L.DomEvent.stopPropagation(e);
                    this.dropDist(e.latlng);
                },
                toggleCaches: function() {
                    if (window.MapSettings && MapSettings.MapLayers && MapSettings.MapLayers.AddGeocacheLayer && MapSettings.MapLayers.RemoveGeocacheLayer) {
                        if (MapSettings.MapLayers.Geocache) {
                            MapSettings.MapLayers.RemoveGeocacheLayer();
                            $(".GME_hide").addClass("gme-button-active").attr("title", "Show caches");
                        } else {
                            MapSettings.MapLayers.AddGeocacheLayer();
                            $(".GME_hide").removeClass("gme-button-active").attr("title", "Hide caches");
                        }
                    }
                },
                toggleTool: function(mode) {
                    var that = this, widgets = {
                        info: {
                            on: function() {
                                $('.leaflet-popup-pane')[0].addEventListener("contextmenu", that.showInfo);
                                that._map.on("click contextmenu", that.showInfo, that);
                                $("#map_canvas").addClass("gme-xhair");
                                $(".GME_info").addClass("gme-button-active").attr("title", "Disable location info tool");
                            },
                            off: function() {
                                $('.leaflet-popup-pane')[0].removeEventListener("contextmenu", that.showInfo);
                                that._map.off("click contextmenu", that.showInfo, that);
                                $("#map_canvas").removeClass("gme-xhair");
                                $(".GME_info").removeClass("gme-button-active").attr("title", "Enable location info tool");
                            }
                        },
                        none: {on: function() {}, off: function() {}},
                        route: {
                            on: function() {
                                $('.leaflet-popup-pane')[0].addEventListener("contextmenu", that.showRoute);
                                that._map.on("click contextmenu", that.showRoute, that);
                                $("#map_canvas").addClass("gme-xhair");
                                $(".GME_route").addClass("gme-button-active").attr("title", "Disable route tool");
                            },
                            off: function() {
                                $('.leaflet-popup-pane')[0].removeEventListener("contextmenu", that.showRoute);
                                that._map.off("click contextmenu", that.showRoute, that);
                                $("#map_canvas").removeClass("gme-xhair");
                                $(".GME_route").removeClass("gme-button-active").attr("title", "Enable route tool");
                            }
                        }
                    };
                    if (!widgets[mode]) {
                        return;
                    }
                    widgets[this._clickMode].off();
                    if (mode == this._clickMode) {
                        this._clickMode = "none";
                    } else {
                        this._clickMode = mode;
                        widgets[mode].on();
                    }
                },
                search: function(searchVal) {
                    var gr, m, call, callbackPrefix = "GME_search_callback", coords = false, marker, that = this;
                    function searchGS(searchVal) {
                        $(".GME_search_results").addClass("hidden");
                        $.getJSON("/api/geocode",{q:searchVal},function(a) {
                            if (a.status === "success") {
                                that._map.panTo(new L.LatLng(a.data.lat, a.data.lng));
                            } else {
                                alert("Sorry, no results found for " + searchVal);
                            }
                        });
                    }
                    function makeCallback2(callname) {callbackCount++; return function(json) {
                        var i, j;
                        if (json.geonames && json.geonames.length > 0) {
                            $(".GME_search_list").empty();
                            for (i = 0, j = json.geonames.length; i < j; i++) {
                                $(".GME_search_list").append("<li><a class='gme-event' data-gme-action='panTo' data-gme-coords='" + json.geonames[i].lat + "," + json.geonames[i].lng + "'>" + json.geonames[i].name + ", " + json.geonames[i].adminName1 + ", " + json.geonames[i].countryCode + "</a></li>");
                            }
                            $(".GME_search_results").removeClass("hidden");
                            $(".GME_search_results.ui-collapsible-collapsed a.ui-collapsible-heading-toggle").click();
                            $(".GME_link_GSSearch").off("click");
                            $(".GME_link_GSSearch").click(function() {searchGS(searchVal);});
                            that._map.panTo(new L.LatLng(json.geonames[0].lat, json.geonames[0].lng));
                        } else {
                            searchGS(searchVal);
                        }
                        $("#" + callname).remove();
                        if (window[callname] !== undefined) {delete window[callname];}
                    };}
                    function makeCallback1(callname) {callbackCount++; return function(json) {
                        var newCall = callbackPrefix + callbackCount;
                        if (json.countryCode) {
                            window[newCall] = makeCallback2(newCall);
                            JSONP("http://api.geonames.org/searchJSON?q=" + encodeURIComponent(searchVal) + "&countryBias=" + json.countryCode + "&maxRows=10&username=gme&callback=" + newCall, newCall);
                        } else {
                            searchGS(searchVal);
                        }
                        $("#" + callname).remove();
                        if (window[callname] !== undefined) {delete window[callname];}
                    };}
                    if (searchVal.length > 0) {
                        m = searchVal.match(/^\s*(?:z|zoom)\s*(\d\d?)\s*$/i);
                        if (m && m.length === 2) {
                            this._map.setZoom(m[1]);
                            return false;
                        }
                        m = searchVal.match(/^\s*(?:p|plot)(?:\s+r\s?(\d*\.?\d*))?\s+(.*)/);
                        if (m && m.length === 3) {
                            coords = parseCoords(m[2]);
                            if (coords) {
                                if (!isNaN(m[1])) {
                                    this.dropMarker(L.latLng(coords.lat, coords.lng), m[1]);
                                } else {
                                    L.marker(coords, {icon: L.divIcon()}).addTo(this._map).bindPopup(DMM(coords));
                                }
                                this._map.panTo(coords);
                                return false;
                            }
                        }
                        m = searchVal.match(/^\s*(GC[0123456789ABCDEFGHJKMNOPQRSTVWXYZ]{1,7})\s*$/i);
                        if (m && m.length === 2) {
                            this.panToGC(m[1]);
                            $(".GME_search_results").addClass("hidden");
                            return false;
                            alert("You must be logged in to allow GME to get cache coordinates.");
                            return false;
                        }
                        gr = parseGR(searchVal);
                        if (gr) {
                            this._map.panTo(new L.LatLng(gr.lat, gr.lng));
                        } else {
                            call = callbackPrefix + callbackCount;
                            window[call] = makeCallback1(call);
                            JSONP("http://api.geonames.org/countryCodeJSON?lat=" + this._map.getCenter().lat + "&lng=" + this._map.getCenter().lng + "&username=gme&radius=100&callback=" + call, call);
                        }
                    }
                    return false;
                },
                panToGC: function(gc) {
          var req = new XMLHttpRequest(),
              map = this._map || e;
          req.addEventListener("load", function(e) {
            var r = req.responseText,
                k = r.indexOf("mapLatLng = {"),
                c;
            if (req.status < 400) {
              try {
                c = JSON.parse(r.substring(k + 12, r.indexOf("}", k) + 1));
                map.panTo(new L.LatLng(c.lat, c.lng));
              } catch(e) {
                console.error("GME: Couldn't extract cache coordinates: " + e + "\nReceived " + r.length + " bytes, coords at " + k);
              }
            } else {
              if (req.status === 404) {
                alert("Sorry, cache " + gc + " doesn't seem to exist.");
              }
              console.error("GME: error retrieving cache page to find coords for " + gc + ": " + req.statusText);
            }
          });
          req.open("GET", "https://www.geocaching.com/geocache/" + gc);
          req.send();
                },
                updateScale: function(e, timer) {
                    var map = this._map || e;
                    if (!map.getBounds) {
                        console.error("GME: updateScale didn't have working map.");
                        return;
                    }
                    function updateMap() {
                        var bound = map.getBounds();
                        var width = formatDistance(Math.cos(map.getCenter().lat * L.LatLng.DEG_TO_RAD) * 111319.49079327358 * Math.abs(bound.getSouthWest().lng - bound.getSouthEast().lng));
                        $(this._container).find(".gme-scale").html(width);
                    }
                    if (timer !== undefined) {
                        window.clearTimeout(timer.timer);
                        timer.timer = window.setTimeout(function() {map.whenReady(updateMap); return false;}, 200);
                    } else {
                        map.whenReady(updateMap);
                    }
                },
                _clickMode: "none"
            },
            zoomWarningObj = {
                options:{position:"topleft"},
                onAdd: function(map) {
                    var c = L.DomUtil.create("div", "leaflet-control-zoomwarning gme-left");
                    function checkZoom() {
                        if (map.getZoom() > map.layersMaxZoom) {
                            map.setZoom(map.layersMaxZoom);
                        }
                        if (map.getZoom() < map.layersMinZoom) {
                            map.setZoom(map.layersMinZoom);
                        }
                        if (this.getZoom() > 18) {
                            c.style.display = "block";
                            if (typeof amplify === "object" && typeof amplify.store === "function" && amplify.store("ShowPanel") === false) {
                                $(".leaflet-control-zoomwarning").css("left", "30px");
                            }
                        } else {
                            c.style.display = "none";
                        }
                    }
                    c.innerHTML = "<a class='gme-button gme-button-l gme-button-r' title='Caches not visible at this zoom level'></a>";
                    c.style.display = (map.getZoom() > 18) ? "block" : "none";
                    map.on("zoomend", checkZoom);
                    return c;
                }
            };

            function GME_load_widget(map) {
                var control = new L.GME_Widget().addTo(map);
                $(control._container).addClass("gme-left").css("top", "20px");
                $(".groundspeak-control-findmylocation").remove();
                if (L.GME_FollowMyLocationControl) {
                    map.addControl(new L.GME_FollowMyLocationControl());
                }
                $(".leaflet-control-scale").addClass("gme-control-scale");
                $("a.ToggleSidebar").unbind();
                $("a.ToggleSidebar").click(function(a) {
                    a.preventDefault();
                    if (window.pnlOpen) {
                        window.pnlOpen = false;
                        $(".Sidebar").animate({left: "-355px"},500);
                        $(".leaflet-control-zoom, .leaflet-control-toolbar, .leaflet-control-scale, .gme-left").animate({left: "30px"}, 500);
                        $(this).removeClass("Open");
                    } else {
                        window.pnlOpen=true;
                        $(".Sidebar").animate({left: "0"},500);
                        $(".leaflet-control-zoom, .leaflet-control-toolbar, .leaflet-control-scale, .gme-left").animate({left: "385px"}, 500);
                        $(this).addClass("Open");
                    }
                    if (typeof amplify === "object" && typeof amplify.store === "function") {
                        amplify.store("ShowPanel", window.pnlOpen);
                    }
                    return false;
                });
                // Trigger reset to update scale and width controls.
                map.fireEvent("viewreset");
                return control;
            }
        },
        xhr: function(e) {
            var node = document.getElementById("gme_jsonp_node"),
                callback = node.getAttribute("data-gme-callback"),
                url = node.text,
                details = {
                    "method": "GET",
                    "url": url,
                    "onload": function(response) {
                        var x = response.responseText,
                            call = x.match(/([a-zA-Z_$][0-9a-zA-Z_$]*)\s*\(/),
                            s;
                        if (call && call.length === 2 && call[1] === callback) {
                            s = document.getElementById("gme_jsonp_node");
                            s.setAttribute("data-gme-callback", callback);
                            s.text = x.substring(x.indexOf("(")+1, x.lastIndexOf(")"));
                            document.dispatchEvent(new Event("GME_XHR_callback"));
                        } else {
                            console.error("GME: Received: " + x);
                        }
                    }
                };
            if (gmeResources.env.xhr === 'GM4') {
                // GreaseMonkey 4+.
                GM.xmlHttpRequest(details);
            } else {
                // Other userscript engines.
                setTimeout(function() {
                    GM_xmlhttpRequest(details);
                }, 0);
            }
        }
    }
},

pageTests = [
    ["listing", /\/geocache\/GC|\/seek\/cache_details\.aspx|\/seek\/cache_details2\.aspx/],
    ["maps", /\/map\//],
    ["hide", /\/hide\/planning\.aspx/],
    ["type", /\/hide\/typelocation\.aspx/],
    ["hide", /\/hide\/waypoints\.aspx/],
    ["seek", /\/seek\/$|\/seek\/default\.aspx/],
    ["track", /\/track\/map_gm\.aspx/]
],
i, target, target2, targets;

function buildScript() {
    var j, script = "";
    for (j = 1; j < arguments.length; j++) {
        if (typeof arguments[j] === "string" && gmeResources.script.hasOwnProperty(arguments[j])) {
            script += unwrapFunction(gmeResources.script[arguments[j]]);
            gmeResources.env.init.push(arguments[j]);
        }
    }
    insertScript(
        'var GME;\
        (function() {\
            "use strict";\
            function GeocachingMapEnhancements() {\
                var gmeConfig = ' + JSON.stringify({env: gmeResources.env, parameters: gmeResources.parameters}) +    ";" +
                script +
            '}\
            GME = new GeocachingMapEnhancements();\
            console.info("Geocaching Map Enhancements v' + gmeResources.parameters.version + ' loaded.");\
        }());',
        arguments[0]
    );
}

function insertCSS(css) {
    if (typeof css !== "string") {console.error("GME: insertCSS not called with string: " + typeof css); return;}
    var style = document.createElement('style');
    style.type = 'text/css';
    if (style.styleSheet) {
        style.styleSheet.cssText = css;
    } else {
        style.appendChild(document.createTextNode(css));
    }
    document.documentElement.firstChild.appendChild(style);
}

function insertPage(div, src, title, back) {
    if (div && typeof src === 'string') {
        var d = document.createElement('div');
        d.id = div;
        d.title = title || '';
        d.innerHTML = ['<div><a href="#', back || '', '" title="Close" class="gme-close-dialog">X</a><header>', d.title, '</header><div class="gme-modal-content">', src, '</div></div>'].join('');
        d.className = 'gme-modalDialog';
        document.documentElement.lastChild.appendChild(d);
    } else {
        console.error("GME: insertPage not called with correct parameters.");
    }
}

function insertScript(src, id) {
    console.log("GME: Inserting script: " + id);
    if (typeof src !== "string") {console.error("GME: insertScript not called with string."); return;}
    var s = document.createElement("script");
    s.type = "text/javascript";
    s.text = src;
    if (id) {
        s.id = id;
    }
    document.documentElement.firstChild.appendChild(s);
    document.documentElement.firstChild.removeChild(s);
}

function unwrapFunction(fn) {
    var text;
    if (typeof fn === "function") {
        text = fn.toString();
        return text.slice(text.indexOf("{") + 1, text.lastIndexOf("}"));
    }
    return fn;
}

function xhr(e) {
    var node = document.getElementById("gme_jsonp_node"),
        callback = node.getAttribute("data-gme-callback"),
        url = node.text,
        details = {
            "method": "GET",
            "url": url,
            "onload": function(response) {
                var x = response.responseText,
                    call = x.match(/([a-zA-Z_$][0-9a-zA-Z_$]*)\s*\(/),
                    s;
                if (call && call.length === 2 && call[1] === callback) {
                    s = document.getElementById("gme_jsonp_node");
                    s.setAttribute("data-gme-callback", callback);
                    s.text = x.substring(x.indexOf("(")+1, x.lastIndexOf(")"));
                    document.dispatchEvent(new Event("GME_XHR_callback"));
                } else {
                    console.error("GME: Received: " + x);
                }
            }
        };
    if (gmeResources.env.xhr === 'GM4') {
        GM.xmlHttpRequest(details);
    } else {
        setTimeout(function() {GM_xmlhttpRequest(details);}, 0);
    }
}

// Check GME already running.
function checkAlreadyRunning(waitCount) {
    try {
        var alreadyRunning = false;
        if (document.querySelector("head[data-gme-version]")) {
            alreadyRunning = ' (old script)';
        } else {
            var runners = document.getElementsByTagName('meta');
            var count = 0;
            for (i = 0; i < runners.length; i++) {
                if (runners[i].getAttribute('data-gme-version')) {
                    count++;
                }
            }
            if (count > 1) {
                alreadyRunning = ' (new script)';
            }
        }
        if (alreadyRunning) {
            var mess = 'Geocaching Map Enhancements v' + gmeResources.parameters.version + ' aborting.\nMessage: GME already running' + alreadyRunning + '.';
            console.error(mess);
            alert(mess);
            return;
        } else {waitCount++; if (waitCount <= 100) setTimeout(function(){checkAlreadyRunning(waitCount);}, 100);}
    } catch(e) {console.error("GME: Check GME already running run into error (function checkAlreadyRunning). " + e);}
}

// Check if it is upgraded.
function checkIsUpgraded() {
    (async () => {
        try {
            var versionMsg = gmeResources.parameters.versionMsg;
            if (gmeResources.env.xhr === 'GM4') {
                var scriptVersion = GM.info.script.version;
                var last_version = await GM.getValue('last_version', '');
            } else {
                var scriptVersion = GM_info.script.version;
                var last_version = GM_getValue('last_version', '');
            }
            if (last_version != scriptVersion) {
                // Simulate update counter.
                var counter = document.createElement('div');
                counter.innerHTML = ' <img src="https://s11.flagcounter.com/count2/0lCZ/bg_FFFFFF/txt_000000/border_CCCCCC/columns_6/maxflags_60/viewers_0/labels_1/pageviews_1/flags_0/percent_0/" style="border: none; visibility: hidden; width: 2px; height: 2px;" alt="">';
                counter.innerHTML += '<img src="https://s11.flagcounter.com/count2/sSec/bg_FFFFFF/txt_000000/border_CCCCCC/columns_6/maxflags_60/viewers_0/labels_1/pageviews_1/flags_0/percent_0/" style="border: none; visibility: hidden; width: 2px; height: 2px;" alt="">';
                counter.setAttribute('style', 'display: none');
                document.getElementsByTagName('body')[0].appendChild(counter);
                // Store new last version.
                if (gmeResources.env.xhr === 'GM4') {
                    GM.setValue('last_version', scriptVersion);
                } else {
                    GM_setValue('last_version', scriptVersion);
                }
                // Set update message.
                if (last_version == '') {
                    alert("Geocaching Map Enhancements was installed with version " + scriptVersion + versionMsg);
                } else {
                    alert("Geocaching Map Enhancements has been updated to version " + scriptVersion + versionMsg);
                }
            }
        } catch(e) {console.error("GME: Check if it is upgraded run into error (function checkIsUpgraded). " + e);}
    })();
}

// Check for upgrade.
function checkForUpgrade() {
    (async () => {
        try {
            // Determine time of next check for upgrade.
            if (gmeResources.env.xhr === 'GM4') {
                var next_check = parseInt(await GM.getValue('update_next_check', 0), 10);
            } else {
                var next_check = parseInt(GM_getValue('update_next_check', 0), 10);
            }
            if (!next_check) next_check = 0;
            // Save time for next check for upgrade.
            var time = new Date().getTime();
            if (next_check < time) {
                // Wait 24 hours for a new check for upgrade.
                time += 24 * 60 * 60 * 1000;
                if (gmeResources.env.xhr === 'GM4') {
                    GM.setValue('update_next_check', time.toString());
                } else {
                    GM_setValue('update_next_check', time.toString());
                }
                // Determine script version and update url.
                if (gmeResources.env.xhr === 'GM4') {
                    var scriptVersion = GM.info.script.version;
                    var match = GM.info.scriptMetaStr.match(/@downloadURL\s+(http(.*)user.js)/);
                    if (match && match[1]) {
                        var urlScript = match[1];
                    }
                } else {
                    var scriptVersion = GM_info.script.version;
                    var urlScript = GM_info.script.downloadURL;
                }
                // Determine source.
                var details = {
                    "method": "GET",
                    "url": urlScript,
                    "onload": function(result) {
                        try {
                            // Handle upgrade.
                            var version = result.responseText.match(/\/\/\s\@version(.*)/);
                            if (version) {
                                var new_version = version[1].replace(/\s/g, "");
                                if (new_version != scriptVersion) {
                                    var currVersion = "version " + scriptVersion;
                                    var text = "Version " + new_version + " of script Geocaching Map Enhancements is available. " +
                                        "You are currently using " + currVersion + ".\n\n" +
                                        "Click OK to upgrade.\n\n" +
                                        "(After upgrade, please refresh your page.)";
                                    if (window.confirm(text)) {
                                        document.location.href = urlScript;
                                    }
                                }
                            }
                        } catch(e) {console.error("GME: Check for upgrade run into error (GM_xmlhttpRequest onload). " + e);}
                    }
                };
                if (scriptVersion && urlScript) {
                    if (gmeResources.env.xhr === 'GM4') {
                        GM.xmlHttpRequest(details);
                    } else {
                        setTimeout(function() {
                            GM_xmlhttpRequest(details);
                        }, 0);
                    }
                }
            }
        } catch(e) {console.error("GME: Check for upgrade run into error (function checkForUpgrade). " + e);}
    })();
}

function startingWithPageRuns() {
    try {
        for (i = 0; i < pageTests.length; i++) {
            if (pageTests[i][1].test(document.location.pathname)) {
                gmeResources.env.page = pageTests[i][0];
                // Publish running version.
                var publishVersion = document.createElement('meta');
                if (gmeResources.env.xhr === 'GM4') {
                    var scriptVersion = GM.info.script.version;
                } else {
                    var scriptVersion = GM_info.script.version;
                }
                publishVersion.setAttribute('data-gme-version', scriptVersion);
                document.getElementsByTagName('head')[0].appendChild(publishVersion);
                // Full check GME already running.
                checkAlreadyRunning(0);
                // Check is upgraded.
                checkIsUpgraded();
                // Check for upgrade.
                checkForUpgrade();
                break;
            }
        }
    } catch(e) {console.error("GME: Page typical processing run into error (function startingWithPageRuns). " + e);}
}

function startingWithStorage() {
    try {
        try {
            if (window.localStorage !== undefined && window.localStorage !== null) {gmeResources.env.storage = true;}
        } catch(e) {
            // Potential security exception.
            console.error("GME: No localStorage capability - GME cannot set configuration. " + e);
        }

        if (gmeResources.env.storage) {
            var a, b, customJSON, GME_custom, paramsJSON, storedParams;
            // List of defunct tileUrls to remove from settings.
            var blacklist = [
                "https://ecn.t{s}.tiles.virtualearth.net/tiles/r{q}?g=737&productSet=mmOS",
                "https://ecn.t{s}.tiles.virtualearth.net/tiles/r{q}?g=864&productSet=mmCB",
                "https://otile{s}-s.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.jpg",
                "https://otile{s}-s.mqcdn.com/tiles/1.0.0/sat/{z}/{x}/{y}.jpg"
            ];
            try {
                paramsJSON = localStorage.getItem("GME_parameters");
                if (paramsJSON) {
                    try {
                        storedParams = JSON.parse(paramsJSON);
                        if (storedParams.version !== gmeResources.parameters.version) {
                            for (a in gmeResources.parameters) {
                                if (gmeResources.parameters.hasOwnProperty(a)) {
                                    if (storedParams[a] === undefined) {storedParams[a] = gmeResources.parameters[a];}
                                }
                            }
                            storedParams.version = gmeResources.parameters.version;
                            storedParams.versionMsg = gmeResources.parameters.versionMsg;
                            localStorage.setItem("GME_parameters", JSON.stringify(storedParams));
                        }
                        if (typeof storedParams.maps === "string") {
                            console.info("GME: Trying to fix corrupted map settings.");
                            storedParams.maps = JSON.parse(storedParams.maps);
                        }
                        gmeResources.parameters = storedParams;
                    } catch(e) {
                        console.error("GME: Could not parse stored configuration parameters. " + e);
                    }
                }
                // Import old-style custom maps.
                customJSON = localStorage.getItem("GME_custom");
                if (customJSON) {
                    console.info("GME: Found stored custom settings.");
                    try {
                        GME_custom = JSON.parse(customJSON);
                        if (GME_custom.maps && GME_custom.maps.length > 0) {
                            gmeResources.parameters.maps = gmeResources.parameters.maps.concat(GME_custom.maps);
                        }
                        delete localStorage.GME_custom;
                    } catch(e) {
                        console.error("GME: Could not parse stored custom maps. " + e);
                    }
                }
                // Remove old-style builtin maps.
                if (gmeResources.parameters.includeMaps) {
                    delete gmeResources.parameters.includeMaps;
                }
                if (gmeResources.parameters.excludeMaps) {
                    for (a = gmeResources.parameters.excludeMaps.length - 1; a >= 0; a--) {
                        for (b = gmeResources.parameters.maps.length -1; b >= 0; b--) {
                            if (gmeResources.parameters.maps[b].alt === gmeResources.parameters.excludeMaps[a]) {
                                gmeResources.parameters.maps[b].ignore = true;
                            }
                        }
                    }
                    delete gmeResources.parameters.excludeMaps;
                }
                // Remove broken map sources.
                for (a = gmeResources.parameters.maps.length - 1;  a >= 0; a--) {
                    for (b = 0; b < blacklist.length; b++) {
                        if (gmeResources.parameters.maps[a].tileUrl === blacklist[b]) {
                            gmeResources.parameters.maps.splice(a,1);
                        }
                    }
                }
                localStorage.setItem("GME_parameters", JSON.stringify(gmeResources.parameters));
            } catch(e) {
                console.error("GME: Bad Exception: " + e);
                // Potential security exception. Carry on with default parameters, but block localstorage.
                gmeResources.env.storage = false;
            }
        }
    } catch(e) {console.error("GME: Storage processing run into error (function startingWithStorage). " + e);}
}

function startingWithOthers() {
    try {
        document.addEventListener("GME_XHR_event", xhr);

        if (!gmeResources.env.geolocation) {
            gmeResources.script.dist = function() {console.error("GME: Geolocation not available.");};
        }
        if (!gmeResources.env.dragdrop) {
            gmeResources.script.drag = function() {console.error("GME: Drag and Drop not available.");};
            gmeResources.script.drop = gmeResources.script.drag;
        }

        insertCSS(gmeResources.css.main);
        if (gmeResources.env.storage) {
            insertPage('GME_config', gmeResources.html.config, 'Configure GME v' + gmeResources.parameters.version);
            insertPage('GME_format', gmeResources.html.customInfo, 'Custom Mapsource Format', 'GME_config');
        }
    } catch(e) {console.error("GME: Other processing run into error (function startingWithOthers). " + e);}
}

function startingWithInsertScript() {
    try {
        switch(gmeResources.env.page) {
            case "listing":
                // On a geocache listing.
                if (gmeResources.env.dragdrop) {insertCSS(gmeResources.css.drag);}
                function checksBeforeInsertScriptListing(waitCount) {
                    if (gmeResources.env.xhr === 'GM4') {
                        setTimeout(function(){
                            buildScript("GME_page_listing", "common", gmeResources.env.storage ? "config" : "", "map", "dist", "drag", "drop", "loadListing");
                        }, 0);
                    } else if (typeof L === "object" && typeof $ === "function") {
                        setTimeout(function(){
                            buildScript("GME_page_listing", "common", gmeResources.env.storage ? "config" : "", "map", "dist", "drag", "drop", "loadListing");
                        }, 0);
                    } else {waitCount++; if (waitCount <= 100) setTimeout(function(){checksBeforeInsertScriptListing(waitCount);}, 100);}
                }
                checksBeforeInsertScriptListing(0);
                break;
            case "seek":
                // On the Hide & Seek page.
                target2 = document.querySelector(".SeekCacheWidget h4");
                targets = document.getElementsByTagName("h5");
                for (i = 0; i < targets.length; i++) {
                    if (targets[i].innerHTML.match(/WGS84/)) {
                        target = targets[i];
                        break;
                    }
                }
                if (target && target2) {
                    var grDiv = document.createElement("div"), hereDiv = document.createElement("div");
                    grDiv.innerHTML = '<h5>Ordnance Survey Grid Reference :</h5><dl><dt>Grid reference : </dt><dd><form name="grForm" id="grForm"><input type="text" class="Text EqualWidthInput" maxlength="50" size="15" name="grRef" id="grRef" placeholder="SU122422">&nbsp;<input type="submit" class="Button blockWithModalSpinner" name="submitGR" value="Go" id="grSub"></form></dd></dl><h5>Freeform coordinates</h5><dl><dt>Coordinates :</dt><dd><form name="coordForm" id="coordForm"><input type="text" class="Text EqualWidthInput" maxlength="50" size="15" name="gme_coords" id="gme_coords" placeholder="N 51° 10.683′ W 001° 49.604′"/>&nbsp;<input type="submit" class="Button blockWithModalSpinner" name="gme_coords_sub" value="Go" id="gme_coords_sub"/></form></dd></dl>';
                    hereDiv.innerHTML = '<h4>Where you are...</h4><dl><dt>Use GeoLocation :</dt><dd><form name="hereForm" id="hereForm"><input type="submit" class="Button blockWithModalSpinner" name="GME_hereSub" value="Go" id="GME_hereSub"></form></dd></dl><h4>By keyword...</h4><dl><dt>Google search :</dt><dd><form name="googleForm" id="googleForm"><input type="text" class="Text EqualWidthInput" maxlength="50" size="15" name="gme_google" id="gme_google"/><input type="submit" class="Button blockWithModalSpinner" name="GME_googleSub" value="Go" id="GME_googleSub"></form></dd></dl>';
                    target.parentNode.insertBefore(grDiv, target);
                    target2.parentNode.insertBefore(hereDiv, target2);
                    buildScript("GME_page_seek", "common", gmeResources.env.storage ? "config" : "", "osgb", "seek", "loadSeek");
                }
                break;
            case "track":
                // On a TB tracking map.
                buildScript("GME_page_track", "common", gmeResources.env.storage ? "config" : "", "map", "widget", "loadTrack");
                break;
            case "maps":
                // On a Geocaching Maps page.
                // Check for click-thru cache data in URI.
                var pop = document.location.href.match(/pop=([A-Za-z0-9+\/=]+)[\?&]?/);
                if (pop && pop.length === 2) {
                    try {
                        localStorage.setItem("GME_cache", pop[1]);
                        document.location.href = document.location.href.replace(/#&pop=([A-Za-z0-9+\/=]+)[\?&]?/, '');
                    } catch(e) {
                        console.error("GME: Couldn't decode click-through data: " + pop[1] + " " + e);
                    }
                    return;
                }
                if (gmeResources.parameters.osgbSearch) {
                    targets = document.getElementsByClassName("SearchBox");
                    if (targets[0]) {
                        targets[0].innerHTML = gmeResources.html.search;
                    }
                }
                buildScript("GME_page_map", "common", gmeResources.env.storage ? "config" : "", "cssTransitionsFix", "map", "widget", "labels", "drop", gmeResources.parameters.osgbSearch ? "osgb" : "", "loadMap");
                break;
            case "type":
                buildScript("GME_page_type", "common", gmeResources.env.storage ? "config" : "", "map", "widget", "drop", "loadType");
                break;
            case "hide":
                buildScript("GME_page_hide", "common", gmeResources.env.storage ? "config" : "", "map", "widget", "drop", "loadHide");
                break;
            default:
                // Somewhere random on the main website.
                if (gmeResources.env.storage) {
                    buildScript("Generic config", "common", "config", "loadDefault");
                }
        }
    } catch(e) {console.error("GME: Inserting script run into error (function startingWithInsertScript). " + e);}
}

function checkLoggedInAndStarting(waitCount) {
    try {
        // 'user-menu' ist immer da, enthält gegebenenfalls die Buttons zum Anloggen.
        if (document.getElementsByClassName('user-menu')[0] && document.getElementsByClassName('player-profile')[0]) {
            startingWithPageRuns();
            startingWithStorage();
            startingWithOthers();
            startingWithInsertScript();
        } else {waitCount++; if (waitCount <= 100) setTimeout(function(){checkLoggedInAndStarting(waitCount);}, 100);}
    } catch(e) {console.error("GME: Check logged in run into error (function checkLoggedInAndStarting). " + e);}
}

// Don't run on frames or iframes.
if (window.top !== window.self) {return;}

if (!(typeof JSON === 'object' && typeof JSON.parse === 'function')) {
    console.error("Geocaching Map Enhancements requires a browser with JSON support.");
    return;
}

// Trixie treats jQuery Mobile dialogs as new page loads, resetting GME's functions.
if (window.GME !== undefined) {return;}

// Prüfen ob angelogged und starten der Verarbeitung.
checkLoggedInAndStarting(0);

}());
