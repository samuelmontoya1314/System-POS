const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Backend del POS funcionando!');
});

const WooCommerce = require('./woocommerce');

// Ruta para obtener productos de WooCommerce
app.get('/api/products', async (req, res) => {
  try {
    const { data } = await WooCommerce.get('products');
    res.json(data);
  } catch (error) {
    console.error('Error al obtener productos de WooCommerce:', error);
    res.status(500).json({ message: 'Error al obtener productos' });
  }
});

// Ruta para crear un nuevo pedido en WooCommerce
app.post('/api/orders', async (req, res) => {
  const { cart, customer } = req.body;

  const orderData = {
    payment_method: "bacs", // O el método de pago que prefieras
    payment_method_title: "Direct Bank Transfer",
    set_paid: true,
    billing: {
      first_name: customer.firstName,
      last_name: customer.lastName,
      email: customer.email,
    },
    shipping: {
      first_name: customer.firstName,
      last_name: customer.lastName,
    },
    line_items: cart.map(item => ({
      product_id: item.id,
      quantity: item.quantity,
    })),
    status: 'completed' // Marcar como completado
  };

  try {
    const { data } = await WooCommerce.post('orders', orderData);
    res.json(data);
  } catch (error) {
    console.error('Error al crear el pedido en WooCommerce:', error.response ? error.response.data : error.message);
    res.status(500).json({ message: 'Error al crear el pedido', details: error.response ? error.response.data : null });
  }
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});