from flask import Flask, render_template, request, jsonify
import openai
import os

app = Flask(__name__)

# Set your OpenAI API key
openai.api_key = os.environ.get('OPENAI_API_KEY')


def calculate_sip(monthly_investment, expected_return_rate, investment_period):
    monthly_rate = expected_return_rate / 12 / 100
    months = investment_period * 12
    future_value = monthly_investment * ((pow(1 + monthly_rate, months) - 1) /
                                         monthly_rate) * (1 + monthly_rate)
    total_investment = monthly_investment * months
    estimated_returns = future_value - total_investment

    return {
        'future_value': round(future_value, 2),
        'total_investment': round(total_investment, 2),
        'estimated_returns': round(estimated_returns, 2)
    }


def get_investment_suggestion(monthly_investment, expected_return_rate,
                              investment_period):
    prompt = f"Given a monthly investment of ₹{monthly_investment}, an expected return rate of {expected_return_rate}% per annum, and an investment period of {investment_period} years, provide a brief suggestion for the investor. Consider factors like diversification, risk, and long-term goals."

    response = openai.Completion.create(
        engine="text-davinci-002",
        prompt=prompt,
        max_tokens=150,
        n=1,
        stop=None,
        temperature=0.7,
    )

    return response.choices[0].text.strip()


@app.route('/')
def home():
    return render_template('index.html')


@app.route('/calculate', methods=['POST'])
def calculate():
    data = request.json
    monthly_investment = float(data['monthlyInvestment'])
    expected_return_rate = float(data['expectedReturnRate'])
    investment_period = int(data['investmentPeriod'])

    result = calculate_sip(monthly_investment, expected_return_rate,
                           investment_period)

    # Generate investment breakdown data for the chart
    breakdown = []
    for year in range(1, investment_period + 1):
        year_result = calculate_sip(monthly_investment, expected_return_rate,
                                    year)
        breakdown.append({
            'year': year,
            'invested': year_result['total_investment'],
            'returns': year_result['estimated_returns']
        })

    suggestion = get_investment_suggestion(monthly_investment,
                                           expected_return_rate,
                                           investment_period)

    return jsonify({
        'result': result,
        'breakdown': breakdown,
        'suggestion': suggestion
    })


if __name__ == '__main__':
    app.run(debug=True)
