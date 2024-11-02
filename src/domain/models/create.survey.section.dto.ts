import { CreateQuestionDto } from "./create.question.dto";
import { SectionVisibility } from "./section.visibility";

export interface CreateSurveySectionDto {
    order: number;
    name: string;
    visibility: SectionVisibility;
    groupId?: string;
    questions: CreateQuestionDto[];
    displayOnOneScreen: boolean;
}