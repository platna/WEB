const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(jsonServer.bodyParser);

server.use((req, res, next) => {
  console.log("Получен запрос:", req.method, req.path);
  next();
});


// POST /users (создание пользователя)
server.use((req, res, next) => {
  if (req.method === 'POST' && req.path === '/users') {
    // ... (код для создания пользователя - без изменений)
  }
  next();
});

// PUT /users/:id (редактирование пользователя)
server.use((req, res, next) => {
  if (req.method === 'PUT' && req.path.startsWith('/users/')) {
    const userId = parseInt(req.path.split('/')[2], 10);
    const updatedUser = req.body;

    const existingUserIndex = router.db.get('users').findIndex({ id: userId }).value();
    if (existingUserIndex !== -1) {
      router.db.get('users')
        .nth(existingUserIndex) // Находим пользователя по индексу
        .assign(updatedUser) // Обновляем данные
        .write();
      res.status(200).json(updatedUser);
    } else {
      res.status(404).send('User not found');
    }

    return; // Завершаем обработку здесь
  }
  next();
});

// DELETE /users/:id (удаление пользователя)
server.use((req, res, next) => {
  if (req.method === 'DELETE' && req.path.startsWith('/users/')) {
    const userId = parseInt(req.path.split('/')[2], 10);
    let db = router.db.getState();

    // Удаляем корзину товаров и избранные товары
    router.db.get('carts').remove({ userId }).write();
    router.db.get('favorites').remove({ userId }).write();

    // Удаляем пользователя
    router.db.get('users').remove({ id: userId }).write();

    // Переиндексация ID оставшихся пользователей
    const remainingUsers = router.db.get('users').value();
    remainingUsers.forEach((user, index) => {
      user.id = index + 1;
    });

    // Обновляем базу данных с переиндексированными пользователями
    router.db.setState({ ...db, users: remainingUsers, config: { nextId: remainingUsers.length + 1 } }).write(); // nextId - кол-во оставшихся пользователей + 1

    res.status(200).json(remainingUsers); // Отправляем обновленный список пользователей
    return;
  }
  next();
});

// Получение товаров по категории
server.get('/products/category/:category', (req, res) => {
  const category = req.params.category;
  const products = router.db.get('products').filter({ category }).value();
  if (products.length > 0) {
    res.status(200).json(products);
  } else {
    res.status(404).send('No products found for this category');
  }
});

// Получение товара по ID
server.get('/products/:id', (req, res) => {
  const productId = parseInt(req.params.id, 10);
  const product = router.db.get('products').find({ id: productId }).value();
  if (product) {
    res.status(200).json(product);
  } else {
    res.status(404).send('Product not found');
  }
});

// POST /cart/:userId (добавление товара в корзину)
server.post('/cart/:userId', (req, res, next) => {
  const db = router.db; // доступ к базе данных
  const userId = parseInt(req.params.userId);
  const productId = req.body.productId;

  // Найти товар в корзине
  const existingCartItem = db.get('cart')
    .find({ userId: userId, productId: productId })
    .value();

  if (existingCartItem) {
    // Если товар уже есть, увеличить quantity
    existingCartItem.quantity += 1;
    db.get('cart')
      .find({ userId: userId, productId: productId })
      .assign(existingCartItem)
      .write();
    res.status(200).json(existingCartItem);
  } else {
    // Если товара нет, добавить новый объект
    const product = db.get('products').find({ id: productId }).value();
    if (product) {
      const newCartItem = {
        userId: userId,
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        detailedImage: product.detailedImage
      };
      db.get('cart').push(newCartItem).write();
      res.status(201).json(newCartItem);
    } else {
      res.status(404).json({ error: 'Product not found' });
    }
  }
});

// GET /cart/:userId (получение корзины пользователя)
server.get('/cart/:userId', (req, res) => {
  const userId = parseInt(req.params.userId, 10);
  const cartItems = router.db.get('cart').filter({ userId }).value();
  res.json(cartItems);
});

// PUT /cart/:userId (обновление количества товара в корзине)
server.put('/cart/:userId', (req, res) => {
  const userId = parseInt(req.params.userId, 10);
  const { productId, quantity } = req.body;

  // Ищем товар в корзине пользователя по userId и productId
  const cartItem = router.db.get('cart')
                            .find({ userId: userId, productId: productId })  //  Изменено
                            .value();

  if (!cartItem) {
    return res.status(404).send('Cart item not found');
  }

  // Обновляем количество (или удаляем, если quantity === 0)
  if (quantity === 0) {
    router.db.get('cart').remove({ userId: userId, productId: productId }).write();  // Изменено
    return res.status(200).json({ message: 'Item removed from cart' });
  } else {
    router.db.get('cart')
             .find({ userId: userId, productId: productId })  // Изменено
             .assign({ quantity: quantity })  //  Обновляем только quantity
             .write();

             // Обновление цены
          const product = router.db.get('products').find({ id: productId }).value();
          cartItem.price = product.price * quantity;

             // Сохранение изменений
            router.db.get('cart')
                .find({ userId: userId, productId: productId })
                .assign(cartItem)
                .write();

    return res.status(200).json(cartItem);  //  Возвращаем обновленный объект
  }
});

// DELETE /cart/:userId (удаление товара из корзины)
server.delete('/cart/:userId', (req, res) => {
  const userId = parseInt(req.params.userId, 10);

  // Если запрос содержит clearAll, очищаем всю корзину
  if (req.body && req.body.clearAll) {
    router.db.get('cart').remove({ userId }).write();
    return res.status(204).send(); // Успешно очищена корзина
  }

  // Удаление конкретного товара
  const { productId } = req.body; 
  if (!productId) {
    return res.status(400).send('ProductId is required to delete specific item');
  }

  const cartItem = router.db.get('cart')
                            .find({ userId, productId })
                            .value();

  if (!cartItem) {
    return res.status(404).send('Cart item not found');
  }

  router.db.get('cart').remove({ userId, productId }).write();
  res.status(204).send(); // 204 No Content, так как товар удален
});

// Получение содержимого корзины
server.get('/cart', (req, res) => {
  const cart = router.db.get('cart').value() || [];
  res.status(200).json(cart);
});

// POST /favorites (добавление товара в избранное)
server.post('/favorites', (req, res) => {
  console.log('Запрос на добавление в избранное:', req.body);

  // Извлекаем userId и productId из тела запроса
  const userId = parseInt(req.body.userId, 10);
  const productId = parseInt(req.body.productId, 10);

  // Проверяем на наличие обязательных параметров
  if (!userId || !productId) {
    return res.status(400).json({ error: 'userId и productId обязательны' });
  }

  // Проверяем существование товара в базе
  const product = router.db.get('products').find({ id: productId }).value();
  if (!product) {
    return res.status(404).json({ error: 'Товар не найден' });
  }

  // Загружаем список избранных товаров для пользователя
  let favorites = router.db.get('favorites').filter({ userId }).value();

  // Проверяем, есть ли уже этот товар в избранном
  const isProductInFavorites = favorites.some(item => item.productId === productId);

  if (isProductInFavorites) {
    return res.status(400).json({ error: 'Товар уже в избранном' });
  }

  // Создаем новый объект товара для добавления в избранное
  const favoriteItem = {
    userId: userId,
    productId: product.id,
    name: product.name,
    price: product.price,
    detailedImage: product.detailedImage
  };

  // Добавляем товар в избранное
  router.db.get('favorites').push(favoriteItem).write();

  // Отправляем успешный ответ с добавленным товаром
  res.status(201).json(favoriteItem);
});


// GET /favorites/:userId (получение списка избранных товаров пользователя)
server.get('/favorites/:userId', (req, res) => {
  const userId = parseInt(req.params.userId, 10);
  console.log("Получение избранного для userId:", userId); // Для отладки

  const favorites = router.db.get('favorites').filter({ userId }).value();

  if (favorites.length === 0) {
    return res.status(404).json({ message: 'Нет избранных товаров' });
  }

  const favoriteProductIds = favorites.map(fav => fav.productId);
  const products = router.db.get('products')
    .filter(product => favoriteProductIds.includes(product.id))
    .value();

  res.status(200).json(products);
});

// DELETE /favorites (удаление товара из избранного)
server.delete('/favorites', (req, res) => {
  const { userId, productId } = req.body;
  console.log('Полученные параметры:', req.body); 

  if (!userId || !productId) {
    return res.status(400).json({ message: 'Необходимо указать userId и productId' });
  }

  // Удаляем товар из избранного
  const favorite = router.db.get('favorites').find({ userId, productId }).value();
  if (!favorite) {
    return res.status(404).json({ message: 'Товар не найден в избранном' });
  }

  router.db.get('favorites').remove({ userId, productId }).write();

  res.status(200).json({ message: 'Товар удален из избранного' });
});

// DELETE /favorites/user/:userId (удаление всех избранных товаров пользователя)
server.delete('/favorites/user/:userId', (req, res) => {
  const userId = parseInt(req.params.userId, 10);

  if (!userId) {
    return res.status(400).json({ message: 'Необходимо указать userId' });
  }

  const removedFavorites = router.db.get('favorites').remove({ userId }).write();

  if (removedFavorites.length === 0) {
      return res.status(404).json({ message: 'Избранные товары не найдены для этого пользователя' });
  }
    
  res.status(200).json({ message: 'Избранные товары пользователя удалены' });
});

server.get('/', (req, res) => {
  res.sendStatus(200);
});

server.use(router);

server.listen(3000, () => {
  console.log('JSON Server is running on port 3000');
});