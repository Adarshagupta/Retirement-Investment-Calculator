const result = document.getElementById("result");

function addToScreen(value) {
    result.value += value;
}

function clearScreen() {
    result.value = "";
}

function calculate() {
    try {
        result.value = eval(result.value);
    } catch (error) {
        result.value = "Error";
    }
}
