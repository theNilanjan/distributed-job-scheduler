-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: job_scheduler
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'SUPER_ADMIN','Full platform administrator'),(2,'ORG_ADMIN','Organization administrator'),(3,'PROJECT_ADMIN','Project administrator'),(4,'DEVELOPER','Can create and operate jobs'),(5,'VIEWER','Read-only access'),(6,'WORKER','Worker runtime identity');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Platform Admin','admin@jobscheduler.local','$2b$12$cJrKW3LK4iJEKn5fEm18SulIQCzGRSbcE8NQ5n94lc6FPzvhKhXX.','ACTIVE',NULL,'2026-07-04 09:00:44','2026-07-04 09:00:44');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `user_roles`
--

LOCK TABLES `user_roles` WRITE;
/*!40000 ALTER TABLE `user_roles` DISABLE KEYS */;
INSERT INTO `user_roles` VALUES (1,1);
/*!40000 ALTER TABLE `user_roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `organizations`
--

LOCK TABLES `organizations` WRITE;
/*!40000 ALTER TABLE `organizations` DISABLE KEYS */;
INSERT INTO `organizations` VALUES (1,'Acme University Labs','acme-university-labs','Sample organization for the job scheduling demo.','2026-07-04 09:00:44','2026-07-04 09:00:44');
/*!40000 ALTER TABLE `organizations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `organization_members`
--

LOCK TABLES `organization_members` WRITE;
/*!40000 ALTER TABLE `organization_members` DISABLE KEYS */;
INSERT INTO `organization_members` VALUES (1,1,1,'ORG_ADMIN','2026-07-04 09:00:44','2026-07-04 09:00:44');
/*!40000 ALTER TABLE `organization_members` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `projects`
--

LOCK TABLES `projects` WRITE;
/*!40000 ALTER TABLE `projects` DISABLE KEYS */;
INSERT INTO `projects` VALUES (1,1,'Data Processing Platform','DPP','Sample project containing queues and jobs.','ACTIVE','2026-07-04 09:00:44','2026-07-04 09:00:44');
/*!40000 ALTER TABLE `projects` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `project_members`
--

LOCK TABLES `project_members` WRITE;
/*!40000 ALTER TABLE `project_members` DISABLE KEYS */;
INSERT INTO `project_members` VALUES (1,1,1,'PROJECT_ADMIN','2026-07-04 09:00:44','2026-07-04 09:00:44');
/*!40000 ALTER TABLE `project_members` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `retry_policies`
--

LOCK TABLES `retry_policies` WRITE;
/*!40000 ALTER TABLE `retry_policies` DISABLE KEYS */;
INSERT INTO `retry_policies` VALUES (1,'Fixed 30s x3','FIXED',3,30,300,1,'2026-07-04 09:00:44','2026-07-04 09:00:44'),(2,'Linear 60s x5','LINEAR',5,60,900,1,'2026-07-04 09:00:44','2026-07-04 09:00:44'),(3,'Exponential 15s x6','EXPONENTIAL',6,15,1800,1,'2026-07-04 09:00:44','2026-07-04 09:00:44');
/*!40000 ALTER TABLE `retry_policies` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `job_queues`
--

LOCK TABLES `job_queues` WRITE;
/*!40000 ALTER TABLE `job_queues` DISABLE KEYS */;
INSERT INTO `job_queues` VALUES (1,1,3,'High Priority ETL','high-priority-etl','ACTIVE',100,5,120,'etl-a','2026-07-04 09:00:44','2026-07-04 09:00:44'),(2,1,1,'Reports','reports','PAUSED',20,2,30,'reports-a','2026-07-04 09:00:44','2026-07-04 09:00:44');
/*!40000 ALTER TABLE `job_queues` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `jobs`
--

LOCK TABLES `jobs` WRITE;
/*!40000 ALTER TABLE `jobs` DISABLE KEYS */;
INSERT INTO `jobs` VALUES (1,1,NULL,'seed-job-1','IMMEDIATE','QUEUED','Seed ETL Import','{\"dataset\": \"students\", \"operation\": \"import\"}',50,0,3,'2026-07-04 09:00:44',NULL,NULL,NULL,NULL,NULL,NULL,NULL,300,'2026-07-04 09:00:44','2026-07-04 09:00:44');
/*!40000 ALTER TABLE `jobs` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-07-04 14:38:23
