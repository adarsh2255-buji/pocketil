import React, { useEffect, useState } from 'react';
import { Loader2, CheckCircle2, Clock, CreditCard, X, Check, Receipt, AlertTriangle } from 'lucide-react';
import api from '../utils/api';


const StudentFeeManager = ({ user }) => {
  const [feeData, setFeeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Payment State
  const [selectedMonths, setSelectedMonths] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('Online');
  const [processing, setProcessing] = useState(false);
  const [receipt, setReceipt] = useState(null);

  useEffect(() => {
    fetchFeeDetails();
  }, []);

  const fetchFeeDetails = async () => {
    setLoading(true);
    try {
      const response = await api.get('/fees/my-fees');
      setFeeData(response.data);
      setError('');
    } catch (err) {
      // If 404, it means admin hasn't set structure yet
      if (err.response && err.response.status === 404) {
        setError('Fee structure has not been assigned to your batch yet. Please contact the office.');
      } else {
        setError('Failed to load fee details.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMonthSelection = (month) => {
    setSelectedMonths(prev => 
      prev.includes(month) 
        ? prev.filter(m => m !== month) 
        : [...prev, month]
    );
  };

  const calculateTotal = () => {
    if (!feeData) return 0;
    return selectedMonths.reduce((total, monthName) => {
      const monthRecord = feeData.monthlyStatus.find(m => m.month === monthName);
      return total + (monthRecord ? monthRecord.amount : 0);
    }, 0);
  };

  const handlePayNow = async () => {
    setProcessing(true);
    try {
      const amountToPay = calculateTotal();
      const response = await api.post('/fees/pay', {
        studentId: user.id || user._id, 
        monthsToPay: selectedMonths,
        paymentMethod: paymentMethod,
        amount: amountToPay // Optional, backend validates, but good to send
      });

      if (response.data.success) {
        setReceipt(response.data.receipt);
        fetchFeeDetails(); // Refresh data to show updated status
        setSelectedMonths([]);
      }
    } catch (err) {
      alert(err.response?.data?.msg || 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="p-12 text-center text-gray-500"><Loader2 className="h-8 w-8 animate-spin mx-auto mb-2"/>Loading fees...</div>;
  
  if (error) return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
      <div className="bg-yellow-50 inline-block p-3 rounded-full mb-4"><AlertTriangle className="h-8 w-8 text-yellow-600" /></div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">Notice</h3>
      <p className="text-gray-600">{error}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-2">
            <div className="bg-blue-50 p-2 rounded-lg"><CreditCard className="h-5 w-5 text-blue-600" /></div>
            <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-1 rounded-full">Annual</span>
          </div>
          <p className="text-sm text-gray-500">Total Fee</p>
          <p className="text-2xl font-bold text-gray-900">₹{feeData.totalFee}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-2">
            <div className="bg-green-50 p-2 rounded-lg"><CheckCircle2 className="h-5 w-5 text-green-600" /></div>
            <span className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-1 rounded-full">Paid</span>
          </div>
          <p className="text-sm text-gray-500">Fee Paid</p>
          <p className="text-2xl font-bold text-green-700">₹{feeData.paidFee}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-2">
            <div className="bg-red-50 p-2 rounded-lg"><Clock className="h-5 w-5 text-red-600" /></div>
            <span className="text-xs font-semibold bg-red-100 text-red-700 px-2 py-1 rounded-full">Pending</span>
          </div>
          <p className="text-sm text-gray-500">Balance Due</p>
          <p className="text-2xl font-bold text-red-700">₹{feeData.remainingFee}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Monthly Breakdown List */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">Monthly Dues</h2>
            <p className="text-sm text-gray-500">Select months to pay online</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4">Select</th>
                  <th className="px-6 py-4">Month</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Paid On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {feeData.monthlyStatus.map((record, index) => (
                  <tr key={index} className={record.status === 'Paid' ? 'bg-gray-50' : 'hover:bg-gray-50'}>
                    <td className="px-6 py-4">
                      {record.status === 'Due' && (
                        <input 
                          type="checkbox" 
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          checked={selectedMonths.includes(record.month)}
                          onChange={() => handleMonthSelection(record.month)}
                        />
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">{record.month}</td>
                    <td className="px-6 py-4 text-gray-600">₹{record.amount}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${record.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      {record.paidDate ? new Date(record.paidDate).toLocaleDateString() : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-fit">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">Payment Summary</h2>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <p className="text-sm text-gray-500 mb-2">Selected Months</p>
              <div className="flex flex-wrap gap-2">
                {selectedMonths.length > 0 ? (
                  selectedMonths.map(m => (
                    <span key={m} className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-xs font-medium border border-indigo-100">{m}</span>
                  ))
                ) : (
                  <span className="text-sm text-gray-400 italic">No months selected</span>
                )}
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-600">Total Payable</span>
                <span className="text-2xl font-bold text-gray-900">₹{calculateTotal()}</span>
              </div>
              
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
              <select 
                className="w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm mb-4"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="Online">Online / UPI</option>
                <option value="Bank Transfer">Bank Transfer</option>
                {/* Cash option typically for admin, but visible for demo */}
              </select>

              <button 
                onClick={handlePayNow}
                disabled={selectedMonths.length === 0 || processing}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none disabled:opacity-50 transition-colors"
              >
                {processing ? <Loader2 className="animate-spin h-5 w-5" /> : `Pay ₹${calculateTotal()}`}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Receipt Modal */}
      {receipt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-green-600 p-6 text-white text-center relative">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold">Payment Successful!</h2>
              <p className="text-green-100">Thank you for your payment</p>
              <button onClick={() => setReceipt(null)} className="absolute top-4 right-4 text-white hover:text-green-100">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="text-center pb-4 border-b border-gray-100">
                <p className="text-sm text-gray-500 mb-1">Transaction ID</p>
                <p className="font-mono text-xs text-gray-800 bg-gray-100 py-1 px-2 rounded inline-block">{receipt.transactionId}</p>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Student Name</span>
                  <span className="font-medium text-gray-900">{receipt.studentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Register No</span>
                  <span className="font-medium text-gray-900">{receipt.registerNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Date</span>
                  <span className="font-medium text-gray-900">{new Date(receipt.date).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Payment Method</span>
                  <span className="font-medium text-gray-900">{receipt.paymentMethod}</span>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <p className="text-xs text-gray-500 mb-2 uppercase font-bold tracking-wide">Paid For</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {receipt.monthsPaid.map(m => (
                    <span key={m} className="bg-white border border-gray-200 text-gray-700 px-2 py-1 rounded text-xs">{m}</span>
                  ))}
                </div>
                <div className="flex justify-between items-center border-t border-gray-200 pt-3">
                  <span className="font-bold text-gray-900">Total Amount</span>
                  <span className="font-bold text-xl text-indigo-600">₹{receipt.amountPaid}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 flex justify-center">
              <button 
                onClick={() => setReceipt(null)}
                className="text-indigo-600 font-semibold hover:text-indigo-800 text-sm flex items-center gap-2"
              >
                <Receipt className="h-4 w-4" /> Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default StudentFeeManager;