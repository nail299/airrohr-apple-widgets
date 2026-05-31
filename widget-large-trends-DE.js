// ====================================================================
// 1. BENUTZER-EINSTELLUNGEN (Hier ausfüllen)
// ====================================================================
const SENSEBOX_ID = "DEINE_SENSEBOX_ID_HIER_EINTRAGEN"; 
// ====================================================================


const API_BASE = "https://api.opensensemap.org";
const REFRESH_INT = 300; // 5 Minuten Update-Intervall

// ====================================================================
// HAUPTPROGRAMM
// ====================================================================
let widget = await createWidget();

if (!config.runsInWidget) {
    await widget.presentLarge();
}
Script.setWidget(widget);
Script.complete();

// ====================================================================
// WIDGET UI & LOGIK
// ====================================================================
async function createWidget() {
    let w = new ListWidget();
    
    // Dunkles Theme
    let startColor = new Color("#1e293b"); 
    let endColor = new Color("#0f172a");
    let gradient = new LinearGradient();
    gradient.colors = [startColor, endColor];
    gradient.locations = [0.0, 1.0];
    w.backgroundGradient = gradient;
    w.setPadding(20, 20, 20, 20);
    w.url = "scriptable:///run/" + encodeURIComponent(Script.name());
    
    // --- HEADER ---
    let headerStack = w.addStack();
    headerStack.centerAlignContent();
    let title = headerStack.addText("🌍 openSenseMap Trends");
    title.font = Font.boldSystemFont(16);
    title.textColor = new Color("#94a3b8");
    headerStack.addSpacer(); 

    w.addSpacer(15);

    try {
        let boxReq = new Request(`${API_BASE}/boxes/${SENSEBOX_ID}`);
        boxReq.timeoutInterval = 10;
        let boxData = await boxReq.loadJSON();
        
        let sensors = {
            temp: boxData.sensors.find(s => s.title === "Temperatur"),
            humidity: boxData.sensors.find(s => s.title === "rel. Luftfeuchte"),
            pressure: boxData.sensors.find(s => s.title === "Luftdruck"),
            pm25: boxData.sensors.find(s => s.title === "PM2.5"),
            pm10: boxData.sensors.find(s => s.title === "PM10")
        };

        let now = new Date();
        let fromDate7d = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));

        let fetchSafe = (s) => s ? fetchAndSplitData(s._id, fromDate7d, now) : Promise.resolve({d24: [], d7: []});
        
        let [tempHist, humHist, pressHist, pm25Hist, pm10Hist] = await Promise.all([
            fetchSafe(sensors.temp),
            fetchSafe(sensors.humidity),
            fetchSafe(sensors.pressure),
            fetchSafe(sensors.pm25),
            fetchSafe(sensors.pm10)
        ]);

        // --- SPALTEN-ÜBERSCHRIFTEN ---
        let colHeaderStack = w.addStack();
        let padStack = colHeaderStack.addStack();
        padStack.size = new Size(65, 0);
        
        let t24Stack = colHeaderStack.addStack();
        t24Stack.size = new Size(110, 0); 
        let t24 = t24Stack.addText("24 Stunden");
        t24.font = Font.systemFont(10);
        t24.textColor = new Color("#94a3b8"); 
        
        colHeaderStack.addSpacer(); 
        
        let t7Stack = colHeaderStack.addStack();
        t7Stack.size = new Size(110, 0); 
        let t7 = t7Stack.addText("7 Tage");
        t7.font = Font.systemFont(10);
        t7.textColor = new Color("#94a3b8"); 

        w.addSpacer(8);

        // --- ZEICHNEN DER MATRIX REIHEN ---
        addSensorRow(w, "Temperatur", tempHist, new Color("#f59e0b")); 
        w.addSpacer(10);
        addSensorRow(w, "Luftfeuchte", humHist, new Color("#3b82f6")); 
        w.addSpacer(10);
        addSensorRow(w, "Luftdruck", pressHist, new Color("#22c55e"), true); 
        w.addSpacer(10);
        addSensorRow(w, "PM 2.5", pm25Hist, new Color("#ef4444")); 
        w.addSpacer(10);
        addSensorRow(w, "PM 10", pm10Hist, new Color("#f97316")); 

    } catch (err) {
        w.addSpacer();
        let errText = w.addText("Daten-Fehler. Der openSenseMap Server braucht zu lange zum Antworten.");
        errText.font = Font.systemFont(12);
        errText.textColor = new Color("#ef4444");
    }
    
    w.addSpacer(); 
    
    // --- FOOTER (Zentriert) ---
    let footerStack = w.addStack();
    footerStack.addSpacer(); 
    
    let footerText = "Update: " + new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    let timeLabel = footerStack.addText(footerText);
    timeLabel.font = Font.systemFont(10);
    timeLabel.textColor = new Color("#64748b");
    
    footerStack.addSpacer(); 
    
    let nextRefresh = new Date();
    nextRefresh.setSeconds(nextRefresh.getSeconds() + REFRESH_INT);
    w.refreshAfterDate = nextRefresh;
    
    return w;
}

// ====================================================================
// DATEN LADEN, ZERSCHNEIDEN & AUSMISTEN
// ====================================================================
async function fetchAndSplitData(sensorId, fromDate, toDate) {
    let url = `${API_BASE}/boxes/${SENSEBOX_ID}/data/${sensorId}?from-date=${fromDate.toISOString()}&to-date=${toDate.toISOString()}&format=json`;
    let req = new Request(url);
    req.timeoutInterval = 12; 
    try {
        let rawData = await req.loadJSON(); 
        
        let cutoff24h = new Date(new Date().getTime() - (24 * 60 * 60 * 1000));
        
        let raw24h = rawData.filter(d => new Date(d.createdAt) >= cutoff24h);
        let raw7d = rawData;

        return {
            d24: downsample(raw24h, 60),
            d7: downsample(raw7d, 60)
        };
    } catch (e) {
        return { d24: [], d7: [] };
    }
}

function downsample(arr, targetCount) {
    if (!arr || arr.length === 0) return [];
    let step = Math.ceil(arr.length / targetCount);
    if (step < 1) step = 1;
    let reduced = [];
    for (let i = 0; i < arr.length; i += step) {
        reduced.push(parseFloat(arr[i].value));
    }
    return reduced.reverse(); 
}

// ====================================================================
// UI-BUILDER: MATRIX-REIHE FÜR EINEN SENSOR
// ====================================================================
function addSensorRow(parent, labelText, dataObj, color, isPressure = false) {
    let row = parent.addStack();
    row.centerAlignContent();

    // 1. Spalte: Label 
    let labelStack = row.addStack();
    labelStack.size = new Size(65, 0); 
    let lbl = labelStack.addText(labelText);
    lbl.font = Font.systemFont(11); 
    lbl.textColor = color;

    // 2. Spalte: 24 Stunden Graph
    let img24 = createChartImage(dataObj.d24, color, isPressure);
    let wImg24 = row.addImage(img24);
    wImg24.imageSize = new Size(110, 30); 

    row.addSpacer(); 

    // 3. Spalte: 7 Tage Graph
    let img7 = createChartImage(dataObj.d7, color, isPressure);
    let wImg7 = row.addImage(img7);
    wImg7.imageSize = new Size(110, 30); 
}

// ====================================================================
// NATIVE CHART-ZEICHENFUNKTION (DrawContext)
// ====================================================================
function createChartImage(dataPoints, baseColor, isPressure) {
    if (dataPoints.length < 2) {
        let dc = new DrawContext();
        dc.size = new Size(110, 30); 
        return dc.getImage();
    }

    if (isPressure) {
        dataPoints = dataPoints.map(p => p / 100);
    }

    let min = Math.min(...dataPoints);
    let max = Math.max(...dataPoints);
    let range = max - min;
    if (range === 0) range = 1; 

    const width = 110; 
    const height = 30;
    let dc = new DrawContext();
    dc.size = new Size(width, height);
    dc.opaque = false;
    dc.respectScreenScale = true;
    
    let path = new Path();
    let stepX = width / (dataPoints.length - 1);
    
    for (let i = 0; i < dataPoints.length; i++) {
        let normalizedY = (dataPoints[i] - min) / range;
        let x = i * stepX;
        let y = height - (normalizedY * height);
        
        y = Math.max(2, Math.min(height - 2, y)); 

        if (i === 0) {
            path.move(new Point(x, y));
        } else {
            path.addLine(new Point(x, y));
        }
    }
    
    dc.addPath(path);
    dc.setStrokeColor(baseColor);
    dc.setLineWidth(2.5);
    dc.strokePath();
    
    return dc.getImage();
}
