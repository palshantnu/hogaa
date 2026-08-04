-- MySQL dump 10.13  Distrib 8.0.43, for macos15 (x86_64)
--
-- Host: 127.0.0.1    Database: ecommerce_db
-- ------------------------------------------------------
-- Server version	9.3.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `admins`
--

DROP TABLE IF EXISTS `admins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admins` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `mobile` varchar(15) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('super_admin','admin','sub_admin') DEFAULT 'admin',
  `profile_image` varchar(255) DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `last_login` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `mobile` (`mobile`),
  UNIQUE KEY `email_2` (`email`),
  UNIQUE KEY `mobile_2` (`mobile`),
  UNIQUE KEY `email_3` (`email`),
  UNIQUE KEY `mobile_3` (`mobile`),
  UNIQUE KEY `email_4` (`email`),
  UNIQUE KEY `mobile_4` (`mobile`),
  UNIQUE KEY `email_5` (`email`),
  UNIQUE KEY `mobile_5` (`mobile`),
  UNIQUE KEY `email_6` (`email`),
  UNIQUE KEY `mobile_6` (`mobile`),
  UNIQUE KEY `email_7` (`email`),
  UNIQUE KEY `mobile_7` (`mobile`),
  UNIQUE KEY `email_8` (`email`),
  UNIQUE KEY `mobile_8` (`mobile`),
  UNIQUE KEY `email_9` (`email`),
  UNIQUE KEY `mobile_9` (`mobile`),
  UNIQUE KEY `email_10` (`email`),
  UNIQUE KEY `mobile_10` (`mobile`),
  UNIQUE KEY `email_11` (`email`),
  UNIQUE KEY `mobile_11` (`mobile`),
  UNIQUE KEY `email_12` (`email`),
  UNIQUE KEY `mobile_12` (`mobile`),
  UNIQUE KEY `email_13` (`email`),
  UNIQUE KEY `mobile_13` (`mobile`),
  UNIQUE KEY `email_14` (`email`),
  UNIQUE KEY `mobile_14` (`mobile`),
  UNIQUE KEY `email_15` (`email`),
  UNIQUE KEY `mobile_15` (`mobile`),
  UNIQUE KEY `email_16` (`email`),
  UNIQUE KEY `mobile_16` (`mobile`),
  UNIQUE KEY `email_17` (`email`),
  UNIQUE KEY `mobile_17` (`mobile`),
  UNIQUE KEY `email_18` (`email`),
  UNIQUE KEY `mobile_18` (`mobile`),
  UNIQUE KEY `email_19` (`email`),
  UNIQUE KEY `mobile_19` (`mobile`),
  UNIQUE KEY `email_20` (`email`),
  UNIQUE KEY `mobile_20` (`mobile`),
  UNIQUE KEY `email_21` (`email`),
  UNIQUE KEY `mobile_21` (`mobile`),
  UNIQUE KEY `email_22` (`email`),
  UNIQUE KEY `mobile_22` (`mobile`),
  UNIQUE KEY `email_23` (`email`),
  UNIQUE KEY `mobile_23` (`mobile`),
  UNIQUE KEY `email_24` (`email`),
  UNIQUE KEY `mobile_24` (`mobile`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admins`
--

LOCK TABLES `admins` WRITE;
/*!40000 ALTER TABLE `admins` DISABLE KEYS */;
INSERT INTO `admins` VALUES (5,'Super Admin','admin@gmail.com','9999999999','$2b$10$HvSdU2h24pcaSXO6hByjDuaSstUkLEl1OqytqH7FPHegnpUhEVveO','super_admin',NULL,'active','2026-04-28 10:02:23','2026-04-17 06:18:36','2026-04-28 10:02:23');
/*!40000 ALTER TABLE `admins` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `attribute_values`
--

DROP TABLE IF EXISTS `attribute_values`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attribute_values` (
  `id` int NOT NULL AUTO_INCREMENT,
  `attribute_id` int NOT NULL,
  `value` varchar(100) NOT NULL,
  `color_code` varchar(20) DEFAULT NULL,
  `sort_order` int DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_attribute_value` (`attribute_id`,`value`),
  CONSTRAINT `attribute_values_ibfk_1` FOREIGN KEY (`attribute_id`) REFERENCES `attributes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attribute_values`
--

LOCK TABLES `attribute_values` WRITE;
/*!40000 ALTER TABLE `attribute_values` DISABLE KEYS */;
INSERT INTO `attribute_values` VALUES (1,1,'30 ml',NULL,0,'2026-04-15 09:46:32','2026-04-15 09:46:32'),(2,1,'90 ml',NULL,1,'2026-04-15 09:46:32','2026-04-15 09:46:32'),(5,2,'cherry',NULL,1,'2026-04-23 04:59:26','2026-04-27 05:25:11'),(6,2,'Strawberry',NULL,0,'2026-04-27 05:25:11','2026-04-27 05:25:11');
/*!40000 ALTER TABLE `attribute_values` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `attributes`
--

DROP TABLE IF EXISTS `attributes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attributes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `type` enum('select','color','size') DEFAULT 'select',
  `is_global` tinyint(1) DEFAULT '1',
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attributes`
--

LOCK TABLES `attributes` WRITE;
/*!40000 ALTER TABLE `attributes` DISABLE KEYS */;
INSERT INTO `attributes` VALUES (1,'Size','size','select',1,'active','2026-04-15 09:46:32','2026-04-15 09:46:32'),(2,' Colour','-colour','select',1,'active','2026-04-15 10:21:50','2026-04-27 05:25:11');
/*!40000 ALTER TABLE `attributes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `banners`
--

DROP TABLE IF EXISTS `banners`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `banners` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `media_type` enum('image','video') COLLATE utf8mb4_unicode_ci DEFAULT 'image',
  `image` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `video` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `video_poster` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `link` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sort_order` int NOT NULL DEFAULT '0',
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `banners`
--

LOCK TABLES `banners` WRITE;
/*!40000 ALTER TABLE `banners` DISABLE KEYS */;
INSERT INTO `banners` VALUES (5,'hogaa','hogaa','image','banner-1777270567984-28461806.jpeg',NULL,NULL,'http://localhost:5173/',1,'active','2026-04-27 06:16:07','2026-04-27 06:16:07');
/*!40000 ALTER TABLE `banners` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cart_items`
--

DROP TABLE IF EXISTS `cart_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cart_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `cart_id` int NOT NULL,
  `product_id` int NOT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `price` decimal(10,2) NOT NULL COMMENT 'Price at time of adding to cart',
  `total` decimal(10,2) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `variation_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `cart_id` (`cart_id`),
  KEY `product_id` (`product_id`),
  KEY `variation_id` (`variation_id`),
  CONSTRAINT `cart_items_ibfk_55` FOREIGN KEY (`cart_id`) REFERENCES `carts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `cart_items_ibfk_56` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `cart_items_ibfk_57` FOREIGN KEY (`variation_id`) REFERENCES `product_variations` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart_items`
--

LOCK TABLES `cart_items` WRITE;
/*!40000 ALTER TABLE `cart_items` DISABLE KEYS */;
INSERT INTO `cart_items` VALUES (16,1,6,1,199.00,199.00,'2026-04-28 10:31:29','2026-04-28 10:31:29',16),(17,1,4,1,349.00,349.00,'2026-04-28 10:31:31','2026-04-28 10:31:31',NULL);
/*!40000 ALTER TABLE `cart_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `carts`
--

DROP TABLE IF EXISTS `carts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `carts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `session_id` varchar(100) DEFAULT NULL COMMENT 'For guest users',
  `total_items` int DEFAULT '0',
  `subtotal` decimal(10,2) DEFAULT '0.00',
  `discount` decimal(10,2) DEFAULT '0.00',
  `total` decimal(10,2) DEFAULT '0.00',
  `coupon_code` varchar(50) DEFAULT NULL,
  `coupon_discount` decimal(10,2) DEFAULT '0.00',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `carts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `carts`
--

LOCK TABLES `carts` WRITE;
/*!40000 ALTER TABLE `carts` DISABLE KEYS */;
INSERT INTO `carts` VALUES (1,1,NULL,2,548.00,0.00,548.00,NULL,0.00,'2026-04-15 09:49:17','2026-04-28 10:31:31');
/*!40000 ALTER TABLE `carts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `slug` varchar(100) DEFAULT NULL,
  `description` text,
  `image` varchar(255) DEFAULT NULL,
  `sort_order` int DEFAULT '0',
  `status` enum('active','inactive') DEFAULT 'active',
  `parent_id` int DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  UNIQUE KEY `name_2` (`name`),
  UNIQUE KEY `name_3` (`name`),
  UNIQUE KEY `name_4` (`name`),
  UNIQUE KEY `name_5` (`name`),
  UNIQUE KEY `name_6` (`name`),
  UNIQUE KEY `name_7` (`name`),
  UNIQUE KEY `name_8` (`name`),
  UNIQUE KEY `name_9` (`name`),
  UNIQUE KEY `name_10` (`name`),
  UNIQUE KEY `name_11` (`name`),
  UNIQUE KEY `name_12` (`name`),
  UNIQUE KEY `name_13` (`name`),
  UNIQUE KEY `name_14` (`name`),
  UNIQUE KEY `name_15` (`name`),
  UNIQUE KEY `name_16` (`name`),
  UNIQUE KEY `name_17` (`name`),
  UNIQUE KEY `name_18` (`name`),
  UNIQUE KEY `name_19` (`name`),
  UNIQUE KEY `name_20` (`name`),
  UNIQUE KEY `name_21` (`name`),
  UNIQUE KEY `name_22` (`name`),
  UNIQUE KEY `name_23` (`name`),
  UNIQUE KEY `name_24` (`name`),
  UNIQUE KEY `name_25` (`name`),
  UNIQUE KEY `name_26` (`name`),
  UNIQUE KEY `name_27` (`name`),
  UNIQUE KEY `name_28` (`name`),
  UNIQUE KEY `name_29` (`name`),
  UNIQUE KEY `slug` (`slug`),
  UNIQUE KEY `slug_2` (`slug`),
  UNIQUE KEY `slug_3` (`slug`),
  UNIQUE KEY `slug_4` (`slug`),
  UNIQUE KEY `slug_5` (`slug`),
  UNIQUE KEY `slug_6` (`slug`),
  UNIQUE KEY `slug_7` (`slug`),
  UNIQUE KEY `slug_8` (`slug`),
  UNIQUE KEY `slug_9` (`slug`),
  UNIQUE KEY `slug_10` (`slug`),
  UNIQUE KEY `slug_11` (`slug`),
  UNIQUE KEY `slug_12` (`slug`),
  UNIQUE KEY `slug_13` (`slug`),
  UNIQUE KEY `slug_14` (`slug`),
  UNIQUE KEY `slug_15` (`slug`),
  UNIQUE KEY `slug_16` (`slug`),
  UNIQUE KEY `slug_17` (`slug`),
  UNIQUE KEY `slug_18` (`slug`),
  UNIQUE KEY `slug_19` (`slug`),
  UNIQUE KEY `slug_20` (`slug`),
  UNIQUE KEY `slug_21` (`slug`),
  UNIQUE KEY `slug_22` (`slug`),
  UNIQUE KEY `slug_23` (`slug`),
  UNIQUE KEY `slug_24` (`slug`),
  UNIQUE KEY `slug_25` (`slug`),
  UNIQUE KEY `slug_26` (`slug`),
  UNIQUE KEY `slug_27` (`slug`),
  UNIQUE KEY `slug_28` (`slug`),
  UNIQUE KEY `slug_29` (`slug`),
  KEY `parent_id` (`parent_id`),
  CONSTRAINT `categories_ibfk_1` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (5,'LIPS','lips','Lip Balm 4gm | 24H Hydration & Moisturization','category-1777273711495-453944664.png',1,'active',NULL,'2026-04-11 08:27:50','2026-04-27 07:08:31');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `product_id` int NOT NULL,
  `product_name` varchar(200) NOT NULL COMMENT 'Snapshot of product name at purchase',
  `product_image` varchar(255) DEFAULT NULL,
  `quantity` int NOT NULL,
  `price` decimal(10,2) NOT NULL COMMENT 'Price at time of purchase',
  `total` decimal(10,2) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `variation_id` int DEFAULT NULL,
  `cgst_amount` decimal(10,2) DEFAULT '0.00',
  `sgst_amount` decimal(10,2) DEFAULT '0.00',
  `igst_amount` decimal(10,2) DEFAULT '0.00',
  `variation_name` varchar(200) DEFAULT NULL,
  `product_sku` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  KEY `product_id` (`product_id`),
  KEY `variation_id` (`variation_id`),
  CONSTRAINT `order_items_ibfk_49` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `order_items_ibfk_50` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `order_items_ibfk_51` FOREIGN KEY (`variation_id`) REFERENCES `product_variations` (`id`),
  CONSTRAINT `order_items_ibfk_52` FOREIGN KEY (`variation_id`) REFERENCES `product_variations` (`id`),
  CONSTRAINT `order_items_ibfk_53` FOREIGN KEY (`variation_id`) REFERENCES `product_variations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `order_items_ibfk_54` FOREIGN KEY (`variation_id`) REFERENCES `product_variations` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` VALUES (15,14,4,'Hogaa Lip Gloss - Soft Pink','product-1777266516931-61549309.png',1,349.00,349.00,'2026-04-28 07:55:23','2026-04-28 07:55:23',NULL,0.00,0.00,0.00,NULL,NULL),(16,14,6,'Hogaa Lip Balm','product-1777269496690-851405430.png',1,199.00,199.00,'2026-04-28 07:55:23','2026-04-28 07:55:23',16,0.00,0.00,0.00,'cherry',NULL);
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_number` varchar(20) NOT NULL,
  `user_id` int NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `shipping_charge` decimal(10,2) DEFAULT '0.00',
  `discount` decimal(10,2) DEFAULT '0.00',
  `tax` decimal(10,2) DEFAULT '0.00',
  `total` decimal(10,2) NOT NULL,
  `coupon_code` varchar(50) DEFAULT NULL,
  `coupon_discount` decimal(10,2) DEFAULT '0.00',
  `payment_method` enum('cod','card','upi','netbanking','payu') DEFAULT 'cod',
  `payment_status` enum('pending','paid','failed','refunded') DEFAULT 'pending',
  `order_status` enum('pending','confirmed','processing','shipped','delivered','cancelled','returned') DEFAULT 'pending',
  `shipping_address` text NOT NULL,
  `shipping_city` varchar(50) NOT NULL,
  `shipping_state` varchar(50) NOT NULL,
  `shipping_pincode` varchar(10) NOT NULL,
  `shipping_phone` varchar(15) NOT NULL,
  `tracking_number` varchar(100) DEFAULT NULL,
  `notes` text,
  `cancelled_at` datetime DEFAULT NULL,
  `delivered_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `shipping_name` varchar(200) DEFAULT NULL,
  `shipping_email` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_number` (`order_number`),
  UNIQUE KEY `order_number_2` (`order_number`),
  UNIQUE KEY `order_number_3` (`order_number`),
  UNIQUE KEY `order_number_4` (`order_number`),
  UNIQUE KEY `order_number_5` (`order_number`),
  UNIQUE KEY `order_number_6` (`order_number`),
  UNIQUE KEY `order_number_7` (`order_number`),
  UNIQUE KEY `order_number_8` (`order_number`),
  UNIQUE KEY `order_number_9` (`order_number`),
  UNIQUE KEY `order_number_10` (`order_number`),
  UNIQUE KEY `order_number_11` (`order_number`),
  UNIQUE KEY `order_number_12` (`order_number`),
  UNIQUE KEY `order_number_13` (`order_number`),
  UNIQUE KEY `order_number_14` (`order_number`),
  UNIQUE KEY `order_number_15` (`order_number`),
  UNIQUE KEY `order_number_16` (`order_number`),
  UNIQUE KEY `order_number_17` (`order_number`),
  UNIQUE KEY `order_number_18` (`order_number`),
  UNIQUE KEY `order_number_19` (`order_number`),
  UNIQUE KEY `order_number_20` (`order_number`),
  UNIQUE KEY `order_number_21` (`order_number`),
  UNIQUE KEY `order_number_22` (`order_number`),
  UNIQUE KEY `order_number_23` (`order_number`),
  UNIQUE KEY `order_number_24` (`order_number`),
  UNIQUE KEY `order_number_25` (`order_number`),
  UNIQUE KEY `order_number_26` (`order_number`),
  UNIQUE KEY `order_number_27` (`order_number`),
  UNIQUE KEY `order_number_28` (`order_number`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,'ORD1776247126119',1,3000.00,0.00,0.00,0.00,3000.00,NULL,0.00,'cod','pending','processing','ededede','deded','dede','33233323','1111111111',NULL,NULL,NULL,NULL,'2026-04-15 09:58:46','2026-04-17 06:37:19','shantnu pal','shantnu@gmail.com'),(2,'ORD1776248743935',1,2000.00,0.00,0.00,0.00,2000.00,NULL,0.00,'cod','pending','processing','ededede','deded','dede','33233323','1111111111',NULL,NULL,NULL,NULL,'2026-04-15 10:25:43','2026-04-17 06:37:19','shantnu pal','shantnu@gmail.com'),(3,'ORD1776331149535',1,100.00,40.00,0.00,0.00,140.00,NULL,0.00,'payu','pending','shipped','ededede','deded','dede','33233323','1111111111',NULL,NULL,NULL,NULL,'2026-04-16 09:19:09','2026-04-17 06:37:39','shantnu pal','shantnu@gmail.com'),(4,'ORD1776331438675',1,100.00,40.00,0.00,0.00,140.00,NULL,0.00,'cod','pending','shipped','ededede','deded','dede','33233323','1111111111',NULL,NULL,NULL,NULL,'2026-04-16 09:23:58','2026-04-17 06:37:39','shantnu pal','shantnu@gmail.com'),(5,'ORD1776331455376',1,120.00,40.00,0.00,0.00,160.00,NULL,0.00,'payu','paid','confirmed','ededede','deded','dede','33233323','1111111111','TXN17763314554079A0M',NULL,NULL,NULL,'2026-04-16 09:24:15','2026-04-16 09:27:09','shantnu pal','shantnu@gmail.com'),(6,'ORD1776331901457',1,120.00,40.00,0.00,0.00,160.00,NULL,0.00,'payu','paid','confirmed','ededede','deded','dede','33233323','1111111111','TXN1776331901495I84L',NULL,NULL,NULL,'2026-04-16 09:31:41','2026-04-16 09:32:46','shantnu pal','shantnu@gmail.com'),(7,'ORD1776332077015',1,100.00,40.00,0.00,0.00,140.00,NULL,0.00,'payu','paid','confirmed','ededede','deded','dede','33233323','1111111111','TXN1776332077057MG3A',NULL,NULL,NULL,'2026-04-16 09:34:37','2026-04-16 09:35:01','shantnu pal','shantnu@gmail.com'),(8,'ORD1776332875760',1,120.00,40.00,0.00,0.00,160.00,NULL,0.00,'payu','pending','pending','ededede','deded','dede','33233323','1111111111',NULL,NULL,NULL,NULL,'2026-04-16 09:47:55','2026-04-16 09:47:55','shantnu pal','shantnu@gmail.com'),(9,'ORD1776333184809',1,200.00,40.00,0.00,0.00,240.00,NULL,0.00,'cod','pending','pending','ededede','deded','dede','33233323','1111111111',NULL,NULL,NULL,NULL,'2026-04-16 09:53:04','2026-04-16 09:53:04','shantnu pal','shantnu@gmail.com'),(10,'ORD1776333199879',1,200.00,40.00,0.00,0.00,240.00,NULL,0.00,'payu','pending','pending','ededede','deded','dede','33233323','1111111111',NULL,NULL,NULL,NULL,'2026-04-16 09:53:19','2026-04-16 09:53:19','shantnu pal','shantnu@gmail.com'),(11,'ORD1776333245693',1,200.00,40.00,0.00,0.00,240.00,NULL,0.00,'payu','pending','delivered','ededede','deded','dede','33233323','1111111111',NULL,NULL,NULL,'2026-04-17 06:44:47','2026-04-16 09:54:05','2026-04-17 06:44:47','shantnu pal','shantnu@gmail.com'),(12,'ORD1776333881891',1,120.00,40.00,0.00,0.00,160.00,NULL,0.00,'payu','pending','delivered','ededede','deded','dede','33233323','1111111111',NULL,NULL,NULL,'2026-04-17 06:44:37','2026-04-16 10:04:41','2026-04-17 06:44:37','shantnu pal','shantnu@gmail.com'),(13,'ORD1776838148907',1,200.00,40.00,0.00,0.00,240.00,NULL,0.00,'cod','pending','pending','ededede','deded','dede','33233323','1111111111',NULL,NULL,NULL,NULL,'2026-04-22 06:09:08','2026-04-22 06:09:08','shantnu pal','shantnu@gmail.com'),(14,'ORD1777362923137',1,548.00,0.00,0.00,0.00,548.00,NULL,0.00,'payu','paid','confirmed','ededede','deded','dede','33233323','1111111111','TXN1777362923212XMS1',NULL,NULL,NULL,'2026-04-28 07:55:23','2026-04-28 07:57:32','shantnu pal','shantnu@gmail.com');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pages`
--

DROP TABLE IF EXISTS `pages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `slug` varchar(100) NOT NULL,
  `title` varchar(200) NOT NULL,
  `content` longtext NOT NULL,
  `meta_title` varchar(200) DEFAULT NULL,
  `meta_description` text,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pages`
--

LOCK TABLES `pages` WRITE;
/*!40000 ALTER TABLE `pages` DISABLE KEYS */;
INSERT INTO `pages` VALUES (2,'privacy-policy','privacy policy','<p>privacy policyprivacy policyprivacy policyprivacy policyprivacy policyprivacy policyprivacy policy</p>','privacy policy','<p>privacy policyprivacy policyprivacy policyprivacy policyprivacy policyprivacy policyprivacy policy</p>','active','2026-04-16 10:21:26','2026-04-16 10:21:26');
/*!40000 ALTER TABLE `pages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_attributes`
--

DROP TABLE IF EXISTS `product_attributes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_attributes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `attribute_id` int NOT NULL,
  `attribute_value_id` int NOT NULL,
  `price_adjustment` decimal(10,2) DEFAULT '0.00',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `product_id` (`product_id`),
  KEY `attribute_id` (`attribute_id`),
  KEY `attribute_value_id` (`attribute_value_id`),
  CONSTRAINT `product_attributes_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `product_attributes_ibfk_2` FOREIGN KEY (`attribute_id`) REFERENCES `attributes` (`id`),
  CONSTRAINT `product_attributes_ibfk_3` FOREIGN KEY (`attribute_value_id`) REFERENCES `attribute_values` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_attributes`
--

LOCK TABLES `product_attributes` WRITE;
/*!40000 ALTER TABLE `product_attributes` DISABLE KEYS */;
/*!40000 ALTER TABLE `product_attributes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_variation_attributes`
--

DROP TABLE IF EXISTS `product_variation_attributes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_variation_attributes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `variation_id` int NOT NULL,
  `attribute_id` int NOT NULL,
  `attribute_value_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_variation_attribute` (`variation_id`,`attribute_id`),
  KEY `attribute_id` (`attribute_id`),
  KEY `attribute_value_id` (`attribute_value_id`),
  CONSTRAINT `product_variation_attributes_ibfk_1` FOREIGN KEY (`variation_id`) REFERENCES `product_variations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `product_variation_attributes_ibfk_2` FOREIGN KEY (`attribute_id`) REFERENCES `attributes` (`id`),
  CONSTRAINT `product_variation_attributes_ibfk_3` FOREIGN KEY (`attribute_value_id`) REFERENCES `attribute_values` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=65 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_variation_attributes`
--

LOCK TABLES `product_variation_attributes` WRITE;
/*!40000 ALTER TABLE `product_variation_attributes` DISABLE KEYS */;
INSERT INTO `product_variation_attributes` VALUES (59,14,2,5),(60,13,2,6),(63,16,2,5),(64,15,2,6);
/*!40000 ALTER TABLE `product_variation_attributes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_variations`
--

DROP TABLE IF EXISTS `product_variations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_variations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `sku` varchar(100) DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `compare_price` decimal(10,2) DEFAULT NULL,
  `cost_per_item` decimal(10,2) DEFAULT NULL,
  `stock` int DEFAULT '0',
  `stock_status` enum('in_stock','out_of_stock','backorder') DEFAULT 'in_stock',
  `images` json DEFAULT NULL,
  `weight` decimal(10,2) DEFAULT NULL,
  `cgst_rate` decimal(5,2) DEFAULT '0.00',
  `sgst_rate` decimal(5,2) DEFAULT '0.00',
  `igst_rate` decimal(5,2) DEFAULT '0.00',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `variation_slug` varchar(200) DEFAULT NULL,
  `base_price` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `sku` (`sku`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `product_variations_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_variations`
--

LOCK TABLES `product_variations` WRITE;
/*!40000 ALTER TABLE `product_variations` DISABLE KEYS */;
INSERT INTO `product_variations` VALUES (13,5,NULL,249.00,499.00,NULL,100,'in_stock','[\"variation-1777267621849-966867478.png\", \"variation-1777267621862-876027984.png\", \"variation-1777267621871-43390526.png\", \"variation-1777267621877-77646371.png\", \"variation-1777267621881-413762026.png\", \"variation-1777267621893-726821035.jpg\", \"variation-1777267621899-639663749.jpg\", \"variation-1777267621903-127513912.png\", \"variation-1777267621908-872741265.png\"]',NULL,0.00,0.00,0.00,1,'2026-04-27 05:27:02','2026-04-27 07:23:34','hogaa-lip-cheek-tint-strawberry',249.00),(14,5,NULL,249.00,499.00,NULL,100,'in_stock','[\"variation-1777267621916-537475283.png\", \"variation-1777267621921-331696511.png\", \"variation-1777267621938-927231930.png\", \"variation-1777267621945-971358449.png\", \"variation-1777267621953-908089160.png\", \"variation-1777267621961-343008432.jpg\", \"variation-1777267621965-842270542.jpg\", \"variation-1777267621970-595687043.png\", \"variation-1777267621979-141741207.png\"]',NULL,0.00,0.00,0.00,1,'2026-04-27 05:27:02','2026-04-27 07:23:34','hogaa-lip-cheek-tint-cherry',249.00),(15,6,NULL,199.00,399.00,NULL,100,'in_stock','[\"variation-1777269496776-171365309.png\", \"variation-1777269496784-437248086.png\", \"variation-1777269496793-374642385.png\", \"variation-1777269496826-820401893.png\", \"variation-1777269496837-65986826.png\", \"variation-1777269496851-371473982.png\", \"variation-1777269496858-332469237.jpg\"]',NULL,0.00,0.00,0.00,1,'2026-04-27 05:58:16','2026-04-28 10:16:58','hogaa-lip-balm-strawberry',199.00),(16,6,NULL,199.00,399.00,NULL,99,'in_stock','[\"variation-1777269496867-846601704.png\", \"variation-1777269496873-557107092.png\", \"variation-1777269496885-32048627.png\", \"variation-1777269496926-88843890.png\", \"variation-1777269496941-22848738.png\", \"variation-1777269496950-496706655.png\", \"variation-1777269496959-441965109.jpg\"]',NULL,0.00,0.00,0.00,1,'2026-04-27 05:58:17','2026-04-28 10:16:58','hogaa-lip-balm-cherry',199.00);
/*!40000 ALTER TABLE `product_variations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(200) NOT NULL,
  `slug` varchar(200) DEFAULT NULL,
  `description` text,
  `short_description` text,
  `price` decimal(10,2) NOT NULL,
  `compare_price` decimal(10,2) DEFAULT NULL COMMENT 'Original price before discount',
  `cost_per_item` decimal(10,2) DEFAULT NULL,
  `sku` varchar(50) DEFAULT NULL,
  `barcode` varchar(50) DEFAULT NULL,
  `stock` int DEFAULT '0',
  `stock_status` enum('in_stock','out_of_stock','backorder') DEFAULT 'in_stock',
  `category_id` int NOT NULL,
  `images` json DEFAULT NULL COMMENT 'Array of image filenames',
  `product_video` varchar(255) DEFAULT NULL COMMENT 'Optional product video filename',
  `weight` decimal(10,2) DEFAULT NULL COMMENT 'Weight in grams',
  `dimensions` json DEFAULT NULL COMMENT '{length, width, height}',
  `tags` json DEFAULT NULL COMMENT 'Array of tags',
  `is_featured` tinyint(1) DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `views` int DEFAULT '0',
  `sold_count` int DEFAULT '0',
  `meta_title` varchar(200) DEFAULT NULL,
  `meta_description` text,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `has_variations` tinyint(1) DEFAULT '0',
  `cgst_rate` decimal(5,2) DEFAULT '0.00',
  `sgst_rate` decimal(5,2) DEFAULT '0.00',
  `igst_rate` decimal(5,2) DEFAULT '0.00',
  `base_price` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  UNIQUE KEY `sku` (`sku`),
  UNIQUE KEY `slug_2` (`slug`),
  UNIQUE KEY `sku_2` (`sku`),
  UNIQUE KEY `slug_3` (`slug`),
  UNIQUE KEY `sku_3` (`sku`),
  UNIQUE KEY `slug_4` (`slug`),
  UNIQUE KEY `sku_4` (`sku`),
  UNIQUE KEY `slug_5` (`slug`),
  UNIQUE KEY `sku_5` (`sku`),
  UNIQUE KEY `slug_6` (`slug`),
  UNIQUE KEY `sku_6` (`sku`),
  UNIQUE KEY `slug_7` (`slug`),
  UNIQUE KEY `sku_7` (`sku`),
  UNIQUE KEY `slug_8` (`slug`),
  UNIQUE KEY `sku_8` (`sku`),
  UNIQUE KEY `slug_9` (`slug`),
  UNIQUE KEY `sku_9` (`sku`),
  UNIQUE KEY `slug_10` (`slug`),
  UNIQUE KEY `sku_10` (`sku`),
  UNIQUE KEY `slug_11` (`slug`),
  UNIQUE KEY `sku_11` (`sku`),
  UNIQUE KEY `slug_12` (`slug`),
  UNIQUE KEY `sku_12` (`sku`),
  UNIQUE KEY `slug_13` (`slug`),
  UNIQUE KEY `sku_13` (`sku`),
  UNIQUE KEY `slug_14` (`slug`),
  UNIQUE KEY `sku_14` (`sku`),
  UNIQUE KEY `slug_15` (`slug`),
  UNIQUE KEY `sku_15` (`sku`),
  UNIQUE KEY `slug_16` (`slug`),
  UNIQUE KEY `sku_16` (`sku`),
  UNIQUE KEY `slug_17` (`slug`),
  UNIQUE KEY `sku_17` (`sku`),
  UNIQUE KEY `slug_18` (`slug`),
  UNIQUE KEY `sku_18` (`sku`),
  UNIQUE KEY `slug_19` (`slug`),
  UNIQUE KEY `sku_19` (`sku`),
  UNIQUE KEY `slug_20` (`slug`),
  UNIQUE KEY `sku_20` (`sku`),
  UNIQUE KEY `slug_21` (`slug`),
  UNIQUE KEY `sku_21` (`sku`),
  UNIQUE KEY `slug_22` (`slug`),
  UNIQUE KEY `sku_22` (`sku`),
  UNIQUE KEY `slug_23` (`slug`),
  UNIQUE KEY `sku_23` (`sku`),
  UNIQUE KEY `slug_24` (`slug`),
  UNIQUE KEY `sku_24` (`sku`),
  UNIQUE KEY `slug_25` (`slug`),
  UNIQUE KEY `sku_25` (`sku`),
  UNIQUE KEY `slug_26` (`slug`),
  UNIQUE KEY `sku_26` (`sku`),
  UNIQUE KEY `slug_27` (`slug`),
  UNIQUE KEY `sku_27` (`sku`),
  UNIQUE KEY `slug_28` (`slug`),
  UNIQUE KEY `sku_28` (`sku`),
  UNIQUE KEY `slug_29` (`slug`),
  UNIQUE KEY `sku_29` (`sku`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (4,'Hogaa Lip Gloss - Soft Pink','hogaa-lip-gloss-soft-pink','<h1>About this item</h1>\r\n\r\n<ul>\r\n	<li>Deep Hydration for Soft Lips Infused with nourishing ingredients that keep lips moisturized, soft, and smooth while preventing dryness.</li>\r\n	<li>Non-Sticky Glossy Shine Lightweight lip gloss formula glides smoothly on lips, delivering a beautiful glossy shine without a sticky feel.</li>\r\n	<li>Long-Lasting Comfort Provides lasting freshness and hydration so your lips stay comfortable, glossy, and radiant throughout the day.</li>\r\n	<li>Enhances Natural Beauty Soft pink shade adds a subtle tint and shine that enhances your natural lip color for a fresh, polished look.</li>\r\n	<li>Perfect for Everyday Use Compact lip gloss tube ideal for daily wear, quick touch-ups, travel, work, or casual outings.<br />\r\n	&nbsp;</li>\r\n</ul>\r\n','Lip Gloss 5ml | Hydrating Non-Sticky Lip Gloss | Soft Pink Glossy Finish | Long-Lasting Shine & Moisture | Lightweight Lip Shine for Soft Smooth Lips | Pack of 1\r\n',349.00,699.00,NULL,NULL,NULL,99,'in_stock',5,'[\"product-1777266516931-61549309.png\", \"product-1777266516946-344440321.png\", \"product-1777266516957-830875696.png\", \"product-1777266516971-454387542.jpg\", \"product-1777266516977-172469801.jpeg\"]','product-video-1777370585377-954466082.mp4',NULL,NULL,'[]',0,1,42,1,NULL,NULL,'2026-04-27 05:08:36','2026-04-28 10:15:56',0,0.00,0.00,0.00,349.00),(5,'Hogaa Lip & Cheek Tint','hogaa-lip-cheek-tint','<h1>About this item</h1>\r\n\r\n<ul>\r\n	<li>2-in-1 Lip &amp; Cheek Tint A versatile beauty tint designed for both lips and cheeks, giving a natural flush of color with a radiant, healthy glow.</li>\r\n	<li>Natural Velvet Finish Soft, velvety texture blends effortlessly into skin and lips, creating a smooth, natural-looking finish that enhances your beauty.</li>\r\n	<li>Long-Lasting Wear High-quality formula provides long-lasting color so your makeup stays fresh and vibrant throughout the day.</li>\r\n	<li>Lightweight &amp; Blendable Formula Smooth and lightweight texture glides easily on the skin and blends seamlessly for a comfortable, natural look.</li>\r\n	<li>Travel Friendly Mini Glass Jar Compact 5 gm jar makes it perfect for daily makeup, quick touch-ups, travel, office, or on-the-go beauty routines.</li>\r\n</ul>\r\n','Lip & Cheek Tint 5g | 2-in-1 Lip and Blush Tint | Natural Velvet Finish | Long Lasting Hydrating Formula | Lightweight Smooth Texture | Cherry / Strawberry Shade | Mini Glass Jar | Pack of 1 (Cherry)\r\n',0.00,NULL,NULL,NULL,NULL,0,'in_stock',5,'[\"product-1777267621772-950112542.png\", \"product-1777267621780-660949762.png\", \"product-1777267621794-671049469.png\", \"product-1777267621805-219227937.png\", \"product-1777267621820-274668078.png\", \"product-1777267621826-736344071.jpg\", \"product-1777267621830-530051290.jpg\", \"product-1777267621833-972604366.png\", \"product-1777267621840-301488900.png\"]',NULL,NULL,NULL,'[]',0,1,29,0,NULL,NULL,'2026-04-27 05:27:02','2026-04-28 10:31:16',1,0.00,0.00,0.00,0.00),(6,'Hogaa Lip Balm','hogaa-lip-balm','<h1>About this item</h1>\r\n\r\n<ul>\r\n	<li>24-Hour Hydration: HOGAA Lip Balm provides long-lasting moisture that keeps your lips soft, smooth, and hydrated throughout the day while preventing dryness and cracking.</li>\r\n	<li>Nourishing Ingredients: Enriched with Shea Butter, Sweet Almond Oil, and Vitamin E to deeply nourish lips and improve their natural softness and elasticity.</li>\r\n	<li>Protects Against Dryness: Forms a protective barrier that shields lips from harsh weather conditions such as wind, cold, and dry air.</li>\r\n	<li>Smooth &amp; Non-Sticky Formula: Lightweight texture glides easily on lips, providing comfortable hydration without leaving a greasy or sticky feel.</li>\r\n	<li>Perfect for Daily Lip Care: Compact and travel-friendly lip balm suitable for men and women, ideal for everyday use in all seasons.</li>\r\n</ul>\r\n','Lip Balm 4gm | 24H Hydration & Moisturization | Shea Butter, Almond Oil & Vitamin E | For Dry & Chapped Lips | Soft, Smooth & Nourished Lips | Pack of 1',0.00,NULL,NULL,NULL,NULL,0,'in_stock',5,'[\"product-1777269496690-851405430.png\", \"product-1777269496702-747098954.png\", \"product-1777269496720-652967901.png\", \"product-1777269496736-971822605.png\", \"product-1777269496750-893170086.png\", \"product-1777269496761-759958729.png\", \"product-1777269496770-560282786.jpg\"]','product-video-1777371418406-941993410.mp4',NULL,NULL,'[]',0,1,30,0,NULL,NULL,'2026-04-27 05:58:16','2026-04-28 10:35:35',1,0.00,0.00,0.00,0.00);
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `mobile` varchar(15) NOT NULL,
  `gender` enum('male','female','other') DEFAULT 'female',
  `password` varchar(255) NOT NULL,
  `address` text,
  `city` varchar(50) DEFAULT NULL,
  `state` varchar(50) DEFAULT NULL,
  `pincode` varchar(10) DEFAULT NULL,
  `profile_image` varchar(255) DEFAULT NULL,
  `device_token` varchar(255) DEFAULT NULL,
  `status` enum('active','inactive','blocked') DEFAULT 'active',
  `email_verified` tinyint(1) DEFAULT '0',
  `mobile_verified` tinyint(1) DEFAULT '0',
  `last_login` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_email` (`email`),
  UNIQUE KEY `idx_mobile` (`mobile`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'shantnu pal','shantnu@gmail.com','1111111111','male','$2b$10$tdA1MFoBoRLESejuef2a/.Swu1ePxOlv6A.hyYKBuqvjLtTiumAV2','ededede','deded','dede','33233323',NULL,NULL,'active',0,0,'2026-04-13 06:30:01','2026-04-13 06:01:31','2026-04-15 10:41:31');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-08 18:51:10
