import { QuestionType } from "../../domain/models/question-type";
import { ImageOption } from "./image_option";
import { NumberRangeModel } from "./number.range.model";
import { TextSelectionOption } from "./text.selection.option";

export interface CreateQuestionModel{
    content?: string,
    type: QuestionType,
    isRequired: boolean
    options: TextSelectionOption[]
    numberRange: NumberRangeModel,
    imageOptions: ImageOption[]
}