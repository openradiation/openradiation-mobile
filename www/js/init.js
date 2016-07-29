//debug 
debug = true;

//tension adatpee a chaque tube
var tension_tube = {"SBM-20": 380, "M4011": 400};

var OUT_PACKET_SERIAL_NB   		= 0x01;
var OUT_PACKET_VERSION                  = 0x02;
var OUT_PACKET_SENSOR_TYPE              = 0x03;
var OUT_PACKET_ALIM_TENSION             = 0x04;
var OUT_PACKET_COUNT                    = 0x05;
var OUT_PACKET_TEMPERATURE              = 0x06;

var OUT_PACKET_TUBE_TYPE                = 0x10;
var OUT_PACKET_NOMINAL_TENSION          = 0x11;
var OUT_PACKET_ACTUAL_TENSION           = 0x12;
var OUT_PACKET_PWM_DUTY_CYCLE           = 0x13;
var OUT_PACKET_CALIB_COEFF              = 0x14;

var OUT_PACKET_DEBUG_BYTE1              = 0xD1;
var OUT_PACKET_DEBUG_BYTE2              = 0xD2;
var OUT_PACKET_DEBUG_FLOAT1             = 0xF1;
var OUT_PACKET_DEBUG_FLOAT2             = 0xF2;
var OUT_PACKET_DEBUG_STRING1            = 0xE1;
var OUT_PACKET_DEBUG_STRING2            = 0xE2;


var IN_PACKET_STEALTH                   = 0x01;
var IN_PACKET_SILENT                    = 0x02;
var IN_PACKET_SET_TENSION               = 0x11;
var IN_PACKET_SEND_INFO                 = 0x12;

var API_KEY								= "50adef3bdec466edc25f40c8fedccbce";
var API_URI								= "https://submit.open-radiation.net/measurements";

//test si chrome
var isMobile = true;
if (window.chrome)
{
	isMobile = false;

}

//global var settings
MC_UseOk = false;
MC_ProfileOk = false;

window.onerror = function (errorMsg, url, lineNumber) {
	console.log('Error: ' + errorMsg + ' Script: ' + url + ' Line: ' + lineNumber);
    alert('Error: ' + errorMsg + ' Script: ' + url + ' Line: ' + lineNumber);
    
}