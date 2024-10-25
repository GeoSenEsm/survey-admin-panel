import { QuestionType } from "../../domain/models/question-type";
import { SectionVisibility } from "../../domain/models/section.visibility";
import { SurveyDetailsDto } from "../../domain/models/survey.details.dtos";
import { CreateSurveyModel } from "../models/create.survey.model";
import { getDefaultNumberRange } from "../models/number.range.model";
import { SurveyDetailsMapper } from "./survey-details-mapper";

describe('SurveyDetailsMapper', () => {
  let mapper: SurveyDetailsMapper;

  beforeEach(() => {
    mapper = new SurveyDetailsMapper();
  });

  it('should map SurveyDetailsDto to CreateSurveyModel correctly', () => {
    const surveyDto: SurveyDetailsDto = {
      id: 'survey-id',
      name: 'Test survey name',
      rowVersion: 1,
      sections: [
        {
          id: 'section-1',
          order: 1,
          name: 'Section 1',
          visibility: SectionVisibility.ALWAYS,
          displayOnOneScreen: true,
          rowVersion: 1,
          questions: [
            {
              id: 'question-2-id',
              order: 2,
              content: 'What is your favorite number?',
              questionType: QuestionType.LINEAR_SCALE,
              required: false,
              rowVersion: 1,
              numberRange: { id: 'range-1', from: 1, to: 3, fromLabel: 'Low', toLabel: 'Big', rowVersion: 1 }
            },
            {
              id: 'question-1-id',
              order: 1,
              content: 'What is your favorite color?',
              questionType: QuestionType.SINGLE_CHOICE,
              required: true,
              rowVersion: 1,
              options: [
                { id: 'option-1', order: 1, label: 'Red', rowVersion: 1 },
                { id: 'option-2', order: 2, label: 'Blue', rowVersion: 1 }
              ]
            },
            {
              id: 'question-3-id',
              order: 3,
              content: 'This question can trigger a section',
              questionType: QuestionType.MULTIPLE_CHOICE,
              required: false,
              options: [
                { id: 'option-4', order: 2, label: 'This does not show section 2', rowVersion: 1 },
                { id: 'option-3', order: 1, label: 'This shows section 2', showSection: 2, rowVersion: 1 },
              ],
              rowVersion: 1
            }
          ]
        },
        {
          id: 'section-3',
          order: 3,
          name: 'Section 3',
          visibility: SectionVisibility.GROUP_SPECIFIC,
          displayOnOneScreen: true,
          groupId: 'group-123',
          rowVersion: 1,
          questions: [
            {
              id: 'question-5-id',
              order: 1,
              content: 'This is a number range question',
              questionType: QuestionType.LINEAR_SCALE,
              required: true,
              rowVersion: 1,
              numberRange: { id: 'range-2', from: 0, to: 2, fromLabel: 'Youngest', toLabel: 'Oldest', rowVersion: 1 }
            }
          ]
        },
        {
          id: 'section-2',
          order: 2,
          name: 'Section 2',
          visibility: SectionVisibility.ANSWER_TRIGGERED,
          displayOnOneScreen: true,
          rowVersion: 1,
          questions: [
            {
              id: 'question-4-id',
              order: 1,
              content: 'This is a yes/no question',
              questionType: QuestionType.YES_NO_CHOICE,
              required: true,
              rowVersion: 1
            }
          ]
        }
      ]
    };

    const expectedModel: CreateSurveyModel = {
      name: 'Test survey name',
      sections: [
        {
          name: 'Section 1',
          visibility: SectionVisibility.ALWAYS,
          respondentsGroupId: undefined,
          questions: [
            {
              content: 'What is your favorite color?',
              type: QuestionType.SINGLE_CHOICE,
              isRequired: true,
              options: [
                { content: 'Red', showSection: undefined},
                { content: 'Blue', showSection: undefined},
              ],
              numberRange: getDefaultNumberRange()
            },
            {
              content: 'What is your favorite number?',
              type: QuestionType.LINEAR_SCALE,
              isRequired: false,
              options: [],
              numberRange: { from: 1, to: 3, fromLabel: 'Low', toLabel: 'Big'}
            },
            {
              content: 'This question can trigger a section',
              type: QuestionType.MULTIPLE_CHOICE,
              isRequired: false,
              options: [
                { content: 'This shows section 2', showSection: 2 },
                { content: 'This does not show section 2', showSection: undefined},
              ],
              numberRange: getDefaultNumberRange()
            }
          ],
          displayOnOneScreen: true
        },
        {
          name: 'Section 2',
          visibility: SectionVisibility.ANSWER_TRIGGERED,
          respondentsGroupId: undefined,
          questions: [
            {
              content: 'This is a yes/no question',
              type: QuestionType.YES_NO_CHOICE,
              isRequired: true,
              numberRange: getDefaultNumberRange(),
              options: []
            }
          ],
          displayOnOneScreen: true
        },
        {
          name: 'Section 3',
          visibility: SectionVisibility.GROUP_SPECIFIC,
          respondentsGroupId: 'group-123',
          questions: [
            {
              content: 'This is a number range question',
              type: QuestionType.LINEAR_SCALE,
              isRequired: true,
              options: [],
              numberRange: { from: 0, to: 2, fromLabel: 'Youngest', toLabel: 'Oldest'}
            }
          ],
          displayOnOneScreen: true
        }
      ]
    };

    const result = mapper.map(surveyDto);
    expect(result).toEqual(expectedModel);
  });
});
