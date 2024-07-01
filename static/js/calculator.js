let totalInvestment = 0;
let totalInterest = 0;
let investmentChart;

document.addEventListener("DOMContentLoaded", function () {
    initializeSliders();
    initializeChart();
});

function initializeSliders() {
    const sliders = document.querySelectorAll('input[type="range"]');
    sliders.forEach((slider) => {
        const valueSpan = document.getElementById(`${slider.id}-value`);
        valueSpan.textContent = slider.value;

        slider.oninput = function () {
            valueSpan.textContent = this.value;
        };
    });
}

function initializeChart() {
    const ctx = document.getElementById("investmentChart").getContext("2d");
    investmentChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: [],
            datasets: [
                {
                    label: "Investment",
                    data: [],
                    backgroundColor: "rgba(54, 162, 235, 0.5)",
                    borderColor: "rgba(54, 162, 235, 1)",
                    borderWidth: 1,
                },
                {
                    label: "Interest/Profit",
                    data: [],
                    backgroundColor: "rgba(255, 99, 132, 0.5)",
                    borderColor: "rgba(255, 99, 132, 1)",
                    borderWidth: 1,
                },
            ],
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    stacked: true,
                },
                y: {
                    stacked: true,
                    beginAtZero: true,
                },
            },
        },
    });
}

function calculate(type) {
    let amount, years, rate;

    if (type === "sip") {
        amount = parseFloat(document.getElementById("sip-amount").value);
        years = parseFloat(document.getElementById("sip-years").value);
        rate = parseFloat(document.getElementById("sip-rate").value);
    } else if (type === "gold") {
        amount = parseFloat(document.getElementById("gold-amount").value);
        years = parseFloat(document.getElementById("gold-years").value);
        rate = parseFloat(document.getElementById("gold-rate").value);
    } else if (type === "fd") {
        amount = parseFloat(document.getElementById("fd-amount").value);
        years = parseFloat(document.getElementById("fd-years").value);
        rate = parseFloat(document.getElementById("fd-rate").value);
    }

    fetch("/calculate", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ type, amount, years, rate }),
    })
        .then((response) => response.json())
        .then((data) => {
            displayResult(type, amount, years, rate, data);
            updateTotals(type, data);
            updateChart(type, amount, years, data);
        });
}

function displayResult(type, amount, years, rate, result) {
    let message = `<strong>${type.toUpperCase()} Calculation:</strong><br>`;
    message += `Amount: ₹${amount}<br>`;
    message += `Years: ${years}<br>`;
    message += `Rate: ${rate}%<br>`;

    if (type === "sip") {
        message += `Future Value: ₹${result.futureValue}<br>`;
        message += `Total Investment: ₹${result.totalInvestment}<br>`;
        message += `Interest Earned: ₹${result.interestEarned}`;
    } else if (type === "gold") {
        message += `Future Value: ₹${result.futureValue}<br>`;
        message += `Profit: ₹${result.profit}`;
    } else if (type === "fd") {
        message += `Maturity Amount: ₹${result.futureValue}<br>`;
        message += `Interest Earned: ₹${result.interestEarned}`;
    }

    const chatBox = document.getElementById("chat-box");
    const messageElement = document.createElement("div");
    messageElement.className = "chat-message";
    messageElement.innerHTML = message;
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function updateTotals(type, result) {
    if (type === "sip") {
        totalInvestment += result.totalInvestment;
        totalInterest += result.interestEarned;
    } else if (type === "gold") {
        totalInvestment += parseFloat(
            document.getElementById("gold-amount").value,
        );
        totalInterest += result.profit;
    } else if (type === "fd") {
        totalInvestment += parseFloat(
            document.getElementById("fd-amount").value,
        );
        totalInterest += result.interestEarned;
    }

    document.getElementById("total-investment").textContent =
        `₹${totalInvestment.toFixed(2)}`;
    document.getElementById("total-interest").textContent =
        `₹${totalInterest.toFixed(2)}`;
}

function updateChart(type, amount, years, result) {
    const labels = investmentChart.data.labels;
    const investmentData = investmentChart.data.datasets[0].data;
    const interestData = investmentChart.data.datasets[1].data;

    if (!labels.includes(type)) {
        labels.push(type);
        investmentData.push(0);
        interestData.push(0);
    }

    const index = labels.indexOf(type);

    if (type === "sip") {
        investmentData[index] = result.totalInvestment;
        interestData[index] = result.interestEarned;
    } else if (type === "gold") {
        investmentData[index] = amount;
        interestData[index] = result.profit;
    } else if (type === "fd") {
        investmentData[index] = amount;
        interestData[index] = result.interestEarned;
    }

    investmentChart.update();
}
