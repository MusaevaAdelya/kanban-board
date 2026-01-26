import { Component, output } from '@angular/core';
import { Card } from '../card/card';

@Component({
  selector: 'app-login-button',
  standalone: true,
  imports: [Card],
  templateUrl: "./login-button.html"
})
export class LoginButton {
  login = output<void>();
}