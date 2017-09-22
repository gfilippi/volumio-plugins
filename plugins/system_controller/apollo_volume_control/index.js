'use strict';

var libQ = require('kew');
var fs=require('fs-extra');
var config = new (require('v-conf'))();
var exec = require('child_process').exec;
var execSync = require('child_process').execSync;


module.exports = apolloVolumeControl;
function apolloVolumeControl(context) {
    var self = this;

    this.context = context;
    this.commandRouter = this.context.coreCommand;
    this.logger = this.context.logger;
    this.configManager = this.context.configManager;

}



apolloVolumeControl.prototype.onVolumioStart = function()
{
    var self = this;
    var configFile=this.commandRouter.pluginManager.getConfigurationFile(this.context,'config.json');
    this.config = new (require('v-conf'))();
    this.config.loadFile(configFile);


    return libQ.resolve();
}

apolloVolumeControl.prototype.onStart = function() {
    var self = this;
    var defer=libQ.defer();
    var device = self.getAdditionalConf("system_controller", "system", "device");
    if (device == "Raspberry PI") {
        //self.enablePIOverlay(); not needed for Apollo
    }

    setTimeout(function() {
        self.startRattenu();
        defer.resolve();
    },2000)


    return defer.promise;
};

apolloVolumeControl.prototype.getConfigurationFiles = function() {
	return ['config.json'];
}

apolloVolumeControl.prototype.onStop = function() {
    var self = this;
    var defer=libQ.defer();

    // Once the Plugin has successfull stopped resolve the promise
    self.removeVolumeScripts();
    self.stopRattenu();
    defer.resolve();

    return libQ.resolve();
};

apolloVolumeControl.prototype.onRestart = function() {
    var self = this;
    // Optional, use if you need it
};


// Configuration Methods -----------------------------------------------------------------------------

apolloVolumeControl.prototype.getUIConfig = function() {
    var defer = libQ.defer();
    var self = this;

    var lang_code = this.commandRouter.sharedVars.get('language_code');

    self.commandRouter.i18nJson(__dirname+'/i18n/strings_'+lang_code+'.json',
        __dirname+'/i18n/strings_en.json',
        __dirname + '/UIConfig.json')
        .then(function(uiconf)
        {
            self.configManager.setUIConfigParam(uiconf,'sections[0].content[0].value',self.config.get('map_to_100', false));

            defer.resolve(uiconf);
        })
        .fail(function()
        {
            defer.reject(new Error());
        });

    return defer.promise;
};


apolloVolumeControl.prototype.setUIConfig = function(data) {
    var self = this;
    //Perform your installation tasks here
};

apolloVolumeControl.prototype.getConf = function(varName) {
    var self = this;
    //Perform your installation tasks here
};

apolloVolumeControl.prototype.setConf = function(varName, varValue) {
    var self = this;
    //Perform your installation tasks here
};


apolloVolumeControl.prototype.startRattenu = function () {
    var self = this;

    if(0) //apollo does not needs this
    {
        exec("/usr/bin/sudo /bin/systemctl start rattenu.service", {uid: 1000, gid: 1000}, function (error, stdout, stderr) {
                 if (error !== null) {
                     self.logger.info('Error, cannot start R ATTENU '+error)
                         } else {
                     self.logger.info('R Attenu started')
                         self.addVolumeScripts();
                 }
             });
    }
    else
    {
        self.logger.info('Apollo Adds volume scripts')
        self.addVolumeScripts();
    }
};

apolloVolumeControl.prototype.stopRattenu = function () {
    var self = this;

    if(0) //Apollo does not needs this
    {
        exec("/usr/bin/sudo /bin/systemctl stop rattenu.service", {uid: 1000, gid: 1000}, function (error, stdout, stderr) {
                 if (error !== null) {
                     self.logger.info('Error, cannot stop R ATTENU '+error)
                         } else {
                     self.logger.info('R Attenu stopped')
                         }
             });
    }
    else
    {
        self.logger.info('Apollo Volume Control stopped')
    }

};

apolloVolumeControl.prototype.addVolumeScripts = function() {
    var self = this;

    var enabled = true;
    var setVolumeScript = '/data/plugins/system_controller/apollo_volume_control/setvolume.sh';
    var getVolumeScript = '/data/plugins/system_controller/apollo_volume_control/getvolume.sh';
    var setMuteScript = '/data/plugins/system_controller/apollo_volume_control/setmute.sh';
    var getMuteScript = '/data/plugins/system_controller/apollo_volume_control/getmute.sh';
    var minVol = 0;
    var maxVol = 85;
    var mapTo100 = self.config.get('map_to_100', false);

    var data = {'enabled': enabled, 'setvolumescript': setVolumeScript, 'getvolumescript': getVolumeScript, 'setmutescript': setMuteScript,'getmutescript': getMuteScript, 'minVol': minVol, 'maxVol': maxVol, 'mapTo100': mapTo100};
    self.logger.info('Adding Apollo Volume Control parameters'+ JSON.stringify(data))
    self.commandRouter.updateVolumeScripts(data);
};

apolloVolumeControl.prototype.removeVolumeScripts = function() {
    var self = this;

    var enabled = false;
    var setVolumeScript = '';
    var getVolumeScript = '';
    var setMuteScript = '';
    var getMuteScript = '';
    var minVol = 0;
    var maxVol = 100;
    var mapTo100 = false;

    var data = {'enabled': enabled, 'setvolumescript': setVolumeScript, 'getvolumescript': getVolumeScript, 'setmutescript': setMuteScript,'getmutescript': getMuteScript, 'minVol': minVol, 'maxVol': maxVol, 'mapTo100': mapTo100};
    self.commandRouter.updateVolumeScripts(data);
};

//apolloVolumeControl.prototype.enablePIOverlay = function() {
//    var defer = libQ.defer();
//    var self = this;
//
//    exec('/usr/bin/sudo /usr/bin/dtoverlay lirc-rpi gpio_in_pin=17', {uid:1000,gid:1000},
//        function (error, stdout, stderr) {
//            if(error != null) {
//                self.logger.info('Error enabling lirc-rpi overlay: '+error);
//                defer.reject();
//            } else {
//                self.logger.info('lirc-rpi overlay enabled');
//                defer.resolve();
//            }
//        });
//
//    return defer.promise;
//};

apolloVolumeControl.prototype.getAdditionalConf = function (type, controller, data) {
    var self = this;
    var confs = self.commandRouter.executeOnPlugin(type, controller, 'getConfigParam', data);
    return confs;
};

apolloVolumeControl.prototype.saveRelayAttOptions = function (data) {
    var self = this;
    
    self.config.set('map_to_100', data['map_to_100']);

    setTimeout(function(){
        self.addVolumeScripts();
        self.commandRouter.pushToastMessage('success', "Configuration update", 'The configuration has been successfully updated');
    },500)
};
