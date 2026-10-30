import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatToolbarModule, MatButtonModule],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
})
export class Shell {
  auth = inject(Auth);
  private router = inject(Router);

  async sair() {
    await this.auth.logout();
    this.router.navigate(['/login']);
  }
}