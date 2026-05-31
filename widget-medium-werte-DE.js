// ====================================================================
// 1. BENUTZER-EINSTELLUNGEN (Hier ausfüllen)
// ====================================================================
const SENSEBOX_ID = "DEINE_SENSEBOX_ID_HIER_EINTRAGEN"; 
// ====================================================================


const API_URL = "https://api.opensensemap.org/boxes/" + SENSEBOX_ID;
const REFRESH_INT = 300; // 5 Minuten - Passend zum 270s Upload-Intervall der Box

// ====================================================================
// HAUPTPROGRAMM
// ====================================================================
let widget = await createWidget();

if (!config.runsInWidget) {
    // Zeigt beim Ausführen in der App direkt die Vorschau im Querformat (Medium)
    await widget.presentMedium();
}
Script.setWidget(widget);
Script.complete();

// ====================================================================
// WIDGET UI DESIGNER
// ====================================================================
async function createWidget() {
    let w = new ListWidget();
    
    // Hintergrund-Styling
    let startColor = new Color("#1e293b"); 
    let endColor = new Color("#0f172a");
    let gradient = new LinearGradient();
    gradient.colors = [startColor, endColor];
    gradient.locations = [0.0, 1.0];
    w.backgroundGradient = gradient;
    
    w.setPadding(12, 32, 12, 32);
    
    // ZWANGS-UPDATE BEI KLICK
    w.url = "scriptable:///run/" + encodeURIComponent(Script.name());
    
    let data;
    let errorMsg = null;
    
    try {
        data = await fetchOseMData();
    } catch (err) {
        errorMsg = err.message;
    }
    
    // Zentriert den gesamten Inhalt vertikal
    w.addSpacer();
    
    if (errorMsg) {
        let errText = w.addText("Fehler beim Laden:\n" + errorMsg);
        errText.font = Font.systemFont(12);
        errText.textColor = new Color("#ef4444");
    } else {
        // --- HAUPTBEREICH: 2-SPALTEN LAYOUT ---
        let bodyStack = w.addStack();
        
        // ==========================================
        // LINKE SPALTE: Info-Block, PM2.5, PM10
        // ==========================================
        let leftCol = bodyStack.addStack();
        leftCol.layoutVertically();
        
        // --- INFO-BLOCK ---
        let alignStack = leftCol.addStack();
        let infoBlock = alignStack.addStack();
        infoBlock.layoutVertically();
        alignStack.addSpacer(); // Drückt den gesamten Info-Block nach links
        
        let titleRow = infoBlock.addStack();
        titleRow.addSpacer(); // Drückt zur Mitte des Blocks
        let icon = titleRow.addText("📡 ");
        icon.font = Font.systemFont(12);
        let title = titleRow.addText(data ? data.name : "openSenseMap");
        title.font = Font.boldSystemFont(12);
        title.textColor = new Color("#94a3b8");
        titleRow.addSpacer(6);
        let statusDot = titleRow.addText("●");
        statusDot.font = Font.systemFont(12);
        statusDot.textColor = new Color("#22c55e");
        titleRow.addSpacer(); // Drückt zur Mitte des Blocks
        
        infoBlock.addSpacer(2);
        
        let timeRow = infoBlock.addStack();
        timeRow.addSpacer(); // Drückt zur Mitte des Blocks
        let footerText = "Update: " + new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        let timeLabel = timeRow.addText(footerText);
        timeLabel.font = Font.systemFont(10);
        timeLabel.textColor = new Color("#64748b");
        timeRow.addSpacer(); // Drückt zur Mitte des Blocks

        // Flexibler Platzhalter, um PM-Werte nach unten an die rechte Spalte anzugleichen
        leftCol.addSpacer(); 
        
        createValueStack(leftCol, "PM 2.5", data.sensors["PM2.5"], "µg", true, 25, "#ef4444");
        leftCol.addSpacer(4); 
        createValueStack(leftCol, "PM 10", data.sensors["PM10"], "µg", true, 50, "#f97316");
        
        // Flexibler Platzhalter zwischen den Spalten
        bodyStack.addSpacer();
        
        // ==========================================
        // RECHTE SPALTE: Temp, Feuchte, Luftdruck
        // ==========================================
        let rightCol = bodyStack.addStack();
        rightCol.layoutVertically();
        
        createValueStack(rightCol, "Temperatur", data.sensors["Temperatur"], "°C", false, 0, "#f59e0b");
        rightCol.addSpacer(4); 
        
        createValueStack(rightCol, "Luftfeuchte", data.sensors["rel. Luftfeuchte"], "%", false, 0, "#3b82f6");
        rightCol.addSpacer(4); 
        
        let press = data.sensors["Luftdruck"];
        if (press !== undefined) {
            press = press / 100;
        }
        createValueStack(rightCol, "Luftdruck", press, "hPa", false, 0, "#22c55e");
    }
    
    // Zentriert den gesamten Inhalt vertikal
    w.addSpacer();
    
    // iOS/macOS Refresh-Intervall definieren
    let nextRefresh = new Date();
    nextRefresh.setSeconds(nextRefresh.getSeconds() + REFRESH_INT);
    w.refreshAfterDate = nextRefresh;
    
    return w;
}

// ====================================================================
// HILFSFUNKTION: KACHEL FÜR EINEN WERT BAUEN
// ====================================================================
function createValueStack(parentStack, labelText, sensorValue, unit, isPM = false, limit = 0, titleColor = "#94a3b8") {
    let stack = parentStack.addStack();
    stack.layoutVertically();
    
    let label = stack.addText(labelText);
    label.font = Font.systemFont(11); 
    label.textColor = new Color(titleColor);
    
    let valueStr = sensorValue !== undefined ? sensorValue.toFixed(1) : "--";
    let valLabel = stack.addText(valueStr + " " + unit);
    valLabel.font = Font.boldSystemFont(18); 
    
    // Logik: 30% Annäherung = Orange, Überschreitung = Rot
    if (isPM && sensorValue !== undefined && limit > 0) {
        let warningLimit = limit * 0.7; // 30% unter dem Grenzwert
        
        if (sensorValue > limit) {
            valLabel.textColor = new Color("#ef4444"); // Rot
        } else if (sensorValue >= warningLimit) {
            valLabel.textColor = new Color("#f59e0b"); // Orange
        } else {
            valLabel.textColor = Color.white(); // Weiß (Normal)
        }
    } else {
        valLabel.textColor = Color.white();
    }
    
    return stack;
}

// ====================================================================
// DATEN ABRUFEN & PARSEN
// ====================================================================
async function fetchOseMData() {
    let req = new Request(API_URL);
    req.timeoutInterval = 10;
    
    let json = await req.loadJSON();
    
    if (!json || !json.sensors) {
        throw new Error("Ungültige API Antwort");
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
