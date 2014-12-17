window.addEventListener("load", function() { EitS.init(); }, false);

var EitSCore = new function () {
    const _prefPrefix = "extensions.eits.cn.";

    this.boundary = "cH2KM7cH2ae0Ij5GI3KM7cH2Ij5Ij5";

    var logService = null;

    this.getLogService = function () {
        if (logService == null) {
            logService = Components.classes['@mozilla.org/consoleservice;1'].getService();
            logService.QueryInterface(Components.interfaces.nsIConsoleService);
        }
        return logService;
    };

    var appInfo = null;

    this.getAppInfo = function () {
        if (appInfo == null) {
            appInfo = Components.classes["@mozilla.org/xre/app-info;1"].getService(Components.interfaces.nsIXULAppInfo);
        }
        return appInfo;
    };

    this.getBrowser = function () {
        return this.getAppInfo().name + " " + this.getAppInfo().version;
    };

    var ioService = null;

    this.getIOService = function () {
        if(ioService == null) {
            ioService = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
        }
        return ioService;
    };

    var cookieService = null;

    this.getCookieService = function () {
        if (cookieService == null) {
            cookieService = Components.classes["@mozilla.org/cookieService;1"].getService(Components.interfaces.nsICookieService);
        }
        return cookieService;
    };

    var prefService = null;

    this.getPrefService = function () {
        if (prefService == null) {
            prefService = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
        }
        return prefService;
    };

    this.isCookieSendEnabled = function () {
        return this.getPrefService().getBoolPref(_prefPrefix + "cookie.send");
    };

    this.getCookieDomain = function () {
        return this.getPrefService().getCharPref(_prefPrefix + "cookie.domain");
    };

    this.isBasicAuthEnabled = function () {
        return this.getPrefService().getBoolPref(_prefPrefix + "auth.send");
    };

    this.getBasicAuthUser = function () {
        return this.getPrefService().getCharPref(_prefPrefix + "auth.user");
    };

    this.getBasicAuthPass = function () {
        return this.getPrefService().getCharPref(_prefPrefix + "auth.pass");
    };

    this.isSEEnabled = function () {
        return this.getPrefService().getBoolPref(_prefPrefix + "se.enabled");
    };

    this.isTEEnabled = function () {
        return this.getPrefService().getBoolPref(_prefPrefix + "te.enabled");
    };

    this.getSEDataSource = function () {
        return this.getPrefService().getCharPref(_prefPrefix + "se.datasource");
    };

    this.getTEDataSource = function () {
        return this.getPrefService().getCharPref(_prefPrefix + "te.datasource");
    };

    this.getSEDataTarget = function () {
        return this.getPrefService().getCharPref(_prefPrefix + "se.datatarget");
    };

    this.getTEDataTarget = function () {
        return this.getPrefService().getCharPref(_prefPrefix + "te.datatarget");
    };

    this.getExcludeRegex = function () {
        return this.getPrefService().getCharPref(_prefPrefix + "exclude.regex");
    };

    this.isDebugOn = function () {
        return EitSCore.getPrefService().getBoolPref(_prefPrefix + "debug");
    };

    this.log = function (message) {
        if (this.isDebugOn()) {
            this.directLog(message);
        }
    };

    this.directLog = function (message) {
        this.getLogService().logStringMessage("EitS: " + message);
    };

    this.getCookie = function () {
        var uri = this.getIOService().newURI(this.getCookieDomain(), null, null);
        var cookie = this.getCookieService().getCookieString(uri, null);
        EitSCore.log("Adding Cookie: " + cookie);
        return cookie;
    };

    this.getAuthorization = function () {
        var userpass = this.b64EncodeUnicode(EitSCore.getBasicAuthUser() + ":" + EitSCore.getBasicAuthPass());
        return "Basic " + userpass;
    };

    this.b64EncodeUnicode = function (str) {
        return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(match, p1) {
            return String.fromCharCode('0x' + p1);
        }));
    };

    this.logProperties = function () {
        this.directLog("Upload SE Pages: "+ EitSCore.isSEEnabled());
        this.directLog("SE Source Website: "+ EitSCore.getSEDataSource());
        this.directLog("SE Target Website: "+ EitSCore.getSEDataTarget());
        this.directLog("Upload TE Pages: "+ EitSCore.isTEEnabled());
        this.directLog("TE Source Website: "+ EitSCore.getTEDataSource());
        this.directLog("TE Target Website: "+ EitSCore.getTEDataTarget());
        this.directLog("Use Basic Auth: "+ EitSCore.isBasicAuthEnabled());
        this.directLog("Basic Auth Pass: "+ EitSCore.getBasicAuthPass());
        this.directLog("Basic Auth User: "+ EitSCore.getBasicAuthUser());
        this.directLog("Foward Cookie: "+ EitSCore.isCookieSendEnabled());
        this.directLog("Cookie Domain: "+ EitSCore.getCookieDomain());
        this.directLog("Exclusionary Regex: "+ EitSCore.getExcludeRegex());
        this.directLog("Debug status: "+ EitSCore.isDebugOn());
    };

    this.getExclusionRegexObject = function () {
        return new RegExp(this.getExcludeRegex());
    };

    this.testRegexExclusion = function (pathname) {
        return this.getExclusionRegexObject().test(pathname);
    };

    this.testSEConditions = function (loc) {
        if(this.isSEEnabled() && loc.hostname == this.getSEDataSource()) {
            if(this.testRegexExclusion(loc.pathname)) {
                this.log("Not sending request. Path: " + loc.pathname + " matched " + this.getExcludeRegex());
                return false;
            } else {
                return true;
            }
        } else {
            return false;
        }
    };

    this.testTEConditions = function (loc) {
        if(this.isTEEnabled() && loc.hostname == this.getTEDataSource()) {
            if(this.testRegexExclusion(loc.pathname)) {
                this.log("Not sending request. Path: " + loc.pathname + " matched " + this.getExcludeRegex());
                return false;
            } else {
                return true;
            }
        } else {
            return false;
        }
    };
};

var EitS = {

    init : function() {
    	EitSCore.directLog("Initializing EitS...");
        EitS.addEventListener();
        EitSCore.logProperties();
        EitSCore.directLog("EitS Initialization done.");
    },

    addEventListener : function() {
        var appcontent = document.getElementById("appcontent");
        if (appcontent) {
            appcontent.addEventListener("DOMContentLoaded", EitS.onPageLoad, true);
        }
    },

    onPageLoad : function(event) {
    	var doc = event.target;
    	if (EitSCore.testSEConditions(doc.location)) {
            EitSCore.log("CN:SE Page");
    		EitS.post(doc, EitSCore.getSEDataTarget());
        } else if (EitSCore.testTEConditions(doc.location)) {
            EitSCore.log("CN:TE Page");
            EitS.post(doc, EitSCore.getTEDataTarget());
        }
    },

    post : function(doc, tgtPage) {
    	function updateIcon() {
    		var output = req.responseText;
    		var code   = req.responseCode;

    		if (code < 300) return;
    		// Code goes here to change icon if an error code is received
    		// Should probably also implement a popup
    	}

      	var req = new XMLHttpRequest();
    	var scode = doc.getElementsByTagName("html")[0].innerHTML;
	    var requestbody = '--' + EitSCore.boundary + '\n' + 'Content-Disposition: form-data; name="source"' + '\n' + '\n' + scode + '\n'
			+ '--' + EitSCore.boundary + '\n' + 'Content-Disposition: form-data; name="url"' + '\n' + '\n' + doc.location.href + '\n'
			+ '--' + EitSCore.boundary + '\n' + 'Content-Disposition: form-data; name="browser"' + '\n' + '\n' + EitSCore.getBrowser() + '\n'
			+ '--' + EitSCore.boundary + '--';
	    req.open("POST", tgtPage, true);
        req.setRequestHeader("Content-Type", "multipart/form-data;charset=UTF-8;boundary=" + EitSCore.boundary);
        req.setRequestHeader("Content-Length", requestbody.length);
        req.setRequestHeader("Content-Disposition", "form-data; name=\"EitS\"");
        if(EitSCore.isCookieSendEnabled()) {
            req.setRequestHeader("Cookie", EitSCore.getCookie());
            req.channel.QueryInterface(Components.interfaces.nsIHttpChannelInternal).forceAllowThirdPartyCookie = true;
        }
        if(EitSCore.isBasicAuthEnabled()) {
            req.setRequestHeader("Authorization", EitSCore.getAuthorization());
        }

        if (EitSCore.isDebugOn()) {
          var link = doc.location.search;
     
          req.onreadystatechange = function() {
        	  if (req.readyState == 4) {
                  EitSCore.log(link +"  " + tgtPage + " page posted " + req.status + " " + req.statusText); // what does target do?

        		  if (req.status > 299) {
                      EitSCore.log(req.responseText);
        			  alert(link + " " + tgtPage + " page upload failed: " +req.responseText);
        		  }
        	  }
          }
        }

        req.onload = updateIcon;
        req.send(requestbody);
    }
};
