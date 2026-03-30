CREATE DATABASE  IF NOT EXISTS `internship_job_portal` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `internship_job_portal`;
-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: internship_job_portal
-- ------------------------------------------------------
-- Server version	8.0.44

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
-- Table structure for table `applications`
--

DROP TABLE IF EXISTS `applications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `applications` (
  `application_id` int NOT NULL AUTO_INCREMENT,
  `job_id` int NOT NULL,
  `student_id` int NOT NULL,
  `cover_letter` text,
  `status` enum('pending','reviewed','shortlisted','rejected','accepted') DEFAULT 'pending',
  `applied_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `reviewed_at` timestamp NULL DEFAULT NULL,
  `feedback` text,
  PRIMARY KEY (`application_id`),
  UNIQUE KEY `unique_application` (`job_id`,`student_id`),
  KEY `student_id` (`student_id`),
  KEY `idx_status` (`status`),
  KEY `idx_applied_at` (`applied_at`),
  CONSTRAINT `applications_ibfk_1` FOREIGN KEY (`job_id`) REFERENCES `job_postings` (`job_id`) ON DELETE CASCADE,
  CONSTRAINT `applications_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `applications`
--

LOCK TABLES `applications` WRITE;
/*!40000 ALTER TABLE `applications` DISABLE KEYS */;
INSERT INTO `applications` VALUES (1,1,1,'ok','pending','2025-12-14 09:35:19',NULL,NULL);
/*!40000 ALTER TABLE `applications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bookmarks`
--

DROP TABLE IF EXISTS `bookmarks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bookmarks` (
  `bookmark_id` int NOT NULL AUTO_INCREMENT,
  `student_id` int NOT NULL,
  `job_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`bookmark_id`),
  UNIQUE KEY `unique_bookmark` (`student_id`,`job_id`),
  KEY `job_id` (`job_id`),
  CONSTRAINT `bookmarks_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE,
  CONSTRAINT `bookmarks_ibfk_2` FOREIGN KEY (`job_id`) REFERENCES `job_postings` (`job_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bookmarks`
--

LOCK TABLES `bookmarks` WRITE;
/*!40000 ALTER TABLE `bookmarks` DISABLE KEYS */;
/*!40000 ALTER TABLE `bookmarks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `education`
--

DROP TABLE IF EXISTS `education`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `education` (
  `education_id` int NOT NULL AUTO_INCREMENT,
  `student_id` int NOT NULL,
  `institution_name` varchar(255) NOT NULL,
  `degree` varchar(100) DEFAULT NULL,
  `field_of_study` varchar(100) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `gpa` decimal(3,2) DEFAULT NULL,
  `description` text,
  PRIMARY KEY (`education_id`),
  KEY `student_id` (`student_id`),
  CONSTRAINT `education_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `education`
--

LOCK TABLES `education` WRITE;
/*!40000 ALTER TABLE `education` DISABLE KEYS */;
/*!40000 ALTER TABLE `education` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employers`
--

DROP TABLE IF EXISTS `employers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employers` (
  `employer_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `company_name` varchar(255) NOT NULL,
  `company_description` text,
  `industry` varchar(100) DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` text,
  `city` varchar(100) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `logo_url` varchar(500) DEFAULT NULL,
  `verification_status` enum('pending','verified','rejected') DEFAULT 'pending',
  `verified_by` int DEFAULT NULL,
  `verified_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`employer_id`),
  UNIQUE KEY `user_id` (`user_id`),
  KEY `verified_by` (`verified_by`),
  KEY `idx_company_name` (`company_name`),
  CONSTRAINT `employers_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `employers_ibfk_2` FOREIGN KEY (`verified_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employers`
--

LOCK TABLES `employers` WRITE;
/*!40000 ALTER TABLE `employers` DISABLE KEYS */;
INSERT INTO `employers` VALUES (1,3,'e',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'verified',1,'2025-12-14 09:34:10'),(2,5,'test',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'verified',1,'2026-01-26 06:11:07');
/*!40000 ALTER TABLE `employers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_postings`
--

DROP TABLE IF EXISTS `job_postings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_postings` (
  `job_id` int NOT NULL AUTO_INCREMENT,
  `employer_id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `job_type` enum('internship','full-time','part-time','contract') NOT NULL,
  `location` varchar(255) DEFAULT NULL,
  `remote_option` tinyint(1) DEFAULT '0',
  `salary_min` decimal(10,2) DEFAULT NULL,
  `salary_max` decimal(10,2) DEFAULT NULL,
  `currency` varchar(10) DEFAULT 'USD',
  `required_skills` text,
  `required_education` varchar(255) DEFAULT NULL,
  `experience_level` enum('entry','junior','mid','senior') DEFAULT 'entry',
  `application_deadline` date DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`job_id`),
  KEY `employer_id` (`employer_id`),
  KEY `idx_job_type` (`job_type`),
  KEY `idx_location` (`location`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `job_postings_ibfk_1` FOREIGN KEY (`employer_id`) REFERENCES `employers` (`employer_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_postings`
--

LOCK TABLES `job_postings` WRITE;
/*!40000 ALTER TABLE `job_postings` DISABLE KEYS */;
INSERT INTO `job_postings` VALUES (1,1,'ok','ok','internship','ok',0,1.00,10000.00,'USD','java',NULL,'entry',NULL,1,'2025-12-14 09:34:54','2025-12-14 09:34:54'),(2,2,'test','test ok','internship','ok',0,1.00,500.00,'USD','java','','junior',NULL,1,'2026-01-26 06:11:51','2026-01-31 19:37:36');
/*!40000 ALTER TABLE `job_postings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `meetings`
--

DROP TABLE IF EXISTS `meetings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `meetings` (
  `meeting_id` int NOT NULL AUTO_INCREMENT,
  `organizer_id` int NOT NULL,
  `participant_id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `scheduled_at` timestamp NOT NULL,
  `duration_minutes` int DEFAULT '30',
  `status` enum('scheduled','confirmed','in_progress','completed','cancelled','rescheduled') DEFAULT 'scheduled',
  `meeting_link` varchar(500) DEFAULT NULL,
  `meeting_id_external` varchar(500) DEFAULT NULL,
  `application_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`meeting_id`),
  KEY `application_id` (`application_id`),
  KEY `idx_organizer` (`organizer_id`),
  KEY `idx_participant` (`participant_id`),
  KEY `idx_status` (`status`),
  KEY `idx_scheduled_at` (`scheduled_at`),
  CONSTRAINT `meetings_ibfk_1` FOREIGN KEY (`organizer_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `meetings_ibfk_2` FOREIGN KEY (`participant_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `meetings_ibfk_3` FOREIGN KEY (`application_id`) REFERENCES `applications` (`application_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `meetings`
--

LOCK TABLES `meetings` WRITE;
/*!40000 ALTER TABLE `meetings` DISABLE KEYS */;
INSERT INTO `meetings` VALUES (1,3,2,'Video Call','Instant video call','2025-12-14 10:02:05',60,'scheduled','/video-call/1d8c3907-1b16-4d3e-9e25-d51b7067fc54','1d8c3907-1b16-4d3e-9e25-d51b7067fc54',NULL,'2025-12-14 10:01:05','2025-12-14 10:01:05'),(2,2,3,'Video Call','Instant video call','2025-12-14 10:19:39',60,'scheduled','/video-call/cbb4697f-c7b0-4582-b38b-bb58614d6817','cbb4697f-c7b0-4582-b38b-bb58614d6817',NULL,'2025-12-14 10:18:39','2025-12-14 10:18:39'),(3,3,2,'Video Call','Instant video call','2025-12-14 10:27:37',60,'completed','/video-call/8ed63914-d3d2-4855-8559-3455ae6b9bf7','8ed63914-d3d2-4855-8559-3455ae6b9bf7',NULL,'2025-12-14 10:26:37','2025-12-14 10:28:41'),(4,3,2,'Video Call','Instant video call','2025-12-14 11:19:42',60,'completed','/video-call/5738cb78-8877-4c09-9916-3fe5474943c1','5738cb78-8877-4c09-9916-3fe5474943c1',NULL,'2025-12-14 11:18:42','2025-12-14 11:20:43'),(5,3,2,'Video Call','Instant video call','2025-12-14 13:53:22',60,'completed','/video-call/d9b0aaf9-cafe-4b14-8379-ec81a0735da6','d9b0aaf9-cafe-4b14-8379-ec81a0735da6',NULL,'2025-12-14 13:52:22','2025-12-14 13:56:00'),(6,2,3,'Video Call','Instant video call','2025-12-14 13:58:17',60,'completed','/video-call/de2ee429-fe55-4caf-b16e-3e7cd5c14b52','de2ee429-fe55-4caf-b16e-3e7cd5c14b52',NULL,'2025-12-14 13:57:17','2025-12-14 13:58:19'),(7,2,3,'Video Call','Instant video call','2025-12-14 13:59:36',60,'completed','/video-call/07e5fabe-b593-403e-8f65-ae65907fbcd4','07e5fabe-b593-403e-8f65-ae65907fbcd4',NULL,'2025-12-14 13:58:36','2025-12-14 14:00:34'),(8,3,2,'ok','ok','2025-12-14 14:02:00',30,'scheduled',NULL,NULL,NULL,'2025-12-14 14:02:42','2025-12-14 14:02:42'),(9,3,2,'Video Call','Instant video call','2025-12-14 14:04:51',60,'completed','/video-call/5f65aab8-646c-4683-840c-47c7e416bcc9','5f65aab8-646c-4683-840c-47c7e416bcc9',NULL,'2025-12-14 14:03:51','2025-12-14 14:05:51'),(10,2,3,'Video Call','Instant video call','2025-12-14 14:10:37',60,'completed','/video-call/301594f8-2508-4d1b-9171-354a3013d271','301594f8-2508-4d1b-9171-354a3013d271',NULL,'2025-12-14 14:09:37','2025-12-14 14:12:12'),(11,2,3,'Video Call','Instant video call','2025-12-14 14:18:39',60,'completed','/video-call/5d5435ac-ff6d-4203-a376-6eedeffbf665','5d5435ac-ff6d-4203-a376-6eedeffbf665',NULL,'2025-12-14 14:17:39','2025-12-14 14:20:03'),(12,3,2,'Video Call','Instant video call','2025-12-14 14:24:24',60,'completed','/video-call/f18da951-4918-46aa-a93b-ecb57d2eda48','f18da951-4918-46aa-a93b-ecb57d2eda48',NULL,'2025-12-14 14:23:24','2025-12-14 14:27:47'),(13,2,3,'Video Call','Instant video call','2025-12-14 14:29:27',60,'completed','/video-call/4f563ed4-5d9d-41fe-92a9-6b99763310e8','4f563ed4-5d9d-41fe-92a9-6b99763310e8',NULL,'2025-12-14 14:28:27','2025-12-14 14:32:13'),(14,2,3,'Video Call','Instant video call','2025-12-14 14:34:47',60,'completed','/video-call/6277bba4-1d5d-4144-8c2f-c70d45e2f7a2','6277bba4-1d5d-4144-8c2f-c70d45e2f7a2',NULL,'2025-12-14 14:33:47','2025-12-14 14:35:35'),(15,2,3,'Video Call','Instant video call','2025-12-14 14:39:40',60,'completed','/video-call/60816e79-d11e-4e36-b83b-08764ef095a7','60816e79-d11e-4e36-b83b-08764ef095a7',NULL,'2025-12-14 14:38:40','2025-12-14 14:40:02'),(16,2,3,'Video Call','Instant video call','2025-12-14 14:46:53',60,'completed','/video-call/5aadf584-325c-48e5-b8dc-c22347bacfb8','5aadf584-325c-48e5-b8dc-c22347bacfb8',NULL,'2025-12-14 14:45:53','2025-12-14 14:47:07'),(17,2,3,'Video Call','Instant video call','2025-12-14 14:52:37',60,'in_progress','/video-call/8bb84bf2-c319-4a22-9dcd-9eca95ceb099','8bb84bf2-c319-4a22-9dcd-9eca95ceb099',NULL,'2025-12-14 14:51:37','2025-12-14 14:54:34'),(18,2,3,'Video Call','Instant video call','2025-12-14 15:20:09',60,'completed','/video-call/72495bfb-c1f1-4d32-bea1-ff9b3f44ed36','72495bfb-c1f1-4d32-bea1-ff9b3f44ed36',NULL,'2025-12-14 15:19:09','2025-12-14 15:22:43'),(19,2,3,'Video Call','Instant video call','2025-12-14 15:26:04',60,'completed','/video-call/cf9e1517-ffbf-4a32-968a-d7b331e60c1c','cf9e1517-ffbf-4a32-968a-d7b331e60c1c',NULL,'2025-12-14 15:25:04','2025-12-14 15:27:13'),(20,3,2,'aaj','aaj','2025-12-14 15:28:00',30,'scheduled',NULL,NULL,NULL,'2025-12-14 15:27:55','2025-12-14 15:27:55'),(21,3,2,'ok','ok','2025-12-14 15:33:00',30,'scheduled',NULL,NULL,NULL,'2025-12-14 15:28:47','2025-12-14 15:28:47'),(22,3,2,'abhi','abhi','2025-12-14 15:38:00',30,'completed','/video-call/f9477e4b-99f5-4eb7-ae76-530916e6e79d','f9477e4b-99f5-4eb7-ae76-530916e6e79d',NULL,'2025-12-14 15:33:13','2025-12-14 15:34:46'),(23,2,3,'Video Call','Instant video call','2025-12-21 17:07:52',60,'completed','/video-call/b4de107b-579c-4fe8-a5a4-b0407ba0565a','b4de107b-579c-4fe8-a5a4-b0407ba0565a',NULL,'2025-12-21 17:06:52','2025-12-21 17:07:46');
/*!40000 ALTER TABLE `meetings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `messages`
--

DROP TABLE IF EXISTS `messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `messages` (
  `message_id` int NOT NULL AUTO_INCREMENT,
  `application_id` int DEFAULT NULL,
  `sender_id` int NOT NULL,
  `receiver_id` int NOT NULL,
  `subject` varchar(255) DEFAULT NULL,
  `message_text` text NOT NULL,
  `message_type` enum('text','image','video','document','voice','meeting') DEFAULT 'text',
  `file_url` varchar(500) DEFAULT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `file_type` varchar(50) DEFAULT NULL,
  `file_size` bigint DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`message_id`),
  KEY `application_id` (`application_id`),
  KEY `sender_id` (`sender_id`),
  KEY `idx_receiver` (`receiver_id`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_message_type` (`message_type`),
  CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`application_id`) REFERENCES `applications` (`application_id`) ON DELETE SET NULL,
  CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`sender_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `messages_ibfk_3` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `messages`
--

LOCK TABLES `messages` WRITE;
/*!40000 ALTER TABLE `messages` DISABLE KEYS */;
INSERT INTO `messages` VALUES (1,NULL,3,2,NULL,'? WhatsApp Image 2025-11-21 at 9.24.33 AM (1).jpeg','image','/uploads/messages/images/506fca9e-ca84-40ae-962a-919acbb91f7d_WhatsApp Image 2025-11-21 at 9.24.33 AM (1).jpeg','WhatsApp Image 2025-11-21 at 9.24.33 AM (1).jpeg','image/jpeg',68950,1,'2025-12-14 09:35:59'),(2,NULL,2,3,NULL,'? Voice message','voice','/uploads/messages/voice/b9a72dae-4673-4bc4-93bd-80e3282759d3_voice_1765722998575.webm','voice_1765722998575.webm','audio/webm;codecs=opus',6970,1,'2025-12-14 09:36:39'),(3,NULL,3,2,NULL,'? Voice message','voice','/uploads/messages/voice/1436e89e-a185-46f3-8fbc-0768beec6ecc_voice_1765723536727.webm','voice_1765723536727.webm','audio/webm;codecs=opus',3074,1,'2025-12-14 09:45:37'),(4,NULL,3,2,NULL,'? Voice message','voice','/uploads/messages/voice/40e93121-d81b-4d2f-8616-bf4cbf526d7c_voice_1765723542852.webm','voice_1765723542852.webm','audio/webm;codecs=opus',4040,1,'2025-12-14 09:45:43'),(5,NULL,3,2,NULL,'? Voice message','voice','/uploads/messages/voice/bd9ffc03-189e-43f3-8f2d-2fa79ddac8ac_voice_1765723558814.webm','voice_1765723558814.webm','audio/webm;codecs=opus',124815,1,'2025-12-14 09:45:59'),(6,NULL,2,3,NULL,'? Voice message','voice','/uploads/messages/voice/2689a33e-89f8-4957-af0b-873469d658bd_voice_1765724348402.webm','voice_1765724348402.webm','audio/webm;codecs=opus',90733,1,'2025-12-14 09:59:08'),(7,NULL,3,2,'Video Call Invitation','? Video call started. Click to join: http://localhost:3000/video-call/1d8c3907-1b16-4d3e-9e25-d51b7067fc54','meeting',NULL,NULL,NULL,NULL,1,'2025-12-14 10:01:05'),(8,NULL,3,2,NULL,'? Voice message','voice','/uploads/messages/voice/e7aba99f-8d0a-4c1d-be9e-7117fd7b3ff0_voice_1765724677155.webm','voice_1765724677155.webm','audio/webm;codecs=opus',43981,1,'2025-12-14 10:04:37'),(9,NULL,2,3,NULL,'? Voice message','voice','/uploads/messages/voice/937b69c4-b692-4a84-8885-b1e299e82ab8_voice_1765724895806.webm','voice_1765724895806.webm','audio/webm;codecs=opus',31311,1,'2025-12-14 10:08:16'),(10,NULL,3,2,NULL,'? Voice message','voice','/uploads/messages/voice/5a5248d7-2aef-49df-9c4a-dd5d6b584095_voice_1765725003132.webm','voice_1765725003132.webm','audio/webm;codecs=opus',7937,1,'2025-12-14 10:10:03'),(11,NULL,3,2,NULL,'? Voice message','voice','/uploads/messages/voice/dd991e0a-bc6d-4017-9c5a-d8fcfa1ba521_voice_1765725032582.webm','voice_1765725032582.webm','audio/webm;codecs=opus',56635,1,'2025-12-14 10:10:33'),(12,NULL,2,3,NULL,'? Voice message','voice','/uploads/messages/voice/822b93a2-8594-4921-a789-61dcc8063f3c_voice_1765725497385.webm','voice_1765725497385.webm','audio/webm;codecs=opus',54687,1,'2025-12-14 10:18:17'),(13,NULL,2,3,'Video Call Invitation','? Video call started. Click to join: http://localhost:3000/video-call/cbb4697f-c7b0-4582-b38b-bb58614d6817','meeting',NULL,NULL,NULL,NULL,1,'2025-12-14 10:18:39'),(14,NULL,3,2,'Video Call Invitation','? Video call started. Click to join: http://localhost:3000/video-call/8ed63914-d3d2-4855-8559-3455ae6b9bf7','meeting',NULL,NULL,NULL,NULL,1,'2025-12-14 10:26:37'),(15,NULL,3,2,'Video Call Invitation','? Video call started. Click to join: http://localhost:3000/video-call/5738cb78-8877-4c09-9916-3fe5474943c1','meeting',NULL,NULL,NULL,NULL,1,'2025-12-14 11:18:42'),(16,NULL,3,2,'Video Call Invitation','? Video call started. Click to join: http://localhost:3000/video-call/d9b0aaf9-cafe-4b14-8379-ec81a0735da6','meeting',NULL,NULL,NULL,NULL,1,'2025-12-14 13:52:23'),(17,NULL,2,3,'Video Call Invitation','? Video call started. Click to join: http://localhost:3000/video-call/de2ee429-fe55-4caf-b16e-3e7cd5c14b52','meeting',NULL,NULL,NULL,NULL,1,'2025-12-14 13:57:17'),(18,NULL,2,3,'Video Call Invitation','? Video call started. Click to join: http://localhost:3000/video-call/07e5fabe-b593-403e-8f65-ae65907fbcd4','meeting',NULL,NULL,NULL,NULL,1,'2025-12-14 13:58:36'),(19,NULL,3,2,'Video Call Invitation','? Video call started. Click to join: http://localhost:3000/video-call/5f65aab8-646c-4683-840c-47c7e416bcc9','meeting',NULL,NULL,NULL,NULL,1,'2025-12-14 14:03:52'),(20,NULL,2,3,'Video Call Invitation','? Video call started. Click to join: http://localhost:3000/video-call/301594f8-2508-4d1b-9171-354a3013d271','meeting',NULL,NULL,NULL,NULL,1,'2025-12-14 14:09:37'),(21,NULL,2,3,'Video Call Invitation','? Video call started. Click to join: http://localhost:3000/video-call/5d5435ac-ff6d-4203-a376-6eedeffbf665','meeting',NULL,NULL,NULL,NULL,1,'2025-12-14 14:17:39'),(22,NULL,3,2,'Video Call Invitation','? Video call started. Click to join: http://localhost:3000/video-call/f18da951-4918-46aa-a93b-ecb57d2eda48','meeting',NULL,NULL,NULL,NULL,1,'2025-12-14 14:23:24'),(23,NULL,2,3,'Video Call Invitation','? Video call started. Click to join: http://localhost:3000/video-call/4f563ed4-5d9d-41fe-92a9-6b99763310e8','meeting',NULL,NULL,NULL,NULL,1,'2025-12-14 14:28:27'),(24,NULL,2,3,'Video Call Invitation','? Video call started. Click to join: http://localhost:3000/video-call/6277bba4-1d5d-4144-8c2f-c70d45e2f7a2','meeting',NULL,NULL,NULL,NULL,1,'2025-12-14 14:33:47'),(25,NULL,2,3,'Video Call Invitation','? Video call started. Click to join: http://localhost:3000/video-call/60816e79-d11e-4e36-b83b-08764ef095a7','meeting',NULL,NULL,NULL,NULL,1,'2025-12-14 14:38:40'),(26,NULL,2,3,'Video Call Invitation','? Video call started. Click to join: http://localhost:3000/video-call/5aadf584-325c-48e5-b8dc-c22347bacfb8','meeting',NULL,NULL,NULL,NULL,1,'2025-12-14 14:45:53'),(27,NULL,2,3,'Video Call Invitation','? Video call started. Click to join: http://localhost:3000/video-call/8bb84bf2-c319-4a22-9dcd-9eca95ceb099','meeting',NULL,NULL,NULL,NULL,1,'2025-12-14 14:51:37'),(28,NULL,2,3,'Video Call Invitation','? Video call started. Click to join: http://localhost:3000/video-call/72495bfb-c1f1-4d32-bea1-ff9b3f44ed36','meeting',NULL,NULL,NULL,NULL,1,'2025-12-14 15:19:09'),(29,NULL,2,3,'Video Call Invitation','? Video call started. Click to join: http://localhost:3000/video-call/cf9e1517-ffbf-4a32-968a-d7b331e60c1c','meeting',NULL,NULL,NULL,NULL,1,'2025-12-14 15:25:04'),(30,NULL,3,2,'Meeting Scheduled','? Meeting scheduled: \"abhi\"\n? Date: 15/12/2025, 01:38:00\n⏱️ Duration: 30 minutes\n\nJoin here: http://localhost:3000/video-call/f9477e4b-99f5-4eb7-ae76-530916e6e79d','meeting',NULL,NULL,NULL,NULL,1,'2025-12-14 15:33:13'),(31,NULL,3,2,NULL,'? Voice message','voice','/uploads/messages/voice/e434c3a7-1e69-4f79-9a06-10f3f43657d1_voice_1765744553736.webm','voice_1765744553736.webm','audio/webm;codecs=opus',52739,1,'2025-12-14 15:35:54'),(32,NULL,2,3,NULL,'? Voice message','voice','/uploads/messages/voice/5a1d91d4-1d1a-429a-bf2e-069f16881735_voice_1765744780572.webm','voice_1765744780572.webm','audio/webm;codecs=opus',2093,1,'2025-12-14 15:39:41'),(33,NULL,2,3,NULL,'? Voice message','voice','/uploads/messages/voice/0653d76f-b363-4884-b95b-c85f1845efcc_voice_1765744787124.webm','voice_1765744787124.webm','audio/webm;codecs=opus',35207,1,'2025-12-14 15:39:47'),(34,NULL,3,2,NULL,'? Voice message','voice','/uploads/messages/voice/8e4c0880-fd9b-4582-8b3d-48a38b566c9b_voice_1766354778293.webm','voice_1766354778293.webm','audio/webm;codecs=opus',12813,1,'2025-12-21 17:06:18'),(35,NULL,2,3,'Video Call Invitation','? Video call started. Click to join: http://localhost:3000/video-call/b4de107b-579c-4fe8-a5a4-b0407ba0565a','meeting',NULL,NULL,NULL,NULL,1,'2025-12-21 17:06:52'),(36,NULL,3,2,NULL,'? Voice message','voice','/uploads/messages/voice/8f3bb86d-180a-428f-a425-90c7659752e5_voice_1766354889187.webm','voice_1766354889187.webm','audio/webm;codecs=opus',55669,1,'2025-12-21 17:08:09');
/*!40000 ALTER TABLE `messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `notification_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `type` varchar(50) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `link` varchar(500) DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`notification_id`),
  KEY `idx_user_read` (`user_id`,`is_read`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=61 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (2,2,'new_message','New Message Received','You have a new message from e@e.com','/messages',0,'2025-12-14 09:35:59'),(4,2,'new_message','New Message Received','You have a new message from e@e.com','/messages',0,'2025-12-14 09:45:37'),(5,2,'new_message','New Message Received','You have a new message from e@e.com','/messages',0,'2025-12-14 09:45:43'),(6,2,'new_message','New Message Received','You have a new message from e@e.com','/messages',0,'2025-12-14 09:45:59'),(8,2,'meeting_scheduled','New Meeting Scheduled','You have a meeting scheduled: Video Call on Dec 14, 2025 at 03:02 PM','/messages',1,'2025-12-14 10:01:05'),(9,2,'new_message','New Message Received','You have a new message from e@e.com','/messages',0,'2025-12-14 10:01:05'),(10,2,'new_message','New Message Received','You have a new message from e@e.com','/messages',0,'2025-12-14 10:04:37'),(11,3,'new_message','New Message Received','You have a new message from s@s.com','/messages',0,'2025-12-14 10:08:16'),(12,2,'new_message','New Message Received','You have a new message from e@e.com','/messages',0,'2025-12-14 10:10:03'),(13,2,'new_message','New Message Received','You have a new message from e@e.com','/messages',0,'2025-12-14 10:10:33'),(14,3,'new_message','New Message Received','You have a new message from s@s.com','/messages',0,'2025-12-14 10:18:17'),(15,3,'meeting_scheduled','New Meeting Scheduled','You have a meeting scheduled: Video Call on Dec 14, 2025 at 03:19 PM','/messages',0,'2025-12-14 10:18:39'),(16,3,'new_message','New Message Received','You have a new message from s@s.com','/messages',0,'2025-12-14 10:18:39'),(17,2,'meeting_scheduled','New Meeting Scheduled','You have a meeting scheduled: Video Call on Dec 14, 2025 at 03:27 PM','/messages',0,'2025-12-14 10:26:37'),(18,2,'new_message','New Message Received','You have a new message from e@e.com','/messages',0,'2025-12-14 10:26:37'),(19,2,'meeting_scheduled','New Meeting Scheduled','You have a meeting scheduled: Video Call on Dec 14, 2025 at 04:19 PM','/messages',0,'2025-12-14 11:18:42'),(20,2,'new_message','New Message Received','You have a new message from e@e.com','/messages',0,'2025-12-14 11:18:42'),(21,2,'meeting_scheduled','New Meeting Scheduled','You have a meeting scheduled: Video Call on Dec 14, 2025 at 06:53 PM','/messages',0,'2025-12-14 13:52:23'),(22,2,'new_message','New Message Received','You have a new message from e@e.com','/messages',0,'2025-12-14 13:52:23'),(23,3,'meeting_scheduled','New Meeting Scheduled','You have a meeting scheduled: Video Call on Dec 14, 2025 at 06:58 PM','/messages',0,'2025-12-14 13:57:17'),(24,3,'new_message','New Message Received','You have a new message from s@s.com','/messages',0,'2025-12-14 13:57:17'),(25,3,'meeting_scheduled','New Meeting Scheduled','You have a meeting scheduled: Video Call on Dec 14, 2025 at 06:59 PM','/messages',0,'2025-12-14 13:58:36'),(26,3,'new_message','New Message Received','You have a new message from s@s.com','/messages',0,'2025-12-14 13:58:36'),(27,2,'meeting_scheduled','New Meeting Scheduled','You have a meeting scheduled: ok on Dec 14, 2025 at 07:02 PM','/messages',0,'2025-12-14 14:02:42'),(28,2,'meeting_scheduled','New Meeting Scheduled','You have a meeting scheduled: Video Call on Dec 14, 2025 at 07:04 PM','/messages',0,'2025-12-14 14:03:52'),(29,2,'new_message','New Message Received','You have a new message from e@e.com','/messages',0,'2025-12-14 14:03:52'),(30,3,'meeting_scheduled','New Meeting Scheduled','You have a meeting scheduled: Video Call on Dec 14, 2025 at 07:10 PM','/messages',0,'2025-12-14 14:09:37'),(31,3,'new_message','New Message Received','You have a new message from s@s.com','/messages',0,'2025-12-14 14:09:37'),(32,3,'meeting_scheduled','New Meeting Scheduled','You have a meeting scheduled: Video Call on Dec 14, 2025 at 07:18 PM','/messages',0,'2025-12-14 14:17:39'),(33,3,'new_message','New Message Received','You have a new message from s@s.com','/messages',0,'2025-12-14 14:17:39'),(34,2,'meeting_scheduled','New Meeting Scheduled','You have a meeting scheduled: Video Call on Dec 14, 2025 at 07:24 PM','/messages',0,'2025-12-14 14:23:24'),(35,2,'new_message','New Message Received','You have a new message from e@e.com','/messages',0,'2025-12-14 14:23:24'),(36,3,'meeting_scheduled','New Meeting Scheduled','You have a meeting scheduled: Video Call on Dec 14, 2025 at 07:29 PM','/messages',0,'2025-12-14 14:28:27'),(37,3,'new_message','New Message Received','You have a new message from s@s.com','/messages',0,'2025-12-14 14:28:27'),(38,3,'meeting_scheduled','New Meeting Scheduled','You have a meeting scheduled: Video Call on Dec 14, 2025 at 07:34 PM','/messages',0,'2025-12-14 14:33:47'),(39,3,'new_message','New Message Received','You have a new message from s@s.com','/messages',0,'2025-12-14 14:33:47'),(40,3,'meeting_scheduled','New Meeting Scheduled','You have a meeting scheduled: Video Call on Dec 14, 2025 at 07:39 PM','/messages',0,'2025-12-14 14:38:40'),(41,3,'new_message','New Message Received','You have a new message from s@s.com','/messages',0,'2025-12-14 14:38:40'),(42,3,'meeting_scheduled','New Meeting Scheduled','You have a meeting scheduled: Video Call on Dec 14, 2025 at 07:46 PM','/messages',0,'2025-12-14 14:45:53'),(43,3,'new_message','New Message Received','You have a new message from s@s.com','/messages',0,'2025-12-14 14:45:53'),(44,3,'meeting_scheduled','New Meeting Scheduled','You have a meeting scheduled: Video Call on Dec 14, 2025 at 07:52 PM','/messages',0,'2025-12-14 14:51:37'),(45,3,'new_message','New Message Received','You have a new message from s@s.com','/messages',0,'2025-12-14 14:51:37'),(46,3,'meeting_scheduled','New Meeting Scheduled','You have a meeting scheduled: Video Call on Dec 14, 2025 at 08:20 PM','/messages',0,'2025-12-14 15:19:09'),(47,3,'new_message','New Message Received','You have a new message from s@s.com','/messages',0,'2025-12-14 15:19:09'),(48,3,'meeting_scheduled','New Meeting Scheduled','You have a meeting scheduled: Video Call on Dec 14, 2025 at 08:26 PM','/messages',0,'2025-12-14 15:25:04'),(49,3,'new_message','New Message Received','You have a new message from s@s.com','/messages',0,'2025-12-14 15:25:04'),(50,2,'meeting_scheduled','New Meeting Scheduled','You have a meeting scheduled: aaj on Dec 14, 2025 at 08:28 PM','/messages',0,'2025-12-14 15:27:55'),(51,2,'meeting_scheduled','New Meeting Scheduled','You have a meeting scheduled: ok on Dec 14, 2025 at 08:33 PM','/messages',0,'2025-12-14 15:28:47'),(52,2,'meeting_scheduled','New Meeting Scheduled','You have a meeting scheduled: abhi on Dec 14, 2025 at 08:38 PM','/messages',0,'2025-12-14 15:33:13'),(53,2,'new_message','New Message Received','You have a new message from e@e.com','/messages',0,'2025-12-14 15:33:13'),(54,2,'new_message','New Message Received','You have a new message from e@e.com','/messages',0,'2025-12-14 15:35:54'),(55,3,'new_message','New Message Received','You have a new message from s@s.com','/messages',0,'2025-12-14 15:39:41'),(56,3,'new_message','New Message Received','You have a new message from s@s.com','/messages',0,'2025-12-14 15:39:47'),(57,2,'new_message','New Message Received','You have a new message from e@e.com','/messages',0,'2025-12-21 17:06:19'),(58,3,'meeting_scheduled','New Meeting Scheduled','You have a meeting scheduled: Video Call on Dec 21, 2025 at 10:07 PM','/messages',0,'2025-12-21 17:06:52'),(59,3,'new_message','New Message Received','You have a new message from s@s.com','/messages',0,'2025-12-21 17:06:52'),(60,2,'new_message','New Message Received','You have a new message from e@e.com','/messages',0,'2025-12-21 17:08:09');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_reset_tokens` (
  `token_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `token` varchar(255) NOT NULL,
  `expires_at` timestamp NOT NULL,
  `used` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`token_id`),
  UNIQUE KEY `token` (`token`),
  KEY `user_id` (`user_id`),
  KEY `idx_token` (`token`),
  CONSTRAINT `password_reset_tokens_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_tokens`
--

LOCK TABLES `password_reset_tokens` WRITE;
/*!40000 ALTER TABLE `password_reset_tokens` DISABLE KEYS */;
INSERT INTO `password_reset_tokens` VALUES (1,2,'1067fe11-955b-4bde-9b74-9637c0fe529256b0f5eb-478a-43aa-9a0a-23c8794c977e','2025-12-29 10:21:33',1),(2,2,'71318783-3a45-41e0-956a-d63922769063f963d9ed-b9a9-4e79-83f0-eaf8d43e34cb','2025-12-29 10:33:24',0);
/*!40000 ALTER TABLE `password_reset_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_skills`
--

DROP TABLE IF EXISTS `student_skills`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `student_skills` (
  `skill_id` int NOT NULL AUTO_INCREMENT,
  `student_id` int NOT NULL,
  `skill_name` varchar(100) NOT NULL,
  `proficiency_level` enum('beginner','intermediate','advanced','expert') DEFAULT 'intermediate',
  PRIMARY KEY (`skill_id`),
  KEY `student_id` (`student_id`),
  KEY `idx_skill` (`skill_name`),
  CONSTRAINT `student_skills_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_skills`
--

LOCK TABLES `student_skills` WRITE;
/*!40000 ALTER TABLE `student_skills` DISABLE KEYS */;
/*!40000 ALTER TABLE `student_skills` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `students`
--

DROP TABLE IF EXISTS `students`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `students` (
  `student_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `address` text,
  `city` varchar(100) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `resume_url` varchar(500) DEFAULT NULL,
  `profile_picture_url` varchar(500) DEFAULT NULL,
  `bio` text,
  PRIMARY KEY (`student_id`),
  UNIQUE KEY `user_id` (`user_id`),
  KEY `idx_name` (`first_name`,`last_name`),
  CONSTRAINT `students_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `students`
--

LOCK TABLES `students` WRITE;
/*!40000 ALTER TABLE `students` DISABLE KEYS */;
INSERT INTO `students` VALUES (1,2,'s','s',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(3,6,'s','1',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `students` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `system_logs`
--

DROP TABLE IF EXISTS `system_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `system_logs` (
  `log_id` int NOT NULL AUTO_INCREMENT,
  `admin_id` int NOT NULL,
  `action_type` varchar(100) NOT NULL,
  `target_user_id` int DEFAULT NULL,
  `description` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`log_id`),
  KEY `admin_id` (`admin_id`),
  KEY `target_user_id` (`target_user_id`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `system_logs_ibfk_1` FOREIGN KEY (`admin_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `system_logs_ibfk_2` FOREIGN KEY (`target_user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `system_logs`
--

LOCK TABLES `system_logs` WRITE;
/*!40000 ALTER TABLE `system_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `system_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `user_type` enum('student','employer','admin') NOT NULL,
  `is_verified` tinyint(1) DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_banned` tinyint(1) DEFAULT '0',
  `banned_until` datetime DEFAULT NULL,
  `ban_reason` text,
  `verification_code` varchar(10) DEFAULT NULL,
  `verification_code_expires_at` datetime DEFAULT NULL,
  `verification_attempts` int DEFAULT '0',
  `last_verification_attempt_at` datetime DEFAULT NULL,
  `resend_code_attempts` int DEFAULT '0',
  `last_resend_code_at` datetime DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_email` (`email`),
  KEY `idx_user_type` (`user_type`),
  KEY `idx_is_banned` (`is_banned`),
  KEY `idx_banned_until` (`banned_until`),
  KEY `idx_verification_code` (`verification_code`),
  KEY `idx_verification_code_expires_at` (`verification_code_expires_at`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin@portal.com','$2a$11$Wr5/05H7/82nzQVq7khcOO//eLg23YNtbGJJhz8aHgFbqetvjGpnG','admin',1,1,'2025-12-14 14:30:05','2026-02-21 10:42:21',0,NULL,NULL,NULL,NULL,0,NULL,0,NULL),(2,'s@s.com','$2a$11$30ytbp8KSdgaFLWrw/Ui7ONl9xBbsGOgWhJbdM9CSyPwFiV1omFbe','student',0,1,'2025-12-14 09:33:09','2025-12-14 09:33:09',0,NULL,NULL,NULL,NULL,0,NULL,0,NULL),(3,'e@e.com','$2a$11$46ShFuqy8mDKXxNj.Ww5j.7qfdssoPaQo8Y5dN0uxKjoFJDXKVeka','employer',0,0,'2025-12-14 09:33:32','2026-01-31 19:36:45',0,'2026-02-04 00:36:45',NULL,NULL,NULL,0,NULL,0,NULL),(5,'taimoorto12345@gmail.com','$2a$11$s3L5nvAAiKv4WOuvVSf8dOfakg/b8GmfD8O0jTVYjWuD2mgTJt9vy','employer',1,1,'2026-01-26 06:09:06','2026-01-26 06:09:34',0,NULL,NULL,NULL,NULL,0,NULL,0,NULL),(6,'s1@s.com','$2a$11$hV5UGDfvNNPCttOJNF.m/OVP6gqqLB.GyEpWpSr4LKgAiwFq1C2Fq','student',0,1,'2026-01-31 19:36:04','2026-01-31 19:36:04',0,NULL,NULL,'160973','2026-02-01 00:46:04',0,NULL,0,NULL);
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

-- Dump completed on 2026-03-30  5:02:39
