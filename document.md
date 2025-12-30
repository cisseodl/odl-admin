# Documentation Technique du Projet : Tableau de Bord ODC Learning

Ce document fournit un aperçu technique détaillé du tableau de bord d'administration, incluant son architecture, les fonctionnalités implémentées, les composants clés et les solutions techniques adoptées.

---

## 1. Vue d'ensemble du Projet

*   **Objectif :** Développer un tableau de bord d'administration pour la plateforme e-learning ODC Learning, permettant la gestion des utilisateurs (apprenants, instructeurs, administrateurs), des contenus (cours, catégories, rubriques), et offrant des outils de suivi et d'analyse.
*   **Technologies Frontend :**
    *   **Framework :** Next.js (version 16.0.10)
    *   **Langage :** TypeScript
    *   **UI/Composants :** Shadcn UI, Tailwind CSS
    *   **Gestion de formulaires :** React Hook Form avec Zod pour la validation des schémas.
    *   **Gestion d'état global :** React Context API (pour l'authentification).
    *   **Thème :** `next-themes` pour la gestion du mode sombre.
*   **Technologies Backend (assumées par les endpoints) :** Spring Boot (Java) avec des APIs REST.

## 2. Architecture Frontend

L'application suit une architecture basée sur Next.js App Router, organisant le code en modules fonctionnels (`app/`, `components/`, `services/`, `hooks/`, `lib/`, `models/`, `types/`).

*   **Structure des Répertoires Clés :**
    *   `app/` : Pages et layouts de l'application (ex: `/admin`, `/admin/users`).
    *   `components/` : Composants UI réutilisables, subdivisés par domaine (`admin/`, `shared/`, `ui/`).
    *   `services/` : Modules pour l'interaction avec l'API backend (ex: `user.service.ts`, `cohorte.service.ts`).
    *   `hooks/` : Hooks React personnalisés pour la logique réutilisable (ex: `useModal`, `useSearch`).
    *   `lib/validations/` : Schémas Zod pour la validation des formulaires.
    *   `models/` : Interfaces TypeScript représentant les modèles de données du backend.
    *   `contexts/` : Fournisseurs de contexte React (ex: `auth-context.tsx`).

*   **Communication API :**
    *   Un service `api.service.ts` centralise les appels `fetch`, gérant l'ajout automatique du token d'authentification (`Authorization: Bearer {{TOKEN}}`) depuis `localStorage` et la désérialisation des réponses JSON.
    *   **Proxy de développement :** Configuration de `next.config.mjs` avec des règles de `rewrites` pour rediriger les appels API (ex: `/awsodclearning/:path*`) vers le serveur backend (`http://localhost:8080/awsodclearning/:path*`), résolvant les problèmes de CORS et de routage en développement.

## 3. Fonctionnalités Implémentées et Améliorations Techniques

### 3.1. Gestion des Utilisateurs et du Contenu

#### 3.1.1. Gestion des Instructeurs
*   **Fichiers Modifiés :** `components/admin/instructors-list.tsx`, `services/instructor.service.ts`, `lib/validations/instructor.ts`, `components/shared/instructor-form-modal.tsx`.
*   **Implémentation :**
    *   Le `InstructorsList` récupère les instructeurs via `instructorService.getAllInstructors()` (`GET /instructors/read`).
    *   `instructor.service.ts` a été créé pour encapsuler les appels API (GET, PUT).
    *   La modification (`handleUpdateInstructor`) envoie les données du formulaire (`InstructorFormData`) à `instructorService.updateInstructor()` (`PUT /instructors/update/{id}`).
    *   Le schéma Zod `instructorSchema` et le `InstructorFormModal` ont été mis à jour pour inclure les champs `firstName`, `lastName`, `phone`, `qualifications`, `bio`, `imagePath`.
    *   Mappage robuste des dates et des placeholders pour les champs non fournis par l'API (courses, students, rating).

#### 3.1.2. Gestion des Apprenants (via la page "Utilisateurs")
*   **Fichiers Modifiés :** `components/admin/users-list.tsx`, `services/apprenant.service.ts`, `lib/validations/user.ts`, `components/shared/user-form-modal.tsx`.
*   **Implémentation :**
    *   Correction du mappage `mapUserDbToUserDisplay` pour interpréter correctement `userDb.role` (ADMIN, INSTRUCTOR, USER) et l'afficher comme "Admin", "Instructeur" ou "Apprenant".
    *   `apprenant.service.ts` a été complété avec `updateApprenant(id, apprenantData)` et `deleteApprenant(id)` (`PUT /apprenants/update/{id}`, `DELETE /apprenants/delete/{id}`).
    *   Les fonctions `handleUpdateUser` et `handleDeleteUser` dans `UsersList` appellent désormais ces services.
    *   Le schéma Zod `userSchema` et le `UserFormModal` ont été étendus pour inclure les champs `nom`, `prenom`, `numero`, `profession`, `niveauEtude`, `filiere`, `cohorteId`.

#### 3.1.3. Gestion des Cohortes
*   **Fichiers Modifiés :** `services/cohorte.service.ts`, `lib/validations/cohorte.ts`, `components/shared/cohorte-form-modal.tsx`, `components/admin/cohortes-list.tsx`.
*   **Implémentation :**
    *   `cohorte.service.ts` a été corrigé pour `updateCohorte` (ID dans l'URL) et implémente `getAllCohortes`, `createCohorte`, `updateCohorte`, `deleteCohorte`.
    *   Schéma Zod `cohorteSchema` et `CohorteFormModal` créés pour `nom`, `description`, `dateDebut`, `dateFin` avec des sélecteurs de date `shadcn/ui`.
    *   `CohortesList` intègre toutes les opérations CRUD et affiche les cohortes.
    *   **Correction des dates :** Résolution de l'erreur `RangeError: Invalid time value` dans `CohorteFormModal` par une gestion robuste des dates (`new Date(...).getTime()`) lors de l'initialisation et de la soumission du formulaire (conversion de formats locaux en ISO string).

#### 3.1.4. Gestion des Catégories
*   **Fichiers Modifiés :** `services/categorie.service.ts`, `lib/validations/category.ts`, `components/shared/category-form-modal.tsx`, `components/admin/categories-list.tsx`.
*   **Implémentation :**
    *   `categorie.service.ts` utilise `getAllCategories`, `createCategorie`, `updateCategorie`, `deleteCategorie`.
    *   Schéma Zod `categorySchema` et `CategoryFormModal` créés pour `title` et `description`.
    *   `CategoriesList` intègre toutes les opérations CRUD.
    *   **Amélioration de l'erreur :** `handleDeleteCategory` fournit des messages d'erreur spécifiques (`404/401/403`).

#### 3.1.5. Gestion des Rubriques (Nouvelle section dans les Paramètres)
*   **Fichiers Modifiés :** `services/rubrique.service.ts`, `lib/validations/rubrique.ts`, `components/shared/rubrique-form-modal.tsx`, `components/admin/rubriques-list.tsx`, `components/admin/settings-panel.tsx`.
*   **Implémentation :**
    *   `rubrique.service.ts` : Services CRUD créés (`getAllRubriques`, `createRubrique`, `updateRubrique`, `deleteRubrique`) avec endpoints assumés (`/rubriques/read`, `/save`, `/update/{id}`, `/delete/{id}`).
    *   Schéma Zod `rubriqueSchema` et `RubriqueFormData` créés pour `rubrique`, `image`, `description`, `objectifs`, `publicCible`, `dureeFormat`, `lienRessources`.
    *   **Gestion des images inconsistante de l'API :**
        *   `createRubrique` (POST) : Utilise `multipart/form-data` avec `imageFile` (champ `File`).
        *   `updateRubrique` (PUT) : Utilise `application/json` avec `image` (chemin string).
        *   Le `RubriqueFormModal` s'adapte dynamiquement (input texte vs input fichier) en fonction du mode (création/modification).
    *   `RubriquesList` affiche et gère les rubriques.
    *   Intégration de `RubriquesList` dans `SettingsPanel` via un nouvel onglet "Rubriques" ( `TabsTrigger`, `TabsContent` ).
    *   Correction des problèmes de casse (`public_cible` -> `publicCible`, `duree_format` -> `dureeFormat`) dans le mappage et l'affichage.

### 3.2. Améliorations Générales de l'Interface Utilisateur (UI/UX)

*   **Mode Sombre :**
    *   **Implémentation :** Intégration de `next-themes` pour un mode sombre cohérent.
    *   **Fichiers Modifiés :** `app/layout.tsx` (intégration du `ThemeProvider`), `components/theme-toggle.tsx` (bouton de bascule), `components/admin/header.tsx` (intégration du bouton).
    *   **Fonctionnalité :** Bouton dans l'en-tête pour basculer entre les modes "Clair" et "Sombre".
*   **Formulaires Modaux Défilants :**
    *   **Implémentation :** Application de `max-h-[calc(100vh_-_100px)]` et `overflow-y-auto` à `DialogContent` dans `components/ui/modal-form.tsx`.
    *   **Impact :** Résolution des problèmes de contenu coupé et de "parties transparentes" dans les formulaires longs.
*   **Champs de Rôle Pré-sélectionnés et Désactivés :**
    *   **Implémentation :** Modification de `components/shared/user-form-modal.tsx` pour accepter `roleDefaultValue` et `disableRoleField`.
    *   **Impact :** Le champ de rôle est automatiquement réglé sur "Apprenant" et désactivé lors de l'ajout/modification d'un apprenant, garantissant la cohérence.
*   **Espacement de la Sidebar :**
    *   **Implémentation :** Ajustement des classes Tailwind CSS (`mb-3`) dans `components/admin/sidebar.tsx`.
    *   **Impact :** Amélioration de la lisibilité et de l'esthétique de la barre latérale.

### 3.3. Corrections de Bugs Techniques Critiques

*   **Problèmes d'Importation de Hooks Next.js (`useState`, `useEffect`) :**
    *   **Contexte :** Erreurs `ReferenceError: useState is not defined` dues à un placement incorrect de l'import et/ou de la directive `"use client"`.
    *   **Solution :** Correction du fichier `components/admin/settings-panel.tsx` pour garantir que la directive `"use client"` est la toute première ligne, suivie des imports nécessaires (`import { useState, useEffect } from "react"`).
*   **Problèmes de Routage API (Proxy Next.js) :**
    *   **Contexte :** Erreurs `net::ERR_CONNECTION_REFUSED` et réception de réponses HTML au lieu de JSON pour les appels API.
    *   **Solution :** Configuration de `next.config.mjs` avec des règles de `rewrites` pour proxyfier correctement les requêtes `/awsodclearning/:path*` vers le serveur backend `http://localhost:8080/awsodclearning/:path*`.
*   **Erreurs de Formatage de Date :**
    *   **Contexte :** Erreur `RangeError: Invalid time value` lors de la manipulation des dates dans `CohorteFormModal`.
    *   **Solution :** Implémentation de validations robustes (`!isNaN(new Date(value).getTime())`) et de conversions de format (`DD/MM/YYYY` vers `ISO string`) lors de l'initialisation et de la soumission des formulaires de date.
*   **Erreurs de Syntaxe :**
    *   Correction de diverses erreurs de syntaxe (par exemple, des accolades mal placées dans la définition des colonnes de `DataTable` dans `rubriques-list.tsx` et des caractères indésirables dans `users-list.tsx`) pour assurer la compilation et l'exécution sans accroc.

---

Ce document reflète un état d'avancement significatif du projet frontend, avec une attention particulière portée à la fiabilité, à l'extensibilité et à l'expérience utilisateur, tout en résolvant les défis techniques rencontrés.
