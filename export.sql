-- MariaDB dump 10.19  Distrib 10.6.4-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: portail_tutorat
-- ------------------------------------------------------
-- Server version	10.6.4-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `account`
--

DROP TABLE IF EXISTS `account`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `account` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` text DEFAULT NULL,
  `password` text DEFAULT NULL,
  `prenom` varchar(255) DEFAULT NULL,
  `nom` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `account`
--

LOCK TABLES `account` WRITE;
/*!40000 ALTER TABLE `account` DISABLE KEYS */;
INSERT INTO `account` VALUES (1,'qlegot@gmail.com','$2b$10$NXAiGQQcvav6QfAK6urPmO01kW4yVXtRTbLMKFLwr1..R4f/8gKDW','Quentin','Legot'),(4,'quentin@example.com','$2b$10$x0FjifvZBCSI20/qW/CYUu6y4U/e23EcTbfDgGlRE7OdLQu99cv7O','Quentin','Legot'),(5,'quentin2@example.com','$2b$10$KCuBaYInkUxAcH1315IxHuIL83IeGKnS8vfpghkN5kSq4wg7Olkpy','Quentin','Legot');
/*!40000 ALTER TABLE `account` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tags`
--

DROP TABLE IF EXISTS `tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tags` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `content` varchar(75) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tags`
--

LOCK TABLES `tags` WRITE;
/*!40000 ALTER TABLE `tags` DISABLE KEYS */;
INSERT INTO `tags` VALUES (1,'Mathématique'),(2,'Langues'),(3,'Informatique'),(4,'Autres'),(5,'Physique'),(6,'Chimie');
/*!40000 ALTER TABLE `tags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tutorat`
--

DROP TABLE IF EXISTS `tutorat`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tutorat` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `proposed_by` int(11) DEFAULT NULL,
  `tags_id` int(11) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `customer_id` int(11) DEFAULT NULL,
  `startdate` datetime DEFAULT NULL,
  `duration` smallint(5) unsigned DEFAULT NULL,
  `price` float DEFAULT NULL,
  `place` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `proposed_by` (`proposed_by`),
  KEY `customer_id` (`customer_id`),
  KEY `tags_id` (`tags_id`),
  CONSTRAINT `tutorat_ibfk_1` FOREIGN KEY (`proposed_by`) REFERENCES `account` (`id`),
  CONSTRAINT `tutorat_ibfk_2` FOREIGN KEY (`customer_id`) REFERENCES `account` (`id`),
  CONSTRAINT `tutorat_ibfk_3` FOREIGN KEY (`tags_id`) REFERENCES `tags` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tutorat`
--

LOCK TABLES `tutorat` WRITE;
/*!40000 ALTER TABLE `tutorat` DISABLE KEYS */;
INSERT INTO `tutorat` VALUES (1,1,1,'Tutorat de mathématique, niveau collège',NULL,'2022-02-26 12:30:00',120,10,'Caen'),(2,1,3,'Tutorat d\'informatique, niveau L1/ DUT 1',NULL,'2022-02-26 08:30:00',180,15,'Rouen'),(3,4,1,'Tutorat de mathématique plus spécialement algèbre linéaire pour des étudiants de licences informatique et/ou mathématiques',NULL,'2022-01-29 17:55:09',90,12,'Bordeaux');
/*!40000 ALTER TABLE `tutorat` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2022-02-17 14:33:34
