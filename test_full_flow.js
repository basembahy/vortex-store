const http = require('http');

const PORT = 5000;
const BASE_URL = `http://localhost:${PORT}`;

function makeRequest(path, options = {}, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const reqOptions = {
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    if (body) {
      if (typeof body === 'object') {
        body = JSON.stringify(body);
        reqOptions.headers['Content-Type'] = 'application/json';
      }
      reqOptions.headers['Content-Length'] = Buffer.byteLength(body);
    }

    const req = http.request(url, reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch (e) {
          json = data;
        }
        resolve({ status: res.statusCode, data: json, headers: res.headers });
      });
    });

    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Starting Vortex Store End-to-End Verification Tests...\n');

  try {
    // 1. Health check
    console.log('1. Testing Health Endpoint...');
    const health = await makeRequest('/api/health');
    console.log('   Status:', health.status, '| Response:', health.data.status);
    if (health.status !== 200) throw new Error('Health check failed');

    // 2. Settings check
    console.log('\n2. Testing Store Settings Endpoint...');
    const settings = await makeRequest('/api/settings');
    console.log('   Status:', settings.status, '| InstaPay Handle:', settings.data.settings?.instapay_username);
    if (!settings.data.settings?.instapay_username) throw new Error('Store settings missing');

    // 3. Products check (18 games seeded from photos)
    console.log('\n3. Testing Products Catalog...');
    const prods = await makeRequest('/api/products');
    console.log('   Status:', prods.status, '| Total Games:', prods.data.count);
    const sample = prods.data.products[0];
    console.log(`   Sample Game: "${sample.title}" | Sign: ${sample.price_sign} EGP | Home: ${sample.price_home} EGP | Full: ${sample.price_full} EGP`);
    if (prods.data.count < 10) throw new Error('Catalog did not seed properly');

    // 4. Admin Login
    console.log('\n4. Testing Admin Authentication...');
    const loginRes = await makeRequest('/api/auth/login', { method: 'POST' }, {
      email: 'admin@vortex.store',
      password: 'admin123456'
    });
    console.log('   Status:', loginRes.status, '| Role:', loginRes.data.user?.role);
    if (loginRes.status !== 200 || !loginRes.data.token) throw new Error('Admin login failed');
    const adminToken = loginRes.data.token;

    // 5. Admin Adds a New Product
    console.log('\n5. Testing Product Creation by Admin...');
    const newGame = await makeRequest('/api/products', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` }
    }, {
      title: 'Forza Horizon 5 Premium',
      title_ar: 'فورزا هورايزون 5 بريميوم',
      category: 'Racing',
      description: 'Ultimate driving adventure in Mexico',
      price_sign: 90,
      price_home: 120,
      price_full: 220,
      featured: true
    });
    console.log('   Status:', newGame.status, '| Created Game ID:', newGame.data.product?.id);
    if (newGame.status !== 201) throw new Error('Product creation failed');

    // 6. Customer Checkout / Order Creation
    console.log('\n6. Testing Customer Order Placement (InstaPay flow)...');
    const orderItems = [
      {
        product_id: sample.id,
        product_title: sample.title,
        account_type: 'HOME',
        price: sample.price_home,
        quantity: 1
      },
      {
        product_id: newGame.data.product.id,
        product_title: newGame.data.product.title,
        account_type: 'SIGN',
        price: 90,
        quantity: 1
      }
    ];

    const orderRes = await makeRequest('/api/orders', { method: 'POST' }, {
      customer_name: 'كريم محمود',
      customer_email: 'karim.gamer@gmail.com',
      customer_phone: '01099887766',
      whatsapp_number: '+201099887766',
      payment_method: 'instapay',
      items: orderItems,
      notes: 'Please activate fast on Xbox Series X'
    });
    console.log('   Status:', orderRes.status, '| Order ID:', orderRes.data.order_id, '| Total:', orderRes.data.total_amount, 'EGP');
    if (orderRes.status !== 201) throw new Error('Order creation failed');
    const orderId = orderRes.data.order_id;

    // 7. Customer Track Order (Before Fulfillment)
    console.log('\n7. Testing Customer Order Tracking (Pending State)...');
    const trackBefore = await makeRequest(`/api/orders/${orderId}?phone=01099887766`);
    console.log('   Status:', trackBefore.status, '| Order State:', trackBefore.data.order?.status);
    console.log('   Items in Order:', trackBefore.data.order?.items?.length);

    // 8. Admin Views Orders
    console.log('\n8. Testing Admin Order Management List...');
    const adminOrders = await makeRequest('/api/orders/admin/all', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('   Status:', adminOrders.status, '| Total Orders in Admin:', adminOrders.data.count);
    const foundOrder = adminOrders.data.orders.find((o) => o.id === orderId);
    if (!foundOrder) throw new Error('Admin could not see the newly created order');

    // 9. Admin Fulfills Order with Xbox Account Credentials
    console.log('\n9. Testing Admin Fulfilling Order with Xbox Credentials...');
    const fulfillPayload = {
      items_credentials: foundOrder.items.map((item, idx) => ({
        id: item.id,
        account_email: `vortex.account${idx + 1}@outlook.com`,
        account_password: `XboxPass#${idx + 100}!`,
        account_instructions: '1. Add account to Xbox\n2. Set as Home Xbox\n3. Enjoy!'
      })),
      mark_completed: true
    };

    const fulfillRes = await makeRequest(`/api/orders/admin/${orderId}/fulfill`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` }
    }, fulfillPayload);
    console.log('   Status:', fulfillRes.status, '| Order Status now:', fulfillRes.data.order?.status);
    if (fulfillRes.data.order?.status !== 'COMPLETED') throw new Error('Order fulfillment failed');

    // 10. Customer Track Order (After Fulfillment - Verifying Xbox Credentials Delivery)
    console.log('\n10. Testing Customer Order Tracking (Completed State with Credentials)...');
    const trackAfter = await makeRequest(`/api/orders/${orderId}?phone=01099887766`);
    const deliveredItem = trackAfter.data.order?.items[0];
    console.log('   Delivered Xbox Email:', deliveredItem?.account_email);
    console.log('   Delivered Xbox Password:', deliveredItem?.account_password);
    console.log('   Instructions received:', Boolean(deliveredItem?.account_instructions));
    if (!deliveredItem?.account_email || !deliveredItem?.account_password) {
      throw new Error('Xbox credentials were not delivered to customer!');
    }

    // 11. Admin Creates Another Admin User
    console.log('\n11. Testing Multi-Admin User Creation...');
    const newAdmin = await makeRequest('/api/admin/users/admin', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` }
    }, {
      name: 'Super Admin Two',
      email: 'admin2@vortex.store',
      password: 'admin2password123'
    });
    console.log('   Status:', newAdmin.status, '| New Admin User Role:', newAdmin.data.user?.role);
    if (newAdmin.data.user?.role !== 'ADMIN') throw new Error('Failed to create new admin user');

    // 12. Admin Stats
    console.log('\n12. Testing Admin Analytics Stats...');
    const statsRes = await makeRequest('/api/admin/stats', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('   Completed Orders:', statsRes.data.completed_orders);
    console.log('   Total Revenue:', statsRes.data.total_revenue, 'EGP');
    console.log('   Admin Users Count:', statsRes.data.admin_users_count);

    console.log('\n🎉 ALL 12 END-TO-END TESTS PASSED SUCCESSFULLY! 🚀');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Test failed:', err.message);
    process.exit(1);
  }
}

runTests();
