var videoElement = document.querySelector('video');
var canvas = document.getElementById('pcCanvas');
var mobileCanvas = document.getElementById('mobileCanvas');
var ctx = canvas.getContext('2d');
var mobileCtx = mobileCanvas.getContext('2d');
var videoSelect = document.querySelector('select#videoSource');
var videoOption = document.getElementById('videoOption');
var imageInput = document.getElementById('imageInput');
var buttonGo = document.getElementById('go');
var barcode_result = document.getElementById('dbr');
var barcodeCanvas = null;
var barcodeContext = null;
imageInput.addEventListener('change', handleImage, false);


var isPaused = false;
var videoWidth = 640,
videoHeight = 480;
var mobileVideoWidth = 240,
mobileVideoHeight = 320;
var isPC = true;

var ZXing = null;
var decodePtr = null;

var tick = function()
{
    if (window.ZXing)
    {
        ZXing = ZXing();
        decodePtr = ZXing.Runtime.addFunction(decodeCallback);
    }
    else
    {
        setTimeout(tick, 10);
    }
};
tick();

// check devices
function browserRedirect()
{
    var deviceType;
    var sUserAgent = navigator.userAgent.toLowerCase();
    var bIsIpad = sUserAgent.match(/ipad/i) === "ipad";
    var bIsIphoneOs = sUserAgent.match(/iphone os/i) === "iphone os";
    var bIsMidp = sUserAgent.match(/midp/i) === "midp";
    var bIsUc7 = sUserAgent.match(/rv:1.2.3.4/i) === "rv:1.2.3.4";
    var bIsUc = sUserAgent.match(/ucweb/i) === "ucweb";
    var bIsAndroid = sUserAgent.match(/android/i) === "android";
    var bIsCE = sUserAgent.match(/windows ce/i) === "windows ce";
    var bIsWM = sUserAgent.match(/windows mobile/i) === "windows mobile";
    if (bIsIpad || bIsIphoneOs || bIsMidp || bIsUc7 || bIsUc || bIsAndroid || bIsCE || bIsWM)
    {
        deviceType = 'phone';
    }
    else
    {
        deviceType = 'pc';
    }
    return deviceType;
}

if (browserRedirect() === 'pc')
{
    isPC = true;
    barcodeCanvas = canvas;
    barcodeContext = ctx;
    canvas.style.display = 'block';
    mobileCanvas.style.display = 'none';
}
else
{
    isPC = false;
    barcodeCanvas = mobileCanvas;
    barcodeContext = mobileCtx;
    mobileCanvas.style.display = 'block';
    canvas.style.display = 'none';
}

function handleImage(e)
{
    var reader = new FileReader();

    reader.onload = function(event)
    {
        var img = new Image();
        img.onload = function()
        {
            barcodeCanvas.width = img.width;
            barcodeCanvas.height = img.height;
            barcodeContext.drawImage(img, 0, 0);
        };
        img.src = event.target.result;
    };

    reader.readAsDataURL(e.target.files[0]);
    scanBarcodeImage();
}

// scan barcode
function scanBarcodeImage()
{
    barcode_result.textContent = "";

    if (ZXing === null)
    {
        buttonGo.disabled = false;
        alert("Barcode Reader is not ready!");
        return;
    }

    // read barcode
    var imageData = barcodeContext.getImageData(0, 0, barcodeCanvas.width, barcodeCanvas.height);
    var idd = imageData.data;
    var image = ZXing._resize(barcodeCanvas.width, barcodeCanvas.height);
    console.time("decode barcode");
    for (var i = 0, j = 0; i < idd.length; i += 4, j++)
    {
        ZXing.HEAPU8[image + j] = idd[i];
    }
    var err = ZXing._decode_any(decodePtr);
    console.timeEnd('decode barcode');
    console.log("error code", err);
    if (err === -2)
    {
        setTimeout(scanBarcodeImage, 30);
    }
}

var decodeCallback = function(ptr, len, resultIndex, resultCount)
{
    var result = new Uint8Array(ZXing.HEAPU8.buffer, ptr, len);
    console.log(String.fromCharCode.apply(null, result));
    barcode_result.textContent = String.fromCharCode.apply(null, result);
    buttonGo.disabled = false;
    if (isPC)
    {
        canvas.style.display = 'block';
    }
    else
    {
        mobileCanvas.style.display = 'block';
    }
};

// add button event
buttonGo.onclick = function()
{
    if (isPC)
    {
        canvas.style.display = 'none';
    }
    else
    {
        mobileCanvas.style.display = 'none';
    }

    isPaused = false;
    buttonGo.disabled = true;
    scanBarcode();
};

// scan barcode
function scanBarcode()
{
    barcode_result.textContent = "";

    if (ZXing === null)
    {
        buttonGo.disabled = false;
        alert("Barcode Reader is not ready!");
        return;
    }

    var data = null,
    context = null,
    width = 0,
    height = 0,
    dbrCanvas = null;

    if (isPC)
    {
        context = ctx;
        width = videoWidth;
        height = videoHeight;
        dbrCanvas = canvas;
    }
    else
    {
        context = mobileCtx;
        width = mobileVideoWidth;
        height = mobileVideoHeight;
        dbrCanvas = mobileCanvas;
    }

    context.drawImage(videoElement, 0, 0, width, height);

    var vid = document.getElementById("video");
    console.log("video width: " + vid.videoWidth + ", height: " + vid.videoHeight);
    var barcodeCanvas = document.createElement("canvas");
    barcodeCanvas.width = vid.videoWidth;
    barcodeCanvas.height = vid.videoHeight;
    var barcodeContext = barcodeCanvas.getContext('2d');
    var imageWidth = vid.videoWidth, imageHeight = vid.videoHeight;
    barcodeContext.drawImage(videoElement, 0, 0, imageWidth, imageHeight);
    // read barcode
    var imageData = barcodeContext.getImageData(0, 0, imageWidth, imageHeight);
    var idd = imageData.data;
    var image = ZXing._resize(imageWidth, imageHeight);
    console.time("decode barcode");
    for (var i = 0, j = 0; i < idd.length; i += 4, j++)
    {
        ZXing.HEAPU8[image + j] = idd[i];
    }
    var err = ZXing._decode_any(decodePtr);
    console.timeEnd('decode barcode');
    console.log("error code", err);
    if (err === -2)
    {
        setTimeout(scanBarcode, 30);
    }
}

// https://github.com/samdutton/simpl/tree/gh-pages/getusermedia/sources 
var videoSelect = document.querySelector('select#videoSource');

navigator.mediaDevices.enumerateDevices()
.then(gotDevices).then(getStream).catch(handleError);

videoSelect.onchange = getStream;

function gotDevices(deviceInfos)
{
    for (var i = deviceInfos.length - 1; i >= 0; --i)
    {
        var deviceInfo = deviceInfos[i];
        var option = document.createElement('option');
        option.value = deviceInfo.deviceId;
        if (deviceInfo.kind === 'videoinput')
        {
            option.text = deviceInfo.label || 'camera ' +
            (videoSelect.length + 1);
            videoSelect.appendChild(option);
        }
        else
        {
            console.log('Found one other kind of source/device: ', deviceInfo);
        }
    }
}

function getStream()
{
    buttonGo.disabled = false;
    if (window.stream)
    {
        window.stream.getTracks().forEach(function(track)
        {
            track.stop();
        });
    }

    var constraints = {
        video: {
            deviceId: {exact: videoSelect.value}
        }
    };

    navigator.mediaDevices.getUserMedia(constraints).
    then(gotStream).catch(handleError);
}

function gotStream(stream)
{
    window.stream = stream; // make stream available to console
    videoElement.srcObject = stream;
}

function handleError(error)
{
    console.log('Error: ', error);
}