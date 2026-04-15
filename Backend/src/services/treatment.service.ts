import { diseaseDB, DiseaseEntry } from "../data/diseases";

export const lookupTreatment = (disease: string): string => {
    const entry = diseaseDB[disease];
    if (!entry) return `No treatment data found for "${disease}"`;

    const parts: string[] = [
        `Plant: ${entry.plant}`,
        `Disease: ${entry.name}`,
        `Severity: ${entry.severity}`,
    ];

    if (entry.treatments.chemical.length > 0)
        parts.push(`Chemical treatments: ${entry.treatments.chemical.join(", ")}`);
    if (entry.treatments.organic.length > 0)
        parts.push(`Organic treatments: ${entry.treatments.organic.join(", ")}`);
    if (entry.treatments.cultural.length > 0)
        parts.push(`Cultural practices: ${entry.treatments.cultural.join(", ")}`);
    if (entry.precautions.length > 0)
        parts.push(`Precautions: ${entry.precautions.join(", ")}`);

    return parts.join("\n");
};

export const lookupDisease = (disease: string): string => {
    const entry = diseaseDB[disease];
    if (!entry) return `No info found for "${disease}"`;

    const parts: string[] = [
        `Plant: ${entry.plant}`,
        `Disease: ${entry.name}`,
        `Description: ${entry.desc}`,
        `Causes: ${entry.causes}`,
        `Severity: ${entry.severity}`,
        `Favorable conditions: ${entry.conditions}`,
    ];

    if (entry.symptoms.length > 0)
        parts.push(`Symptoms: ${entry.symptoms.join(", ")}`);

    return parts.join("\n");
};
