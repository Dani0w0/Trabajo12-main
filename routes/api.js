'use strict';

const axios = require('axios');

// Almacenamiento en memoria para likes
let likesStorage = {};

module.exports = function (app) {

  // Endpoint principal: Obtener precio de acción
  app.route('/api/stock-prices')
    .get(async function (req, res) {
      const { stock, like } = req.query;
      
      // Manejar casos de una o dos acciones
      if (Array.isArray(stock)) {
        // Comparar dos acciones
        const stock1 = stock[0].toUpperCase();
        const stock2 = stock[1].toUpperCase();
        
        try {
          // Obtener precios de ambas acciones
          const [data1, data2] = await Promise.all([
            getStockPrice(stock1),
            getStockPrice(stock2)
          ]);
          
          // Obtener likes de ambas
          const addLike = like === 'true';
          const likes1 = getLikes(stock1, addLike, req.ip);
          const likes2 = getLikes(stock2, addLike, req.ip);
          
          res.json({
            stockData: [
              {
                stock: stock1,
                price: data1.price,
                rel_likes: likes1 - likes2
              },
              {
                stock: stock2,
                price: data2.price,
                rel_likes: likes2 - likes1
              }
            ]
          });
        } catch (error) {
          res.json({ error: 'Error fetching stock data' });
        }
      } else if (stock) {
        // Una sola acción
        const stockSymbol = stock.toUpperCase();
        
        try {
          const data = await getStockPrice(stockSymbol);
          const likesCount = getLikes(stockSymbol, like === 'true', req.ip);          
          res.json({
            stockData: {
              stock: stockSymbol,
              price: data.price,
              likes: likesCount
            }
          });
        } catch (error) {
          res.json({ error: 'Error fetching stock data' });
        }
      } else {
        res.json({ error: 'Stock parameter required' });
      }
    });
};

// Función para obtener precio desde API
async function getStockPrice(symbol) {
  const apiKey = process.env.STOCK_API_KEY;
  
  try {
    const response = await axios.get(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`
    );
    
    const data = response.data['Global Quote'];
    
    if (!data || !data['05. price']) {
      throw new Error('Stock not found');
    }
    
    return {
      price: parseFloat(data['05. price']),
      symbol: symbol
    };
  } catch (error) {
    throw new Error('External API error');
  }
}

// Función para manejar likes
function getLikes(stockSymbol, addLike, ip) {
  if (!likesStorage[stockSymbol]) {
    likesStorage[stockSymbol] = {
      likes: 0,
      ips: []
    };
  }

  if (addLike && !likesStorage[stockSymbol].ips.includes(ip)) {
    likesStorage[stockSymbol].ips.push(ip);
    likesStorage[stockSymbol].likes++;
  }

  return likesStorage[stockSymbol].likes;
}