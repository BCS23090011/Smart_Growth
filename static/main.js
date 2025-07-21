document.addEventListener('DOMContentLoaded', function() {
    // ========== 保留原有的语言切换功能 ==========
    const languageToggle = document.querySelectorAll('.lang-btn');
    const elementsWithData = document.querySelectorAll('[data-en], [data-my]');
    const inputsWithPlaceholder = document.querySelectorAll('[data-en-placeholder], [data-my-placeholder]');
    
    let currentLanguage = 'en';
    
    function switchLanguage(lang) {
        currentLanguage = lang;
        
        languageToggle.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === lang);
        });
        
        elementsWithData.forEach(element => {
            if (element.dataset[lang]) {
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    element.value = element.dataset[lang];
                } else {
                    element.textContent = element.dataset[lang];
                }
            }
        });
        
        inputsWithPlaceholder.forEach(input => {
            if (input.dataset[`${lang}-placeholder`]) {
                input.placeholder = input.dataset[`${lang}-placeholder`];
            }
        });
        
        if (window.weatherChart) {
            window.weatherChart.data.datasets[0].label = currentLanguage === 'en' ? 'Rainfall (mm)' : 'Hujan (mm)';
            window.weatherChart.update();
        }
    }
    
    languageToggle.forEach(btn => {
        btn.addEventListener('click', function() {
            switchLanguage(this.dataset.lang);
        });
    });

    // ========== 保留原有的导航栏效果 ==========
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
    
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const navLinks = document.querySelector('.nav-links');
    
    hamburgerMenu.addEventListener('click', function() {
        navLinks.classList.toggle('active');
        hamburgerMenu.classList.toggle('open');
    });
    
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function() {
            navLinks.classList.remove('active');
            hamburgerMenu.classList.remove('open');
        });
    });

    // ========== 保留原有的植物预测工具代码 ==========
    // (完全保留原有的预测工具相关代码，不做任何修改)
    const toolSteps = document.querySelectorAll('.tool-step');
    const progressSteps = document.querySelectorAll('.progress-step');
    const nextButtons = document.querySelectorAll('.next-step');
    const prevButtons = document.querySelectorAll('.prev-step');
    const getResultsButton = document.querySelector('.get-results');
    const restartToolButton = document.querySelector('.restart-tool');
    const soilQuizLink = document.querySelector('.soil-quiz-link');
    const soilQuizSection = document.querySelector('.soil-quiz');
    const closeQuizButton = document.querySelector('.prev-question');
    const nextQuizButton = document.querySelector('.next-question');
    
    let currentStep = 1;
    
    showStep(currentStep);
    
    nextButtons.forEach(button => {
        button.addEventListener('click', function() {
            if (validateStep(currentStep)) {
                currentStep++;
                showStep(currentStep);
            }
        });
    });
    
    prevButtons.forEach(button => {
        button.addEventListener('click', function() {
            currentStep--;
            showStep(currentStep);
        });
    });
    
    if (getResultsButton) {
        getResultsButton.addEventListener('click', function() {
            if (validateStep(currentStep)) {
                document.querySelector('.prediction-tool').classList.add('hidden');
                document.querySelector('.results').classList.remove('hidden');
            }
        });
    }
    
    if (restartToolButton) {
        restartToolButton.addEventListener('click', function() {
            document.querySelectorAll('.crop-card, .soil-card, .terrain-card').forEach(card => {
                card.classList.remove('selected');
            });
            
            document.querySelectorAll('input, select').forEach(input => {
                if (input.type !== 'button' && input.type !== 'submit') {
                    input.value = '';
                }
            });
            
            document.querySelector('.results').classList.add('hidden');
            document.querySelector('.prediction-tool').classList.remove('hidden');
            
            currentStep = 1;
            showStep(currentStep);
        });
    }
    
    if (soilQuizLink) {
        soilQuizLink.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelector('.prediction-tool').classList.add('hidden');
            soilQuizSection.classList.remove('hidden');
        });
    }
    
    if (closeQuizButton) {
        closeQuizButton.addEventListener('click', function() {
            soilQuizSection.classList.add('hidden');
            document.querySelector('.prediction-tool').classList.remove('hidden');
        });
    }
    
    if (nextQuizButton) {
        nextQuizButton.addEventListener('click', function() {
            const selectedOption = document.querySelector('input[name="quiz"]:checked');
            
            if (selectedOption) {
                const soilType = determineSoilTypeFromQuiz(selectedOption.id);
                
                document.querySelectorAll('.soil-card').forEach(card => {
                    card.classList.remove('selected');
                    if (card.dataset.soil === soilType) {
                        card.classList.add('selected');
                    }
                });
                
                soilQuizSection.classList.add('hidden');
                document.querySelector('.prediction-tool').classList.remove('hidden');
            } else {
                alert(currentLanguage === 'en' ? 'Please select an option' : 'Sila pilih pilihan');
            }
        });
    }
    
    document.querySelectorAll('.crop-card').forEach(card => {
    card.addEventListener('click', function() {
        document.querySelectorAll('.crop-card').forEach(c => c.classList.remove('selected'));
        this.classList.add('selected');
        // 添加这行代码，更新隐藏的input值
        document.getElementById('cropTypeInput').value = this.dataset.crop;
        });
    });
    
    document.querySelectorAll('.soil-card').forEach(card => {
        card.addEventListener('click', function() {
            document.querySelectorAll('.soil-card').forEach(c => c.classList.remove('selected'));
            this.classList.add('selected');
            document.getElementById('soilTypeInput').value = this.dataset.soil;
        });
    });
    
    document.querySelectorAll('.terrain-card').forEach(card => {
        card.addEventListener('click', function() {
        document.querySelectorAll('.terrain-card').forEach(c => c.classList.remove('selected'));
        this.classList.add('selected');
        // 添加这行代码
        document.getElementById('terrainTypeInput').value = this.dataset.terrain;
        });
    });
    
    function showStep(step) {
        toolSteps.forEach(step => step.classList.remove('active'));
        document.querySelector(`.tool-step[data-step="${step}"]`).classList.add('active');
        
        progressSteps.forEach((progressStep, index) => {
            if (index < step) {
                progressStep.classList.add('active');
            } else {
                progressStep.classList.remove('active');
            }
        });
    }
    
    function validateStep(step) {
        switch(step) {
            case 1:
            const cropSelected = document.querySelector('.crop-card.selected');
            const cropInput = document.getElementById('cropTypeInput');
            if (!cropSelected || !cropInput.value) {
                alert(currentLanguage === 'en' ? 'Please select a crop' : 'Sila pilih tanaman');
                return false;
            }
            case 2:
                const rainfall = document.querySelector('[name="Rainfall(mm/week)"]').value.trim();
                const cloud = document.querySelector('[name="CloudMovementSpeed(km/h)"]').value.trim();
                const wind = document.querySelector('[name="WindSpeed(km/h)"]').value.trim();
                const sunlight = document.querySelector('[name="SunlightDuration(hrs/day)"]').value.trim();
                const extreme = document.querySelector('[name="ExtremeWeatherDays"]').value.trim();

                if (!rainfall || !cloud || !wind || !sunlight || !extreme) {
                    alert(currentLanguage === 'en' ? 'Please fill in all weather conditions.' : 'Sila isi semua keadaan cuaca.');
                    return false;
                }
                break;
            case 3:
                 if (!document.querySelector('.soil-card.selected') || !document.getElementById('soilTypeInput').value) {
                alert(currentLanguage === 'en' ? 'Please select your soil type' : 'Sila pilih jenis tanah anda');
                return false;
            }
            break;
            case 4:
                if (!document.querySelector('.terrain-card.selected') || !document.getElementById('terrainTypeInput').value) {
                alert(currentLanguage === 'en' ? 'Please select your terrain type' : 'Sila pilih jenis bentuk muka bumi anda');
                return false;
            }
            break;
            case 5:
                if (!document.getElementById('FertilizerType').value) {
                    alert(currentLanguage === 'en' ? 'Please select a fertilizer type' : 'Sila pilih jenis baja');
                    return false;
                }
                break;
        }
        return true;
    }
    
    function determineSoilTypeFromQuiz(selectedOption) {
        switch(selectedOption) {
            case 'option1': return 'sandy';
            case 'option2': return 'loam';
            case 'option3': return 'clay';
            case 'option4': return 'peat';
            default: return 'loam';
        }
    }

    // ========== 只修改AI聊天部分 ==========
    const chatInput = document.querySelector('.chat-input input');
    const sendButton = document.querySelector('.send-btn');
    const chatMessages = document.querySelector('.chat-messages');
    const quickQuestions = document.querySelectorAll('.quick-question');
    
    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', sender);
        
        const contentDiv = document.createElement('div');
        contentDiv.classList.add('message-content');
        contentDiv.textContent = text;
        
        messageDiv.appendChild(contentDiv);
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    async function sendMessage() {
        const messageText = chatInput.value.trim();
        if (messageText) {
            addMessage(messageText, 'user');
            
            try {
                const response = await fetch("/ai_chat", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        question: messageText,
                        language: currentLanguage
                    })
                });

                if (!response.ok) throw new Error("Network response was not ok");
                
                const data = await response.json();
                if (data.error) throw new Error(data.error);
                
                addMessage(data.answer, 'bot');
            } catch (error) {
                console.error("Chat error:", error);
                addMessage(currentLanguage === 'en' 
                    ? "Sorry, I couldn't process your request. Please try again later."
                    : "Maaf, saya tidak dapat memproses permintaan anda. Sila cuba lagi nanti.", 
                    'bot');
            }
            
            chatInput.value = '';
        }
    }
    
    if (sendButton) {
        sendButton.addEventListener('click', sendMessage);
    }
    
    if (chatInput) {
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
    
    quickQuestions.forEach(button => {
        button.addEventListener('click', function() {
            const question = this.getAttribute(currentLanguage === 'en' ? 'data-en' : 'data-my');
            chatInput.value = question;
            sendMessage();
        });
    });

    // ========== 保留原有的天气图表代码 ==========
    const weatherCtx = document.getElementById('weatherChart');
if (weatherCtx) {
    fetch('/static/weather.csv')
        .then(response => response.text())
        .then(csv => {
            const rows = csv.trim().split('\n').slice(1); // 跳过标题行
            const labels = [];
            const data = [];

            rows.forEach(row => {
                const [week, rainfall] = row.split(',');
                labels.push(`Week ${week}`);
                data.push(Number(rainfall));
            });

            window.weatherChart = new Chart(weatherCtx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Rainfall (mm)',
                        data: data,
                        borderColor: 'rgba(34, 197, 94, 1)',
                        backgroundColor: 'rgba(34, 197, 94, 0.2)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { position: 'top' },
                        tooltip: { mode: 'index', intersect: false }
                    },
                    scales: {
                        y: {
                            beginAtZero: true
                        }, 
                        animation: false
                    }
                }
            });
        })
        .catch(error => console.error("CSV load error:", error));
}


});

// ========== 保留原有的预测表单提交代码 ==========
const predictionForm = document.getElementById("predictionForm");
if (predictionForm) {
    predictionForm.addEventListener("submit", async function(event) {
        event.preventDefault();

        const resultDiv = document.getElementById("result");
        resultDiv.innerHTML = "<p>Processing prediction...</p>";

        try {
            const formData = new FormData(predictionForm);

            const response = await fetch("/predict", {
                method: "POST",
                body: formData
            });

            if (!response.ok) throw new Error(`Server error: ${response.status}`);

            const result = await response.json();
            if (result.error) throw new Error(result.error);

            resultDiv.innerHTML = `
                <h3>🌱 Viability: ${result["Viability"]}</h3>
                <h4>📈 Growth Grade: ${result["Growth Grade"]}</h4>
                <p>💬 Remarks: ${result["Remarks"] || "None"}</p>
                <p>🤖 Generating AI advice...</p>
            `;

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
            aiAdvice = aiAdvice.replace(/1\.\s*/g, "<br><strong>1.</strong> ");
            aiAdvice = aiAdvice.replace(/2\.\s*/g, "<br><strong>2.</strong> ");

            resultDiv.innerHTML += `
                <h4>🧠 AI Advice:</h4>
                <p>${aiAdvice}</p>
            `;
        } catch (error) {
            resultDiv.innerHTML = `<p class="error">❌ Error: ${error.message}</p>`;
            console.error("Prediction error:", error);
        }
    });
}