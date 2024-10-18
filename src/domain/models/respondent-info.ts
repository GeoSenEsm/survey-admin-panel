export interface RespondentInfo{
    id: string,
    display: string
}

export type RespondentInfoCollections = {
    [key: string]: RespondentInfo[];
}

export type RespondentInfoValueDisplayMappings = {
    [key: string]: Map<string, string>;  
}

export const convertToValueDisplayMappings = (collections: RespondentInfoCollections): RespondentInfoValueDisplayMappings =>{
    const result: RespondentInfoValueDisplayMappings = {};
    Object.keys(collections).forEach(key => {
        const collection = collections[key];
        const map = new Map<string, string>();
        collection.forEach(item => {
            map.set(item.id, item.display);
        });
        result[key] = map;
    });
    return result;
}