import { QuestionType } from "../../domain/models/question.type";
import { NumberRangeModel } from "./number.range.model";
import { TextSelectionOption } from "./text.selection.option";

export interface CreateQuestionModel{
    content?: string,
    type: QuestionType,
    isRequired: boolean
    options: TextSelectionOption[]
    numberRange: NumberRangeModel
}