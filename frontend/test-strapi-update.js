require('dotenv').config({ path: '.env.local' });

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN;

console.log('STRAPI_URL:', STRAPI_URL);
console.log('STRAPI_TOKEN:', STRAPI_TOKEN ? STRAPI_TOKEN.slice(0, 20) + '...' : 'NOT SET');

async function testUpdate() {
  // First, get a lead to test with
  const listRes = await fetch(STRAPI_URL + '/api/leads?pagination[limit]=1', {
    headers: {
      'Content-Type': 'application/json',
      ...(STRAPI_TOKEN && { Authorization: 'Bearer ' + STRAPI_TOKEN }),
    },
  });

  console.log('\n--- LIST LEADS ---');
  console.log('Status:', listRes.status, listRes.statusText);

  if (!listRes.ok) {
    const errorText = await listRes.text();
    console.log('Error:', errorText);
    return;
  }

  const listData = await listRes.json();
  console.log('Found leads:', listData.data?.length || 0);

  if (!listData.data?.length) {
    console.log('No leads to test with');
    return;
  }

  const lead = listData.data[0];
  console.log('Test lead documentId:', lead.documentId);
  console.log('Current paymentStatus:', lead.paymentStatus);
  console.log('Current stripeSessionId:', lead.stripeSessionId);

  // Try to update the lead
  console.log('\n--- UPDATE LEAD ---');
  const updateRes = await fetch(STRAPI_URL + '/api/leads/' + lead.documentId, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(STRAPI_TOKEN && { Authorization: 'Bearer ' + STRAPI_TOKEN }),
    },
    body: JSON.stringify({
      data: {
        stripeSessionId: 'test_session_' + Date.now(),
        paymentStatus: 'paid',
      }
    }),
  });

  console.log('Status:', updateRes.status, updateRes.statusText);

  const updateText = await updateRes.text();
  console.log('Response:', updateText.slice(0, 500));

  if (updateRes.ok) {
    console.log('\n✅ UPDATE SUCCESSFUL!');
  } else {
    console.log('\n❌ UPDATE FAILED');
  }
}

testUpdate().catch(console.error);
