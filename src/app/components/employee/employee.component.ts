import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ApiSpringService } from 'src/app/services/api-spring.service';
import { REGEX_FORM } from 'src/app/utils/validators';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-employee',
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.css'],
})
export class EmployeeComponent implements OnInit {
  employees: any = [];
  updateActive: boolean = false;
  errorSend: string = '';
  selectedEmployee: string = '';
  url: string = 'http://localhost:9090/api/cards';
  urlRooms: string = 'http://localhost:9090/api/rooms';
  urlEmployees: string = 'http://localhost:9090/api/employees';
  constructor(private springService: ApiSpringService) {}

  ngOnInit(): void {
    this.getEmployees();
  }

  employeeData: FormGroup = new FormGroup({
    dni: new FormControl('', [
      Validators.required,
      Validators.pattern(REGEX_FORM.isValidDNI),
    ]),
    name: new FormControl('', [
      Validators.required,
      Validators.pattern(REGEX_FORM.isValidNAME),
    ]),
    lastname: new FormControl('', [
      Validators.required,
      Validators.pattern(REGEX_FORM.isValidLASTNAME),
    ]),
    address: new FormControl('', [
      Validators.required,
      Validators.pattern(REGEX_FORM.isValidLASTNAME),
    ]),
    birthday: new FormControl('', [Validators.required]),
  });

  saveEmployee() {
    if (this.employeeData.valid) {
      this.springService
        .doPost("http://localhost:9002/api/employees", this.employeeData.value)
        .subscribe((response: any) => {
          console.log('response', response);

          if (response != null) {
            this.getEmployees();
            Swal.fire('Ok', response.message, 'success');
            this.resetForm();
            this.errorSend = '';
          } else {
            this.errorSend = response.message;
          }
        });
    } else {
      this.errorSend = 'Asegurese de completar todos los campos';
    }
  }

  getEmployees() {
    this.springService.doGet(this.urlEmployees).subscribe((response) => {
      this.employees = response;
    });
  }

  loadUpdate(employeeId: string) {
    const employeeFound = this.employees.find(
      (employee: any) => employee.id === employeeId
    );
    this.updateActive = true;
    this.selectedEmployee = employeeId;
    this.employeeData.get('dni')?.setValue(employeeFound.dni);
    this.employeeData.get('name')?.setValue(employeeFound.name);
    this.employeeData.get('lastname')?.setValue(employeeFound.lastname);
    this.employeeData.get('birthday')?.setValue(employeeFound.birthday);
    this.employeeData.get('address')?.setValue(employeeFound.address);
  }

  updateEmployee() {
    if (this.employeeData.valid) {
      Swal.fire({
        icon: 'warning',
        title: '¿Deseas actualizar este empleado?',
        showCancelButton: true,
        confirmButtonText: 'Guardar',
      }).then((press) => {
        if (press.isConfirmed) {
          this.springService
            .doPut(`http://localhost:9002/api/employees/${this.selectedEmployee}`, {
              id: this.selectedEmployee,
              ...this.employeeData.value,
            })
            .subscribe((response: any) => {

                Swal.fire(response.message, '', 'success');
                this.getEmployees();
                this.resetForm();
                this.updateActive = false;
                this.errorSend = '';

            });
        }
      });
    }
  }

  deleteCard(employeeId: string) {
    Swal.fire({
      icon: 'warning',
      title: '¿Deseas eliminar este empleado?',
      text: 'Recuerda que solo podrás eliminar el empleado si no tiene registros vinculados',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
    }).then((press) => {
      console.log('press', press);

      if (press.isConfirmed) {

        this.springService
          .doDelete(
            `http://localhost:9002/api/employees/${employeeId}`,
            this.employeeData.value
          )
          .subscribe((response: any) => {
            Swal.fire("Ok Empleado eliminado correctamente"
              , '', 'success');
            this.getEmployees();
            this.resetForm();
            this.updateActive = false;
          });
      }
    });
  }

  resetForm() {
    this.updateActive = false;
    const controls = Object.keys(this.employeeData.controls);
    controls.forEach((key) => {
      const control = this.employeeData.get(key);
      if (control) {
        control.setValue('');
        control.markAsUntouched();
        control.markAsPristine();
        control.updateValueAndValidity();
      }
    });
  }

  messageError(input: string) {
    const validate = this.employeeData.get(input);
    const isTouched = validate?.touched;
    const isValid = validate?.valid;
    if (validate?.value === '' && isTouched) return false;
    if (validate?.value === '') return true;
    if (validate?.value !== '' && isValid) return true;
    return false;
  }
}
