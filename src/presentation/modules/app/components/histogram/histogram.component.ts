import { Component, Input, OnInit } from '@angular/core';
import { HistogramDataDto } from '../../../../../domain/models/histogram.data.dto';
import { EChartsOption } from 'echarts';

@Component({
  selector: 'app-histogram',
  templateUrl: './histogram.component.html',
  styleUrl: './histogram.component.css'
})
export class HistogramComponent implements OnInit{
  @Input() histogram!: HistogramDataDto;
  chartOption!: EChartsOption;


  ngOnInit(): void{
    this.chartOption =  {
      title: {
        text: this.histogram.title,
        left: 'center'
      },
      tooltip: {},
      xAxis: {
        type: 'category',
        data: this.histogram.series.map(item => item.label)
      },
      yAxis: {
        type: 'value',
      },
      series: [
        {
          name: 'Ilość udzielonych odpowiedzi',
          type: 'bar',
          data: this.histogram.series.map(item => item.value)
        }
      ]
    }
  }
}
