import { ServerManager } from "./serverManager.js";

export class ChartManager{
    static pannel;
    static canvasChart;
    static ctxChart;
    static chart = null;

    static Init(){
        ChartManager.pannel = document.getElementById('top-pannel');
        ChartManager.canvasChart = document.getElementById('canvasChart');
        ChartManager.ctxChart = ChartManager.canvasChart.getContext('2d');
    }

    static Refresh(){
        if(ChartManager.chart != null){
            ChartManager.chart.destroy();
        }

        let indexArray = [];
        for(let i = 0; i < ServerManager.track.n; i++){
            indexArray.push(i);
        }

        let config = {
            type: 'line',
            data: {
                labels: indexArray,
                datasets: [
                    {
                        label: 'Traj 0 laterals',
                        data: ServerManager.trajs[0].laterals,
                        fill: false,
                        borderColor: 'rgb(192, 75, 192)',
                        pointRadius: 0,
                        borderWidth: 1
                    },
                    {
                        label: 'Traj 0 speed1',
                        data: ServerManager.trajs[0].speed1,
                        fill: false,
                        borderColor: 'rgba(192, 75, 75)',
                        pointRadius: 0,
                        borderWidth: 1
                    },
                    {
                        label: 'Traj 0 speed2',
                        data: ServerManager.trajs[0].speed2,
                        fill: false,
                        borderColor: 'rgb(75, 75, 192)',
                        pointRadius: 0,
                        borderWidth: 1
                    },
                ]
            },
            options: {
                responsive: true,
                interaction: {
                  mode: 'index',
                  intersect: false,
                }
            }
        };


        ChartManager.chart = new Chart(ChartManager.ctxChart, config);
    }
}
