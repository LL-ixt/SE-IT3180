const Household = require('../models/household');
const Invoice = require('../models/invoice');
const Fee = require('../models/fee');
const { calculateFeeAmount } = require('../utils/feeCalculator');

/**
 * Generates invoices for all active households for a given payment session.
 * Checks if an invoice already exists before creating a new one.
 * @param {Object} session - The PaymentSession document.
 */
const generateInvoicesForSession = async (session) => {
    try {
        // 1. Get all active households
        const households = await Household.find({ status: 'active' });
        if (!households.length) return;

        const invoicesToInsert = [];

        // 2. Iterate through each fee in the session
        for (const sessionFee of session.fees) {
            // sessionFee is the subdocument in PaymentSession.fees array
            // We need the full Fee definition for the 'unit' type
            const feeDefinition = await Fee.findById(sessionFee.fee);
            
            if (!feeDefinition) continue;

            // SKIP if fee is not automatic (Manual/Voluntary fees don't generate auto invoices)
            if (feeDefinition.type !== 'mandatory_automatic') continue;

            // Determine the effective price (session override > fee default)
            const effectiveFee = {
                unit: feeDefinition.unit,
                unitPrice: (sessionFee.unitPrice !== undefined && sessionFee.unitPrice !== null) 
                           ? sessionFee.unitPrice 
                           : feeDefinition.unitPrice
            };

            // 3. Create invoice for each household
            for (const household of households) {
                // Check if invoice already exists for this (Session, Fee, Household) tuple
                const exists = await Invoice.findOne({
                    paymentSession: session._id,
                    fee: feeDefinition._id,
                    household: household._id
                });

                if (!exists) {
                    const amount = calculateFeeAmount(effectiveFee, household);
                    
                    invoicesToInsert.push({
                        household: household._id,
                        paymentSession: session._id,
                        fee: feeDefinition._id,
                        amount: amount,
                        dueDate: session.endDate,
                        status: 'unpaid'
                    });
                }
            }
        }

        // 4. Bulk insert
        if (invoicesToInsert.length > 0) {
            await Invoice.insertMany(invoicesToInsert);
        }
    } catch (error) {
        console.error('Error generating invoices:', error);
        // We do not throw here to prevent crashing the main request, 
        // but in a real app you might want to handle this more gracefully.
    }
};

module.exports = { generateInvoicesForSession };