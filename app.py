from flask import Flask, render_template, request, jsonify
import numpy as np

app = Flask(__name__)


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/calculator')
def calculator():
    return render_template("calculator.html")


@app.route('/sipcal')
def sipcal():
    return render_template("sipcal.html")


@app.route('/calculate', methods=['POST'])
def calculate():
    data = request.json
    calculation_type = data['type']
    result = {}
    if calculation_type == 'sip':
        result = calculate_sip(data['amount'], data['years'], data['rate'],
                               data['sipType'], data.get('yearlyIncrease', 0))
    elif calculation_type == 'gold':
        result = calculate_gold(data['amount'], data['years'], data['rate'])
    elif calculation_type == 'fd':
        result = calculate_fd(data['amount'], data['years'], data['rate'])
    return jsonify(result)


def calculate_sip(amount, years, rate, sip_type, yearly_increase):
    monthly_rate = rate / 100 / 12
    months = years * 12
    yearly_breakdown = []
    total_investment = 0
    future_value = 0

    if sip_type == 'monthly':
        for year in range(1, years + 1):
            year_investment = amount * 12 * (1 +
                                             yearly_increase / 100)**(year - 1)
            total_investment += year_investment
            year_future_value = 0
            for month in range(1, 13):
                month_investment = amount * (1 +
                                             yearly_increase / 100)**(year - 1)
                month_future_value = month_investment * (
                    (1 + monthly_rate)**(months -
                                         (year - 1) * 12 - month + 1) -
                    1) / monthly_rate
                year_future_value += month_future_value
            future_value += year_future_value
            yearly_breakdown.append({
                'year':
                year,
                'investment':
                round(year_investment, 2),
                'interest':
                round(year_future_value - year_investment, 2),
                'total':
                round(year_future_value, 2)
            })
    else:  # lumpsum
        future_value = amount * (1 + rate / 100)**years
        total_investment = amount
        for year in range(1, years + 1):
            year_future_value = amount * (1 + rate / 100)**year
            yearly_breakdown.append({
                'year':
                year,
                'investment':
                round(amount, 2),
                'interest':
                round(year_future_value - amount, 2),
                'total':
                round(year_future_value, 2)
            })

    return {
        'futureValue': round(future_value, 2),
        'totalInvestment': round(total_investment, 2),
        'interestEarned': round(future_value - total_investment, 2),
        'yearlyBreakdown': yearly_breakdown
    }


def calculate_gold(amount, years, rate):
    future_value = amount * pow(1 + rate / 100, years)
    profit = future_value - amount
    yearly_breakdown = []
    for year in range(1, years + 1):
        year_future_value = amount * pow(1 + rate / 100, year)
        year_profit = year_future_value - amount
        yearly_breakdown.append({
            'year': year,
            'investment': round(amount, 2),
            'profit': round(year_profit, 2),
            'total': round(year_future_value, 2)
        })
    return {
        'futureValue': round(future_value, 2),
        'profit': round(profit, 2),
        'yearlyBreakdown': yearly_breakdown
    }


def calculate_fd(amount, years, rate):
    future_value = amount * pow(1 + rate / 100, years)
    interest = future_value - amount
    yearly_breakdown = []
    for year in range(1, years + 1):
        year_future_value = amount * pow(1 + rate / 100, year)
        year_interest = year_future_value - amount
        yearly_breakdown.append({
            'year': year,
            'investment': round(amount, 2),
            'interest': round(year_interest, 2),
            'total': round(year_future_value, 2)
        })
    return {
        'futureValue': round(future_value, 2),
        'interestEarned': round(interest, 2),
        'yearlyBreakdown': yearly_breakdown
    }


if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0", port=8550)
