import { QuestionType } from "../../domain/models/question.type";
import { TextSelectionOption } from "./text.selection.option";

export interface CreateQuestionModel{
    content?: string,
    type: QuestionType,
    isRequired: boolean
    options: TextSelectionOption[]
}