import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog'; // Importar Dialog
import { EventosService } from 'src/app/services/eventos.service';
import { FacadeService } from 'src/app/services/facade.service';
import { MaestrosService } from 'src/app/services/maestros.service';
import { AdministradoresService } from 'src/app/services/administradores.service';
// Reutilizamos el modal de eliminar para la confirmación, cambiándole el texto
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
  
  // Listas para selects
  public lista_tipos = ["Conferencia", "Taller", "Seminario", "Concurso"];
  public lista_programas = [
    "Ingeniería en Ciencias de la Computación",
    "Licenciatura en Ciencias de la Computación",
    "Ingeniería en Tecnologías de la Información"
  ];
  public lista_responsables: any[] = [];

  // Checkboxes de público
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
    private dialog: MatDialog // Inyectar MatDialog
  ) { }

  ngOnInit(): void {
    this.obtenerResponsables();

    // Verificar si es Editar o Nuevo
    if (this.activatedRoute.snapshot.params['id']) {
      this.isUpdate = true;
      this.idEvento = this.activatedRoute.snapshot.params['id'];
      this.obtenerEvento(this.idEvento);
    } else {
      this.evento = this.eventosService.esquemaEvento();
      this.evento.publico_objetivo = []; 
    }
  }

  // PUNTO 9: Carga Real de Responsables
  public obtenerResponsables() {
    this.lista_responsables = [];
    
    // 1. Obtener Maestros
    this.maestrosService.obtenerListaMaestros().subscribe(
      (maestros) => {
        maestros.forEach((m: any) => {
          this.lista_responsables.push({
            id: m.user.id,
            nombre: m.user.first_name + ' ' + m.user.last_name + ' (Maestro)'
          });
        });
      }, (error) => { console.error("Error al obtener maestros", error); }
    );

    // 2. Obtener Administradores
    this.administradoresService.obtenerListaAdmins().subscribe(
      (admins) => {
        admins.forEach((a: any) => {
          this.lista_responsables.push({
            id: a.user.id,
            nombre: a.user.first_name + ' ' + a.user.last_name + ' (Admin)'
          });
        });
      }, (error) => { console.error("Error al obtener admins", error); }
    );
  }

  public obtenerEvento(id: number) {
    this.eventosService.obtenerEventoPorID(id).subscribe(
      (response) => {
        this.evento = response;
        // Mapear los checkboxes seleccionados
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
    // Validar si quitaron "Estudiantes"
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

    // Formatear fecha para Django
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

  // PUNTO 15: Modal de Advertencia al Editar
  public actualizar() {
    this.errors = this.eventosService.validarEvento(this.evento);
    if (Object.keys(this.errors).length > 0) return;

    // Abrir Modal
    const dialogRef = this.dialog.open(EliminarUserModalComponent, {
      data: { 
        id: this.idEvento, 
        rol: 'evento_editar' // Usamos un identificador especial para cambiar el texto en el modal
      },
      height: '288px',
      width: '328px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.isDelete) { // Si el usuario dijo "Sí" (en el modal, el botón de acción devuelve true)
        
        // Formatear fecha
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