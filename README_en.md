# 🌍 airRohr/Particulate Matter Sensor Apple Widgets (iOS/iPadOS/macOS)

With these Scriptable scripts, you can display live data and historical trends (24 hours & 7 days) of your openSenseMap or Sensor.Community particulate matter sensor directly as native widgets on your Apple desktop (macOS) or home screen (iOS).

Two optimized widget layouts are available:
* **Medium Widget:** Compact live values (temperature, humidity, air pressure, PM2.5, PM10) with intelligent color coding when approaching WHO limit values.
* **Large Widget:** A pure trend matrix. Renders native sparkline charts for the last 24 hours and 7 days.

---

## 📦 Requirements (What you need)

To use these widgets, you basically only need two things: A compatible sensor and an Apple device. Even if you are not very tech-savvy – don't worry, the setup is absolutely doable!

**1. The Hardware (Your Sensor)**
The script accesses the open database of *openSenseMap*. This means you need an outdoor sensor that transmits its measurement data to this network. The most commonly used devices are:
* **DIY Sensors via Sensor.Community (formerly Luftdaten.info):** Very popular and affordable particulate matter sensors to build yourself. If you don't have a sensor yet, you can find an excellent, illustrated beginner's guide at [sensor.community](https://sensor.community/en/sensors/airrohr/).
* **The senseBox (home):** A ready-made kit directly from the openSenseMap project.
* **Any other smart sensor** capable of transmitting its data via the internet to openSenseMap.

**2. The Software (Your Apple Device)**
* An iPhone, iPad, or a Mac (for the desktop).
* The app **Scriptable** (exact installation explained in step 2).

---

## 🛠 Step 1: Connect your Sensor to openSenseMap

For the widget to access your data, your sensor must send its values to the **openSenseMap**. Compared to other networks, openSenseMap offers the major advantage of an open, extremely fast API interface, allowing our Apple widget to retrieve the history of the last 7 days.

**How to set it up:**
1. Create a free account at [opensensemap.org](https://opensensemap.org) (Top right on *Login* -> *Sign up*).
2. In your new dashboard, click on **New senseBox** and select your sensor type.

👉 **Official step-by-step tutorials (German):**
* [Special tutorial for Sensor.Community users](https://tutorials.opensensemap.org/devices/devices-luftdaten/) *(Recommended for DIY builders)*
* [General Registration Tutorial (senseBox Docs)](https://docs.sensebox.de/docs/products/home/aufbau/home-schritt-2/)

Once your sensor is outdoors, connected to Wi-Fi, and transmitting data, you will find your unique **senseBox ID** in your openSenseMap dashboard (a 24-character combination of numbers and letters, e.g., `5d1c828730bde6001adf2309`). Copy this ID; you will need it for the code!

---

## ⚙️ Step 2: Widget Installation & Configuration

The widgets are based on the free app **Scriptable**, which serves as a bridge between the code and your Apple system.

1. Download [Scriptable](https://scriptable.app/) from the App Store for iOS or macOS.
2. Open the app and create a new, empty script using the **+** symbol in the top right corner.
3. Copy the entire code from the file `widget-medium-werte.js` or `widget-large-trends.js` here on GitHub and paste it into this empty script.
4. At the very top of the code in **line 4**, paste your previously copied ID:
```javascript
   const SENSEBOX_ID = "INSERT_YOUR_SENSEBOX_ID_HERE";
