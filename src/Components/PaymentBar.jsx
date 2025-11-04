import React from 'react';

const PaymentBar = ({ payments, total, currency, hoveredWeek }) => {
  const formatCurrency = (amount, curr) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: curr,
    }).format(amount);
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-900 mb-1">Compensation</h3>
        <p className="text-2xl font-bold text-ignite-primary">
          {formatCurrency(total, currency)}
        </p>
        <p className="text-sm text-gray-600 mt-1">{payments.length} × {formatCurrency(payments[0]?.amount || 0, currency)} payments</p>
      </div>

      <div className="space-y-3">
        {payments.map((payment) => {
          const isHighlighted = hoveredWeek === payment.week;
          return (
            <div
              key={payment.id}
              className={`bg-white rounded-lg p-4 border-2 transition-all ${
                isHighlighted
                  ? 'border-ignite-primary shadow-lg scale-105'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(payment.amount, currency)}
                    </span>
                    <span className="text-sm text-gray-600">Week {payment.week}</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      payment.status === 'paid'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {payment.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">{payment.trigger}:</span> {payment.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PaymentBar;

