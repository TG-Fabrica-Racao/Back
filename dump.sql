-- MySQL dump 10.13  Distrib 8.0.34, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: fabrica_racao
-- ------------------------------------------------------
-- Server version	8.0.34

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
-- Table structure for table `acerto_estoque`
--

DROP TABLE IF EXISTS `acerto_estoque`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `acerto_estoque` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_ingrediente` int DEFAULT NULL,
  `id_racao` int DEFAULT NULL,
  `data_acerto` datetime NOT NULL,
  `id_usuario` int NOT NULL,
  `quantidade` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `id_racao` (`id_racao`),
  KEY `id_ingrediente` (`id_ingrediente`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `acerto_estoque_ibfk_1` FOREIGN KEY (`id_racao`) REFERENCES `racoes` (`id`),
  CONSTRAINT `acerto_estoque_ibfk_2` FOREIGN KEY (`id_ingrediente`) REFERENCES `ingredientes` (`id`),
  CONSTRAINT `acerto_estoque_ibfk_3` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `acerto_estoque`
--

LOCK TABLES `acerto_estoque` WRITE;
/*!40000 ALTER TABLE `acerto_estoque` DISABLE KEYS */;
/*!40000 ALTER TABLE `acerto_estoque` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `acoes`
--

DROP TABLE IF EXISTS `acoes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `acoes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(50) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `acoes`
--

LOCK TABLES `acoes` WRITE;
/*!40000 ALTER TABLE `acoes` DISABLE KEYS */;
INSERT INTO `acoes` VALUES (1,'Cadastrar ingrediente'),(2,'Atualizar ingrediente'),(3,'Deletar ingrediente'),(4,'Comprar ingrediente'),(5,'Acertar estoque do ingrediente'),(6,'Cadastrar ração'),(7,'Atualizar ração'),(8,'Adicionar ingredientes na fórmula da ração'),(9,'Atualizar ingredientes na fórmula da ração'),(10,'Deletar ingrediente da fórmula da ração'),(11,'Comprar ração'),(12,'Produzir ração'),(13,'Acertar estoque da ração'),(14,'Deletar ração');
/*!40000 ALTER TABLE `acoes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categorias`
--

DROP TABLE IF EXISTS `categorias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categorias` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(30) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categorias`
--

LOCK TABLES `categorias` WRITE;
/*!40000 ALTER TABLE `categorias` DISABLE KEYS */;
INSERT INTO `categorias` VALUES (1,'Pré-inicial'),(2,'Inicial'),(3,'Recria'),(4,'Terminação'),(5,'Gestação'),(6,'Lactação'),(7,'Outros');
/*!40000 ALTER TABLE `categorias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `compras_ingrediente`
--

DROP TABLE IF EXISTS `compras_ingrediente`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `compras_ingrediente` (
  `id` int NOT NULL AUTO_INCREMENT,
  `data_compra` date NOT NULL,
  `id_ingrediente` int NOT NULL,
  `quantidade_bruta` decimal(10,2) NOT NULL,
  `pre_limpeza` decimal(10,2) NOT NULL,
  `quantidade_liquida` decimal(10,2) NOT NULL,
  `valor_unitario` decimal(10,2) NOT NULL,
  `valor_total` decimal(10,2) NOT NULL,
  `numero_nota` varchar(50) NOT NULL,
  `fornecedor` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `id_ingrediente` (`id_ingrediente`),
  CONSTRAINT `compras_ingrediente_ibfk_1` FOREIGN KEY (`id_ingrediente`) REFERENCES `ingredientes` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `compras_ingrediente`
--

LOCK TABLES `compras_ingrediente` WRITE;
/*!40000 ALTER TABLE `compras_ingrediente` DISABLE KEYS */;
/*!40000 ALTER TABLE `compras_ingrediente` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `compras_racao`
--

DROP TABLE IF EXISTS `compras_racao`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `compras_racao` (
  `id` int NOT NULL AUTO_INCREMENT,
  `data_compra` date NOT NULL,
  `id_racao` int NOT NULL,
  `quantidade` decimal(10,2) DEFAULT NULL,
  `valor_unitario` decimal(10,2) NOT NULL,
  `valor_total` decimal(10,2) NOT NULL,
  `numero_nota` varchar(50) NOT NULL,
  `fornecedor` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `id_racao` (`id_racao`),
  CONSTRAINT `compras_racao_ibfk_1` FOREIGN KEY (`id_racao`) REFERENCES `racoes` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `compras_racao`
--

LOCK TABLES `compras_racao` WRITE;
/*!40000 ALTER TABLE `compras_racao` DISABLE KEYS */;
/*!40000 ALTER TABLE `compras_racao` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fases_granja`
--

DROP TABLE IF EXISTS `fases_granja`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fases_granja` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(30) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fases_granja`
--

LOCK TABLES `fases_granja` WRITE;
/*!40000 ALTER TABLE `fases_granja` DISABLE KEYS */;
INSERT INTO `fases_granja` VALUES (1,'Reprodução'),(2,'Maternidade'),(3,'Creche'),(4,'Terminação');
/*!40000 ALTER TABLE `fases_granja` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `grupos`
--

DROP TABLE IF EXISTS `grupos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `grupos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(30) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `grupos`
--

LOCK TABLES `grupos` WRITE;
/*!40000 ALTER TABLE `grupos` DISABLE KEYS */;
INSERT INTO `grupos` VALUES (1,'Aditivo'),(2,'Aminoácidos'),(3,'Energético'),(4,'Fibrosos'),(5,'Lácteo'),(6,'Macro minerais'),(7,'Micro nutrientes'),(8,'Milho/sorgo'),(9,'Palatabilizantes'),(10,'Promotor e medicamento'),(11,'Protéicos'),(12,'Outros');
/*!40000 ALTER TABLE `grupos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ingrediente_racao`
--

DROP TABLE IF EXISTS `ingrediente_racao`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ingrediente_racao` (
  `id_ingrediente` int NOT NULL,
  `id_racao` int NOT NULL,
  `quantidade` float NOT NULL,
  KEY `id_ingrediente` (`id_ingrediente`),
  KEY `id_racao` (`id_racao`),
  CONSTRAINT `ingrediente_racao_ibfk_1` FOREIGN KEY (`id_ingrediente`) REFERENCES `ingredientes` (`id`),
  CONSTRAINT `ingrediente_racao_ibfk_2` FOREIGN KEY (`id_racao`) REFERENCES `racoes` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ingrediente_racao`
--

LOCK TABLES `ingrediente_racao` WRITE;
/*!40000 ALTER TABLE `ingrediente_racao` DISABLE KEYS */;
/*!40000 ALTER TABLE `ingrediente_racao` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ingredientes`
--

DROP TABLE IF EXISTS `ingredientes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ingredientes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(50) NOT NULL,
  `id_grupo` int NOT NULL,
  `estoque_minimo` decimal(10,2) NOT NULL,
  `estoque_atual` decimal(10,2) DEFAULT '0.00',
  PRIMARY KEY (`id`),
  KEY `id_grupo` (`id_grupo`),
  CONSTRAINT `ingredientes_ibfk_1` FOREIGN KEY (`id_grupo`) REFERENCES `grupos` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ingredientes`
--

LOCK TABLES `ingredientes` WRITE;
/*!40000 ALTER TABLE `ingredientes` DISABLE KEYS */;
/*!40000 ALTER TABLE `ingredientes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `producao_racao`
--

DROP TABLE IF EXISTS `producao_racao`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `producao_racao` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_racao` int NOT NULL,
  `data_producao` datetime NOT NULL,
  `id_usuario` int NOT NULL,
  `quantidade` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `id_racao` (`id_racao`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `producao_racao_ibfk_1` FOREIGN KEY (`id_racao`) REFERENCES `racoes` (`id`),
  CONSTRAINT `producao_racao_ibfk_2` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `producao_racao`
--

LOCK TABLES `producao_racao` WRITE;
/*!40000 ALTER TABLE `producao_racao` DISABLE KEYS */;
/*!40000 ALTER TABLE `producao_racao` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`%`*/ /*!50003 TRIGGER `atualizar_estoque_ingredientes` AFTER INSERT ON `producao_racao` FOR EACH ROW BEGIN
    CALL atualizarEstoque(NEW.id, NEW.quantidade);
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `racoes`
--

DROP TABLE IF EXISTS `racoes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `racoes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(50) NOT NULL,
  `id_categoria` int NOT NULL,
  `tipo_racao` enum('Produção própria','Comprada','Ambos') NOT NULL,
  `fase_utilizada` int NOT NULL,
  `batida` decimal(10,2) DEFAULT '0.00',
  `estoque_minimo` decimal(10,2) NOT NULL,
  `estoque_atual` decimal(10,2) DEFAULT '0.00',
  PRIMARY KEY (`id`),
  KEY `id_categoria` (`id_categoria`),
  KEY `fase_utilizada` (`fase_utilizada`),
  CONSTRAINT `racoes_ibfk_1` FOREIGN KEY (`id_categoria`) REFERENCES `categorias` (`id`),
  CONSTRAINT `racoes_ibfk_2` FOREIGN KEY (`fase_utilizada`) REFERENCES `fases_granja` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `racoes`
--

LOCK TABLES `racoes` WRITE;
/*!40000 ALTER TABLE `racoes` DISABLE KEYS */;
/*!40000 ALTER TABLE `racoes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `registros`
--

DROP TABLE IF EXISTS `registros`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `registros` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `data_registro` datetime NOT NULL,
  `id_usuario` int NOT NULL,
  `id_acao` int NOT NULL,
  `descricao` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `id_usuario` (`id_usuario`),
  KEY `id_acao` (`id_acao`),
  CONSTRAINT `registros_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `registros_ibfk_2` FOREIGN KEY (`id_acao`) REFERENCES `acoes` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `registros`
--

LOCK TABLES `registros` WRITE;
/*!40000 ALTER TABLE `registros` DISABLE KEYS */;
/*!40000 ALTER TABLE `registros` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(50) NOT NULL,
  `email` varchar(50) NOT NULL,
  `senha` varchar(100) NOT NULL,
  `telefone` varchar(20) NOT NULL,
  `status_usuario` enum('Ativo','Inativo') NOT NULL,
  `cargo` enum('Administrador','Funcionário') NOT NULL,
  `passwordResetToken` varchar(100) DEFAULT NULL,
  `passwordResetExpires` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'Felipe Cardoso','felipe@gmail.com','$2b$10$9FwsLe4DqYynCCHgz4YHyuOFI8W843N3uFpKPXN0wpxe6g9q2vbQ.','(14) 1234 - 5678','Ativo','Administrador',NULL,NULL);
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'fabrica_racao'
--

--
-- Dumping routines for database 'fabrica_racao'
--
/*!50003 DROP PROCEDURE IF EXISTS `atualizarEstoque` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `atualizarEstoque`(IN id_producao INT, IN quantidade_produzida INT)
BEGIN
    DECLARE ingredientes_racao INT;
    DECLARE id_ingrediente_update INT;
    DECLARE index_loop INT;
    DECLARE index_loop2 INT;
    DECLARE id_racao_update INT;
    DECLARE quantidade_ingrediente_batida DECIMAL(10, 2);
    DECLARE quantidade_ingrediente DECIMAL(10, 2);
    DECLARE quantidade_total DECIMAL(10, 2);
    DECLARE novo_estoque DECIMAL(10, 2);
    DECLARE estoque_agora DECIMAL(10, 2);
    DECLARE cursor_ingredientes CURSOR FOR
        SELECT id_ingrediente
        FROM ingrediente_racao
        WHERE id_racao = (SELECT id_racao FROM producao_racao WHERE id = id_producao);
    
    SELECT id_racao INTO id_racao_update FROM producao_racao WHERE id = id_producao;

    -- Contar os ingredientes da ração
    SELECT COUNT(*) INTO ingredientes_racao FROM ingrediente_racao WHERE id_racao = id_racao_update;

    SELECT batida INTO quantidade_total FROM racoes WHERE id = id_racao_update;

    SET index_loop = 1;

    OPEN cursor_ingredientes;

    WHILE index_loop <= ingredientes_racao DO

        FETCH NEXT FROM cursor_ingredientes INTO id_ingrediente_update;
        
        SELECT quantidade INTO quantidade_ingrediente FROM ingrediente_racao WHERE id_racao = id_racao_update AND id_ingrediente = id_ingrediente_update LIMIT index_loop;

        SET quantidade_ingrediente_batida = (quantidade_ingrediente / quantidade_total) * quantidade_produzida;
		
        SELECT estoque_atual INTO estoque_agora FROM ingredientes where id = id_ingrediente_update;
        SET novo_estoque = (estoque_agora - quantidade_ingrediente_batida);
        UPDATE ingredientes SET estoque_atual = novo_estoque WHERE id = id_ingrediente_update;
        
        SET index_loop = index_loop + 1;
    END WHILE;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-10-25 10:35:17
