import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { ApiSpringService } from 'src/app/services/api-spring.service';
import { REGEX_FORM } from 'src/app/utils/validators';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-sales',
  templateUrl: './sales.component.html',
  styleUrls: ['./sales.component.css']
})
export class SalesComponent implements OnInit{
  cards:           any = []
  products:        any = []
  categories:      any = []
  employees:       any = []
  rooms:           any = []
  details:         any = []
  filterdProducts: any = []
  subtotal:        number = 0
  recharge:        number = 0
  rechargePercent: number = 0
  iva:             number = 0
  selectedCard: string = "";
  selectedRoom: string = "";
  selectedUser = {
    name: "",
    dni: "",
  }
  selectedEmployee = {
    name: "",
    dni: "",
  }
  errorSend:            string = "";
  errorAdd:             string = "";
  urlProduct:           string = "http://localhost:9090/api/products"
  urlCategory:          string = "http://localhost:9090/api/categories"
  urlEmployee:          string = "http://localhost:9090/api/employees"
  urlCards:             string = "http://localhost:9090/api/cards"
  urlRooms:             string = "http://localhost:9090/api/rooms"
  urlSales:             string = "http://localhost:9090/api/sales"
  urlsaleDetails:       string = "http://localhost:9090/api/saleDetails"


  userData: FormGroup = new FormGroup({
    cardNumber: new FormControl('', [
      Validators.required
    ]),
    employeeId: new FormControl('', [
      Validators.required
    ])
  })

  detailData: FormGroup = new FormGroup({
    categoryId: new FormControl('', [
      Validators.required
    ]),
    productId: new FormControl('', [
      Validators.required
    ]),
    quantity: new FormControl('', [
      Validators.required,
      Validators.pattern(REGEX_FORM.isPositiveInteger)
    ])
  })

  constructor(
    private springService: ApiSpringService
  ) {}


  ngOnInit(): void {
    this.getCards()
    this.getCategories()
    this.getProducts()
    this.getEmployees()
    this.getRooms()
  }

  wasSelected(event: Event) {
    const select = event.target as HTMLSelectElement
    if(select.value === "") {
      this.filterdProducts = []
    } else {
      this.filterdProducts = this.products.filter((product: any) => {
        return product.categoryId === Number(select.value)
      })
    }
  }

  getRooms() {
    this.springService.doGet(this.urlRooms).subscribe((response) => {
      this.rooms = response
    })
  }

  hadChanged(event: Event) {
    const select = event.target as HTMLSelectElement
    if(select.value === "") {
      this.selectedUser.dni = ""
      this.selectedUser.name = ""
      this.selectedRoom = ""
      this.recharge = 0
      this.iva = 0
    } else {
      const selectedCard = this.cards.find((card: any) => {
        return card.cardNumber === select.value
      })
      const foundCard = this.cards.find((card: any) => {
        return card.cardNumber === select.value
      })
      this.selectedUser.dni = foundCard.customer.dni
      this.selectedUser.name = foundCard.customer.name + " "+ foundCard.customer.lastname
      this.selectedRoom = selectedCard.roomId.toString()
      this.calculateExtras()

    }
  }

  calculateExtras() {
    if(this.selectedRoom !== "") {
      const foundRoom = this.rooms.find((room: any) => {
        return room.id.toString() === this.selectedRoom
      })
      this.recharge = parseFloat((this.subtotal * (foundRoom.extra / 100)).toFixed(2))
      this.iva = parseFloat(((this.subtotal + this.recharge) * 0.12).toFixed(2))
    } else {
      this.recharge = 0
      this.iva = 0
    }
  }

  getCards() {
    this.springService.doGet(this.urlCards).subscribe((response) => {
      this.cards = response
    })
  }

  getProducts() {
    this.springService.doGet(this.urlProduct).subscribe((response) => {
      this.products = response
    })
  }

  getCategories() {
    this.springService.doGet(this.urlCategory).subscribe((response) => {
      this.categories = response
    })
  }

  getEmployees() {
    this.springService.doGet(this.urlEmployee).subscribe((response) => {
      this.employees = response
    })
  }

  addDetail() {
    console.log("this.userData", this.userData.value);

    console.log("this.detailData", this.detailData.value);

    if(this.detailData.valid) {
      const { productId, quantity } = this.detailData.value;
      const foundDetail = this.details.find((detail: any) => {
        return detail.productId === productId
      })

      if(foundDetail) {
        this.errorAdd = "Ese producto ya existe en la lista de consumo"
        return
      }

      const foundProduct = this.products.find((product: any) => {
        return Number(product.id) === Number(productId)
      })

      this.details.push({
        productName: foundProduct.name,
        subtotal: foundProduct.price * quantity,
        price: foundProduct.price,
        quantity,
        productId
      })

      this.subtotal = this.details.reduce((sub: number, next: any) => {
        return sub + next.subtotal;
      }, 0);
      this.calculateExtras()
      this.errorAdd = ""
      this.resetForm('detail')
      Swal.fire("Producto añadido al consumo:", "", "success");
    } else {
      Swal.fire("Atención","Debes completar todos los campos del producto","warning");
    }
  }

  updateQuantity(productId: string) {
    Swal.fire({
      title: "Actualizar cantidad",
      input: "number",
      inputLabel: "Ingrese la nueva cantidad:",
      showCancelButton: true,
      cancelButtonText: "Cancelar",
      confirmButtonText: "Actualizar",
      allowOutsideClick: false,
      inputValidator: function(value) {
        if (!value) {
          return "Debe ingresar una nueva cantidad";
        } else {
          if(REGEX_FORM.isPositiveInteger.test(value)) {
            return ""
          } else {
            return "Solo se admiten números enteros positivos"
          }
        }
      },
    }).then((result) => {
      if (result.isConfirmed) {
        this.details.map((detail: any) => {
          if(detail.productId === productId) {
            detail.quantity = result.value
            detail.subtotal = detail.price * result.value
          }
          return detail
        })

        this.subtotal = this.details.reduce((sub: number, next: any) => {
          return sub + next.subtotal;
        }, 0);
        this.calculateExtras()
        Swal.fire("Cantidad actualizada:", result.value, "success");
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire("Actualización cancelada", "", "info");
      }
    });
  }

  sendData() {
    console.log("this.userData", this.userData.value);

    if(this.userData.valid) {
      const {cardNumber, employeeId} = this.userData.value
      const dataCopy = structuredClone(this.details).map((detail:any) => {
        delete detail.productName
        return detail
      })
      const sale = {
        recharge: this.recharge,
        iva: this.iva,
        saleDetail: dataCopy,
        cardNumber,
        employeeId: Number(employeeId),
      }
      console.log("sale", sale);

      this.springService.doPost("http://localhost:9002/api/sales", sale).subscribe((response: any) => {
        console.log("response sala", response);

        if(response !== null) {
          this.resetAll()
          Swal.fire(response.message, "", "success");
        } else {
          Swal.fire(response.message, "", "error");
        }

      })

    } else {
      Swal.fire("Atención", "Debes completar los campos de datos generales", "warning")
    }
  }

  resetAll() {
    this.details= []
    this.filterdProducts = []
    this.subtotal = 0
    this.recharge = 0
    this.rechargePercent = 0
    this.iva = 0
    this.selectedCard = "";
    this.selectedRoom = "";
    this.resetForm("user")
    this.resetForm("detail")
    this.selectedUser.dni = ""
    this.selectedUser.name = ""
  }

  removeDetail(productId: string) {
    Swal.fire({
      title: "Quitar producto",
      icon: "warning",
      text: "¿Deseas quitar este producto de la lista de consumo?",
      showCancelButton: true,
      cancelButtonText: "Cancelar",
      confirmButtonText: "Eliminar",
      allowOutsideClick: false,
    }).then((result) => {
      if (result.isConfirmed){
        const index = this.details.findIndex((detail: any) => {
          return detail.productId = productId
        });
        if (index !== -1) {
          this.details.splice(index, 1);
        }
        Swal.fire("Producto eliminado de la lista de consumo", "", "success")
      }
    })
  }

  resetForm(form: string ) {
    let controls = [];
    if(form === "detail") {
      controls = Object.keys(this.detailData.controls);
      controls.forEach(key => {
        const control = this.detailData.get(key);
        if(control) {
          control.setValue("")
          control.markAsUntouched();
          control.markAsPristine();
          control.updateValueAndValidity();
        }
      });
    }
    if(form === "user") {
      controls = Object.keys(this.userData.controls);
      controls.forEach(key => {
        const control = this.userData.get(key);
        if(control) {
          control.setValue("")
          control.markAsUntouched();
          control.markAsPristine();
          control.updateValueAndValidity();
        }
      });
    }
  }

  searchCategory(categoryId: string) {
    const category = this.categories.find((cat:any) => cat.id === categoryId)
    return category.name
  }

  msgErrorUser(input: string) {
      const validate = this.userData.get(input);
      const isTouched = validate?.touched;
      const isValid = validate?.valid;
      if(validate?.value === "" && isTouched) return false
      if(validate?.value === "") return true
      if(validate?.value !== "" && isValid) return true
      return false
  }

  msgErrorDetail(input: string) {
      const validate = this.detailData.get(input);
      const isTouched = validate?.touched;
      const isValid = validate?.valid;
      if(validate?.value === "" && isTouched) return false
      if(validate?.value === "") return true
      if(validate?.value !== "" && isValid) return true
      return false
  }
}

