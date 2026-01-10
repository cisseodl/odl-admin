# Système d'Internationalisation (i18n)

Ce projet utilise un système d'internationalisation simple basé sur React Context pour gérer le changement de langue entre le français et l'anglais.

## Structure

- `fr.json` : Traductions en français
- `en.json` : Traductions en anglais
- `contexts/language-context.tsx` : Contexte React pour gérer la langue
- `components/shared/language-switcher.tsx` : Composant pour changer de langue

## Utilisation

### 1. Utiliser le hook `useLanguage`

```tsx
import { useLanguage } from "@/contexts/language-context"

export function MyComponent() {
  const { t, language, setLanguage } = useLanguage()

  return (
    <div>
      <h1>{t("dashboard.title")}</h1>
      <p>{t("common.save")}</p>
    </div>
  )
}
```

### 2. Structure des clés de traduction

Les clés sont organisées par catégories avec des points comme séparateurs :

- `common.*` : Textes communs (save, cancel, delete, etc.)
- `auth.*` : Textes d'authentification
- `dashboard.*` : Textes du tableau de bord
- `users.*` : Textes liés aux utilisateurs
- `courses.*` : Textes liés aux formations
- `analytics.*` : Textes des statistiques
- `reports.*` : Textes des rapports
- `notifications.*` : Textes des notifications
- `settings.*` : Textes des paramètres

### 3. Ajouter de nouvelles traductions

1. Ajoutez la clé dans `fr.json` :
```json
{
  "maSection": {
    "maCle": "Ma valeur en français"
  }
}
```

2. Ajoutez la même clé dans `en.json` :
```json
{
  "maSection": {
    "maCle": "My value in English"
  }
}
```

3. Utilisez-la dans votre composant :
```tsx
const { t } = useLanguage()
<p>{t("maSection.maCle")}</p>
```

### 4. Sélecteur de langue

Le sélecteur de langue est déjà intégré dans les headers (admin et instructor). Il apparaît à côté du toggle de thème.

## Persistance

La langue sélectionnée est sauvegardée dans `localStorage` avec la clé `odl-language` et est restaurée au rechargement de la page.

## Attribut HTML lang

L'attribut `lang` de l'élément `<html>` est automatiquement mis à jour lors du changement de langue pour améliorer l'accessibilité et le SEO.
