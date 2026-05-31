// ====================================================================
// 1. USER SETTINGS (Fill in here)
// ====================================================================
const SENSEBOX_ID = "INSERT_YOUR_SENSEBOX_ID_HERE"; 
// ====================================================================


const API_URL = "https://api.opensensemap.org/boxes/" + SENSEBOX_ID;
const REFRESH_INT = 300; // 5 minutes update interval

// ====================================================================
// MAIN PROGRAM
// ====================================================================
let widget = await createWidget();

if (!config.runsInWidget) {
    await widget.presentMedium();
}
Script.setWidget(widget);
Script.complete();

// ====================================================================
// WIDGET UI DESIGNER
// ====================================================================
async function createWidget() {
    let w = new ListWidget();
    
    let startColor = new Color("#1e293b"); 
    let endColor = new Color("#0f172a");
    let gradient = new LinearGradient();
    gradient.colors = [startColor, endColor];
    gradient.locations = [0.0, 1.0];
    w.backgroundGradient = gradient;
    
    w.setPadding(12, 32, 12, 32);
    
    w.url = "scriptable:///run/" + encodeURIComponent(Script.name());
    
    let data;
    let errorMsg = null;
    
    try {
        data = await fetchOseMData();
    } catch (err) {
        errorMsg = err.message;
    }
    
    w.addSpacer();
    
    if (errorMsg) {
        let errText = w.addText("Error loading:\n" + errorMsg);
        errText.font = Font.systemFont(12);
        errText.textColor = new Color("#ef4444");
    } else {
        let bodyStack = w.addStack();
        
        let leftCol = bodyStack.addStack();
        leftCol.layoutVertically();
        
        let alignStack = leftCol.addStack();
        let infoBlock = alignStack.addStack();
        infoBlock.layoutVertically();
        alignStack.addSpacer(); 
        
        let titleRow = infoBlock.addStack();
        titleRow.addSpacer(); 
        let icon = titleRow.addText("📡 ");
        icon.font = Font.systemFont(12);
        let title = titleRow.addText(data ? data.name : "openSenseMap");
        title.font = Font.boldSystemFont(12);
        title.textColor = new Color("#94a3b8");
        titleRow.addSpacer(6);
        let statusDot = titleRow.addText("●");
        statusDot.font = Font.systemFont(12);
        statusDot.textColor = new Color("#22c55e");
        titleRow.addSpacer(); 
        
        infoBlock.addSpacer(2);
        
        let timeRow = infoBlock.addStack();
        timeRow.addSpacer(); 
        let footerText = "Updated: " + new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        let timeLabel = timeRow.addText(footerText);
        timeLabel.font = Font.systemFont(10);
        timeLabel.textColor = new Color("#64748b");
        timeRow.addSpacer(); 

        leftCol.addSpacer(); 
        
        createValueStack(leftCol, "PM 2.5", data.sensors["PM2.5"], "µg", true, 25, "#ef4444");
        leftCol.addSpacer(4); 
        createValueStack(leftCol, "PM 10", data.sensors["PM10"], "µg", true, 50, "#f97316");
        
        bodyStack.addSpacer();
        
        let rightCol = bodyStack.addStack();
        rightCol.layoutVertically();
        
        createValueStack(rightCol, "Temperature", data.sensors["Temperatur"], "°C", false, 0, "#f59e0b");
        rightCol.addSpacer(4); 
        
        createValueStack(rightCol, "Humidity", data.sensors["rel. Luftfeuchte"], "%", false, 0, "#3b82f6");
        rightCol.addSpacer(4); 
        
        let press = data.sensors["Luftdruck"];
        if (press !== undefined) {
            press = press / 100;
        }
        createValueStack(rightCol, "Pressure", press, "hPa", false, 0, "#22c55e");
    }
    
    w.addSpacer();
    
    let nextRefresh = new Date();
    nextRefresh.setSeconds(nextRefresh.getSeconds() + REFRESH_INT);
    w.refreshAfterDate = nextRefresh;
    
    return w;
}

function createValueStack(parentStack, labelText, sensorValue, unit, isPM = false, limit = 0, titleColor = "#94a3b8") {
    let stack = parentStack.addStack();
    stack.layoutVertically();
    
    let label = stack.addText(labelText);
    label.font = Font.systemFont(11); 
    label.textColor = new Color(titleColor);
    
    let valueStr = sensorValue !== undefined ? sensorValue.toFixed(1) : "--";
    let valLabel = stack.addText(valueStr + " " + unit);
    valLabel.font = Font.boldSystemFont(18); 
    
    if (isPM && sensorValue !== undefined && limit > 0) {
        let warningLimit = limit * 0.7; 
        
        if (sensorValue > limit) {
            valLabel.textColor = new Color("#ef4444"); 
        } else if (sensorValue >= warningLimit) {
            valLabel.textColor = new Color("#f59e0b"); 
        } else {
            valLabel.textColor = Color.white(); 
        }
    } else {
        valLabel.textColor = Color.white();
    }
    
    return stack;
}

async function fetchOseMData() {
    let req = new Request(API_URL);
    req.timeoutInterval = 10;
    
    let json = await req.loadJSON();
    
    if (!json || !json.sensors) {
        throw new Error("Invalid API response");
    }
    
    let result = {
        name: json.name,
        sensors: {}
    };
    
    for (let sensor of json.sensors) {
        if (sensor.lastMeasurement && sensor.lastMeasurement.value) {
            result.sensors[sensor.title] = parseFloat(sensor.lastMeasurement.value);
        }
    }
    
    return result;
}
