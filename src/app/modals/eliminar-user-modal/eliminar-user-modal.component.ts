import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AdministradoresService } from 'src/app/services/administradores.service';
import { AlumnosService } from 'src/app/services/alumnos.service';
import { MaestrosService } from 'src/app/services/maestros.service';
import { EventosService } from 'src/app/services/eventos.service';

@Component({
  selector: 'app-eliminar-user-modal',
  templateUrl: './eliminar-user-modal.component.html',
  styleUrls: ['./eliminar-user-modal.component.scss']
})
export class EliminarUserModalComponent implements OnInit {

  public rol: string = "";

  constructor(
    private administradoresService: AdministradoresService,
    private maestrosService: MaestrosService,
    private alumnosService: AlumnosService,
    private eventosService: EventosService, // Agregamos el servicio de eventos por si acaso, aunque para editar no se usa aquí
    private dialogRef: MatDialogRef<EliminarUserModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.rol = this.data.rol;
  }

  public onNoClick() {
    this.dialogRef.close({ isDelete: false });
  }

  public onDelete() {
    // Caso especial: Editar Evento (Solo confirmación)
    if (this.rol === 'evento_editar') {
      // Al cerrar con true, el componente padre (RegistroEventos) ejecutará la actualización
      this.dialogRef.close({ isDelete: true });
      return;
    }
    
    // Caso: Eliminar Evento (desde la tabla)
    // Nota: Si usaste 'evento' en la tabla para eliminar, agregamos la lógica aquí
    if (this.rol === 'evento') {
       this.eventosService.eliminarEvento(this.data.id).subscribe(
        (response) => {
          console.log(response);
          this.dialogRef.close({ isDelete: true });
        }, (error) => {
          this.dialogRef.close({ isDelete: false });
        }
      );
      return;
    }

    // Lógica existente para Usuarios
    if (this.rol == "administrador") {
      this.administradoresService.eliminarAdmin(this.data.id).subscribe(
        (response) => {
          console.log(response);
          this.dialogRef.close({ isDelete: true });
        }, (error) => {
          this.dialogRef.close({ isDelete: false });
        }
      );

    } else if (this.rol == "maestro") {
      this.maestrosService.eliminarMaestro(this.data.id).subscribe(
        (response) => {
          console.log(response);
          this.dialogRef.close({ isDelete: true });
        }, (error) => {
          this.dialogRef.close({ isDelete: false });
        }
      );

    } else if (this.rol == "alumno") {
      this.alumnosService.eliminarAlumno(this.data.id).subscribe(
        (response) => {
          console.log(response);
          this.dialogRef.close({ isDelete: true });
        }, (error) => {
          this.dialogRef.close({ isDelete: false });
        }
      );
    }
  }
}