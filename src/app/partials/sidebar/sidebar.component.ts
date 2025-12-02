import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FacadeService } from 'src/app/services/facade.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  mobileOpen = false;
  isMobileView = window.innerWidth < 900;
  userRole: string = '';
  
  // Variable para el dropdown
  public isEventosOpen: boolean = false;

  constructor(
    private router: Router,
    private facadeService: FacadeService
  ) { }

  ngOnInit(): void {
    this.userRole = this.facadeService.getUserGroup();
  }

  @HostListener('window:resize')
  onResize() {
    this.isMobileView = window.innerWidth < 900;
    if (!this.isMobileView) {
      this.mobileOpen = false;
    }
  }

  toggleSidebar() {
    this.mobileOpen = !this.mobileOpen;
  }

  closeSidebar() {
    this.mobileOpen = false;
  }

  // Función para abrir/cerrar el menú de eventos
  toggleEventos() {
    this.isEventosOpen = !this.isEventosOpen;
  }

  logout() {
    this.facadeService.logout().subscribe(
      () => { this.limpiarYSalir(); },
      () => { this.limpiarYSalir(); }
    );
  }

  limpiarYSalir(){
    this.facadeService.destroyUser();
    this.router.navigate(['/login']);
    this.closeSidebar();
  }

  // Helpers de roles
  isAdmin(): boolean { return this.userRole === 'administrador'; }
  isTeacher(): boolean { return this.userRole === 'maestro'; }
  isStudent(): boolean { return this.userRole === 'alumno'; }

  canSeeAdminItems(): boolean { return this.isAdmin(); }
  canSeeTeacherItems(): boolean { return this.isAdmin() || this.isTeacher(); }
  canSeeStudentItems(): boolean { return this.isAdmin() || this.isTeacher() || this.isStudent(); }
  canSeeHomeItem(): boolean { return this.isAdmin() || this.isTeacher(); }
  canSeeRegisterItem(): boolean { return this.isAdmin() || this.isTeacher(); }
}