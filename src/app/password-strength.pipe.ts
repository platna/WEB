import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'passwordStrength',
    standalone: false
})
export class PasswordStrengthPipe implements PipeTransform {

  transform(value: string | null): { strength: string, color: string } {
    if (!value) return { strength: '', color: '' };

    const weak = /^(?=.*[a-zA-Z]).{6,}$/;
    const medium = /^(?=.*[a-zA-Z])(?=.*\d).{6,}$/;
    const strong = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;

    let strength = 'Слабый';
    let color = 'red';

    if (strong.test(value)) {
      strength = 'Сильный';
      color = 'green';
    } else if (medium.test(value)) {
      strength = 'Средний';
      color = 'rgb(255, 145, 0)';
    } else if (weak.test(value)) {
      strength = 'Слабый';
      color = 'red';
    }

    return { strength, color };
  }
}
