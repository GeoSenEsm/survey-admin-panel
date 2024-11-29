import { Injectable } from '@angular/core';
import {
  SurveyDetailsDto,
  SurveyNumberRangeDto,
  SurveyOptionDto,
  SurveyQuestionDto,
  SurveySectionDto,
} from '../../domain/models/survey.details.dtos';
import { CreateQuestionModel } from '../models/create.question.model';
import { CreateSectionModel } from '../models/create.section.model';
import { CreateSurveyModel } from '../models/create.survey.model';
import {
  getDefaultNumberRange,
  NumberRangeModel,
} from '../models/number.range.model';
import { TextSelectionOption } from '../models/text.selection.option';
import { Mapper } from './mapper';
import { ImageOption } from '../models/image_option';
import { QuestionType } from '../../domain/models/question-type';
import { ConfigService } from '../services/config.service';

@Injectable({
  providedIn: 'root',
})
export class SurveyDetailsMapper
  implements Mapper<SurveyDetailsDto, CreateSurveyModel>
{
    apiUrl: string;

    constructor(configService: ConfigService){
        this.apiUrl = configService.apiUrl;
    }

  map(source: SurveyDetailsDto): CreateSurveyModel {
    const sortedSections = source.sections.sort((a, b) => a.order - b.order);
    return {
      name: source.name,
      sections: sortedSections.map((e) => this.mapSection(e)),
    };
  }

  private mapSection(section: SurveySectionDto): CreateSectionModel {
    const sortedQuestions = section.questions.sort((a, b) => a.order - b.order);
    return {
      name: section.name,
      visibility: section.visibility,
      respondentsGroupId: section.groupId,
      questions: sortedQuestions.map((e) => this.mapQuestion(e)),
      displayOnOneScreen: section.displayOnOneScreen,
    };
  }

  private mapQuestion(question: SurveyQuestionDto): CreateQuestionModel {
    const sortedOptions = question.options?.sort((a, b) => a.order - b.order);
    const imageOptions =
      question.questionType == QuestionType.IMAGE_CHOICE
        ? sortedOptions?.map((e) => this.mapImageOption(e))
        : [];
    const options = question.questionType !== QuestionType.IMAGE_CHOICE 
    ? sortedOptions?.map((e) => this.mapOption(e)) : [];
    return {
      content: question.content,
      type: question.questionType,
      isRequired: question.required,
      imageOptions: imageOptions ?? [],
      options: options ?? [],
      numberRange: question.numberRange
        ? this.mapNumberRange(question.numberRange)
        : getDefaultNumberRange(),
    };
  }

  private mapOption(option: SurveyOptionDto): TextSelectionOption {
    return {
      content: option.label,
      showSection: option.showSection,
    };
  }

  private mapImageOption(option: SurveyOptionDto): ImageOption {
    return {
      code: option.label,
      src: this.apiUrl + '' + option.imagePath,
    };
  }

  private mapNumberRange(numberRange: SurveyNumberRangeDto): NumberRangeModel {
    return {
      from: numberRange.from,
      to: numberRange.to,
      fromLabel: numberRange.fromLabel,
      toLabel: numberRange.toLabel,
    };
  }
}
