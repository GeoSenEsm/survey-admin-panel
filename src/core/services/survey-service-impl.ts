import { Observable } from "rxjs";
import { SurveyService } from "../../domain/external_services/survey.service";
import { CreateSurveyDto } from "../../domain/models/create.survey.dto";
import { ApiService } from "./api.service";
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { SurveyDto } from "../../domain/models/survey.dto";
import { SurveySummaryShortDto } from "../../domain/models/survey.summary.short.dto";
import { ConfigService } from "./config.service";
import { SurveyDetailsDto } from "../../domain/models/survey.details.dtos";

@Injectable({
    providedIn: 'root'
})
export class SurveyServiceImpl extends ApiService implements SurveyService{
    constructor(client: HttpClient, configService: ConfigService) {
        super(client, configService);
      }
    getAllSummaryShort(): Observable<SurveySummaryShortDto[]> {
        return this.get<SurveySummaryShortDto[]>('/api/surveys/shortsummaries');
    }
    getAllShort(): Observable<SurveyDto[]> {
        return this.get<SurveyDto[]>("/api/surveys/short");
    }

    createSurvey(dto: CreateSurveyDto): Observable<any> {
       return this.post('/api/surveys', dto);
    }

    getSurveyById(id: string): Observable<SurveyDetailsDto> {
        return this.get('/api/surveys', { surveyId: id });
    }
}

export const buildFormData = (createSurveyDto: CreateSurveyDto, files: File[]) =>{
    const formData = new FormData();

    formData.append('name', createSurveyDto.name);

    createSurveyDto.sections.forEach((section, sectionIndex) => {
        formData.append(`sections[${sectionIndex}].order`, section.order.toString());
        formData.append(`sections[${sectionIndex}].name`, section.name);
        formData.append(`sections[${sectionIndex}].visibility`, section.visibility);

        if (section.groupId) {
            formData.append(`sections[${sectionIndex}].groupId`, section.groupId);
        }

        section.questions.forEach((question, questionIndex) => {
            formData.append(`sections[${sectionIndex}].questions[${questionIndex}].order`, question.order.toString());
            formData.append(`sections[${sectionIndex}].questions[${questionIndex}].content`, question.content);
            formData.append(`sections[${sectionIndex}].questions[${questionIndex}].questionType`, question.questionType);
            formData.append(`sections[${sectionIndex}].questions[${questionIndex}].required`, question.required.toString());

            if (question.options) {
                question.options.forEach((option, optionIndex) => {
                    formData.append(`sections[${sectionIndex}].questions[${questionIndex}].options[${optionIndex}].order`, option.order.toString());
                    formData.append(`sections[${sectionIndex}].questions[${questionIndex}].options[${optionIndex}].label`, option.label);
                    if (option.showSection !== undefined) {
                        formData.append(`sections[${sectionIndex}].questions[${questionIndex}].options[${optionIndex}].showSection`, option.showSection.toString());
                    }
                });
            }

            if (question.numberRange) {
                formData.append(`sections[${sectionIndex}].questions[${questionIndex}].numberRange.from`, question.numberRange.from.toString());
                formData.append(`sections[${sectionIndex}].questions[${questionIndex}].numberRange.to`, question.numberRange.to.toString());
                if (question.numberRange.fromLabel) {
                    formData.append(`sections[${sectionIndex}].questions[${questionIndex}].numberRange.fromLabel`, question.numberRange.fromLabel);
                }
                if (question.numberRange.toLabel) {
                    formData.append(`sections[${sectionIndex}].questions[${questionIndex}].numberRange.toLabel`, question.numberRange.toLabel);
                }
            }
        });
    });

    files.forEach((file, index) => {
        formData.append(`images[${index}]`, file, file.name);
    });

    return formData;
};