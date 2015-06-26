//test si chrome
var isMobile = true;
if (window.chrome)
{
	isMobile = false;

}

//global var settings
MC_UseOk = true;
MC_ProfileOk = true;

window.onerror = function (errorMsg, url, lineNumber) {
	console.log('Error: ' + errorMsg + ' Script: ' + url + ' Line: ' + lineNumber);
    alert('Error: ' + errorMsg + ' Script: ' + url + ' Line: ' + lineNumber);
    
}