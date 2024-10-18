import { CreateSurveySectionDto } from "./create.survey.section.dto";

export interface CreateSurveyDto {
    name: string;
    sections: CreateSurveySectionDto[];
}