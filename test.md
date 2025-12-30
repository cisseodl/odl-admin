# Guide de Test des Endpoints de l'API ODC Learning

Ce document décrit le flux de travail pour tester les endpoints de l'API. Les requêtes doivent être exécutées dans l'ordre présenté pour simuler un scénario d'utilisation logique, de la création d'un utilisateur à la consommation de contenu.

**Variables d'environnement :**
*   `BASE_URL`: L'URL de base de l'API (ex: `http://localhost:8080`)
*   `TOKEN_ADMIN`: Token JWT obtenu après la connexion d'un utilisateur admin.
*   `TOKEN_APPRENANT`: Token JWT obtenu après la connexion d'un utilisateur apprenant.
*   `USER_ID_APPRENANT`: ID de l'utilisateur apprenant obtenu après sa création/connexion.

---

### 6.14. Authentification et Gestion de Connexion (AuthenticationController)

#### 6.14.1. Créer un utilisateur Administrateur
*   **Endpoint:** `POST /awsodclearning/auth/signup`
*   **Rôle:** Public
*   **Description:** Crée un nouvel utilisateur administrateur.
*   **Headers:** `Content-Type: multipart/form-data`
*   **Form Data:**
    *   `user` (champ texte, **doit contenir une chaîne JSON valide**): `{"fullName": "Admin User", "email": "admin@odc.com", "password": "password123", "phone": "1234567890", "admin": true, "activate": true}`
    *   `avatar`: (Fichier image optionnel)
*   **Exemple de Réponse JSON (Succès):**
    ```json
    {
      "data": {
        "token": "eyJ...",
        "user": {
          "id": 1,
          "fullName": "Admin User",
          "email": "admin@odc.com",
          "phone": "1234567890",
          "admin": true,
          "activate": true,
          "avatar": "admin_avatar.png",
          "role": "ADMIN"
        }
      },
      "ok": true,
      "message": "Création de l'utilisateur réussie"
    }
    ```

#### 6.14.2. Créer un utilisateur Apprenant
*   **Endpoint:** `POST /awsodclearning/auth/signup`
*   **Rôle:** Public
*   **Description:** Crée un nouvel utilisateur apprenant.
*   **Headers:** `Content-Type: multipart/form-data`
*   **Form Data:**
    *   `user` (champ texte, **doit contenir une chaîne JSON valide**): `{"fullName": "Learner User", "email": "learner@odc.com", "password": "password123", "phone": "0987654321", "admin": false, "activate": true}`
    *   `avatar`: (Fichier image optionnel)
*   **Action:** Notez l'ID de l'utilisateur créé (`USER_ID_APPRENANT`).
*   **Exemple de Réponse JSON (Succès):**
    ```json
    {
      "data": {
        "token": "eyJ...",
        "user": {
          "id": 2,
          "fullName": "Learner User",
          "email": "learner@odc.com",
          "phone": "0987654321",
          "admin": false,
          "activate": true,
          "avatar": "learner_avatar.png",
          "role": "USER"
        }
      },
      "ok": true,
      "message": "Création de l'utilisateur réussie"
    }
    ```

#### 6.14.3. Connexion (Admin et Apprenant)
*   **Endpoint:** `POST /awsodclearning/auth/signin`
*   **Rôle:** Public
*   **Description:** Connecte un utilisateur et retourne un token JWT.
*   **Headers:** `Content-Type: application/json`
*   **Body:** `{"email": "admin@odc.com", "password": "password123"}` (Répéter avec les identifiants de l'apprenant)
*   **Action:** Sauvegardez les tokens (`TOKEN_ADMIN`, `TOKEN_APPRENANT`).
*   **Exemple de Réponse JSON (Succès):**
    ```json
    {
        "data": {
            "token": "ey...",
            "user": {
                "id": 1,
                "fullName": "Admin User",
                "email": "admin@odc.com",
                "phone": "1234567890",
                "admin": true,
                "activate": true,
                "avatar": "admin_avatar.png",
                "role": "ADMIN"
            }
        },
        "message": "Authentification réussie",
        "ok": true
    }
    ```

#### 6.14.4. Changer le mot de passe
*   **Endpoint:** `POST /awsodclearning/auth/change-pass`
*   **Rôle:** Authentifié (USER, ADMIN, LEARNER)
*   **Description:** Permet à un utilisateur de changer son mot de passe.
*   **Headers:**
    ```json
    {
      "Content-Type": "application/json",
      "Authorization": "Bearer {{TOKEN_APPRENANT}}"
    }
    ```
*   **Body:**
    ```json
    {
      "username": "learner@odc.com",
      "pass1": "password123",
      "pass2": "new_password123"
    }
    ```
*   **Exemple de Réponse JSON (Succès):**
    ```json
    {
      "data": null,
      "ok": true,
      "message": "Mot de passe modifié avec succès."
    }
    ```

#### 6.14.5. Créer un apprenant via l'admin
*   **Endpoint:** `POST /awsodclearning/auth/create-learner/{cohorteId}`
*   **Rôle:** Admin
*   **Description:** Crée un nouvel utilisateur avec le rôle d'apprenant et l'associe à une cohorte.
*   **Headers:**
    ```json
    {
      "Content-Type": "multipart/form-data",
      "Authorization": "Bearer {{TOKEN_ADMIN}}"
    }
    ```
*   **Path Variables:**
    *   `cohorteId`: ID de la cohorte (ex: `1`)
*   **Form Data:**
    *   `learner`: (champ texte, **doit contenir une chaîne JSON valide**): `{"nom": "Learner", "prenom": "New", "email": "new.learner@odc.com", "numero": "0000000000", "profession": "Etudiant", "niveauEtude": "Licence", "filiere": "Informatique"}`
    *   `photo`: (fichier image)
*   **Exemple de Réponse JSON (Succès):**
    ```json
    {
      "data": {
        "id": 3,
        "fullName": "New Learner",
        "email": "new.learner@odc.com",
        "phone": "0000000000",
        "admin": false,
        "activate": true,
        "avatar": "learner_photo.png",
        "role": "LEARNER",
        "learner": {
          "id": 3,
          "nom": "Learner",
          "prenom": "New",
          "email": "new.learner@odc.com"
        }
      },
      "ok": true,
      "message": "Apprenant enregistré avec succès"
    }
    ```

## 2. Gestion du Contenu (Rôle Admin)

Exécuter avec `Authorization: Bearer {{TOKEN_ADMIN}}`.

### 2.1. Gestion des Catégories

*   **Endpoint:** `POST /awsodclearning/categorie/save`
*   **Headers:** `Content-Type: application/json`
*   **Body:** `{"title": "Développement Web", "description": "Cours sur le dev web."}`
*   **Action:** Notez l'ID de la catégorie (`categorie_id`).

### 2.2. Gestion des Cours

#### 2.2.1. Créer un cours (Payant)
*   **Endpoint:** `POST /awsodclearning/courses/save/{{categorie_id}}`
*   **Headers:** `Content-Type: multipart/form-data`
*   **Form Data:**
    *   `courses`: `{"title": "React Avancé", "description": "Hooks, Context, Performance.", "duration": 10, "courseType": "REGISTER", "price": 49.99}`
*   **Action:** Notez l'ID (`course_payant_id`).

#### 2.2.2. Créer un cours (Gratuit)
*   **Endpoint:** `POST /awsodclearning/courses/save/{{categorie_id}}`
*   **Headers:** `Content-Type: multipart/form-data`
*   **Form Data:**
    *   `courses`: `{"title": "Introduction à React", "description": "Les bases de React.", "duration": 4, "courseType": "REGISTER", "price": 0.00}`
*   **Action:** Notez l'ID (`course_gratuit_id`).

### 2.3. Gestion des Chapitres

*   **Endpoint:** `POST /awsodclearning/chapters/save`
*   **Headers:** `Content-Type: multipart/form-data`
*   **Form Data:**
    *   `chapter`: `{"courseId": "{{course_gratuit_id}}", "courseType": "REGISTER", "chapters": [{"title": "Chapitre 1: Introduction", "description": "Configuration de l'environnement."}]}`
*   **Action:** Notez l'ID du chapitre (`chapitre_id`).

### 2.4. Gestion des Quiz

*   **Endpoint:** `POST /awsodclearning/quiz/create`
*   **Headers:** `Content-Type: application/json`
*   **Body:** `{"titre": "Quiz sur les bases de React", "description": "Testez vos connaissances.", "courseId": "{{course_gratuit_id}}", "dureeMinutes": 15, "scoreMinimum": 75, "questions": [{"contenu": "Qu'est-ce que le JSX ?", "type": "CHOIX_UNIQUE", "points": 10, "reponses": [{"texte": "Une extension syntaxique pour JavaScript.", "estCorrecte": true}, {"texte": "Autre chose.", "estCorrecte": false}]}]}`
*   **Action:** Notez l'ID du quiz (`quiz_id`) et l'ID de la question et des réponses.

---

## 3. Parcours Apprenant

Exécuter avec `Authorization: Bearer {{TOKEN_APPRENANT}}`.

### 3.1. Inscription et Paiement (Cours Payant)

#### 3.1.1. Créer une commande
*   **Endpoint:** `POST /awsodclearning/orders/create`
*   **Headers:** `Content-Type: application/json`
*   **Body:** `{"courseIds": ["{{course_payant_id}}"]}`
*   **Action:** Notez l'ID de la commande (`order_id`).

#### 3.1.2. Créer une intention de paiement
*   **Endpoint:** `POST /awsodclearning/orders/payment-intent/{{order_id}}`
*   **Action:** Notez le `paymentIntentId`.

#### 3.1.3. Confirmer le paiement
*   **Endpoint:** `POST /awsodclearning/orders/confirm`
*   **Headers:** `Content-Type: application/json`
*   **Body:** `{"paymentIntentId": "{{paymentIntentId}}"}`

### 3.2. Progression dans un Cours (Cours Gratuit)

#### 3.2.1. Valider un chapitre

*   **Endpoint:** `POST /awsodclearning/learnerchapter/save`
*   **Description:** Marque un chapitre comme terminé pour un utilisateur.
*   **Note:** L'API attend des données `application/x-www-form-urlencoded`.
*   **Headers:** `Content-Type: application/x-www-form-urlencoded`
*   **Form Data:**
    *   `userId`: `{{USER_ID_APPRENANT}}`
    *   `chapitreId`: `{{chapitre_id}}`
    *   `coursId`: `{{course_gratuit_id}}`

### 3.3. Évaluation (Quiz)

#### 3.3.1. Soumettre les réponses à un quiz

*   **Endpoint:** `POST /awsodclearning/quiz/submit`
*   **Description:** Soumet les réponses de l'apprenant pour un quiz et obtient le score.
*   **Headers:** `Content-Type: application/json`
*   **Body:**
    ```json
    {
      "quizId": "{{quiz_id}}",
      "answers": [
        {
          "questionId": "{{question_id}}",
          "reponseIds": ["{{reponse_correcte_id}}"]
        }
      ]
    }
    ```
*   **Réponse attendue:** Un résultat avec le score de l'apprenant.

---

## 5. Autres Endpoints GET

### 5.1. Gestion des Apprenants (ApprenantController)

#### 5.1.1. Récupérer tous les apprenants
*   **Endpoint:** `GET /awsodclearning/apprenants/get-all`
*   **Rôle:** User, Admin, Learner (nécessite authentification)
*   **Description:** Récupère la liste de tous les apprenants inscrits.
*   **Headers:**
    ```json
    {
      "Authorization": "Bearer {{TOKEN_APPRENANT}}"
    }
    ```
*   **Exemple de Réponse JSON (Succès):**
    ```json
    {
      "data": [
        {
          "id": 1,
          "createdAt": "2025-01-01T10:00:00",
          "updatedAt": "2025-01-01T10:00:00",
          "nom": "Dupont",
          "prenom": "Jean",
          "email": "jean.dupont@example.com",
          "numero": "0123456789",
          "profession": "Étudiant",
          "niveauEtude": "Licence",
          "filiere": "Informatique",
          "cohorte": {
            "id": 1,
            "createdAt": "2025-01-01T09:00:00",
            "updatedAt": "2025-01-01T09:00:00",
            "nom": "Cohorte 2025",
            "description": "Première cohorte de l'année",
            "dateDebut": "2025-01-15T09:00:00",
            "dateFin": "2025-06-15T17:00:00"
          }
        },
        {
          "id": 2,
          "createdAt": "2025-01-02T11:00:00",
          "updatedAt": "2025-01-02T11:00:00",
          "nom": "Martin",
          "prenom": "Sophie",
          "email": "sophie.martin@example.com",
          "numero": "0698765432",
          "profession": "Développeur",
          "niveauEtude": "Master",
          "filiere": "Data Science",
          "cohorte": null
        }
      ],
      "ok": true,
      "message": null
    }
    ```

#### 5.1.2. Récupérer les apprenants par cohorte (paginé)
*   **Endpoint:** `GET /awsodclearning/apprenants/get-by-cohorte/{cohorteId}/{page}/{size}`
*   **Rôle:** User, Admin, Learner (nécessite authentification)
*   **Description:** Récupère les apprenants appartenant à une cohorte spécifique, avec pagination.
*   **Headers:**
    ```json
    {
      "Authorization": "Bearer {{TOKEN_APPRENANT}}"
    }
    ```
*   **Path Variables:**
    *   `cohorteId`: ID de la cohorte (ex: `1`)
    *   `page`: Numéro de page (commence à 0) (ex: `0`)
    *   `size`: Nombre d'éléments par page (ex: `10`)
*   **Exemple de Réponse JSON (Succès):**
    ```json
    {
      "data": {
        "content": [
          {
            "id": 1,
            "createdAt": "2025-01-01T10:00:00",
            "updatedAt": "2025-01-01T10:00:00",
            "nom": "Dupont",
            "prenom": "Jean",
            "email": "jean.dupont@example.com",
            "numero": "0123456789",
            "profession": "Étudiant",
            "niveauEtude": "Licence",
            "filiere": "Informatique",
            "cohorte": {
              "id": 1,
              "createdAt": "2025-01-01T09:00:00",
              "updatedAt": "2025-01-01T09:00:00",
              "nom": "Cohorte 2025",
              "description": "Première cohorte de l'année",
              "dateDebut": "2025-01-15T09:00:00",
              "dateFin": "2025-06-15T17:00:00"
            }
          }
        ],
        "pageable": {
          "sort": {
            "empty": true,
            "sorted": false,
            "unsorted": true
          },
          "offset": 0,
          "pageNumber": 0,
          "pageSize": 10,
          "unpaged": false,
          "paged": true
        },
        "totalElements": 1,
        "totalPages": 1,
        "last": true,
        "size": 10,
        "number": 0,
        "sort": {
          "empty": true,
          "sorted": false,
          "unsorted": true
        },
        "numberOfElements": 1,
          "first": true,
          "empty": false
        },
        "ok": true,
        "message": null
      }
      ```
      
### 5.2. Gestion des Catégories (CategorieController)

#### 5.2.1. Récupérer toutes les catégories
*   **Endpoint:** `GET /awsodclearning/categorie/read`
*   **Rôle:** User, Admin, Learner (nécessite authentification)
*   **Description:** Récupère la liste de toutes les catégories.
*   **Headers:**
    ```json
    {
      "Authorization": "Bearer {{TOKEN_APPRENANT}}"
    }
    ```
*   **Exemple de Réponse JSON (Succès):**
    ```json
    {
      "data": [
        {
          "id": 1,
          "createdAt": "2025-01-01T10:00:00",
          "updatedAt": "2025-01-01T10:00:00",
          "title": "Développement Web",
          "description": "Cours sur les technologies web."
        },
        {
          "id": 2,
          "createdAt": "2025-01-02T11:00:00",
          "updatedAt": "2025-01-02T11:00:00",
          "title": "Cloud Computing",
          "description": "Cours sur AWS, Azure et GCP."
        }
      ],
      "ok": true,
      "message": "Liste des catégories"
    }
    ```

#### 5.2.2. Récupérer une catégorie par ID
*   **Endpoint:** `GET /awsodclearning/categorie/read/{id}`
*   **Rôle:** User, Admin, Learner (nécessite authentification)
*   **Description:** Récupère les détails d'une catégorie spécifique par son ID.
*   **Headers:**
    ```json
    {
      "Authorization": "Bearer {{TOKEN_APPRENANT}}"
    }
    ```
*   **Path Variables:**
    *   `id`: ID de la catégorie (ex: `1`)
*   **Exemple de Réponse JSON (Succès):**
    ```json
    {
      "id": 1,
      "createdAt": "2025-01-01T10:00:00",
      "updatedAt": "2025-01-01T10:00:00",
      "title": "Développement Web",
      "description": "Cours sur les technologies web."
    }
    ```

### 5.3. Gestion des Chapitres (ChapterController)

#### 5.3.1. Récupérer les chapitres d'un cours
*   **Endpoint:** `GET /awsodclearning/chapters/course/{courseId}`
*   **Rôle:** User, Admin, Learner (nécessite authentification)
*   **Description:** Récupère la liste de tous les chapitres d'un cours spécifié.
*   **Headers:**
    ```json
    {
      "Authorization": "Bearer {{TOKEN_APPRENANT}}"
    }
    ```
*   **Path Variables:**
    *   `courseId`: ID du cours (ex: `{{course_gratuit_id}}`)
*   **Exemple de Réponse JSON (Succès):**
    ```json
    {
      "data": [
        {
          "id": 101,
          "createdAt": "2025-01-05T09:00:00",
          "updatedAt": "2025-01-05T09:00:00",
          "title": "Chapitre 1: Introduction",
          "description": "Description du chapitre 1.",
          "pdfPath": "/path/to/chapter1.pdf",
          "chapterLink": "https://youtube.com/link_chap1",
          "course": {
            "id": "{{course_gratuit_id}}",
            "title": "Introduction à React"
            // Autres détails simplifiés du cours
          }
        },
        {
          "id": 102,
          "createdAt": "2025-01-05T10:00:00",
          "updatedAt": "2025-01-05T10:00:00",
          "title": "Chapitre 2: Les Composants",
          "description": "Description du chapitre 2.",
          "pdfPath": null,
          "chapterLink": "https://youtube.com/link_chap2",
          "course": {
            "id": "{{course_gratuit_id}}",
            "title": "Introduction à React"
          }
        }
      ],
      "ok": true,
      "message": "Chapitres du cours récupérés"
    }
    ```

### 5.4. Gestion des Cohortes (CohorteController)

#### 5.4.1. Récupérer toutes les cohortes
*   **Endpoint:** `GET /awsodclearning/cohorte/read`
*   **Rôle:** User, Admin, Learner (nécessite authentification)
*   **Description:** Récupère la liste de toutes les cohortes disponibles.
*   **Headers:**
    ```json
    {
      "Authorization": "Bearer {{TOKEN_APPRENANT}}"
    }
    ```
*   **Exemple de Réponse JSON (Succès):**
    ```json
    {
      "data": [
        {
          "id": 1,
          "createdAt": "2025-01-01T09:00:00",
          "updatedAt": "2025-01-01T09:00:00",
          "nom": "Cohorte React 2025-Q1",
          "description": "Cohorte dédiée aux fondamentaux de React au premier trimestre 2025.",
          "dateDebut": "2025-01-15T09:00:00",
          "dateFin": "2025-03-15T17:00:00"
        },
        {
          "id": 2,
          "createdAt": "2025-02-01T10:00:00",
          "updatedAt": "2025-02-01T10:00:00",
          "nom": "Cohorte AWS Pro 2025",
          "description": "Cohorte pour la certification AWS Solutions Architect Professional.",
          "dateDebut": "2025-02-20T09:00:00",
          "dateFin": "2025-08-20T17:00:00"
        }
      ],
      "ok": true,
      "message": "Liste des cohortes"
    }
    ```

#### 5.4.2. Récupérer une cohorte par ID
*   **Endpoint:** `GET /awsodclearning/cohorte/read/{id}`
*   **Rôle:** User, Admin, Learner (nécessite authentification)
*   **Description:** Récupère les détails d'une cohorte spécifique par son ID.
*   **Headers:**
    ```json
    {
      "Authorization": "Bearer {{TOKEN_APPRENANT}}"
    }
    ```
*   **Path Variables:**
    *   `id`: ID de la cohorte (ex: `1`)
*   **Exemple de Réponse JSON (Succès):**
    ```json
    {
      "data": {
        "id": 1,
        "createdAt": "2025-01-01T09:00:00",
        "updatedAt": "2025-01-01T09:00:00",
        "nom": "Cohorte React 2025-Q1",
        "description": "Cohorte dédiée aux fondamentaux de React au premier trimestre 2025.",
        "dateDebut": "2025-01-15T09:00:00",
        "dateFin": "2025-03-15T17:00:00"
      },
      "ok": true,
      "message": "Cohorte récupérée"
    }
    ```

### 5.5. Gestion des Configurations (ConfigurationController)

#### 5.5.1. Récupérer la configuration
*   **Endpoint:** `GET /awsodclearning/configurations/get-config`
*   **Rôle:** Public (nécessite d'être authentifié)
*   **Description:** Récupère la configuration générale de l'application.
*   **Headers:**
    ```json
    {
      "Authorization": "Bearer {{TOKEN_APPRENANT}}"
    }
    ```
*   **Exemple de Réponse JSON (Succès):**
    ```json
    {
      "data": {
        "id": 1,
        "createdAt": "2025-01-01T08:00:00",
        "updatedAt": "2025-01-01T08:00:00",
        "homepageText": "Bienvenue sur Orange Digital Learning!",
        "homepageImageUrl": "http://example.com/images/homepage.png",
        "loginImageUrl": "http://example.com/images/login.png",
        "aboutText": "Découvrez notre plateforme d'apprentissage innovante.",
        "aboutImageUrl": "http://example.com/images/about.png"
      },
      "ok": true,
      "message": "Configuration récupérée"
    }
    ```

### 5.6. Gestion des Cours (CoursesController)

#### 5.6.1. Récupérer un cours par ID
*   **Endpoint:** `GET /awsodclearning/courses/read/{id}`
*   **Rôle:** User, Admin, Learner (nécessite authentification)
*   **Description:** Récupère les détails d'un cours spécifique par son ID.
*   **Headers:**
    ```json
    {
      "Authorization": "Bearer {{TOKEN_APPRENANT}}"
    }
    ```
*   **Path Variables:**
    *   `id`: ID du cours (ex: `1`)
*   **Exemple de Réponse JSON (Succès):**
    ```json
    {
      "data": {
        "id": 1,
        "createdAt": "2025-01-01T10:00:00",
        "updatedAt": "2025-01-01T10:00:00",
        "title": "Introduction à React",
        "description": "Apprenez les bases de React.",
        "imagePath": "/path/to/react_intro.png",
        "duration": 4,
        "courseType": "REGISTER",
        "price": 0.00,
        "categorie": {
          "id": 1,
          "title": "Développement Web"
        }
      },
      "ok": true,
      "message": "Cours récupéré"
    }
    ```

#### 5.6.2. Récupérer tous les cours
*   **Endpoint:** `GET /awsodclearning/courses/read`
*   **Rôle:** User, Admin, Learner (nécessite authentification)
*   **Description:** Récupère la liste de tous les cours disponibles.
*   **Headers:**
    ```json
    {
      "Authorization": "Bearer {{TOKEN_APPRENANT}}"
    }
    ```
*   **Exemple de Réponse JSON (Succès):**
    ```json
    {
      "data": [
        {
          "id": 1,
          "createdAt": "2025-01-01T10:00:00",
          "updatedAt": "2025-01-01T10:00:00",
          "title": "Introduction à React",
          "description": "Apprenez les bases de React.",
          "imagePath": "/path/to/react_intro.png",
          "duration": 4,
          "courseType": "REGISTER",
          "price": 0.00,
          "categorie": {
            "id": 1,
            "title": "Développement Web"
          }
        },
        {
          "id": 2,
          "createdAt": "2025-01-02T11:00:00",
          "updatedAt": "2025-01-02T11:00:00",
          "title": "React Avancé",
          "description": "Concepts avancés de React.",
          "imagePath": "/path/to/react_advanced.png",
          "duration": 10,
          "courseType": "REGISTER",
          "price": 49.99,
          "categorie": {
            "id": 1,
            "title": "Développement Web"
          }
        }
      ],
      "ok": true,
      "message": "Liste des cours"
    }
    ```

#### 5.6.3. Récupérer les cours par page
*   **Endpoint:** `GET /awsodclearning/courses/page/{page}/{size}`
*   **Rôle:** User, Admin, Learner (nécessite authentification)
*   **Description:** Récupère les cours avec pagination.
*   **Headers:**
    ```json
    {
      "Authorization": "Bearer {{TOKEN_APPRENANT}}"
    }
    ```
*   **Path Variables:**
    *   `page`: Numéro de page (ex: `0`)
    *   `size`: Nombre d'éléments par page (ex: `10`)
*   **Exemple de Réponse JSON (Succès):**
    ```json
    {
      "data": {
        "content": [
          {
            "id": 1,
            "createdAt": "2025-01-01T10:00:00",
            "updatedAt": "2025-01-01T10:00:00",
            "title": "Introduction à React",
            "description": "Apprenez les bases de React.",
            "imagePath": "/path/to/react_intro.png",
            "duration": 4,
            "courseType": "REGISTER",
            "price": 0.00,
            "categorie": {
              "id": 1,
              "title": "Développement Web"
            }
          }
        ],
        "pageable": {
          "sort": {
            "empty": true,
            "sorted": false,
            "unsorted": true
          },
          "offset": 0,
          "pageNumber": 0,
          "pageSize": 10,
          "unpaged": false,
          "paged": true
        },
        "totalElements": 2,
        "totalPages": 1,
        "last": true,
        "size": 10,
        "number": 0,
        "sort": {
          "empty": true,
          "sorted": false,
          "unsorted": true
        },
        "numberOfElements": 1,
        "first": true,
        "empty": false
      },
      "ok": true,
      "message": "Cours récupérés par page"
    }
    ```

#### 5.6.4. Récupérer les cours par catégorie
*   **Endpoint:** `GET /awsodclearning/courses/read/by-category/{catId}`
*   **Rôle:** User, Admin, Learner (nécessite authentification)
*   **Description:** Récupère la liste des cours pour une catégorie spécifique.
*   **Headers:**
    ```json
    {
      "Authorization": "Bearer {{TOKEN_APPRENANT}}"
    }
    ```
*   **Path Variables:**
    *   `catId`: ID de la catégorie (ex: `1`)
*   **Exemple de Réponse JSON (Succès):**
    ```json
    {
      "data": [
        {
          "id": 1,
          "createdAt": "2025-01-01T10:00:00",
          "updatedAt": "2025-01-01T10:00:00",
          "title": "Introduction à React",
          "description": "Apprenez les bases de React.",
          "imagePath": "/path/to/react_intro.png",
          "duration": 4,
          "courseType": "REGISTER",
          "price": 0.00,
          "categorie": {
            "id": 1,
            "title": "Développement Web"
          }
        }
      ],
      "ok": true,
      "message": "Cours par catégorie récupérés"
    }
    ```

### 5.7. Gestion des Évaluations (EvaluationsController)

#### 5.7.1. Récupérer toutes les évaluations
*   **Endpoint:** `GET /awsodclearning/evaluations/get-all`
*   **Rôle:** User, Admin, Learner (nécessite authentification)
*   **Description:** Récupère la liste de toutes les évaluations.
*   **Headers:**
    ```json
    {
      "Authorization": "Bearer {{TOKEN_APPRENANT}}"
    }
    ```
*   **Exemple de Réponse JSON (Succès):**
    ```json
    {
      "data": [
        {
          "id": 1,
          "createdAt": "2025-01-01T10:00:00",
          "updatedAt": "2025-01-01T10:00:00",
          "title": "Évaluation d'Introduction à React",
          "description": "Évaluation des connaissances de base en React.",
          "status": "Active",
          "imagePath": "/path/to/evaluation_react.png",
          "questions": [
            {
              "id": 201,
              "title": "Question 1",
              "description": "Description question 1",
              "type": "QCM"
            }
          ]
        },
        {
          "id": 2,
          "createdAt": "2025-01-02T11:00:00",
          "updatedAt": "2025-01-02T11:00:00",
          "title": "Évaluation Avancée AWS",
          "description": "Évaluation sur les concepts avancés d'AWS.",
          "status": "Active",
          "imagePath": "/path/to/evaluation_aws.png",
          "questions": []
        }
      ],
      "ok": true,
      "message": "Évaluations récupérées"
    }
    ```

### 5.8. Gestion des Labs (LabController)

#### 5.8.1. Récupérer toutes les définitions de lab
*   **Endpoint:** `GET /awsodclearning/api/labs/`
*   **Rôle:** User, Admin, Learner (nécessite authentification)
*   **Description:** Récupère la liste de toutes les définitions de lab disponibles.
*   **Headers:**
    ```json
    {
      "Authorization": "Bearer {{TOKEN_APPRENANT}}"
    }
    ```
*   **Exemple de Réponse JSON (Succès):**
    ```json
    {
      "data": [
        {
          "id": 1,
          "createdAt": "2025-01-01T10:00:00",
          "updatedAt": "2025-01-01T10:00:00",
          "title": "Lab: Déploiement Docker sur EC2",
          "description": "Déploiement d'une application conteneurisée sur AWS EC2.",
          "dockerImageName": "odl/docker-ec2-lab:latest",
          "instructions": "Instructions détaillées en Markdown...",
          "estimatedDurationMinutes": 60,
          "sessions": [] // Les sessions ne sont pas incluses dans cette réponse
        }
      ],
      "ok": true,
      "message": "Définitions de labs récupérées"
    }
    ```

#### 5.8.2. Récupérer les sessions de lab de l'utilisateur connecté
*   **Endpoint:** `GET /awsodclearning/api/labs/my-sessions`
*   **Rôle:** User, Admin, Learner (nécessite authentification)
*   **Description:** Récupère la liste de toutes les sessions de lab de l'utilisateur authentifié.
*   **Headers:**
    ```json
    {
      "Authorization": "Bearer {{TOKEN_APPRENANT}}"
    }
    ```
*   **Exemple de Réponse JSON (Succès):**
    ```json
    {
      "data": [
        {
          "id": 1,
          "createdAt": "2025-01-01T10:30:00",
          "updatedAt": "2025-01-01T11:00:00",
          "user": {
            "id": "{{USER_ID_APPRENANT}}",
            "email": "learner@odc.com"
          },
          "labDefinition": {
            "id": 1,
            "title": "Lab: Déploiement Docker sur EC2"
          },
          "status": "RUNNING",
          "containerUrl": "http://lab-session-123.aws.com",
          "startTime": "2025-01-01T10:30:00",
          "endTime": null,
          "grade": null,
          "reportUrl": null
        }
      ],
      "ok": true,
      "message": "Sessions de lab utilisateur récupérées"
    }
    ```

### 5.9. Gestion des Commandes (OrderController)

#### 5.9.1. Récupérer les commandes de l'utilisateur
*   **Endpoint:** `GET /awsodclearning/orders/my-orders`
*   **Rôle:** Authentifié (Admin ou Learner)
*   **Description:** Récupère l'historique des commandes effectuées par l'utilisateur authentifié.
*   **Headers:**
    ```json
    {
      "Authorization": "Bearer {{TOKEN_APPRENANT}}"
    }
    ```
*   **Exemple de Réponse JSON (Succès):**
    ```json
    {
      "data": [
        {
          "id": 1,
          "orderDate": "2025-01-10T14:30:00",
          "totalAmount": 49.99,
          "status": "PAID"
        },
        {
          "id": 2,
          "orderDate": "2025-01-12T10:00:00",
          "totalAmount": 99.99,
          "status": "PENDING"
        }
      ],
      "ok": true,
      "message": "Historique des commandes"
    }
    ```

### 5.10. Gestion des Questions (QuestionsController)

#### 5.10.1. Récupérer toutes les questions
*   **Endpoint:** `GET /awsodclearning/questions/get-all`
*   **Rôle:** User, Admin, Learner (nécessite authentification)
*   **Description:** Récupère la liste de toutes les questions.
*   **Headers:**
    ```json
    {
      "Authorization": "Bearer {{TOKEN_APPRENANT}}"
    }
    ```
*   **Exemple de Réponse JSON (Succès):**
    ```json
    {
      "data": [
        {
          "id": 1,
          "createdAt": "2025-01-01T10:00:00",
          "updatedAt": "2025-01-01T10:00:00",
          "title": "Question sur React",
          "description": "Quel est le but principal de React ?",
          "status": "Active",
          "imagePath": null,
          "type": "QCM",
          "reponses": [
            {
              "id": 1,
              "title": "Réponse A",
              "description": "Description A",
              "status": "Active"
            },
            {
              "id": 2,
              "title": "Réponse B",
              "description": "Description B",
              "status": "Active"
            }
          ],
          "evaluations": {
            "id": 1,
            "title": "Évaluation d'Introduction à React"
          }
        }
      ],
      "ok": true,
      "message": "Questions récupérées"
    }
    ```

### 5.11. Gestion des Quiz (QuizController)

#### 5.11.1. Récupérer les quiz par cours
*   **Endpoint:** `GET /awsodclearning/quiz/course/{courseId}`
*   **Rôle:** User, Admin, Learner (nécessite authentification)
*   **Description:** Récupère la liste de tous les quiz associés à un cours spécifique.
*   **Headers:**
    ```json
    {
      "Authorization": "Bearer {{TOKEN_APPRENANT}}"
    }
    ```
*   **Path Variables:**
    *   `courseId`: ID du cours (ex: `{{course_gratuit_id}}`)
*   **Exemple de Réponse JSON (Succès):**
    ```json
    {
      "data": [
        {
          "id": 1,
          "titre": "Quiz sur les bases de React",
          "description": "Testez vos connaissances sur les bases de React.",
          "courseId": "{{course_gratuit_id}}",
          "dureeMinutes": 15,
          "scoreMinimum": 75,
          "questions": [
            {
              "id": 1,
              "contenu": "Qu'est-ce que le JSX ?",
              "type": "QCM",
              "points": 10,
              "reponses": [
                {
                  "id": 1,
                  "texte": "Une extension syntaxique pour JavaScript.",
                  "estCorrecte": true
                },
                {
                  "id": 2,
                  "texte": "Autre chose.",
                  "estCorrecte": false
                }
              ]
            }
          ]
        }
      ],
      "ok": true,
      "message": "Quiz du cours récupérés"
    }
    ```

### 5.12. Gestion des Réponses (ReponsesController)

#### 5.12.1. Récupérer toutes les réponses
*   **Endpoint:** `GET /awsodclearning/reponses/get-all`
*   **Rôle:** User, Admin, Learner (nécessite authentification)
*   **Description:** Récupère la liste de toutes les réponses enregistrées.
*   **Headers:**
    ```json
    {
      "Authorization": "Bearer {{TOKEN_APPRENANT}}"
    }
    ```
*   **Exemple de Réponse JSON (Succès):**
    ```json
    {
      "data": [
        {
          "id": 1,
          "createdAt": "2025-01-01T10:00:00",
          "updatedAt": "2025-01-01T10:00:00",
          "title": "Réponse correcte",
          "description": "Ceci est une réponse correcte.",
          "status": "Active",
          "imagePath": null,
          "questions": {
            "id": 1,
            "title": "Question 1"
          }
        },
        {
          "id": 2,
          "createdAt": "2025-01-01T10:01:00",
          "updatedAt": "2025-01-01T10:01:00",
          "title": "Réponse incorrecte",
          "description": "Ceci est une réponse incorrecte.",
          "status": "Active",
          "imagePath": null,
          "questions": {
            "id": 1,
            "title": "Question 1"
          }
        }
      ],
      "ok": true,
      "message": "Réponses récupérées"
    }
    ```

### 5.13. Gestion des Utilisateurs (UserController)

#### 5.13.1. Récupérer tous les utilisateurs (paginé)
*   **Endpoint:** `GET /awsodclearning/users/get-all/{page}/{size}`
*   **Rôle:** Admin (nécessite authentification)
*   **Description:** Récupère la liste de tous les utilisateurs enregistrés avec pagination.
*   **Headers:**
    ```json
    {
      "Authorization": "Bearer {{TOKEN_ADMIN}}"
    }
    ```
*   **Path Variables:**
    *   `page`: Numéro de page (ex: `0`)
    *   `size`: Nombre d'éléments par page (ex: `10`)
*   **Exemple de Réponse JSON (Succès):**
    ```json
    {
      "data": {
        "content": [
          {
            "id": 1,
            "fullName": "Admin User",
            "email": "admin@odc.com",
            "phone": "1234567890",
            "admin": true,
            "activate": true,
            "avatar": "admin_avatar.png",
            "role": "ADMIN"
          },
          {
            "id": 2,
            "fullName": "Learner User",
            "email": "learner@odc.com",
            "phone": "0987654321",
            "admin": false,
            "activate": true,
            "avatar": "learner_avatar.png",
            "role": "USER"
          }
        ],
        "pageable": {
          "sort": {
            "empty": true,
            "sorted": false,
            "unsorted": true
          },
          "offset": 0,
          "pageNumber": 0,
          "pageSize": 10,
          "unpaged": false,
          "paged": true
        },
        "totalElements": 2,
        "totalPages": 1,
        "last": true,
        "size": 10,
        "number": 0,
        "sort": {
          "empty": true,
          "sorted": false,
          "unsorted": true
        },
        "numberOfElements": 2,
        "first": true,
        "empty": false
      },
      "ok": true,
      "message": "Utilisateurs récupérés"
    }
    ```

#### 5.13.2. Vérifier l'existence d'un utilisateur par numéro de téléphone
*   **Endpoint:** `GET /awsodclearning/users/check/{phone}`
*   **Rôle:** Public
*   **Description:** Vérifie si un utilisateur existe déjà en utilisant son numéro de téléphone.
*   **Headers:** (Aucun en-tête d'authentification requis)
*   **Path Variables:**
    *   `phone`: Numéro de téléphone (ex: `1234567890`)
*   **Exemple de Réponse JSON (Utilisateur trouvé):**
    ```json
    {
      "data": true,
      "ok": true,
      "message": "Utilisateur trouvé pour ce numéro de téléphone."
    }
    ```
*   **Exemple de Réponse JSON (Utilisateur non trouvé):**
    ```json
    {
      "data": false,
      "ok": true,
      "message": "Aucun utilisateur trouvé pour ce numéro de téléphone."
    }
    ```

### 5.14. Authentification (AuthenticationController)

#### 5.14.1. Demander la réinitialisation du mot de passe
*   **Endpoint:** `GET /awsodclearning/auth/forget-pass/{username}`
*   **Rôle:** Public
*   **Description:** Déclenche le processus de réinitialisation de mot de passe pour l'utilisateur spécifié par son nom d'utilisateur (email).
*   **Headers:** (Aucun en-tête d'authentification requis)
*   **Path Variables:**
    *   `username`: L'email de l'utilisateur (ex: `user@example.com`)
*   **Exemple de Réponse JSON (Succès):**
    ```json
    {
      "data": "user@example.com",
      "ok": true,
      "message": "Nouveau mot de passe généré (vérifiez les logs pour le mot de passe)."
    }
    ```
*   **Exemple de Réponse JSON (Utilisateur non trouvé):**
    ```json
    {
      "data": null,
      "ok": false,
      "message": "Cet utilisateur n'existe pas."
    }
    ```

#### 5.14.2. Vérifier la disponibilité de l'API
*   **Endpoint:** `GET /awsodclearning/auth/check-availability`
*   **Rôle:** Public
*   **Description:** Un simple endpoint pour vérifier que l'API est en ligne.
*   **Headers:** (Aucun en-tête d'authentification requis)
*   **Exemple de Réponse (Texte Brut):**
    ```
    ATK Rest Api works fine
    ```

---
## 4. Endpoints restants

Cette section liste les autres endpoints notables.

### 4.1. Dashboard (Admin)
*   **Endpoint:** `GET /awsodclearning/dashboard/summary`
*   **Rôle:** Authentifié (Admin ou Learner)
*   **Description:** Récupère les statistiques du tableau de bord pour l'utilisateur authentifié (ou globalement pour l'admin).
*   **Headers:**
    ```json
    {
      "Authorization": "Bearer {{TOKEN_APPRENANT}}"
    }
    ```
*   **Exemple de Réponse JSON (Succès - Contexte Apprenant):**
    ```json
    {
      "data": {
        "coursesJoined": 5,
        "certificatesObtained": 2,
        "averageScore": 85.5,
        "totalQuizAttempts": 12,
        "totalUsers": null,
        "totalCourses": null,
        "totalQuizAttemptsGlobal": null,
        "totalCertificatesGlobal": null,
        "mode": "STUDENT"
      },
      "ok": true,
      "message": "Statistiques du tableau de bord"
    }
    ```
*   **Exemple de Réponse JSON (Succès - Contexte Admin):**
    ```json
    {
      "data": {
        "coursesJoined": null,
        "certificatesObtained": null,
        "averageScore": null,
        "totalQuizAttempts": null,
        "totalUsers": 150,
        "totalCourses": 25,
        "totalQuizAttemptsGlobal": 300,
        "totalCertificatesGlobal": 50,
        "mode": "ADMIN"
      },
      "ok": true,
      "message": "Statistiques du tableau de bord"
    }
    ```

### 4.3. Téléchargement
*   **Endpoint:** `GET /awsodclearning/download/user-guide`
*   **Rôle:** Authentifié
*   **Description:** Télécharge un guide utilisateur (exemple de téléchargement de fichier).

---

## 6. Autres Endpoints POST/PUT/DELETE

### 6.1. Gestion des Apprenants (ApprenantController)

#### 6.1.1. Enregistrer un nouvel apprenant
*   **Endpoint:** `POST /awsodclearning/apprenants/save`
*   **Rôle:** Admin
*   **Description:** Enregistre un nouvel apprenant dans le système.
*   **Headers:**
    ```json
    {
      "Content-Type": "application/json",
      "Authorization": "Bearer {{TOKEN_ADMIN}}"
    }
    ```
*   **Body:**
    ```json
    {
      "nom": "Durand",
      "prenom": "Paul",
      "email": "paul.durand@example.com",
      "numero": "0700000000",
      "profession": "Ingénieur",
      "niveauEtude": "Master",
      "filiere": "Génie Logiciel",
      "cohorte": {
        "id": 1
      }
    }
    ```
*   **Exemple de Réponse JSON (Succès):**
    ```json
    {
      "data": {
        "id": 3,
        "createdAt": "2025-01-03T12:00:00",
        "updatedAt": "2025-01-03T12:00:00",
        "nom": "Durand",
        "prenom": "Paul",
        "email": "paul.durand@example.com",
        "numero": "0700000000",
        "profession": "Ingénieur",
        "niveauEtude": "Master",
        "filiere": "Génie Logiciel",
        "cohorte": {
          "id": 1,
          "nom": "Cohorte React 2025-Q1"
          // ... détails de la cohorte
        }
      },
      "ok": true,
      "message": "Apprenant enregistré avec succès"
    }
    ```

### 6.2. Gestion des Catégories (CategorieController)

#### 6.2.1. Créer une nouvelle catégorie
*   **Endpoint:** `POST /awsodclearning/categorie/save`
*   **Rôle:** Admin
*   **Description:** Crée une nouvelle catégorie de cours.
*   **Headers:**
    ```json
    {
      "Content-Type": "application/json",
      "Authorization": "Bearer {{TOKEN_ADMIN}}"
    }
    ```
*   **Body:**
    ```json
    {
      "title": "Data Science",
      "description": "Cours sur l'analyse de données et le Machine Learning."
    }
    ```
*   **Exemple de Réponse JSON (Succès):**
    ```json
    {
      "data": {
        "id": 3,
        "createdAt": "2025-01-03T12:00:00",
        "updatedAt": "2025-01-03T12:00:00",
        "title": "Data Science",
        "description": "Cours sur l'analyse de données et le Machine Learning."
      },
      "ok": true,
      "message": "Categorie enregistrée"
    }
    ```

#### 6.2.2. Mettre à jour une catégorie existante
*   **Endpoint:** `PUT /awsodclearning/categorie/update`
*   **Rôle:** Admin
*   **Description:** Met à jour les informations d'une catégorie existante.
*   **Headers:**
    ```json
    {
      "Content-Type": "application/json",
      "Authorization": "Bearer {{TOKEN_ADMIN}}"
    }
    ```
*   **Body:**
    ```json
    {
      "id": 3,
      "title": "Data Science & IA",
      "description": "Cours sur l'analyse de données, le Machine Learning et l'Intelligence Artificielle."
    }
    ```
*   **Exemple de Réponse (Succès - Texte Brut):**
    ```
    Le cours a été mis à jour avec succès.
    ```
    (Note: Le contrôleur retourne un `ResponseEntity<String>` pour le succès)

#### 6.2.3. Supprimer une catégorie
*   **Endpoint:** `DELETE /awsodclearning/categorie/delete/{id}`
*   **Rôle:** Admin
*   **Description:** Supprime une catégorie par son ID.
*   **Headers:**
    ```json
    {
      "Authorization": "Bearer {{TOKEN_ADMIN}}"
    }
    ```
*   **Path Variables:**
    *   `id`: ID de la catégorie à supprimer (ex: `3`)
*   **Exemple de Réponse (Succès - Texte Brut):**
    ```
    La catégorie a été supprimée avec succès.
    ```

### 6.3. Gestion des Cohortes (CohorteController)

#### 6.3.1. Créer une nouvelle cohorte
*   **Endpoint:** `POST /awsodclearning/cohorte/save`
*   **Rôle:** Admin
*   **Description:** Crée une nouvelle cohorte de formation.
*   **Headers:**
    ```json
    {
      "Content-Type": "application/json",
      "Authorization": "Bearer {{TOKEN_ADMIN}}"
    }
    ```
*   **Body:**
    ```json
    {
      "nom": "Cohorte Spring Boot 2025-Q3",
      "description": "Cohorte dédiée au développement backend avec Spring Boot.",
      "dateDebut": "2025-09-01T09:00:00",
      "dateFin": "2025-11-30T17:00:00"
    }
    ```
*   **Exemple de Réponse JSON (Succès):**
    ```json
    {
      "data": {
        "id": 3,
        "createdAt": "2025-08-20T10:00:00",
        "updatedAt": "2025-08-20T10:00:00",
        "nom": "Cohorte Spring Boot 2025-Q3",
        "description": "Cohorte dédiée au développement backend avec Spring Boot.",
        "dateDebut": "2025-09-01T09:00:00",
        "dateFin": "2025-11-30T17:00:00"
      },
      "ok": true,
      "message": "Cohorte créée avec succès"
    }
    ```

#### 6.3.2. Mettre à jour une cohorte existante
*   **Endpoint:** `PUT /awsodclearning/cohorte/update`
*   **Rôle:** Admin
*   **Description:** Met à jour les informations d'une cohorte existante.
*   **Headers:**
    ```json
    {
      "Content-Type": "application/json",
      "Authorization": "Bearer {{TOKEN_ADMIN}}"
    }
    ```
*   **Body:**
    ```json
    {
      "id": 3,
      "nom": "Cohorte Spring Boot & Microservices 2025-Q3",
      "description": "Cohorte avancée sur Spring Boot et les microservices.",
      "dateDebut": "2025-09-01T09:00:00",
      "dateFin": "2025-12-15T17:00:00"
    }
    ```
*   **Exemple de Réponse JSON (Succès):**
    ```json
    {
      "data": {
        "id": 3,
        "createdAt": "2025-08-20T10:00:00",
        "updatedAt": "2025-08-20T11:30:00",
        "nom": "Cohorte Spring Boot & Microservices 2025-Q3",
        "description": "Cohorte avancée sur Spring Boot et les microservices.",
        "dateDebut": "2025-09-01T09:00:00",
        "dateFin": "2025-12-15T17:00:00"
      },
      "ok": true,
      "message": "Cohorte mise à jour avec succès"
    }
    ```

#### 6.3.3. Supprimer une cohorte
*   **Endpoint:** `DELETE /awsodclearning/cohorte/delete/{id}`
*   **Rôle:** Admin
*   **Description:** Supprime une cohorte par son ID.
*   **Headers:**
    ```json
    {
      "Authorization": "Bearer {{TOKEN_ADMIN}}"
    }
    ```
*   **Path Variables:**
    *   `id`: ID de la cohorte à supprimer (ex: `3`)
*   **Exemple de Réponse JSON (Succès):**
    ```json
    {
      "data": null,
      "ok": true,
      "message": "Cohorte supprimée avec succès"
    }
    ```

### 6.4. Gestion des Configurations (ConfigurationController)

#### 6.4.1. Mettre à jour la configuration de l'application
*   **Endpoint:** `POST /awsodclearning/configurations/update`
*   **Rôle:** Admin
*   **Description:** Met à jour divers paramètres de configuration de l'application (texte de la page d'accueil, images, etc.).
*   **Headers:**
    ```json
    {
      "Content-Type": "multipart/form-data",
      "Authorization": "Bearer {{TOKEN_ADMIN}}"
    }
    ```
*   **Form Data:**
    *   `homepageText`: (texte, optionnel)
    *   `homepageImage`: (fichier image, optionnel)
    *   `loginImage`: (fichier image, optionnel)
    *   `aboutText`: (texte, optionnel)
    *   `aboutImage`: (fichier image, optionnel)
*   **Exemple de Body (form-data avec uniquement du texte):**
    ```
    homepageText: "Nouveau message d'accueil pour ODC Learning"
    aboutText: "Texte mis à jour pour la section 'À propos'"
    ```
*   **Exemple de Body (form-data avec un fichier):**
    ```
    homepageText: "Bienvenue sur Orange Digital Learning!"
    homepageImage: (sélectionner un fichier image)
    ```
*   **Exemple de Réponse JSON (Succès):**
    ```json
    {
      "data": {
        "id": 1,
        "createdAt": "2025-01-01T08:00:00",
        "updatedAt": "2025-01-01T15:00:00",
        "homepageText": "Nouveau message d'accueil pour ODC Learning",
        "homepageImageUrl": "http://example.com/images/new_homepage.png",
        "loginImageUrl": "http://example.com/images/login.png",
        "aboutText": "Texte mis à jour pour la section 'À propos'",
        "aboutImageUrl": "http://example.com/images/about.png"
      },
      "ok": true,
      "message": "Configuration mise à jour avec succès"
    }
    ```

### 6.5. Gestion des Cours (CoursesController)

#### 6.5.1. Créer un nouveau cours
*   **Endpoint:** `POST /awsodclearning/courses/save/{catId}`
*   **Rôle:** Admin
*   **Description:** Crée un nouveau cours associé à une catégorie. La requête est `multipart/form-data`.
*   **Headers:**
    ```json
    {
      "Content-Type": "multipart/form-data",
      "Authorization": "Bearer {{TOKEN_ADMIN}}"
    }
    ```
*   **Path Variable:**
    *   `catId`: L'ID de la catégorie (ex: `1`)
*   **Form Data:**
    *   `courses`: (champ texte):
        ```json
        {
          "title": "Spring Boot Avancé",
          "description": "Apprenez Spring Boot pour des applications d'entreprise.",
          "duration": 15,
          "courseType": "REGISTER",
          "price": 99.99,
          "categorie": { "id": 1 }
        }
        ```
    *   `image`: (fichier, optionnel): `(joindre un fichier image)`
*   **Exemple de Réponse JSON (Succès):**
    ```json
    {
      "data": {
        "id": 3,
        "createdAt": "2025-01-01T10:00:00",
        "updatedAt": "2025-01-01T10:00:00",
        "title": "Spring Boot Avancé",
        "description": "Apprenez Spring Boot pour des applications d'entreprise.",
        "imagePath": "unique_filename.png",
        "duration": 15,
        "courseType": "REGISTER",
        "price": 99.99,
        "categorie": {
          "id": 1,
          "title": "Développement Web"
        }
      },
      "ok": true,
      "message": "Cours enregistré avec succès"
    }
    ```

#### 6.5.2. Mettre à jour un cours existant
*   **Endpoint:** `PUT /awsodclearning/courses/update`
*   **Rôle:** Admin
*   **Description:** Met à jour les informations d'un cours existant. La requête est `multipart/form-data`.
*   **Headers:**
    ```json
    {
      "Content-Type": "multipart/form-data",
      "Authorization": "Bearer {{TOKEN_ADMIN}}"
    }
    ```
*   **Form Data:**
    *   `courses`: (champ texte):
        ```json
        {
          "id": 3,
          "title": "Spring Boot & Microservices Avancé",
          "description": "Maîtrisez Spring Boot et les microservices.",
          "duration": 20,
          "courseType": "REGISTER",
          "price": 129.99,
          "categorie": { "id": 1 }
        }
        ```
    *   `image`: (fichier, optionnel): `(joindre un nouveau fichier image)`
*   **Exemple de Réponse (Succès - Texte Brut):**
    ```
    Le cours a été mis à jour avec succès.
    ```
    (Note: Le contrôleur retourne un `ResponseEntity<String>` pour le succès)

#### 6.5.3. Supprimer un cours
*   **Endpoint:** `DELETE /awsodclearning/courses/delete/{id}`
*   **Rôle:** Admin
*   **Description:** Supprime un cours par son ID.
*   **Headers:**
    ```json
    {
      "Authorization": "Bearer {{TOKEN_ADMIN}}"
    }
    ```
*   **Path Variables:**
    *   `id`: ID du cours à supprimer (ex: `3`)
*   **Exemple de Réponse (Succès - Texte Brut):**
    ```
    Le cours a été supprimé avec succès.
    ```

### 6.6. Gestion des Évaluations (EvaluationsController)

#### 6.6.1. Créer une nouvelle évaluation
*   **Endpoint:** `POST /awsodclearning/evaluations/save`
*   **Rôle:** Admin
*   **Description:** Crée une nouvelle évaluation avec des questions et réponses.
*   **Headers:**
    ```json
    {
      "Content-Type": "application/json",
      "Authorization": "Bearer {{TOKEN_ADMIN}}"
    }
    ```
*   **Body:**
    ```json
    {
      "title": "Nouvelle Évaluation JavaScript",
      "description": "Évaluation des fondamentaux de JavaScript.",
      "status": "Draft",
      "imagePath": "/path/to/js_evaluation.png",
      "questions": [
        {
          "title": "Question JS 1",
          "description": "Que retourne `typeof null` ?",
          "status": "Active",
          "type": "QCM",
          "reponses": [
            {
              "title": "null",
              "description": "null",
              "status": "Active"
            },
            {
              "title": "object",
              "description": "object",
              "status": "Active"
            }
          ]
        }
      ]
    }
    ```
*   **Exemple de Réponse JSON (Succès):**
    ```json
    {
      "data": {
        "id": 3,
        "createdAt": "2025-01-01T10:00:00",
        "updatedAt": "2025-01-01T10:00:00",
        "title": "Nouvelle Évaluation JavaScript",
        "description": "Évaluation des fondamentaux de JavaScript.",
        "status": "Draft",
        "imagePath": "/path/to/js_evaluation.png",
        "questions": [
          {
            "id": 201,
            "title": "Question JS 1",
            "description": "Que retourne `typeof null` ?",
            "status": "Active",
            "type": "QCM",
            "reponses": [
              {
                "id": 301,
                "title": "null",
                "description": "null",
                "status": "Active"
              },
              {
                "id": 302,
                "title": "object",
                "description": "object",
                "status": "Active"
              }
            ]
          }
        ]
      },
      "ok": true,
      "message": "Évaluation créée avec succès"
    }
    ```

### 6.7. Gestion des Labs (LabController)

#### 6.7.1. Lancer une session de lab
*   **Endpoint:** `POST /awsodclearning/api/labs/start/{labId}`
*   **Rôle:** User, Admin, Learner
*   **Description:** Lance une nouvelle session de lab pour l'utilisateur authentifié.
*   **Headers:**
    ```json
    {
      "Authorization": "Bearer {{TOKEN_APPRENANT}}"
    }
    ```
*   **Path Variables:**
    *   `labId`: ID de la définition du lab à lancer (ex: `1`)
*   **Exemple de Réponse JSON (Succès):**
    ```json
    {
      "data": {
        "id": 10,
        "createdAt": "2025-01-01T10:30:00",
        "updatedAt": "2025-01-01T10:30:00",
        "user": {
          "id": "{{USER_ID_APPRENANT}}",
          "email": "learner@odc.com"
        },
        "labDefinition": {
          "id": 1,
          "title": "Lab: Déploiement Docker sur EC2"
        },
        "status": "RUNNING",
        "containerUrl": "http://lab-session-123.aws.com",
        "startTime": "2025-01-01T10:30:00",
        "endTime": null,
        "grade": null,
        "reportUrl": null
      },
      "ok": true,
      "message": "Session de lab lancée avec succès"
    }
    ```

#### 6.7.2. Arrêter une session de lab
*   **Endpoint:** `POST /awsodclearning/api/labs/stop/{sessionId}`
*   **Rôle:** User, Admin, Learner
*   **Description:** Arrête une session de lab en cours. L'utilisateur doit être le propriétaire de la session.
*   **Headers:**
    ```json
    {
      "Authorization": "Bearer {{TOKEN_APPRENANT}}"
    }
    ```
*   **Path Variables:**
    *   `sessionId`: ID de la session de lab à arrêter (ex: `10`)
*   **Exemple de Réponse JSON (Succès):**
    ```json
    {
      "data": {
        "id": 10,
        "createdAt": "2025-01-01T10:30:00",
        "updatedAt": "2025-01-01T11:00:00",
        "user": {
          "id": "{{USER_ID_APPRENANT}}",
          "email": "learner@odc.com"
        },
        "labDefinition": {
          "id": 1,
          "title": "Lab: Déploiement Docker sur EC2"
        },
        "status": "STOPPED",
        "containerUrl": "http://lab-session-123.aws.com",
        "startTime": "2025-01-01T10:30:00",
        "endTime": "2025-01-01T11:00:00",
        "grade": null,
        "reportUrl": null
      },
      "ok": true,
      "message": "Session de lab arrêtée avec succès"
    }
    ```

#### 6.7.3. Soumettre le résultat d'une session de lab
*   **Endpoint:** `POST /awsodclearning/api/labs/submit/{sessionId}`
*   **Rôle:** User, Admin, Learner
*   **Description:** Soumet le rapport ou le résultat d'une session de lab terminée. L'utilisateur doit être le propriétaire de la session.
*   **Headers:**
    ```json
    {
      "Content-Type": "application/json",
      "Authorization": "Bearer {{TOKEN_APPRENANT}}"
    }
    ```
*   **Path Variables:**
    *   `sessionId`: ID de la session de lab à soumettre (ex: `10`)
*   **Body (optionnel):**
    ```json
    {
      "reportUrl": "http://mon-serveur.com/rapports/lab1_userX.pdf"
    }
    ```
*   **Exemple de Réponse JSON (Succès):**
    ```json
    {
      "data": {
        "id": 10,
        "createdAt": "2025-01-01T10:30:00",
        "updatedAt": "2025-01-01T11:15:00",
        "user": {
          "id": "{{USER_ID_APPRENANT}}",
          "email": "learner@odc.com"
        },
        "labDefinition": {
          "id": 1,
          "title": "Lab: Déploiement Docker sur EC2"
        },
        "status": "SUBMITTED",
        "containerUrl": "http://lab-session-123.aws.com",
        "startTime": "2025-01-01T10:30:00",
        "endTime": "2025-01-01T11:00:00",
        "grade": null,
        "reportUrl": "http://mon-serveur.com/rapports/lab1_userX.pdf"
      },
      "ok": true,
      "message": "Session de lab soumise avec succès"
    }
    ```

### 6.8. Gestion de la Progression Apprenant (LearnerChapterController)

#### 6.8.1. Valider un chapitre
*   **Endpoint:** `POST /awsodclearning/learnerchapter/save`
*   **Rôle:** User, Admin, Learner
*   **Description:** Marque un chapitre comme terminé pour un utilisateur.
*   **Note:** L'API attend des données `application/x-www-form-urlencoded`.
*   **Headers:** `Content-Type: application/x-www-form-urlencoded`
*   **Form Data:**
    *   `userId`: `{{USER_ID_APPRENANT}}`
    *   `chapitreId`: `{{chapitre_id}}`
    *   `coursId`: `{{course_gratuit_id}}`
*   **Exemple de Réponse JSON (Succès):**
    ```json
    {
      "data": {
        "id": 1,
        "createdAt": "2025-01-10T15:00:00",
        "updatedAt": "2025-01-10T15:00:00",
        "learner": {
          "id": "{{USER_ID_APPRENANT}}",
          "email": "learner@odc.com"
        },
        "chapter": {
          "id": "{{chapitre_id}}",
          "title": "Chapitre 1: Introduction"
        }
      },
      "ok": true,
      "message": "Progression de l'apprenant enregistrée"
    }
    ```

### 6.9. Gestion des Commandes (OrderController)

#### 6.9.1. Créer une commande
*   **Endpoint:** `POST /awsodclearning/orders/create`
*   **Rôle:** Apprenant (Authentifié)
*   **Description:** Initialise une commande pour un ou plusieurs cours payants.
*   **Headers:**
    ```json
    {
      "Content-Type": "application/json",
      "Authorization": "Bearer {{TOKEN_APPRENANT}}"
    }
    ```
*   **Body:**
    ```json
    {
      "courseIds": ["{{course_payant_id}}"]
    }
    ```
*   **Exemple de Réponse JSON (Succès):**
    ```json
    {
      "data": {
        "id": 1,
        "createdAt": "2025-01-10T14:30:00",
        "updatedAt": "2025-01-10T14:30:00",
        "user": {
          "id": "{{USER_ID_APPRENANT}}",
          "email": "learner@odc.com"
        },
        "orderDate": "2025-01-10T14:30:00",
        "totalAmount": 49.99,
        "status": "PENDING",
        "paymentId": null,
        "items": [
          {
            "id": 1,
            "course": {
              "id": "{{course_payant_id}}",
              "title": "React Avancé"
            },
            "price": 49.99
          }
        ]
      },
      "ok": true,
      "message": "Commande créée avec succès"
    }
    ```

#### 6.9.2. Créer une intention de paiement (Stripe)
*   **Endpoint:** `POST /awsodclearning/orders/payment-intent/{orderId}`
*   **Rôle:** Apprenant (Authentifié)
*   **Description:** Génère une intention de paiement auprès de Stripe.
*   **Headers:**
    ```json
    {
      "Authorization": "Bearer {{TOKEN_APPRENANT}}"
    }
    ```
*   **Path Variables:**
    *   `orderId`: ID de la commande (ex: `1`)
*   **Exemple de Réponse JSON (Succès):**
    ```json
    {
      "data": {
        "clientSecret": "pi_xxxxxxxxxxxxxxxxx_secret_xxxxxxxxxxxxxxxxx",
        "paymentIntentId": "pi_xxxxxxxxxxxxxxxxx"
      },
      "ok": true,
      "message": "Intention de paiement créée"
    }
    ```

#### 6.9.3. Confirmer le paiement
*   **Endpoint:** `POST /awsodclearning/orders/confirm`
*   **Rôle:** Apprenant (Authentifié)
*   **Description:** Confirme le paiement après une action côté client (simulation).
*   **Headers:**
    ```json
    {
      "Content-Type": "application/json",
      "Authorization": "Bearer {{TOKEN_APPRENANT}}"
    }
    ```
*   **Body:**
    ```json
    {
      "paymentIntentId": "pi_xxxxxxxxxxxxxxxxx"
    }
    ```
*   **Exemple de Réponse JSON (Succès):**
    ```json
    {
      "data": {
        "id": 1,
        "createdAt": "2025-01-10T14:30:00",
        "updatedAt": "2025-01-10T14:35:00",
        "user": {
          "id": "{{USER_ID_APPRENANT}}",
          "email": "learner@odc.com"
        },
        "orderDate": "2025-01-10T14:30:00",
        "totalAmount": 49.99,
        "status": "PAID",
        "paymentId": "pi_xxxxxxxxxxxxxxxxx",
        "items": [
          {
            "id": 1,
            "course": {
              "id": "{{course_payant_id}}",
              "title": "React Avancé"
            },
            "price": 49.99
          }
        ]
      },
      "ok": true,
      "message": "Paiement confirmé avec succès"
    }
    ```

### 6.9. Gestion des Commandes (OrderController)

#### 6.9.1. Créer une commande
*   **Endpoint:** `POST /awsodclearning/orders/create`
*   **Rôle:** Apprenant (Authentifié)
*   **Description:** Initialise une commande pour un ou plusieurs cours payants.
*   **Headers:**
    ```json
    {
      "Content-Type": "application/json",
      "Authorization": "Bearer {{TOKEN_APPRENANT}}"
    }
    ```
*   **Body:**
    ```json
    {
      "courseIds": ["{{course_payant_id}}"]
    }
    ```
*   **Exemple de Réponse JSON (Succès):**
    ```json
    {
      "data": {
        "id": 1,
        "createdAt": "2025-01-10T14:30:00",
        "updatedAt": "2025-01-10T14:30:00",
        "user": {
          "id": "{{USER_ID_APPRENANT}}",
          "email": "learner@odc.com"
        },
        "orderDate": "2025-01-10T14:30:00",
        "totalAmount": 49.99,
        "status": "PENDING",
        "paymentId": null,
        "items": [
          {
            "id": 1,
            "course": {
              "id": "{{course_payant_id}}",
              "title": "React Avancé"
            },
            "price": 49.99
          }
        ]
      },
      "ok": true,
      "message": "Commande créée avec succès"
    }
    ```

#### 6.9.2. Créer une intention de paiement (Stripe)
*   **Endpoint:** `POST /awsodclearning/orders/payment-intent/{orderId}`
*   **Rôle:** Apprenant (Authentifié)
*   **Description:** Génère une intention de paiement auprès de Stripe.
*   **Headers:**
    ```json
    {
      "Authorization": "Bearer {{TOKEN_APPRENANT}}"
    }
    ```
*   **Path Variables:**
    *   `orderId`: ID de la commande (ex: `1`)
*   **Exemple de Réponse JSON (Succès):**
    ```json
    {
      "data": {
        "clientSecret": "pi_xxxxxxxxxxxxxxxxx_secret_xxxxxxxxxxxxxxxxx",
        "paymentIntentId": "pi_xxxxxxxxxxxxxxxxx"
      },
      "ok": true,
      "message": "Intention de paiement créée"
    }
    ```

#### 6.9.3. Confirmer le paiement
*   **Endpoint:** `POST /awsodclearning/orders/confirm`
*   **Rôle:** Apprenant (Authentifié)
*   **Description:** Confirme le paiement après une action côté client (simulation).
*   **Headers:**
    ```json
    {
      "Content-Type": "application/json",
      "Authorization": "Bearer {{TOKEN_APPRENANT}}"
    }
    ```
*   **Body:**
    ```json
    {
      "paymentIntentId": "pi_xxxxxxxxxxxxxxxxx"
    }
    ```
*   **Exemple de Réponse JSON (Succès):**
    ```json
    {
      "data": {
        "id": 1,
        "createdAt": "2025-01-10T14:30:00",
        "updatedAt": "2025-01-10T14:35:00",
        "user": {
          "id": "{{USER_ID_APPRENANT}}",
          "email": "learner@odc.com"
        },
        "orderDate": "2025-01-10T14:30:00",
        "totalAmount": 49.99,
        "status": "PAID",
        "paymentId": "pi_xxxxxxxxxxxxxxxxx",
        "items": [
          {
            "id": 1,
            "course": {
              "id": "{{course_payant_id}}",
              "title": "React Avancé"
            },
            "price": 49.99
          }
        ]
      },
      "ok": true,
      "message": "Paiement confirmé avec succès"
    }
    ```

### 6.10. Gestion des Questions (QuestionsController)

#### 6.10.1. Créer une nouvelle question
*   **Endpoint:** `POST /awsodclearning/questions/save`
*   **Rôle:** Admin
*   **Description:** Crée une nouvelle question.
*   **Headers:**
    ```json
    {
      "Content-Type": "application/json",
      "Authorization": "Bearer {{TOKEN_ADMIN}}"
    }
    ```
*   **Body:**
    ```json
    {
      "title": "Question sur les Hooks React",
      "description": "Quel hook est utilisé pour gérer l'état local dans un composant fonctionnel ?",
      "status": "Active",
      "imagePath": null,
      "type": "QCM",
      "evaluations": {
        "id": 3
      }
    }
    ```
*   **Exemple de Réponse JSON (Succès):**
    ```json
    {
      "data": {
        "id": 203,
        "createdAt": "2025-01-05T10:00:00",
        "updatedAt": "2025-01-05T10:00:00",
        "title": "Question sur les Hooks React",
        "description": "Quel hook est utilisé pour gérer l'état local dans un composant fonctionnel ?",
        "status": "Active",
        "imagePath": null,
        "type": "QCM",
        "reponses": [],
        "evaluations": {
          "id": 3,
          "title": "Nouvelle Évaluation JavaScript"
        }
      },
      "ok": true,
      "message": "Question enregistrée avec succès"
    }
    ```

### 6.11. Gestion des Quiz (QuizController)

#### 6.11.1. Créer un nouveau quiz
*   **Endpoint:** `POST /awsodclearning/quiz/create`
*   **Rôle:** Admin
*   **Description:** Crée un nouveau quiz complet avec questions et réponses.
*   **Headers:**
    ```json
    {
      "Content-Type": "application/json",
      "Authorization": "Bearer {{TOKEN_ADMIN}}"
    }
    ```
*   **Body:**
    ```json
    {
      "titre": "Quiz sur les Fondamentaux de Java",
      "description": "Testez vos connaissances sur les bases de Java.",
      "courseId": "{{course_gratuit_id}}",
      "dureeMinutes": 20,
      "scoreMinimum": 70,
      "questions": [
        {
          "contenu": "Quel mot-clé est utilisé pour l'héritage en Java ?",
          "type": "QCM",
          "points": 5,
          "reponses": [
            { "texte": "implements", "estCorrecte": false },
            { "texte": "extends", "estCorrecte": true },
            { "texte": "inherits", "estCorrecte": false }
          ]
        },
        {
          "contenu": "Java est-il un langage compilé ou interprété ? (Plusieurs réponses possibles)",
          "type": "QCM",
          "points": 10,
          "reponses": [
            { "texte": "Compilé", "estCorrecte": true },
            { "texte": "Interprété", "estCorrecte": true }
          ]
        }
      ]
    }
    ```
*   **Exemple de Réponse JSON (Succès):**
    ```json
    {
      "data": {
        "id": 501,
        "titre": "Quiz sur les Fondamentaux de Java",
        "description": "Testez vos connaissances sur les bases de Java.",
        "courseId": "{{course_gratuit_id}}",
        "dureeMinutes": 20,
        "scoreMinimum": 70,
        "questions": [
          {
            "id": 601,
            "contenu": "Quel mot-clé est utilisé pour l'héritage en Java ?",
            "type": "QCM",
            "points": 5,
            "reponses": [
              {
                "id": 701,
                "texte": "implements",
                "estCorrecte": false
              },
              {
                "id": 702,
                "texte": "extends",
                "estCorrecte": true
              },
              {
                "id": 703,
                "texte": "inherits",
                "estCorrecte": false
              }
            ]
          }
        ]
      },
      "ok": true,
      "message": "Quiz créé avec succès"
    }
    ```

#### 6.11.2. Soumettre un quiz
*   **Endpoint:** `POST /awsodclearning/quiz/submit`
*   **Rôle:** User, Admin, Learner
*   **Description:** Soumet les réponses de l'apprenant pour un quiz et retourne le résultat.
*   **Headers:**
    ```json
    {
      "Content-Type": "application/json",
      "Authorization": "Bearer {{TOKEN_APPRENANT}}"
    }
    ```
*   **Body:**
    ```json
    {
      "quizId": 501,
      "answers": [
        {
          "questionId": 601,
          "reponseIds": [702]
        }
      ]
    }
    ```
*   **Exemple de Réponse JSON (Succès - Résultat du Quiz):**
    ```json
    {
      "data": {
        "userQuizAttemptId": 1,
        "quizId": 501,
        "userId": "{{USER_ID_APPRENANT}}",
        "score": 5,
        "maxScore": 5,
        "passed": true,
        "submissionDate": "2025-01-05T11:00:00"
      },
      "ok": true,
      "message": "Quiz soumis avec succès"
    }
    ```

### 6.12. Gestion des Réponses (ReponsesController)

#### 6.12.1. Créer une nouvelle réponse
*   **Endpoint:** `POST /awsodclearning/reponses/save`
*   **Rôle:** Admin
*   **Description:** Crée une nouvelle réponse pour une question existante.
*   **Headers:**
    ```json
    {
      "Content-Type": "application/json",
      "Authorization": "Bearer {{TOKEN_ADMIN}}"
    }
    ```
*   **Body:**
    ```json
    {
      "title": "Réponse Exemple 1",
      "description": "Ceci est une description pour la réponse exemple.",
      "status": "Active",
      "imagePath": null,
      "questions": {
        "id": 203
      }
    }
    ```
*   **Exemple de Réponse JSON (Succès):**
    ```json
    {
      "data": {
        "id": 303,
        "createdAt": "2025-01-05T10:15:00",
        "updatedAt": "2025-01-05T10:15:00",
        "title": "Réponse Exemple 1",
        "description": "Ceci est une description pour la réponse exemple.",
        "status": "Active",
        "imagePath": null,
        "questions": {
          "id": 203,
          "title": "Question sur les Hooks React"
        }
      },
      "ok": true,
      "message": "Réponse enregistrée avec succès"
    }
    ```