-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Хост: 127.0.0.1
-- Время создания: Сен 26 2025 г., 14:28
-- Версия сервера: 10.4.32-MariaDB
-- Версия PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- База данных: `inventory`
--

-- --------------------------------------------------------

--
-- Структура таблицы `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `title` varchar(100) NOT NULL,
  `date` datetime NOT NULL,
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп данных таблицы `orders`
--

INSERT INTO `orders` (`id`, `title`, `date`, `description`) VALUES
(1, 'Order 1', '2017-06-29 12:09:33', 'desc'),
(2, 'Order 2', '2017-06-29 12:09:33', 'desc'),
(3, 'Order 3', '2017-06-29 12:09:33', 'desc'),
(4, 'Заказ для группы: test5', '0000-00-00 00:00:00', NULL),
(5, 'Заказ для группы: 1', '0000-00-00 00:00:00', NULL),
(6, 'Заказ для группы: 1', '0000-00-00 00:00:00', NULL),
(7, 'Заказ для группы: t', '0000-00-00 00:00:00', NULL),
(8, 'Заказ для группы: tt', '0000-00-00 00:00:00', NULL),
(9, 'Заказ для группы: 1', '0000-00-00 00:00:00', NULL),
(10, 'Заказ для группы: 1', '0000-00-00 00:00:00', NULL),
(11, 'Заказ для группы: 1', '0000-00-00 00:00:00', NULL);

-- --------------------------------------------------------

--
-- Структура таблицы `order_products`
--

CREATE TABLE `order_products` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп данных таблицы `order_products`
--

INSERT INTO `order_products` (`id`, `order_id`, `product_id`) VALUES
(1, 1, 1),
(2, 2, 2),
(4, 1, 4),
(5, 2, 5),
(6, 3, 6),
(8, 2, 8);

-- --------------------------------------------------------

--
-- Структура таблицы `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `serial_number` bigint(20) NOT NULL,
  `is_new` tinyint(1) NOT NULL,
  `status` enum('свободен','в ремонте') NOT NULL,
  `photo` varchar(500) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `type` varchar(100) NOT NULL,
  `specification` varchar(255) DEFAULT NULL,
  `group_name` varchar(100) DEFAULT NULL,
  `incoming_group` varchar(100) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `guarantee_start` datetime DEFAULT NULL,
  `guarantee_end` datetime DEFAULT NULL,
  `order_id` int(11) DEFAULT NULL,
  `date` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп данных таблицы `products`
--

INSERT INTO `products` (`id`, `serial_number`, `is_new`, `status`, `photo`, `title`, `type`, `specification`, `group_name`, `incoming_group`, `user_id`, `guarantee_start`, `guarantee_end`, `order_id`, `date`) VALUES
(1, 1234, 1, 'в ремонте', 'https://i.pinimg.com/736x/35/59/cd/3559cd8d586263b3fdd14f8bb2299595.jpg', 'Samsung 24\" Monitor', 'Monitors', 'Specification 1', 'Group-1', 'prihod1', 1, '2023-01-15 10:30:00', '2025-01-15 10:30:00', 1, '2023-01-15 10:30:00'),
(2, 5678, 1, 'свободен', 'https://i.pinimg.com/736x/89/ac/6d/89ac6d88437807a6cb4954206e3689f4.jpg', 'Dell XPS 13 Laptop', 'Laptops', 'Specification 1', 'Group-2', 'prihod2', 2, '2023-03-20 14:15:30', '2026-03-20 14:15:30', 2, '2023-03-20 14:15:30'),
(4, 3456, 1, 'свободен', 'https://i.pinimg.com/736x/15/0b/94/150b943679940a3554fc5e9f3291d3f9.jpg', 'LG UltraWide 34\"', 'Monitors', 'Specification 2', 'Group-4', 'prihod4', 4, '2023-06-10 16:45:00', '2025-06-10 16:45:00', 4, '2023-06-10 16:45:00'),
(5, 7890, 1, 'в ремонте', 'https://i.pinimg.com/1200x/05/71/a1/0571a140c8f2c73d60ad88ffd4a2bbb4.jpg', 'MacBook Pro 16\"', 'Laptops', 'Specification 2', 'Group-5', 'prihod5', 5, '2023-11-05 11:20:15', '2026-11-05 11:20:15', 2, '2023-11-05 11:20:15'),
(6, 2468, 0, 'свободен', 'https://i.pinimg.com/736x/9e/9e/85/9e9e85793dfab45e44ae3866db194dfb.jpg', 'Samsung Galaxy S23', 'Phones', 'Specification 4', 'Group-6', 'prihod6', 6, '2023-02-17 13:30:45', '2025-02-17 13:30:45', 3, '2023-02-17 13:30:45'),
(8, 9753, 1, 'свободен', 'https://i.pinimg.com/736x/89/ac/6d/89ac6d88437807a6cb4954206e3689f4.jpg', 'HP Pavilion 15\"', 'Laptops', 'Specification 4', 'Group-7', 'prihod6', 8, '2023-04-12 15:45:00', '2025-04-12 15:45:00', 2, '2023-04-12 15:45:00');

-- --------------------------------------------------------

--
-- Структура таблицы `product_prices`
--

CREATE TABLE `product_prices` (
  `id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `value` decimal(10,2) NOT NULL,
  `symbol` varchar(10) NOT NULL,
  `is_default` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп данных таблицы `product_prices`
--

INSERT INTO `product_prices` (`id`, `product_id`, `value`, `symbol`, `is_default`) VALUES
(1, 1, 299.00, 'USD', 0),
(2, 1, 7800.00, 'UAH', 1),
(3, 2, 1299.00, 'USD', 1),
(4, 2, 33800.00, 'UAH', 0),
(7, 4, 599.00, 'USD', 0),
(8, 4, 15600.00, 'UAH', 1),
(9, 5, 2499.00, 'USD', 1),
(10, 5, 65000.00, 'UAH', 0),
(11, 6, 799.00, 'USD', 1),
(12, 6, 20800.00, 'UAH', 0),
(15, 8, 799.00, 'USD', 1),
(16, 8, 20800.00, 'UAH', 0);

-- --------------------------------------------------------

--
-- Структура таблицы `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп данных таблицы `users`
--

INSERT INTO `users` (`id`, `username`) VALUES
(1, 'Artem'),
(2, 'Dmytro'),
(3, 'Oleksandr'),
(4, 'Mykola'),
(5, 'Ivan'),
(6, 'Viktor'),
(7, 'Andriy'),
(8, 'Pavlo'),
(9, 'Yaroslav'),
(10, 'Olena'),
(11, 'Daryna'),
(12, 'Natalia'),
(13, 'test2'),
(14, 'test3'),
(15, 'testiuser1'),
(17, 'tex'),
(19, 'test'),
(20, 'fdsdfsfsd'),
(21, '1'),
(22, '2'),
(23, 'tttt'),
(24, 'tt');

--
-- Индексы сохранённых таблиц
--

--
-- Индексы таблицы `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `order_products`
--
ALTER TABLE `order_products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Индексы таблицы `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `order_id` (`order_id`);

--
-- Индексы таблицы `product_prices`
--
ALTER TABLE `product_prices`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_id` (`product_id`);

--
-- Индексы таблицы `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT для сохранённых таблиц
--

--
-- AUTO_INCREMENT для таблицы `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT для таблицы `order_products`
--
ALTER TABLE `order_products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT для таблицы `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT для таблицы `product_prices`
--
ALTER TABLE `product_prices`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=63;

--
-- AUTO_INCREMENT для таблицы `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- Ограничения внешнего ключа сохраненных таблиц
--

--
-- Ограничения внешнего ключа таблицы `order_products`
--
ALTER TABLE `order_products`
  ADD CONSTRAINT `order_products_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_products_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Ограничения внешнего ключа таблицы `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `products_ibfk_2` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`);

--
-- Ограничения внешнего ключа таблицы `product_prices`
--
ALTER TABLE `product_prices`
  ADD CONSTRAINT `product_prices_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
