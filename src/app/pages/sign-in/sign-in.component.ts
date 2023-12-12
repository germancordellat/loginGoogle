import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/shared/services/auth.service';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css'],
})
export class SignInComponent {
  public form: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService
  ) {
    this.builForm();
  }

  private builForm() {
    this.form = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }
  public SignInEmailPassword(event: Event) {
    event.preventDefault();
    if (this.form.valid) {
      const { email, password } = this.form.value;
      this.authService.SignInEmailPassword(email, password);
    }
  }

  public loginGoogle() {
    this.authService.loginGoogle();
  }
}
