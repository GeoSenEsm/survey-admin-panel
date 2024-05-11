import { CreateSectionModel } from "./create.section.model";

export interface CreateSurveyModel{
    name?: string,
    sections: CreateSectionModel[]
}