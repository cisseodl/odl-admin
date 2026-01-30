# Guide d'Intégration des Dialogues de Succès/Erreur

Ce guide explique comment intégrer les dialogues de succès/erreur (`ActionResultDialog`) dans tous les composants qui effectuent des opérations POST, PUT, ou DELETE.

## Composants Disponibles

### 1. `ActionResultDialog`
Composant de dialogue réutilisable pour afficher les résultats d'opérations.

**Localisation:** `components/shared/action-result-dialog.tsx`

### 2. `useActionResultDialog`
Hook personnalisé pour gérer l'état des dialogues.

**Localisation:** `hooks/use-action-result-dialog.ts`

## Exemple d'Intégration

### Étape 1: Importer les composants nécessaires

```tsx
import { ActionResultDialog } from "@/components/shared/action-result-dialog"
import { useActionResultDialog } from "@/hooks/use-action-result-dialog"
```

### Étape 2: Utiliser le hook dans votre composant

```tsx
export function MonComposant() {
  const dialog = useActionResultDialog()
  
  // ... votre code ...
}
```

### Étape 3: Intégrer dans les opérations POST/PUT/DELETE

```tsx
const handleCreate = async (data: FormData) => {
  try {
    await service.create(data)
    dialog.showSuccess("L'élément a été créé avec succès.")
    // Recharger les données si nécessaire
    await loadData()
  } catch (error: any) {
    dialog.showError(error?.message || "Une erreur est survenue lors de la création.")
  }
}

const handleUpdate = async (id: number, data: FormData) => {
  try {
    await service.update(id, data)
    dialog.showSuccess("L'élément a été mis à jour avec succès.")
    await loadData()
  } catch (error: any) {
    dialog.showError(error?.message || "Une erreur est survenue lors de la mise à jour.")
  }
}

const handleDelete = async (id: number) => {
  try {
    await service.delete(id)
    dialog.showSuccess("L'élément a été supprimé avec succès.")
    await loadData()
  } catch (error: any) {
    dialog.showError(error?.message || "Une erreur est survenue lors de la suppression.")
  }
}
```

### Étape 4: Ajouter le composant de dialogue dans le JSX

```tsx
return (
  <div>
    {/* Votre contenu */}
    
    {/* Dialogue de résultat */}
    <ActionResultDialog
      isOpen={dialog.isOpen}
      onOpenChange={dialog.setIsOpen}
      isSuccess={dialog.isSuccess}
      message={dialog.message}
      title={dialog.title}
    />
  </div>
)
```

## Exemple Complet

```tsx
"use client"

import { useState } from "react"
import { ActionResultDialog } from "@/components/shared/action-result-dialog"
import { useActionResultDialog } from "@/hooks/use-action-result-dialog"
import { Button } from "@/components/ui/button"
import { myService } from "@/services/my-service"

export function MonComposant() {
  const [items, setItems] = useState([])
  const dialog = useActionResultDialog()

  const handleCreate = async () => {
    try {
      const newItem = await myService.create({ name: "Nouvel élément" })
      dialog.showSuccess("L'élément a été créé avec succès.")
      setItems([...items, newItem])
    } catch (error: any) {
      dialog.showError(error?.message || "Erreur lors de la création.")
    }
  }

  const handleUpdate = async (id: number) => {
    try {
      await myService.update(id, { name: "Élément modifié" })
      dialog.showSuccess("L'élément a été mis à jour avec succès.")
      // Recharger les données
      const updatedItems = await myService.getAll()
      setItems(updatedItems)
    } catch (error: any) {
      dialog.showError(error?.message || "Erreur lors de la mise à jour.")
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await myService.delete(id)
      dialog.showSuccess("L'élément a été supprimé avec succès.")
      setItems(items.filter(item => item.id !== id))
    } catch (error: any) {
      dialog.showError(error?.message || "Erreur lors de la suppression.")
    }
  }

  return (
    <div>
      <Button onClick={handleCreate}>Créer</Button>
      <Button onClick={() => handleUpdate(1)}>Modifier</Button>
      <Button onClick={() => handleDelete(1)}>Supprimer</Button>

      <ActionResultDialog
        isOpen={dialog.isOpen}
        onOpenChange={dialog.setIsOpen}
        isSuccess={dialog.isSuccess}
        message={dialog.message}
        title={dialog.title}
      />
    </div>
  )
}
```

## Remplacement des Toasts Existants

Si votre composant utilise déjà `useToast`, vous pouvez :

1. **Remplacer complètement** les toasts par les dialogues
2. **Combiner** les deux : utiliser les toasts pour les notifications légères et les dialogues pour les opérations importantes

### Exemple de Remplacement

**Avant:**
```tsx
const { toast } = useToast()

const handleDelete = async (id: number) => {
  try {
    await service.delete(id)
    toast({
      title: "Succès",
      description: "L'élément a été supprimé.",
    })
  } catch (error) {
    toast({
      title: "Erreur",
      description: "Une erreur est survenue.",
      variant: "destructive",
    })
  }
}
```

**Après:**
```tsx
const dialog = useActionResultDialog()

const handleDelete = async (id: number) => {
  try {
    await service.delete(id)
    dialog.showSuccess("L'élément a été supprimé avec succès.")
  } catch (error: any) {
    dialog.showError(error?.message || "Une erreur est survenue lors de la suppression.")
  }
}
```

## Fichiers à Modifier

Les composants suivants doivent être mis à jour pour intégrer les dialogues :

### Dashboard Admin
- `components/admin/apprenants-list.tsx`
- `components/admin/instructeurs-list.tsx`
- `components/admin/courses/*.tsx`
- `components/admin/modals/*.tsx`
- Tous les autres composants avec POST/PUT/DELETE

### Dashboard Instructeur
- `components/instructor/*.tsx`
- Tous les composants avec POST/PUT/DELETE

## Notes Importantes

1. **Toujours gérer les erreurs** : Utilisez `try/catch` pour capturer les erreurs
2. **Messages clairs** : Fournissez des messages d'erreur explicites
3. **Recharger les données** : Après un succès, recharger les données si nécessaire
4. **Fermeture automatique** : Le dialogue se ferme automatiquement quand l'utilisateur clique sur "Fermer"

## Support

Pour toute question, consultez les exemples dans :
- `app/admin/profile/page.tsx`
- `app/instructor/profile/page.tsx`
