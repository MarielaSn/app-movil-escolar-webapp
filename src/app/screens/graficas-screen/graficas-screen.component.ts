import { Component, OnInit } from '@angular/core';
import DatalabelsPlugin from 'chartjs-plugin-datalabels';
import { AdministradoresService } from 'src/app/services/administradores.service';

@Component({
  selector: 'app-graficas-screen',
  templateUrl: './graficas-screen.component.html',
  styleUrls: ['./graficas-screen.component.scss']
})
export class GraficasScreenComponent implements OnInit{

  // Histogram
  lineChartData: any = {
    labels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    datasets: [{ data:[89, 34, 43, 54, 28, 74, 93], label: 'Registro de materias', backgroundColor: '#F88406' }]
  };
  lineChartOption = { responsive:false };
  lineChartPlugins = [ DatalabelsPlugin ];

  // Barras
  barChartData: any = {
    labels: ["Administradores", "Maestros", "Alumnos"], // Etiquetas correctas
    datasets: [{ 
      data:[0, 0, 0], // Inicializamos en 0
      label: 'Registro de Usuarios', 
      backgroundColor: ['#F88406', '#FCFF44', '#82D3FB'] 
    }]
  };
  barChartOption = { responsive:false };
  barChartPlugins = [ DatalabelsPlugin ];

  // Circular (Pie)
  pieChartData: any = {
    labels: ["Administradores", "Maestros", "Alumnos"],
    datasets: [{ 
      data:[0, 0, 0], 
      label: 'Registro de usuarios', 
      backgroundColor: ['#FCFF44', '#F1C8F2', '#31E731'] 
    }]
  };
  pieChartOption = { responsive:false };
  pieChartPlugins = [ DatalabelsPlugin ];

  // Dona (Doughnut)
  doughnutChartData: any = {
    labels: ["Administradores", "Maestros", "Alumnos"],
    datasets: [{ 
      data:[0, 0, 0], 
      label: 'Registro de usuarios', 
      backgroundColor: ['#F88406', '#FCFF44', '#31E7E7'] 
    }]
  };
  doughnutChartOption = { responsive:false };
  doughnutChartPlugins = [ DatalabelsPlugin ];

  constructor(
    private administradoresServices: AdministradoresService
  ) { }

  ngOnInit(): void {
    this.obtenerTotalUsers();
  }

  public obtenerTotalUsers(){
    this.administradoresServices.getTotalUsuarios().subscribe(
      (response)=>{
        console.log("Total usuarios: ", response);
        // Asumiendo que tu backend devuelve: { admins: 5, maestros: 10, alumnos: 20 }
        // Si devuelve una lista, ajusta esto. Basado en tu archivo users.py parece devolver un diccionario.
        
        const totalAdmins = response.admins || 0; 
        const totalMaestros = response.maestros || 0;
        const totalAlumnos = response.alumnos || 0;

        // Actualizamos Gráfica de Barras
        this.barChartData = {
          labels: ["Administradores", "Maestros", "Alumnos"],
          datasets: [{ 
            data:[totalAdmins, totalMaestros, totalAlumnos], 
            label: 'Total de Usuarios', 
            backgroundColor: ['#F88406', '#FCFF44', '#82D3FB'] 
          }]
        };

        // Actualizamos Gráfica Circular
        this.pieChartData = {
          labels: ["Administradores", "Maestros", "Alumnos"],
          datasets: [{ 
            data:[totalAdmins, totalMaestros, totalAlumnos], 
            backgroundColor: ['#FCFF44', '#F1C8F2', '#31E731'] 
          }]
        };

        // Actualizamos Gráfica de Dona
        this.doughnutChartData = {
          labels: ["Administradores", "Maestros", "Alumnos"],
          datasets: [{ 
            data:[totalAdmins, totalMaestros, totalAlumnos], 
            backgroundColor: ['#F88406', '#FCFF44', '#31E7E7'] 
          }]
        };

      }, (error)=>{
        alert("No se pudo obtener el total de usuarios");
      }
    );
  }
}