import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-home',
  imports: [RouterLink, MatCardModule, MatButtonModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  auth = inject(Auth);
}