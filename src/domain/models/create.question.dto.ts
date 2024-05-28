import { CreateOptionDto } from "./create.option.dto";
import { QuestionType } from "./question.type";

export interface CreateQuestionDto {
    order: number;
    content: string;
    questionType: QuestionType;
    required: boolean;
    options: CreateOptionDto[];
  }