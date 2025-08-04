const express = require('express');
const router = express.Router();
const axios = require('axios');
const { body, validationResult } = require('express-validator');

const validatePurchase = [
  body('customer').isString().notEmpty(),
  body('email').isEmail(),
  body('amount').isNumeric(),
  body('items').isArray(),
  body('paymentMethod').isString()
];

router.post('/', validatePurchase, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const purchaseData = {
      ...req.body,
      timestamp: new Date().toISOString(),
      ip: req.ip
    };

    await axios.post(process.env.PURCHASE_WEBHOOK_URL, {
      content: '💰 New Purchase',
      embeds: [{
        title: 'Order Details',
        fields: [
          { name: 'Customer', value: purchaseData.customer, inline: true },
          { name: 'Email', value: purchaseData.email, inline: true },
          { name: 'Amount', value: `$${purchaseData.amount}`, inline: true },
          { name: 'Items', value: purchaseData.items.join(', ') },
          { name: 'Payment Method', value: purchaseData.paymentMethod },
          { name: 'IP Address', value: purchaseData.ip }
        ],
        timestamp: purchaseData.timestamp
      }]
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Purchase Logger Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
