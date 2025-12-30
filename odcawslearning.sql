-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : jeu. 25 déc. 2025 à 16:01
-- Version du serveur : 10.4.32-MariaDB
-- Version de PHP : 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `odcawslearning`
--

-- --------------------------------------------------------

--
-- Structure de la table `answers`
--

CREATE TABLE `answers` (
  `id` bigint(20) NOT NULL,
  `activate` bit(1) NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `created_by` varchar(255) DEFAULT NULL,
  `last_modified_at` datetime DEFAULT NULL,
  `modified_by` varchar(255) DEFAULT NULL,
  `infoTest_id` bigint(20) DEFAULT NULL,
  `question_id` bigint(20) DEFAULT NULL,
  `reponse_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `apprenants`
--

CREATE TABLE `apprenants` (
  `id` bigint(20) NOT NULL,
  `activate` bit(1) NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `created_by` varchar(255) DEFAULT NULL,
  `last_modified_at` datetime DEFAULT NULL,
  `modified_by` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `filiere` varchar(255) DEFAULT NULL,
  `niveauEtude` varchar(255) DEFAULT NULL,
  `nom` longtext DEFAULT NULL,
  `numero` varchar(255) DEFAULT NULL,
  `prenom` varchar(255) DEFAULT NULL,
  `profession` varchar(255) DEFAULT NULL,
  `cohorte_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `categorie`
--

CREATE TABLE `categorie` (
  `id` bigint(20) NOT NULL,
  `activate` bit(1) NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `created_by` varchar(255) DEFAULT NULL,
  `last_modified_at` datetime DEFAULT NULL,
  `modified_by` varchar(255) DEFAULT NULL,
  `description` longtext DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `chapter`
--

CREATE TABLE `chapter` (
  `id` bigint(20) NOT NULL,
  `activate` bit(1) NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `created_by` varchar(255) DEFAULT NULL,
  `last_modified_at` datetime DEFAULT NULL,
  `modified_by` varchar(255) DEFAULT NULL,
  `chapterLink` varchar(255) DEFAULT NULL,
  `description` longtext DEFAULT NULL,
  `pdfPath` varchar(255) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `course_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `cohorte`
--

CREATE TABLE `cohorte` (
  `id` bigint(20) NOT NULL,
  `activate` bit(1) NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `created_by` varchar(255) DEFAULT NULL,
  `last_modified_at` datetime DEFAULT NULL,
  `modified_by` varchar(255) DEFAULT NULL,
  `dateDebut` datetime(6) DEFAULT NULL,
  `dateFin` datetime(6) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `nom` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `configuration`
--

CREATE TABLE `configuration` (
  `id` bigint(20) NOT NULL,
  `activate` bit(1) NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `created_by` varchar(255) DEFAULT NULL,
  `last_modified_at` datetime DEFAULT NULL,
  `modified_by` varchar(255) DEFAULT NULL,
  `aboutImageUrl` varchar(255) DEFAULT NULL,
  `aboutText` longtext DEFAULT NULL,
  `homepageImageUrl` varchar(255) DEFAULT NULL,
  `homepageText` longtext DEFAULT NULL,
  `loginImageUrl` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `courses`
--

CREATE TABLE `courses` (
  `id` bigint(20) NOT NULL,
  `activate` bit(1) NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `created_by` varchar(255) DEFAULT NULL,
  `last_modified_at` datetime DEFAULT NULL,
  `modified_by` varchar(255) DEFAULT NULL,
  `courseType` int(11) DEFAULT NULL,
  `description` longtext DEFAULT NULL,
  `duration` int(11) DEFAULT NULL,
  `imagePath` varchar(255) DEFAULT NULL,
  `price` decimal(19,2) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `categorie_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `details_course`
--

CREATE TABLE `details_course` (
  `id` bigint(20) NOT NULL,
  `activate` bit(1) NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `created_by` varchar(255) DEFAULT NULL,
  `last_modified_at` datetime DEFAULT NULL,
  `modified_by` varchar(255) DEFAULT NULL,
  `courseStatut` int(11) DEFAULT NULL,
  `course_id` bigint(20) DEFAULT NULL,
  `learner_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `evaluations`
--

CREATE TABLE `evaluations` (
  `id` bigint(20) NOT NULL,
  `activate` bit(1) NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `created_by` varchar(255) DEFAULT NULL,
  `last_modified_at` datetime DEFAULT NULL,
  `modified_by` varchar(255) DEFAULT NULL,
  `description` longtext DEFAULT NULL,
  `imagePath` varchar(255) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `infotest`
--

CREATE TABLE `infotest` (
  `id` bigint(20) NOT NULL,
  `activate` bit(1) NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `created_by` varchar(255) DEFAULT NULL,
  `last_modified_at` datetime DEFAULT NULL,
  `modified_by` varchar(255) DEFAULT NULL,
  `evaluations_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `lab_definition`
--

CREATE TABLE `lab_definition` (
  `id` bigint(20) NOT NULL,
  `activate` bit(1) NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `created_by` varchar(255) DEFAULT NULL,
  `last_modified_at` datetime DEFAULT NULL,
  `modified_by` varchar(255) DEFAULT NULL,
  `description` longtext DEFAULT NULL,
  `docker_image_name` varchar(255) DEFAULT NULL,
  `estimated_duration_minutes` int(11) DEFAULT NULL,
  `instructions` longtext DEFAULT NULL,
  `title` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `lab_definition`
--

INSERT INTO `lab_definition` (`id`, `activate`, `created_at`, `created_by`, `last_modified_at`, `modified_by`, `description`, `docker_image_name`, `estimated_duration_minutes`, `instructions`, `title`) VALUES
(1, b'1', '2025-12-25 14:57:38', NULL, NULL, NULL, 'Apprenez à lancer un conteneur et exposer le port 80.', 'nginx:latest', 30, '# Instructions pour le Lab Nginx\n\n## Objectif\nDéployer un serveur web Nginx dans un conteneur Docker et l\'exposer sur le port 80.\n\n## Étapes\n1. Lancez le conteneur avec la commande appropriée\n2. Vérifiez que le serveur répond sur le port 80\n3. Accédez à la page d\'accueil par défaut de Nginx\n\n## Commandes utiles\n- `docker run -d -p 80:80 nginx:latest`\n- `curl http://localhost`\n- `docker ps` pour voir les conteneurs actifs', 'Déploiement d\'un serveur Web Nginx'),
(2, b'1', '2025-12-25 14:57:38', NULL, NULL, NULL, 'Scripting AWS avec la librairie Boto3.', 'python:3.9-slim', 45, '# Instructions pour le Lab Python & Boto3\n\n## Objectif\nApprendre à utiliser la librairie Boto3 pour interagir avec les services AWS.\n\n## Étapes\n1. Installez Boto3 dans l\'environnement Python\n2. Configurez vos credentials AWS (via variables d\'environnement ou fichier ~/.aws/credentials)\n3. Créez un script Python qui liste vos buckets S3\n4. Exécutez le script et vérifiez le résultat\n\n## Exemple de code\n```python\nimport boto3\n\ns3 = boto3.client(\'s3\')\nresponse = s3.list_buckets()\nfor bucket in response[\'Buckets\']:\n    print(f\"Bucket: {bucket[\'Name\']}\")\n```\n\n## Commandes utiles\n- `pip install boto3`\n- `python script.py`', 'Introduction à Python & Boto3');

-- --------------------------------------------------------

--
-- Structure de la table `lab_session`
--

CREATE TABLE `lab_session` (
  `id` bigint(20) NOT NULL,
  `activate` bit(1) NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `created_by` varchar(255) DEFAULT NULL,
  `last_modified_at` datetime DEFAULT NULL,
  `modified_by` varchar(255) DEFAULT NULL,
  `container_url` varchar(255) DEFAULT NULL,
  `end_time` datetime DEFAULT NULL,
  `grade` varchar(255) DEFAULT NULL,
  `report_url` varchar(255) DEFAULT NULL,
  `start_time` datetime DEFAULT NULL,
  `status` varchar(255) NOT NULL,
  `lab_definition_id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `learner_chapter`
--

CREATE TABLE `learner_chapter` (
  `id` bigint(20) NOT NULL,
  `activate` bit(1) NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `created_by` varchar(255) DEFAULT NULL,
  `last_modified_at` datetime DEFAULT NULL,
  `modified_by` varchar(255) DEFAULT NULL,
  `chapter` tinyblob DEFAULT NULL,
  `learner` tinyblob DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `orders`
--

CREATE TABLE `orders` (
  `id` bigint(20) NOT NULL,
  `activate` bit(1) NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `created_by` varchar(255) DEFAULT NULL,
  `last_modified_at` datetime DEFAULT NULL,
  `modified_by` varchar(255) DEFAULT NULL,
  `order_date` datetime DEFAULT NULL,
  `payment_id` varchar(255) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `total_amount` decimal(10,2) DEFAULT NULL,
  `user_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `order_items`
--

CREATE TABLE `order_items` (
  `id` bigint(20) NOT NULL,
  `activate` bit(1) NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `created_by` varchar(255) DEFAULT NULL,
  `last_modified_at` datetime DEFAULT NULL,
  `modified_by` varchar(255) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `course_id` bigint(20) DEFAULT NULL,
  `order_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `payment_transactions`
--

CREATE TABLE `payment_transactions` (
  `id` bigint(20) NOT NULL,
  `activate` bit(1) NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `created_by` varchar(255) DEFAULT NULL,
  `last_modified_at` datetime DEFAULT NULL,
  `modified_by` varchar(255) DEFAULT NULL,
  `amount` decimal(10,2) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `stripe_payment_intent_id` varchar(255) DEFAULT NULL,
  `timestamp` datetime DEFAULT NULL,
  `order_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `questions`
--

CREATE TABLE `questions` (
  `id` bigint(20) NOT NULL,
  `activate` bit(1) NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `created_by` varchar(255) DEFAULT NULL,
  `last_modified_at` datetime DEFAULT NULL,
  `modified_by` varchar(255) DEFAULT NULL,
  `description` longtext DEFAULT NULL,
  `imagePath` varchar(255) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL,
  `evaluations_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `quiz`
--

CREATE TABLE `quiz` (
  `id` bigint(20) NOT NULL,
  `activate` bit(1) NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `created_by` varchar(255) DEFAULT NULL,
  `last_modified_at` datetime DEFAULT NULL,
  `modified_by` varchar(255) DEFAULT NULL,
  `description` longtext DEFAULT NULL,
  `dureeMinutes` int(11) DEFAULT NULL,
  `scoreMinimum` int(11) DEFAULT NULL,
  `titre` varchar(255) DEFAULT NULL,
  `course_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `quiz_question`
--

CREATE TABLE `quiz_question` (
  `id` bigint(20) NOT NULL,
  `activate` bit(1) NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `created_by` varchar(255) DEFAULT NULL,
  `last_modified_at` datetime DEFAULT NULL,
  `modified_by` varchar(255) DEFAULT NULL,
  `contenu` longtext DEFAULT NULL,
  `points` int(11) DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL,
  `quiz_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `quiz_reponse`
--

CREATE TABLE `quiz_reponse` (
  `id` bigint(20) NOT NULL,
  `activate` bit(1) NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `created_by` varchar(255) DEFAULT NULL,
  `last_modified_at` datetime DEFAULT NULL,
  `modified_by` varchar(255) DEFAULT NULL,
  `estCorrecte` bit(1) DEFAULT NULL,
  `texte` longtext DEFAULT NULL,
  `question_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `reponses`
--

CREATE TABLE `reponses` (
  `id` bigint(20) NOT NULL,
  `activate` bit(1) NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `created_by` varchar(255) DEFAULT NULL,
  `last_modified_at` datetime DEFAULT NULL,
  `modified_by` varchar(255) DEFAULT NULL,
  `description` longtext DEFAULT NULL,
  `imagePath` varchar(255) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `questions_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `user`
--

CREATE TABLE `user` (
  `id` bigint(20) NOT NULL,
  `activate` bit(1) DEFAULT NULL,
  `admin` bit(1) DEFAULT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `fullName` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `role` varchar(255) DEFAULT NULL,
  `learner_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `user`
--

INSERT INTO `user` (`id`, `activate`, `admin`, `avatar`, `email`, `fullName`, `password`, `phone`, `role`, `learner_id`) VALUES
(1, b'1', b'1', NULL, 'admin@odc.com', 'Admin ODC', '$2a$10$CnFPr/9dFGPzoDudDRP3.uPnFBdy7aMgq.UpWi9k8NAItWq4BjlW.', '77114120', 'ADMIN', NULL);

-- --------------------------------------------------------

--
-- Structure de la table `user_quiz_attempt`
--

CREATE TABLE `user_quiz_attempt` (
  `id` bigint(20) NOT NULL,
  `activate` bit(1) NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `created_by` varchar(255) DEFAULT NULL,
  `last_modified_at` datetime DEFAULT NULL,
  `modified_by` varchar(255) DEFAULT NULL,
  `date_tentative` datetime DEFAULT NULL,
  `score` double DEFAULT NULL,
  `scoreTotal` int(11) DEFAULT NULL,
  `quiz_id` bigint(20) DEFAULT NULL,
  `user_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `answers`
--
ALTER TABLE `answers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FKfwn3tknlksexwstfjdce576o9` (`infoTest_id`),
  ADD KEY `FK3erw1a3t0r78st8ty27x6v3g1` (`question_id`),
  ADD KEY `FKagb8s7dtt8pn126bqxurf5xdm` (`reponse_id`);

--
-- Index pour la table `apprenants`
--
ALTER TABLE `apprenants`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FKnb1tlea9kb7jr1ob0bfrqgsm2` (`cohorte_id`);

--
-- Index pour la table `categorie`
--
ALTER TABLE `categorie`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `chapter`
--
ALTER TABLE `chapter`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FKq9df7i8vu75pmd3w03akyjgpm` (`course_id`);

--
-- Index pour la table `cohorte`
--
ALTER TABLE `cohorte`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `configuration`
--
ALTER TABLE `configuration`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `courses`
--
ALTER TABLE `courses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FKgubhnx2v3dxandl59q1uj1xxd` (`categorie_id`);

--
-- Index pour la table `details_course`
--
ALTER TABLE `details_course`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK8jup3kq2md3muiautub453o9w` (`course_id`),
  ADD KEY `FK1983yg0x17ygf0t1l2veyqqlg` (`learner_id`);

--
-- Index pour la table `evaluations`
--
ALTER TABLE `evaluations`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `infotest`
--
ALTER TABLE `infotest`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FKemgx0vmcnbm8hb9lkwyuhyhd2` (`evaluations_id`);

--
-- Index pour la table `lab_definition`
--
ALTER TABLE `lab_definition`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `lab_session`
--
ALTER TABLE `lab_session`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK45qliajixcxfpm2k2lr9mltc2` (`lab_definition_id`),
  ADD KEY `FKcdlwas00h596g8sb5l1xfh6cu` (`user_id`);

--
-- Index pour la table `learner_chapter`
--
ALTER TABLE `learner_chapter`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FKel9kyl84ego2otj2accfd8mr7` (`user_id`);

--
-- Index pour la table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FKy4aiomvn1gl62yjreckpt6lv` (`course_id`),
  ADD KEY `FKbioxgbv59vetrxe0ejfubep1w` (`order_id`);

--
-- Index pour la table `payment_transactions`
--
ALTER TABLE `payment_transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FKnsous9qyrjv5ss8que6o6617` (`order_id`);

--
-- Index pour la table `questions`
--
ALTER TABLE `questions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FKdow02282ttignmvei62ys2r72` (`evaluations_id`);

--
-- Index pour la table `quiz`
--
ALTER TABLE `quiz`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FKsuuurs360upoc31ioqndwb7cr` (`course_id`);

--
-- Index pour la table `quiz_question`
--
ALTER TABLE `quiz_question`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FKdtynvfjgh6e7fd8l0wk37nrpc` (`quiz_id`);

--
-- Index pour la table `quiz_reponse`
--
ALTER TABLE `quiz_reponse`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK3vds2k0epqhskftggd7m5tjjy` (`question_id`);

--
-- Index pour la table `reponses`
--
ALTER TABLE `reponses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FKcnk97p1sj7vol2pugclsuwi6n` (`questions_id`);

--
-- Index pour la table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FKaui7ukolygn4p6w52fquk7y1` (`learner_id`);

--
-- Index pour la table `user_quiz_attempt`
--
ALTER TABLE `user_quiz_attempt`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FKnpgptwcm0dpbp1dk9p9b81g2l` (`quiz_id`),
  ADD KEY `FKwb5igcktr07aen4dqws2gwq8` (`user_id`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `answers`
--
ALTER TABLE `answers`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `apprenants`
--
ALTER TABLE `apprenants`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `categorie`
--
ALTER TABLE `categorie`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `chapter`
--
ALTER TABLE `chapter`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `cohorte`
--
ALTER TABLE `cohorte`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `configuration`
--
ALTER TABLE `configuration`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `courses`
--
ALTER TABLE `courses`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `details_course`
--
ALTER TABLE `details_course`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `evaluations`
--
ALTER TABLE `evaluations`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `infotest`
--
ALTER TABLE `infotest`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `lab_definition`
--
ALTER TABLE `lab_definition`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT pour la table `lab_session`
--
ALTER TABLE `lab_session`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `learner_chapter`
--
ALTER TABLE `learner_chapter`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `payment_transactions`
--
ALTER TABLE `payment_transactions`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `questions`
--
ALTER TABLE `questions`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `quiz`
--
ALTER TABLE `quiz`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `quiz_question`
--
ALTER TABLE `quiz_question`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `quiz_reponse`
--
ALTER TABLE `quiz_reponse`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `reponses`
--
ALTER TABLE `reponses`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `user`
--
ALTER TABLE `user`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT pour la table `user_quiz_attempt`
--
ALTER TABLE `user_quiz_attempt`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `answers`
--
ALTER TABLE `answers`
  ADD CONSTRAINT `FK3erw1a3t0r78st8ty27x6v3g1` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`),
  ADD CONSTRAINT `FKagb8s7dtt8pn126bqxurf5xdm` FOREIGN KEY (`reponse_id`) REFERENCES `reponses` (`id`),
  ADD CONSTRAINT `FKfwn3tknlksexwstfjdce576o9` FOREIGN KEY (`infoTest_id`) REFERENCES `infotest` (`id`);

--
-- Contraintes pour la table `apprenants`
--
ALTER TABLE `apprenants`
  ADD CONSTRAINT `FKnb1tlea9kb7jr1ob0bfrqgsm2` FOREIGN KEY (`cohorte_id`) REFERENCES `cohorte` (`id`);

--
-- Contraintes pour la table `chapter`
--
ALTER TABLE `chapter`
  ADD CONSTRAINT `FKq9df7i8vu75pmd3w03akyjgpm` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`);

--
-- Contraintes pour la table `courses`
--
ALTER TABLE `courses`
  ADD CONSTRAINT `FKgubhnx2v3dxandl59q1uj1xxd` FOREIGN KEY (`categorie_id`) REFERENCES `categorie` (`id`);

--
-- Contraintes pour la table `details_course`
--
ALTER TABLE `details_course`
  ADD CONSTRAINT `FK1983yg0x17ygf0t1l2veyqqlg` FOREIGN KEY (`learner_id`) REFERENCES `user` (`id`),
  ADD CONSTRAINT `FK8jup3kq2md3muiautub453o9w` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`);

--
-- Contraintes pour la table `infotest`
--
ALTER TABLE `infotest`
  ADD CONSTRAINT `FKemgx0vmcnbm8hb9lkwyuhyhd2` FOREIGN KEY (`evaluations_id`) REFERENCES `evaluations` (`id`);

--
-- Contraintes pour la table `lab_session`
--
ALTER TABLE `lab_session`
  ADD CONSTRAINT `FK45qliajixcxfpm2k2lr9mltc2` FOREIGN KEY (`lab_definition_id`) REFERENCES `lab_definition` (`id`),
  ADD CONSTRAINT `FKcdlwas00h596g8sb5l1xfh6cu` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`);

--
-- Contraintes pour la table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `FKel9kyl84ego2otj2accfd8mr7` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`);

--
-- Contraintes pour la table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `FKbioxgbv59vetrxe0ejfubep1w` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`),
  ADD CONSTRAINT `FKy4aiomvn1gl62yjreckpt6lv` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`);

--
-- Contraintes pour la table `payment_transactions`
--
ALTER TABLE `payment_transactions`
  ADD CONSTRAINT `FKnsous9qyrjv5ss8que6o6617` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`);

--
-- Contraintes pour la table `questions`
--
ALTER TABLE `questions`
  ADD CONSTRAINT `FKdow02282ttignmvei62ys2r72` FOREIGN KEY (`evaluations_id`) REFERENCES `evaluations` (`id`);

--
-- Contraintes pour la table `quiz`
--
ALTER TABLE `quiz`
  ADD CONSTRAINT `FKsuuurs360upoc31ioqndwb7cr` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`);

--
-- Contraintes pour la table `quiz_question`
--
ALTER TABLE `quiz_question`
  ADD CONSTRAINT `FKdtynvfjgh6e7fd8l0wk37nrpc` FOREIGN KEY (`quiz_id`) REFERENCES `quiz` (`id`);

--
-- Contraintes pour la table `quiz_reponse`
--
ALTER TABLE `quiz_reponse`
  ADD CONSTRAINT `FK3vds2k0epqhskftggd7m5tjjy` FOREIGN KEY (`question_id`) REFERENCES `quiz_question` (`id`);

--
-- Contraintes pour la table `reponses`
--
ALTER TABLE `reponses`
  ADD CONSTRAINT `FKcnk97p1sj7vol2pugclsuwi6n` FOREIGN KEY (`questions_id`) REFERENCES `questions` (`id`);

--
-- Contraintes pour la table `user`
--
ALTER TABLE `user`
  ADD CONSTRAINT `FKaui7ukolygn4p6w52fquk7y1` FOREIGN KEY (`learner_id`) REFERENCES `apprenants` (`id`);

--
-- Contraintes pour la table `user_quiz_attempt`
--
ALTER TABLE `user_quiz_attempt`
  ADD CONSTRAINT `FKnpgptwcm0dpbp1dk9p9b81g2l` FOREIGN KEY (`quiz_id`) REFERENCES `quiz` (`id`),
  ADD CONSTRAINT `FKwb5igcktr07aen4dqws2gwq8` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
