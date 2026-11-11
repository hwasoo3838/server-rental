const { test } = require('node:test');
const assert = require('node:assert/strict');
const pricing = require('../assets/backup-pricing.js');
test('server + backup monthly total; none preserves server amount', () => {
  for (const [id, extra] of [['none',0],['starter',9],['standard',25],['business',45]]) {
    const quote = pricing.calculate(175,'USD',id);
    assert.equal(quote.totalAmount,175+extra);
    assert.equal(quote.backupAmount,extra);
  }
  assert.equal(pricing.calculate(290000,'KRW','none').totalAmount,290000);
});
test('unpriced server remains unpriced; unknown plan and currency mixing refused', () => {
  assert.equal(pricing.calculate(null,'USD','standard').totalAmount,null);
  assert.throws(()=>pricing.calculate(290000,'KRW','standard'));
  assert.throws(()=>pricing.calculate(175,'USD','__proto__'));
  assert.throws(()=>pricing.calculate(-1,'USD','starter'));
});
