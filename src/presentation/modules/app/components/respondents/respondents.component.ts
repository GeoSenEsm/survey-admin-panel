import { AfterViewInit, Component, Inject, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { AddRespondentsComponent } from '../add-respondents/add-respondents.component';
import { ButtonData } from '../buttons.ribbon/button.data';

interface RespondentData{
  username: string;
  gender: string;
  ageCategory: string;
  occupationCategory: string;
  educationCategory: string;
  healthStatus: string;
  medicationUse: string;
  lifeSatisfaction: string;
  stressLevel: string;
  qualityOfSleep: string;
}

@Component({
  selector: 'app-respondents',
  standalone: false,
  templateUrl: './respondents.component.html',
  styleUrl: './respondents.component.css'
})
export class RespondentsComponent implements AfterViewInit{
  @ViewChild(MatSort) sort?: MatSort;
  @ViewChild(MatPaginator) paginator?: MatPaginator;
  dataSource?: MatTableDataSource<RespondentData>;
  respondents: RespondentData[] = [];
  displayedColumns: string[] = ['Nazwa użytkownika', 'Płeć', 'Kategoria wiekowa', 'Zatrudnienie', 'Wykształcenie', 'Stan zdrowia', 'Leki', 'Zadowolenie z życia', 'Poziom stresu', 'Jakość snu'];
  columnFilter: { [key: string]: string[] } = {};
 
  genders: string[] = ['Kobieta', 'Mężczyzna'];
  ageCategories: string[] = ['50-59', '60-69', '70+'];
  occupationCategories: string[] = ['Zatrudniony', 'Niezatrudniony'];
  educationCategories: string[] = ['Podstawowe', 'Zawodowe', 'Średnie', 'Wyższe'];
  healthStatuses: string[] = ['Dobry', 'Zły'];
  medicationUses: string[] = ['Tak', 'Nie'];
  lifeSatisfactions: string[] = ['Wysokie', 'Niskie'];
  stressLevels: string[] = ['Niski', 'Wysoki'];
  qualityOfSleeps: string[] = ['Niska', 'Wysoka'];

  ribbonButtons: ButtonData[] = [
    {
      content: 'Utwórz konta dla respondentów',
      onClick: this.generateRespondentsAccounts.bind(this)
    }
  ]

  constructor(@Inject('dialog') private readonly _dialog: MatDialog){
    this.generateRespondents();
  }
  ngAfterViewInit(): void {
    if (this.dataSource) {
      if (this.sort) {
        this.dataSource.sort = this.sort;
      }
      if (this.paginator) {
        this.dataSource.paginator = this.paginator;
      }
    }
  }

  generateRandomRespondent(): RespondentData {
    return {
      username: `User${Math.floor(Math.random() * 10000)}`,
      gender: this.genders[Math.floor(Math.random() * this.genders.length)],
      ageCategory: this.ageCategories[Math.floor(Math.random() * this.ageCategories.length)],
      occupationCategory: this.occupationCategories[Math.floor(Math.random() * this.occupationCategories.length)],
      educationCategory: this.educationCategories[Math.floor(Math.random() * this.educationCategories.length)],
      healthStatus: this.healthStatuses[Math.floor(Math.random() * this.healthStatuses.length)],
      medicationUse: this.medicationUses[Math.floor(Math.random() * this.medicationUses.length)],
      lifeSatisfaction: this.lifeSatisfactions[Math.floor(Math.random() * this.lifeSatisfactions.length)],
      stressLevel: this.stressLevels[Math.floor(Math.random() * this.stressLevels.length)],
      qualityOfSleep: this.qualityOfSleeps[Math.floor(Math.random() * this.qualityOfSleeps.length)],
    };
  }

  generateRespondents(): void {
    this.respondents = [];
    for (let i = 0; i < 100; i++) {
      this.respondents.push(this.generateRandomRespondent());
    }
    this.dataSource = new MatTableDataSource(this.respondents);
    this.dataSource.sort = this.sort!;
    this.dataSource.paginator = this.paginator!;
  }

  generateRespondentsAccounts(): void{
    this._dialog.open(AddRespondentsComponent, {
      hasBackdrop: true,
      closeOnNavigation: false
    })
  }

}
