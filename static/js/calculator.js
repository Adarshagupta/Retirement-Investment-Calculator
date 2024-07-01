let totalInvestment = 0;
let totalInterest = 0;
let investmentChart;

document.addEventListener("DOMContentLoaded", function () {
    initializeSliders();
    initializeChart();
    document.getElementById("defaultOpen").click();
});

function initializeSliders() {
    const sliders = document.querySelectorAll('input[type="range"]');
    sliders.forEach((slider) => {
        const valueSpan = document.getElementById(`${slider.id}-value`);
        updateSliderValue(slider, valueSpan);

        slider.oninput = function () {
            updateSliderValue(this, valueSpan);
        };
    });

    // Add event listener for SIP type radio buttons
    const sipTypeRadios = document.querySelectorAll('input[name="sip-type"]');
    sipTypeRadios.forEach((radio) => {
        radio.addEventListener("change", function () {
            const yearlyIncreaseContainer = document.getElementById(
                "yearly-increase-container",
            );
            if (this.value === "monthly") {
                yearlyIncreaseContainer.style.display = "block";
            } else {
                yearlyIncreaseContainer.style.display = "none";
            }
        });
    });
}

function updateSliderValue(slider, valueSpan) {
    const value = slider.value;
    valueSpan.textContent = slider.id.includes("amount")
        ? numberWithCommas(value)
        : value;

    // Update slider color
    const percent = ((value - slider.min) / (slider.max - slider.min)) * 100;
    slider.style.background = `linear-gradient(to right, var(--primary-color) 0%, var(--primary-color) ${percent}%, #d7d7d7 ${percent}%, #d7d7d7 100%)`;
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
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
                    backgroundColor: "rgba(74, 144, 226, 0.7)",
                    borderColor: "rgba(74, 144, 226, 1)",
                    borderWidth: 1,
                },
                {
                    label: "Interest/Profit",
                    data: [],
                    backgroundColor: "rgba(243, 156, 18, 0.7)",
                    borderColor: "rgba(243, 156, 18, 1)",
                    borderWidth: 1,
                },
            ],
        },
        options: {
            responsive: true,
            scales: {
                x: { stacked: true },
                y: { stacked: true, beginAtZero: true },
            },
            plugins: {
                legend: { position: "top" },
                title: {
                    display: true,
                    text: "Investment Breakdown",
                    font: { size: 16 },
                },
            },
        },
    });
}

function calculate(type) {
    let amount, years, rate, sipType, yearlyIncrease;

    if (type === "sip") {
        amount = parseFloat(document.getElementById("sip-amount").value);
        years = parseFloat(document.getElementById("sip-years").value);
        rate = parseFloat(document.getElementById("sip-rate").value);
        sipType = document.querySelector(
            'input[name="sip-type"]:checked',
        ).value;
        yearlyIncrease = parseFloat(
            document.getElementById("sip-yearly-increase").value,
        );
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            type,
            amount,
            years,
            rate,
            sipType,
            yearlyIncrease,
        }),
    })
        .then((response) => response.json())
        .then((data) => {
            displayResult(
                type,
                amount,
                years,
                rate,
                data,
                sipType,
                yearlyIncrease,
            );
            updateTotals(type, data);
            updateChart(type, amount, years, data);
        });
}

function displayResult(type, amount, years, rate, result) {
    let message = `<strong>${type.toUpperCase()} Calculation:</strong><br>`;
    message += `Amount: ₹${numberWithCommas(amount)}<br>`;
    message += `Years: ${years}<br>`;
    message += `Rate: ${rate}%<br>`;

    if (type === "sip") {
        message += `Future Value: ₹${numberWithCommas(result.futureValue)}<br>`;
        message += `Total Investment: ₹${numberWithCommas(result.totalInvestment)}<br>`;
        message += `Interest Earned: ₹${numberWithCommas(result.interestEarned)}`;
    } else if (type === "gold") {
        message += `Future Value: ₹${numberWithCommas(result.futureValue)}<br>`;
        message += `Profit: ₹${numberWithCommas(result.profit)}`;
    } else if (type === "fd") {
        message += `Maturity Amount: ₹${numberWithCommas(result.futureValue)}<br>`;
        message += `Interest Earned: ₹${numberWithCommas(result.interestEarned)}`;
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
        `₹${numberWithCommas(totalInvestment.toFixed(2))}`;
    document.getElementById("total-interest").textContent =
        `₹${numberWithCommas(totalInterest.toFixed(2))}`;
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
// Add this function to your calculator.js file

function openCalculator(evt, calculatorName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(calculatorName).style.display = "block";
    evt.currentTarget.className += " active";
}

// Open the default tab on page load
document.getElementById("defaultOpen").click();
