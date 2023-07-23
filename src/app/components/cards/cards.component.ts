import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ApiSpringService } from 'src/app/services/api-spring.service';
import { REGEX_FORM } from 'src/app/utils/validators';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-cards',
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.css']
})
export class CardsComponent implements OnInit {
  cards:        any = []
  rooms:        any = []
  employees:        any = []
  updateActive: boolean = false;
  selectedCard: string = "";
  errorSend:     string = "";
  url:          string = "http://localhost:9090/api/cards"
  urlRooms:     string = "http://localhost:9090/api/rooms"
  urlEmployees: string = "http://localhost:9090/api/employees"

  constructor(private springService: ApiSpringService) {}

  ngOnInit(): void {
    this.getRooms()
    this.getEmployees()
    this.getCards()
  }

  cardData: FormGroup = new FormGroup({
    dni: new FormControl('', [
      Validators.required,
      Validators.pattern(REGEX_FORM.isValidDNI)
    ]),
    name: new FormControl('', [
      Validators.required,
      Validators.pattern(REGEX_FORM.isValidNAME)
    ]),
    lastname: new FormControl('', [
      Validators.required,
      Validators.pattern(REGEX_FORM.isValidLASTNAME)
    ]),
    address: new FormControl('', [
      Validators.required,
      Validators.pattern(REGEX_FORM.isValidLASTNAME)
    ]),
    birthday: new FormControl('', [
      Validators.required
    ]),
    roomId: new FormControl('', [
      Validators.required
    ]),
    employeeId: new FormControl('', [
      Validators.required
    ])
  })

  saveCard() {
    if(this.cardData.valid) {
      const dataToSend = structuredClone(this.cardData.value)
      const roomId = dataToSend.roomId
      const employeeId = dataToSend.employeeId
      delete dataToSend.roomId
      delete dataToSend.employeeId
      console.log("dataToSend", dataToSend);
      console.log("roomId", roomId, "employeeId", employeeId);

      this.springService.doPost(`http://localhost:9002/api/cards/${roomId}/${employeeId}`, dataToSend).subscribe((response: any) => {

          Swal.fire("Guardado","success")
          this.getCards()
          this.resetForm()
          this.errorSend = ""

      })
    } else {
      this.errorSend = "Debes completar todos los campos"
    }
  }

  getCards() {
    this.springService.doGet(this.url).subscribe((response) => {
      console.log("response", response);
      this.cards = response
    })
  }

  getRooms() {
    this.springService.doGet(this.urlRooms).subscribe((response) => {
      this.rooms = response
    })
  }

  getEmployees() {
    this.springService.doGet(this.urlEmployees).subscribe((response) => {
      this.employees = response
    })
  }

  loadUpdate(cardNumber: string) {
    const cardFound = this.cards.find((card:any) => card.id === cardNumber)
    this.updateActive = true;
    this.selectedCard = cardNumber;
    console.log("cardFound", cardNumber);

    this.cardData.addControl('id', new FormControl(Number(cardNumber)))
    this.cardData.get('dni')?.setValue(cardFound.customer.dni);
    this.cardData.get('name')?.setValue(cardFound.customer.name);
    this.cardData.get('lastname')?.setValue(cardFound.customer.lastname);
    this.cardData.get('address')?.setValue(cardFound.customer.address);
    this.cardData.get('birthday')?.setValue(cardFound.customer.birthday);
    this.cardData.get('roomId')?.setValue(cardFound.roomId);
    this.cardData.get('employeeId')?.setValue(cardFound.employeeId);
    console.log("this.cardData", this.cardData.value);

  }

  updateCard() {
    console.log("this.cardDatassssssssssssss", this.cardData.value);


      Swal.fire({
        icon: 'warning',
        title: '¿Deseas actualizar este empleado?',
        showCancelButton: true,
        confirmButtonText: 'Guardar',
      }).then((press) => {
        console.log("press", press);

        if (press.isConfirmed === true) {
          const dataToSend = structuredClone(this.cardData.value)
          const roomId = dataToSend.roomId
          const employeeId = dataToSend.employeeId
          delete dataToSend.roomId
          delete dataToSend.employeeId

          const urlUpdate = `http://localhost:9002/api/cards/${this.selectedCard}/${roomId}/${employeeId}`
          console.log( "11111111111111111111111", this.cardData.value , urlUpdate);

          this.springService.doPut(urlUpdate, this.cardData.value).subscribe((response: any) => {

              Swal.fire("Guardado","success")
              this.getCards()
              this.resetForm()
              this.updateActive = false;
              this.errorSend = ""

          })
        }
      })

  }

  deleteCard(cardNumber: Number) {
    console.log("cardNumber", cardNumber);

    Swal.fire({
      icon: 'warning',
      title: '¿Deseas eliminar este empleado?',
      text: 'Recuerda que solo podrás eliminar el empleado si no tiene registros vinculados',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
    }).then((press) => {
      if (press.isConfirmed) {
        this.springService.doDelete(`http://localhost:9002/api/cards/${cardNumber}`, this.cardData.value).subscribe((response: any) => {

            Swal.fire("Ok", "Empleado eliminado", "success")
            this.getCards()
            this.resetForm()
            this.updateActive = false;

        })
      }
    })
  }

  resetForm() {
    this.updateActive = false;
    const controls = Object.keys(this.cardData.controls);
    controls.forEach(key => {
      const control = this.cardData.get(key);
      if(control) {
        control.setValue("")
        control.markAsUntouched();
        control.markAsPristine();
        control.updateValueAndValidity();
      }
    });
  }

  searchEmployee(employeeId: string) {
    const employee = this.employees.find((emp:any) => emp.id === employeeId)
    return `${employee.name} ${employee.lastname}`
  }

  searchRoom(roomId: string) {
    const room = this.rooms.find((room:any) => room.id === roomId)
    return room.name
  }

  messageError(input: string) {
    const validate = this.cardData.get(input);
    const isTouched = validate?.touched;
    const isValid = validate?.valid;
    if(validate?.value === "" && isTouched) return false
    if(validate?.value === "") return true
    if(validate?.value !== "" && isValid) return true
    return false
  }
}
