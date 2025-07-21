import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import GradientBoostingClassifier
import joblib

# 读取数据
df = pd.read_csv("Plant_Growth_with_Grades.csv")

# 编码类别特征
categorical_cols = ['SoilType', 'TerrainType', 'FertilizerType', 'FertilizerSuitability', 'CropType']
label_encoders = {}

for col in categorical_cols:
    le = LabelEncoder()
    df[col] = le.fit_transform(df[col])
    label_encoders[col] = le

# 编码目标变量
viability_le = LabelEncoder()
df['Viability'] = viability_le.fit_transform(df['Viability'])

grade_le = LabelEncoder()
df['GrowthGrade'] = grade_le.fit_transform(df['GrowthGrade'])

# 特征选择
features = ['Rainfall(mm/week)', 'CloudMovementSpeed(km/h)', 'WindSpeed(km/h)',
            'SunlightDuration(hrs/day)', 'ExtremeWeatherDays', 'SoilType',
            'TerrainType', 'FertilizerType', 'FertilizerSuitability',
            'SoilMoisture(%)', 'CropType']

X = df[features]
y_viability = df['Viability']
y_grade = df['GrowthGrade']

# 切分数据
X_train, X_test, y_v_train, y_v_test = train_test_split(X, y_viability, test_size=0.2, random_state=42)
_, _, y_g_train, y_g_test = train_test_split(X, y_grade, test_size=0.2, random_state=42)

# 模型训练
viability_model = GradientBoostingClassifier()
viability_model.fit(X_train, y_v_train)

grade_model = GradientBoostingClassifier()
grade_model.fit(X_train, y_g_train)

# 保存模型
joblib.dump(viability_model, "viability_model.pkl")
joblib.dump(grade_model, "grade_model.pkl")
joblib.dump(label_encoders, "label_encoders.pkl")
joblib.dump(viability_le, "viability_encoder.pkl")
joblib.dump(grade_le, "grade_encoder.pkl")
