// models/rubrique.model.ts
export interface Rubrique {
    id?: number;
    rubrique: string; // Title or name of the rubrique
    image?: string; // URL to the image
    description?: string;
    objectifs?: string; // Objectives of the rubrique
    publicCible?: string; // Target audience
    dureeFormat?: string; // Duration format (e.g., "6 mois")
    lienRessources?: string; // Link to resources
    // Potentially add createdAt, updatedAt, createdBy, modifiedBy if the API returns them
}
