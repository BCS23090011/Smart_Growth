🌱 SmartGrow - AI-Powered Crop Growth Assistant

SmartGrow is a Flask-based web application that predicts crop viability and growth condition using machine learning, and provides AI-generated farming advice via the Google Gemini API.
Built with a focus on Malaysian agriculture, this project simulates data for weather, soil type, terrain, and fertilizer usage to support intelligent, accessible farming decisions.

🚀 Features
- 🔍 Crop Viability Prediction – Predicts whether a crop is viable based on weekly simulated conditions
- 📈 Growth Grade Estimation – Grades growth conditions as Excellent, Good, Fair, or Poor
- 🤖 Gemini API Integration – Generates farming suggestions using Gemini Pro (Generative AI)
- 📊 Interactive Weather Visualization – Uses Chart.js to display rainfall, wind speed, and extreme weather trends

🧪 Tech Stack
- Backend: Python, Flask, scikit-learn, joblib
- Frontend: HTML/CSS, JavaScript, Chart.js
- AI: Google Gemini API (`google-generativeai`)
- Other: pandas, numpy, dotenv

📦 Installation
1. git clone https://github.com/your-username/smart_growth.git
2. cd smart_growth
3. pip install -r requirements.txt
4. replace with your own google api key in app.py



📌 Notes
  📊 Simulated Dataset:
  This project uses AI-generated data instead of real-world datasets.
  The data is designed to reflect typical Malaysian agricultural conditions, and includes:
  1. Weekly rainfall, wind speed, sunlight hours
  2. Soil types (e.g., Clay, Sandy, Loamy)
  3. Terrain types (e.g., Highland, Lowland, Flat)
  4. Fertilizer types (e.g., NPK, Organic, Urea, None)

  🤖 Generative AI Suggestions:
  The Gemini API is used to provide intelligent, human-like planting suggestions based on model output and environmental data.

  📦 Local ML Models:
  ML models were trained on the simulated data using scikit-learn and deployed with joblib. No online training or external APIs are used for prediction.


