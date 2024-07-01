from flask import Flask, render_template, request, jsonify
import numpy as np

app = Flask(__name__)


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/calculate', methods=['POST'])
def calculate():
    data = request.json
    calculation_type = data['type']
    result = {}

    if calculation_type == 'sip':
        result = calculate_sip(data['amount'], data['years'], data['rate'])
    elif calculation_type == 'gold':
        result = calculate_gold(data['amount'], data['years'], data['rate'])
    elif calculation_type == 'fd':
        result = calculate_fd(data['amount'], data['years'], data['rate'])

    return jsonify(result)


def calculate_sip(amount, years, rate):
    monthly_rate = rate / 100 / 12
    months = years * 12
    future_value = amount * ((pow(1 + monthly_rate, months) - 1) /
                             monthly_rate) * (1 + monthly_rate)
    total_investment = amount * months
    interest_earned = future_value - total_investment

    yearly_breakdown = []
    for year in range(1, years + 1):
        year_months = year * 12
        year_future_value = amount * (
            (pow(1 + monthly_rate, year_months) - 1) /
            monthly_rate) * (1 + monthly_rate)
        year_total_investment = amount * year_months
        year_interest_earned = year_future_value - year_total_investment
        yearly_breakdown.append({
            'year': year,
            'investment': round(year_total_investment, 2),
            'interest': round(year_interest_earned, 2),
            'total': round(year_future_value, 2)
        })

    return {
        'futureValue': round(future_value, 2),
        'totalInvestment': round(total_investment, 2),
        'interestEarned': round(interest_earned, 2),
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
    app.run(debug=True, host="0.0.0.0", port=8040)
