import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { EventosService } from 'src/app/services/eventos.service';
import { FacadeService } from 'src/app/services/facade.service';
import { MaestrosService } from 'src/app/services/maestros.service';
import { AdministradoresService } from 'src/app/services/administradores.service';
import { EliminarUserModalComponent } from 'src/app/modals/eliminar-user-modal/eliminar-user-modal.component';

@Component({
  selector: 'app-registro-eventos-screen',
  templateUrl: './registro-eventos-screen.component.html',
  styleUrls: ['./registro-eventos-screen.component.scss']
})
export class RegistroEventosScreenComponent implements OnInit {

  public evento: any = {};
  public isUpdate: boolean = false;
  public errors: any = {};
  public idEvento: number = 0;
  
  public lista_tipos = ["Conferencia", "Taller", "Seminario", "Concurso"];
  public lista_programas = [
    "Ingeniería en Ciencias de la Computación",
    "Licenciatura en Ciencias de la Computación",
    "Ingeniería en Tecnologías de la Información"
  ];
  public lista_responsables: any[] = [];

  public publico_options = [
    { value: 'Estudiantes', label: 'Estudiantes', checked: false },
    { value: 'Profesores', label: 'Profesores', checked: false },
    { value: 'Publico General', label: 'Público General', checked: false }
  ];

  constructor(
    private location: Location,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private eventosService: EventosService,
    private facadeService: FacadeService,
    private maestrosService: MaestrosService,
    private administradoresService: AdministradoresService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    // REQUISITO 18: Seguridad extra (solo admin puede entrar aquí)
    if(this.facadeService.getUserGroup() !== 'administrador'){
      alert("Acceso denegado. Solo los administradores pueden registrar eventos.");
      this.router.navigate(['/home']);
      return;
    }

    this.obtenerResponsables();

    if (this.activatedRoute.snapshot.params['id']) {
      this.isUpdate = true;
      this.idEvento = this.activatedRoute.snapshot.params['id'];
      this.obtenerEvento(this.idEvento);
    } else {
      this.evento = this.eventosService.esquemaEvento();
      this.evento.publico_objetivo = []; 
    }
  }

  public obtenerResponsables() {
    this.lista_responsables = [];
    this.maestrosService.obtenerListaMaestros().subscribe(
      (maestros) => {
        maestros.forEach((m: any) => {
          this.lista_responsables.push({
            id: m.user.id,
            nombre: m.user.first_name + ' ' + m.user.last_name + ' (Maestro)'
          });
        });
      }, (error) => { console.error(error); }
    );
    this.administradoresService.obtenerListaAdmins().subscribe(
      (admins) => {
        admins.forEach((a: any) => {
          this.lista_responsables.push({
            id: a.user.id,
            nombre: a.user.first_name + ' ' + a.user.last_name + ' (Admin)'
          });
        });
      }, (error) => { console.error(error); }
    );
  }

  public obtenerEvento(id: number) {
    this.eventosService.obtenerEventoPorID(id).subscribe(
      (response) => {
        this.evento = response;
        this.evento.publico_objetivo = this.evento.publico_objetivo || [];
        this.publico_options.forEach(opt => {
          if (this.evento.publico_objetivo.includes(opt.value)) {
            opt.checked = true;
          }
        });
      }, (error) => {
        alert("No se pudo obtener la información del evento");
      }
    );
  }

  public checkboxChange(opcion: any) {
    opcion.checked = !opcion.checked;
    if (opcion.checked) {
      this.evento.publico_objetivo.push(opcion.value);
    } else {
      this.evento.publico_objetivo = this.evento.publico_objetivo.filter((item: string) => item !== opcion.value);
    }
    if (!this.evento.publico_objetivo.includes('Estudiantes')) {
      this.evento.programa_educativo = '';
    }
  }

  public revisarProgramaEducativo(): boolean {
    return this.evento.publico_objetivo.includes('Estudiantes');
  }

  public regresar() {
    this.location.back();
  }

  public registrar() {
    this.errors = this.eventosService.validarEvento(this.evento);
    if (Object.keys(this.errors).length > 0) return;

    if(this.evento.fecha_realizacion){
      const fecha = new Date(this.evento.fecha_realizacion);
      this.evento.fecha_realizacion = fecha.toISOString().split('T')[0];
    }

    this.eventosService.registrarEvento(this.evento).subscribe(
      (response) => {
        alert("Evento registrado correctamente");
        this.router.navigate(['/eventos-academicos']);
      }, (error) => {
        alert("Error al registrar evento");
      }
    );
  }

  public actualizar() {
    this.errors = this.eventosService.validarEvento(this.evento);
    if (Object.keys(this.errors).length > 0) return;

    const dialogRef = this.dialog.open(EliminarUserModalComponent, {
      data: { id: this.idEvento, rol: 'evento_editar' },
      height: '288px', width: '328px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.isDelete) {
        if(this.evento.fecha_realizacion){
          const fecha = new Date(this.evento.fecha_realizacion);
          this.evento.fecha_realizacion = fecha.toISOString().split('T')[0];
        }
        this.eventosService.actualizarEvento(this.evento).subscribe(
          (response) => {
            alert("Evento actualizado correctamente");
            this.router.navigate(['/eventos-academicos']);
          }, (error) => {
            alert("Error al actualizar evento");
          }
        );
      }
    });
  }
}