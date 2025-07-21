from flask import Flask, render_template, request, jsonify
import pandas as pd
import joblib
import numpy as np
import datetime
import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# 加载模型和编码器
viability_model = joblib.load("viability_model.pkl")
grade_model = joblib.load("grade_model.pkl")
label_encoders = joblib.load("label_encoders.pkl")
viability_encoder = joblib.load("viability_encoder.pkl")
grade_encoder = joblib.load("grade_encoder.pkl")
genai.configure(api_key="")# Replace with your own api key

# 读取 CSV 数据
df = pd.read_csv("Plant_Growth_with_Grades.csv")

# 推断肥料适用性（可根据你的逻辑调整）
def infer_fertilizer_suitability(soil, fertilizer):
    if fertilizer == "Not":
        return "No"
    if soil == "Clay" and fertilizer in ["NPK", "Organic"]:
        return "Yes"
    if soil == "Sandy" and fertilizer == "Ammonium Sulfate":
        return "Yes"
    return "No"

@app.route('/')
def home():
    today = datetime.datetime.now()
    week_number = today.isocalendar()[1]
    week_data = df[df["Week"] == week_number].iloc[0]

    return render_template("index.html", default_data={
        "rainfall": week_data["Rainfall(mm/week)"],
        "wind": week_data["WindSpeed(km/h)"],
        "sunlight": week_data["SunlightDuration(hrs/day)"],
        "moisture": week_data["SoilMoisture(%)"],
        "extreme": week_data["ExtremeWeatherDays"]
    })

@app.route('/guides')
def guides():
    return render_template("guides.html")

@app.route('/data')
def html_page():
    today = datetime.datetime.now()
    week_number = today.isocalendar()[1]
    date_str = today.strftime("%Y-%m-%d")

    week_data = df[df["Week"] == week_number].iloc[0]

    return render_template("data.html", default_data={
        "rainfall": week_data["Rainfall(mm/week)"],
        "wind": week_data["WindSpeed(km/h)"],
        "sunlight": week_data["SunlightDuration(hrs/day)"],
        "moisture": week_data["SoilMoisture(%)"],
        "extreme": week_data["ExtremeWeatherDays"],
        "week": week_number,
        "date": date_str
    })

@app.route('/predict', methods=['POST'])
def predict():
    print(request.form)
    try:
        data = request.form
        input_data = []

        # 数值特征（顺序与训练保持一致）
        numeric_features = [
            'Rainfall(mm/week)', 'CloudMovementSpeed(km/h)', 'WindSpeed(km/h)',
            'SunlightDuration(hrs/day)', 'ExtremeWeatherDays', 'SoilMoisture(%)'
        ]
        for key in numeric_features:
            input_data.append(float(data[key]))

        # 获取用于推断的数据
        soil = data["SoilType"]
        fertilizer = data["FertilizerType"]
        fert_suit = infer_fertilizer_suitability(soil, fertilizer)

        # 编码类别特征（注意顺序：SoilType, TerrainType, FertilizerType, FertilizerSuitability, CropType）
        encoded = []
        encoded.append(label_encoders["SoilType"].transform([soil])[0])
        encoded.append(label_encoders["TerrainType"].transform([data["TerrainType"]])[0])
        encoded.append(label_encoders["FertilizerType"].transform([fertilizer])[0])
        encoded.append(label_encoders["FertilizerSuitability"].transform([fert_suit])[0])
        encoded.append(label_encoders["CropType"].transform([data["CropType"]])[0])

        input_data.extend(encoded)

        # 转换为模型输入
        input_array = np.array(input_data).reshape(1, -1)

        # 预测
        viability_pred = viability_encoder.inverse_transform(viability_model.predict(input_array))[0]
        grade_pred = grade_encoder.inverse_transform(grade_model.predict(input_array))[0]

        return jsonify({
            "Viability": viability_pred,
            "Growth Grade": grade_pred,
            "Remarks": f"Fertilizer Suitability: {fert_suit} → Predicted grade: {grade_pred}"
        })

    except Exception as e:
        return jsonify({"error": str(e)})
    
@app.route("/gemini_advice", methods=["POST"])
def gemini_advice():
    try:
        from flask import request
        payload = request.get_json()
        viability = payload["viability"]
        grade = payload["grade"]
        remarks = payload["remarks"]

        # 🔍 Step 1: 从 CSV 找到表现最好的组合样本（High + A）
        top_data = df[(df["Viability"] == "Viable") & (df["GrowthGrade"] == "Good")]
        best_samples = top_data[["CropType", "SoilType", "TerrainType", "FertilizerType"]].drop_duplicates().head(5)

        sample_text = "\n".join(
            f"- Crop: {row['CropType']}, Soil: {row['SoilType']}, Terrain: {row['TerrainType']}, Fertilizer: {row['FertilizerType']}"
            for _, row in best_samples.iterrows()
        )

        # 🧠 Prompt with examples + instructions
        prompt = f"""
    You are an agriculture expert AI. Based on the following plant prediction result:

    - Viability: {viability}
    - GrowthGrade: {grade}
    - AdditionalInfo: {remarks}

    Here are some examples from past successful planting records (High viability, Grade A):

    {sample_text}

    Instructions:
    1. Comment briefly on how well the plant is expected to grow.
    2. Suggest one or two improvements (e.g., change soil type, fertilizer, or terrain), based on the successful examples above.
    3. Be clear and practical. For example: "Use Organic fertilizer instead of None" or "Try Loam soil instead of Clay".
    4. Use simple English that farmers can easily understand.
    5. If the result is already excellent, say: "No major changes needed. Maintain current practices."
    """

        model = genai.GenerativeModel("models/gemini-2.5-pro")
        response = model.generate_content(prompt)
        return jsonify({"advice": response.text})

    except Exception as e:
        print("Gemini Error:", e)
        return jsonify({"error": str(e)})

@app.route("/ai_chat", methods=["POST"])
def ai_chat():
    try:
        data = request.get_json()
        question = data["question"]
        language = data.get("language", "en")  # 默认为英文

        # 使用 Gemini 生成回答
        model = genai.GenerativeModel("models/gemini-2.5-pro")
        
        # 根据语言设置不同的提示
        if language == "my":
            prompt = f"""
            Anda adalah pakar pertanian AI. Jawab soalan berikut dalam Bahasa Malaysia:
            Soalan: {question}
            
            Berikan jawapan yang ringkas dan praktikal dalam Bahasa Malaysia. 
            Gunakan istilah pertanian yang sesuai dan berikan contoh jika perlu.
            """
        else:
            prompt = f"""
            You are an agricultural expert AI. Answer the following question:
            Question: {question}
            
            Provide a concise, practical answer in simple English. 
            Use appropriate farming terminology and give examples if needed.
            """

        response = model.generate_content(prompt)
        return jsonify({"answer": response.text})

    except Exception as e:
        return jsonify({"error": str(e)})
    

if __name__ == '__main__':
    app.run(debug=True)


