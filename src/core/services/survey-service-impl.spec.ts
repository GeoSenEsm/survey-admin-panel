import { CreateSurveyDto } from '../../domain/models/create.survey.dto';
import { QuestionType } from '../../domain/models/question-type';
import { SectionVisibility } from '../../domain/models/section.visibility';
import { buildFormData } from './survey-service-impl';

describe('buildFormData', () => {
    it('should build FormData correctly from CreateSurveyDto', () => {
        const createSurveyDto: CreateSurveyDto = {
            name: 'Test Survey',
            sections: [
                {
                    order: 1,
                    name: 'Section 1',
                    visibility: SectionVisibility.ALWAYS,
                    groupId: 'group1',
                    questions: [
                        {
                            order: 1,
                            content: 'What is your name?',
                            questionType: QuestionType.SINGLE_CHOICE,
                            required: true,
                            options: [
                                { order: 1, label: 'Option 1' },
                                { order: 2, label: 'Option 2', showSection: 2 }
                            ],
                            numberRange: undefined
                        }
                    ]
                }
            ]
        };

        const testFile = new File(['file content'], 'test-image.png', { type: 'image/png' });
        const files: File[] = [testFile];

        const formData = buildFormData(createSurveyDto, files);

        expect(formData.has('name')).toBeTrue();
        expect(formData.get('name')).toBe('Test Survey');

        expect(formData.has('sections[0].order')).toBeTrue();
        expect(formData.get('sections[0].order')).toBe('1');

        expect(formData.has('sections[0].name')).toBeTrue();
        expect(formData.get('sections[0].name')).toBe('Section 1');

        expect(formData.has('sections[0].visibility')).toBeTrue();
        expect(formData.get('sections[0].visibility')).toBe(SectionVisibility.ALWAYS);

        expect(formData.has('sections[0].groupId')).toBeTrue();
        expect(formData.get('sections[0].groupId')).toBe('group1');

        expect(formData.has('sections[0].questions[0].order')).toBeTrue();
        expect(formData.get('sections[0].questions[0].order')).toBe('1');

        expect(formData.has('sections[0].questions[0].content')).toBeTrue();
        expect(formData.get('sections[0].questions[0].content')).toBe('What is your name?');

        expect(formData.has('sections[0].questions[0].questionType')).toBeTrue();
        expect(formData.get('sections[0].questions[0].questionType')).toBe(QuestionType.SINGLE_CHOICE);

        expect(formData.has('sections[0].questions[0].required')).toBeTrue();
        expect(formData.get('sections[0].questions[0].required')).toBe('true');

        expect(formData.has('sections[0].questions[0].options[0].order')).toBeTrue();
        expect(formData.get('sections[0].questions[0].options[0].order')).toBe('1');
        expect(formData.get('sections[0].questions[0].options[0].label')).toBe('Option 1');

        expect(formData.has('sections[0].questions[0].options[1].showSection')).toBeTrue();
        expect(formData.get('sections[0].questions[0].options[1].showSection')).toBe('2');

        expect(formData.has('images[0]')).toBeTrue();
        expect(formData.get('images[0]')).toEqual(testFile);
    });
});