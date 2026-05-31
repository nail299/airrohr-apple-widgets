*Read this in other languages: [English](README.md), [Deutsch](README_de.md).*

---

# 🌍 airRohr/Feinstaubsensor Apple Widgets (iOS/iPadOS/macOS)

Mit diesen Scriptable-Skripten kannst du die Live-Daten und historischen Trends (24 Stunden & 7 Tage) deines openSenseMap- oder Sensor.Community-Feinstaubsensors direkt als native Widgets auf deinem Apple-Schreibtisch (macOS) oder Homescreen (iOS) anzeigen lassen.

Es stehen zwei optimierte Widget-Layouts zur Verfügung:
* **Medium-Widget:** Kompakte Live-Werte (Temperatur, Luftfeuchte, Luftdruck, PM2.5, PM10) mit intelligenter Einfärbung bei Annäherung an WHO-Grenzwerte.
* **Large-Widget:** Eine reine Trend-Matrix. Zeichnet native Sparkline-Diagramme für die letzten 24 Stunden und 7 Tage.

---

## 📦 Voraussetzungen (Das brauchst du)

Damit du diese Widgets nutzen kannst, benötigst du im Grunde nur zwei Dinge: Einen kompatiblen Sensor und ein Apple-Gerät. Auch wenn du technisch noch nicht so versiert bist – keine Sorge, die Einrichtung ist absolut machbar!

**1. Die Hardware (Dein Sensor)**
Das Skript greift auf die offene Datenbank der *openSenseMap* zu. Das bedeutet, du brauchst einen Sensor im Außenbereich, der seine Messdaten an dieses Netzwerk sendet. Am häufigsten werden dafür folgende Geräte genutzt:
* **Selbstbau-Sensoren nach Sensor.Community (früher Luftdaten.info):** Das sind sehr beliebte und günstige Feinstaubsensoren zum Selberbauen (meist bestehend aus einem NodeMCU/ESP8266-Chip und einem SDS011-Sensorbauteil, oft verbaut in zwei ineinandergesteckten HT-Rohren aus dem Baumarkt). Wenn du noch keinen Sensor hast, findest du auf [sensor.community](https://sensor.community/de/sensors/airrohr/) eine hervorragende, bebilderte Bauanleitung für Anfänger.
* **Die senseBox (home):** Ein fertiger Bausatz direkt aus dem openSenseMap-Projekt.
* **Jeder andere smarte Sensor**, der in der Lage ist, seine Daten über das Internet an die openSenseMap zu funken.

**2. Die Software (Dein Apple-Gerät)**
* Ein iPhone, iPad oder ein Mac (für den Schreibtisch).
* Die App **Scriptable** (die genaue Installation wird in Schritt 2 erklärt).

---

## 🛠 Schritt 1: Sensor mit openSenseMap verbinden

Damit das Widget auf deine Daten zugreifen kann, muss dein Sensor seine Werte an die **openSenseMap** senden. Die openSenseMap bietet gegenüber anderen Netzwerken (wie der direkten Sensor.Community-Datenbank) den großen Vorteil einer offenen, extrem schnellen Schnittstelle (API), über die unser Apple-Widget sogar die Historie der letzten 7 Tage abrufen kann.

**So richtest du deinen Sensor dort ein:**
1. Erstelle dir kostenlos einen Account auf [opensensemap.org](https://opensensemap.org) (Oben rechts auf *Login* -> *Sign up*).
2. Klicke in deinem neuen Dashboard auf **Neue senseBox** und wähle deinen Sensortyp aus.

👉 **Hier sind die offiziellen, detaillierten Schritt-für-Schritt Anleitungen:**
* [Spezielles Tutorial für Nutzer von Sensor.Community / Luftdaten-Sensoren](https://tutorials.opensensemap.org/devices/devices-luftdaten/) *(Empfohlen für Selbstbauer)*
* [Allgemeines Registrierungs-Tutorial (senseBox Docs)](https://docs.sensebox.de/docs/products/home/aufbau/home-schritt-2/)

Sobald dein Sensor draußen hängt, mit dem WLAN verbunden ist und Daten sendet, findest du in deinem openSenseMap-Dashboard deine eindeutige **senseBox-ID** (eine 24-stellige Kombination aus Zahlen und Buchstaben, z. B. `5d1c828730bde6001adf2309`). Kopiere dir diese ID, du brauchst sie gleich für den Code!

---

## ⚙️ Schritt 2: Installation & Konfiguration des Widgets

Die Widgets basieren auf der kostenlosen App **Scriptable**, die als Brücke zwischen dem Code und deinem Apple-System dient.

1. Lade dir [Scriptable](https://scriptable.app/) aus dem App Store für iOS oder macOS herunter.
2. Öffne die App und erstelle über das **+** Symbol oben rechts ein neues, leeres Skript.
3. Kopiere den gesamten Code aus der Datei `widget-medium-werte.js` oder `widget-large-trends.js` hier aus GitHub und füge ihn in dieses leere Skript ein.
4. Trage ganz oben im Code in **Zeile 4** deine vorhin kopierte ID ein:
```javascript
   const SENSEBOX_ID = "DEINE_SENSEBOX_ID_HIER_EINTRAGEN";
