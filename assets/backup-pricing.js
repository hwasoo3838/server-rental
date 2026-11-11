(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.BackupPricing = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';
  const plans = Object.freeze({
    none: Object.freeze({ name: 'No backup', usd: 0 }),
    starter: Object.freeze({ name: 'Starter · 100 GB', usd: 9 }),
    standard: Object.freeze({ name: 'Standard · 500 GB', usd: 25 }),
    business: Object.freeze({ name: 'Business · 1 TB', usd: 45 })
  });
  function calculate(serverAmount, currency, planId) {
    if (!Object.hasOwn(plans, planId)) throw Error('Invalid backup plan');
    if (!['USD', 'KRW'].includes(currency) || (planId !== 'none' && currency !== 'USD')) throw Error('Invalid billing currency');
    if (serverAmount !== null && (!Number.isSafeInteger(serverAmount) || serverAmount < 0)) throw Error('Invalid server price');
    const backupAmount = plans[planId].usd;
    return { planId, currency, serverAmount, backupAmount,
      totalAmount: serverAmount === null ? null : serverAmount + backupAmount };
  }
  function format(amount, currency) {
    return amount === null ? 'Price confirmation required' : amount.toLocaleString('en-US') + ' ' + currency;
  }
  return Object.freeze({ plans, calculate, format });
});
