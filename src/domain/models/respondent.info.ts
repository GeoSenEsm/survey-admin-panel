export interface RespondentInfo{
    id: number,
    display: string
}

export interface RespondentInfoCollections{
    ageCategories: RespondentInfo[],
    occupationCategories: RespondentInfo[]
    educationCategories: RespondentInfo[]
    greeneryAreaCategories: RespondentInfo[]
    medicationUses: RespondentInfo[]
    healthConditions: RespondentInfo[]
    stressLevels: RespondentInfo[]
    lifeSatisfactions: RespondentInfo[]
    qualityOfSleeps: RespondentInfo[]
}

export interface RespondentInfoValueDisplayMappings{
    ageCategoriesMapping: Map<number, string>,
    occupationCategoriesMapping: Map<number, string>,
    educationCategoriesMapping: Map<number, string>,
    greeneryAreaCategoriesMapping: Map<number, string>,
    medicationUsesMapping: Map<number, string>,
    healthConditionsMapping: Map<number, string>,
    stressLevelsMapping: Map<number, string>,
    lifeSatisfactionsMapping: Map<number, string>,
    qualityOfSleepsMapping: Map<number, string>   
}

export const getMapForProperty = (property: string, mappings: RespondentInfoValueDisplayMappings): Map<number, string> | undefined =>{
    if (property === 'ageCategoryId') return mappings.ageCategoriesMapping;
    if (property === 'occupationCategoryId') return mappings.occupationCategoriesMapping;
    if (property === 'educationCategoryId') return mappings.educationCategoriesMapping;
    if (property === 'greeneryAreaCategoryId') return mappings.greeneryAreaCategoriesMapping;
    if (property === 'medicationUseId') return mappings.medicationUsesMapping;
    if (property === 'healthConditionId') return mappings.healthConditionsMapping;
    if (property === 'stressLevelId') return mappings.stressLevelsMapping;
    if (property === 'lifeSatisfactionId') return mappings.lifeSatisfactionsMapping;
    if (property === 'qualityOfSleepId') return mappings.qualityOfSleepsMapping;

    return undefined;
}

export const convertToValueDisplayMappings = (collections: RespondentInfoCollections): RespondentInfoValueDisplayMappings =>{
    return {
        ageCategoriesMapping: new Map(collections.ageCategories.map(c => [c.id, c.display])),
        occupationCategoriesMapping: new Map(collections.occupationCategories.map(c => [c.id, c.display])),
        educationCategoriesMapping: new Map(collections.educationCategories.map(c => [c.id, c.display])),
        greeneryAreaCategoriesMapping: new Map(collections.greeneryAreaCategories.map(c => [c.id, c.display])),
        medicationUsesMapping: new Map(collections.medicationUses.map(c => [c.id, c.display])),
        healthConditionsMapping: new Map(collections.healthConditions.map(c => [c.id, c.display])),
        stressLevelsMapping: new Map(collections.stressLevels.map(c => [c.id, c.display])),
        lifeSatisfactionsMapping: new Map(collections.lifeSatisfactions.map(c => [c.id, c.display])),
        qualityOfSleepsMapping: new Map(collections.qualityOfSleeps.map(c => [c.id, c.display]))
    }
}