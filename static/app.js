document.getElementById("predictionForm").addEventListener("submit", async function(event) {
    event.preventDefault();
    const resultDiv = document.getElementById("result");
    
    try {
        resultDiv.innerHTML = "<p>Processing prediction...</p>";
        
        // 获取表单数据
        const formData = new FormData(event.target);

        // 请求模型预测
        const response = await fetch("/predict", {
            method: "POST",
            body: formData
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const result = await response.json();

        if (result.error) {
            throw new Error(result.error);
        }

        // 显示基本预测结果
        resultDiv.innerHTML = `
            <h3>🌱 Viability: ${result["Viability"]}</h3>
            <h4>📈 Growth Grade: ${result["Growth Grade"]}</h4>
            <p>💬 Remarks: ${result["Remarks"] || "None"}</p>
            <p>🤖 Generating AI advice...</p>
        `;

        // 请求 Gemini API 获取 AI 建议
        const adviceRes = await fetch("/gemini_advice", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                viability: result["Viability"],
                grade: result["Growth Grade"],
                remarks: result["Remarks"]
            })
        });

        const adviceJson = await adviceRes.json();
        let aiAdvice = adviceJson.advice || "⚠️ Failed to generate AI advice.";
        aiAdvice = aiAdvice.replace(/\*\*/g, "");
        aiAdvice = aiAdvice.replace(/1\.\s*/g, "<br><strong>1.</strong> "); // 换行并加粗序号
        aiAdvice = aiAdvice.replace(/2\.\s*/g, "<br><strong>2.</strong> ");

        resultDiv.innerHTML += `
        <h4>🧠 AI Advice:</h4>
        <p>${aiAdvice}</p>
        `;


    } catch (error) {
        resultDiv.innerHTML = `
            <p class="error">❌ Error: ${error.message}</p>
        `;
        console.error("Prediction error:", error);
    }
});
