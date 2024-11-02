import { SectionVisibility } from "../../domain/models/section.visibility";
import { CreateQuestionModel } from "./create.question.model";

export interface CreateSectionModel{
    name?: string,
    visibility: SectionVisibility,
    questions: CreateQuestionModel[],
    respondentsGroupId?: string,
    displayOnOneScreen: boolean
}