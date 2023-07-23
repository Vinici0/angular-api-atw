import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ApiSpringService } from 'src/app/services/api-spring.service';
import { REGEX_FORM } from 'src/app/utils/validators';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent {
  products:        any = []
  categories:      any = []
  updateActive: boolean = false;
  selectedProduct: string = "";
  errorSend:     string = "";
  urlProduct:    string = "http://localhost:9090/api/products"
  urlCategory:   string = "http://localhost:9090/api/categories"
  constructor(private springService: ApiSpringService) {}

  ngOnInit(): void {
    this.getCategories()
    this.getProducts()
  }

  productData: FormGroup = new FormGroup({
    name: new FormControl('', [
      Validators.required,
      Validators.pattern(REGEX_FORM.isValidText)
    ]),
    description: new FormControl('', [
      Validators.required,
      Validators.pattern(REGEX_FORM.isValidText)
    ]),
    price: new FormControl('', [
      Validators.required,
      Validators.pattern(REGEX_FORM.isDecimal)
    ]),
    caducity: new FormControl('', [
      Validators.required
    ]),
    categoryId: new FormControl('', [
      Validators.required
    ]),
  })

  saveProduct() {
    if(this.productData.valid) {
      this.springService.doPost("http://localhost:9002/api/products", this.productData.value).subscribe((response: any) => {

          Swal.fire(response.message, "", "success")
          this.getProducts()
          this.resetForm()
          this.errorSend = ""

      })
    } else {
      this.errorSend = "Debes completar todos los campos"
    }
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

  loadUpdate(productId: string) {
    const productFound = this.products.find((product:any) => product.id === productId)
    this.updateActive = true;
    this.selectedProduct = productId;
    this.productData.get('name')?.setValue(productFound.name);
    this.productData.get('description')?.setValue(productFound.description);
    this.productData.get('price')?.setValue(productFound.price);
    this.productData.get('caducity')?.setValue(productFound.caducity);
    this.productData.get('categoryId')?.setValue(productFound.categoryId);
  }

  updateProduct() {
    if(this.productData.valid) {
      Swal.fire({
        icon: 'warning',
        title: '¿Deseas actualizar este producto?',
        showCancelButton: true,
        confirmButtonText: 'Actualizar',
      }).then((press) => {
        if (press.isConfirmed) {
          const urlUpdate = `http://localhost:9002/api/products/${this.selectedProduct}`
          this.springService.doPut(urlUpdate, this.productData.value).subscribe((response: any) => {
             if(response !== null) {
              Swal.fire(response.message, "", "success")
              this.getProducts()
              this.resetForm()
              this.updateActive = false;
              this.errorSend = ""
            } else {
              this.errorSend = response.message
            }
          })
        }
      })
    } else {
      this.errorSend = "Debes rellenar todos los campos"
    }
  }

  deleteCard(productId: string) {
    Swal.fire({
      icon: 'warning',
      title: '¿Deseas eliminar este producto?',
      text: 'Recuerda que solo podrás eliminar el producto si no tiene registros vinculados',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
    }).then((press) => {
      if (press.isConfirmed === true) {
        this.springService.doDelete(`http://localhost:9002/api/products/${productId}`, this.productData.value).subscribe((response: any) => {
            Swal.fire("Producto eliminado", "", "success")
            this.getProducts()
            this.resetForm()
            this.updateActive = false;

        })
      }
    })
  }

  resetForm() {
    this.updateActive = false;
    const controls = Object.keys(this.productData.controls);
    controls.forEach(key => {
      const control = this.productData.get(key);
      if(control) {
        control.setValue("")
        control.markAsUntouched();
        control.markAsPristine();
        control.updateValueAndValidity();
      }
    });
  }

  searchCategory(categoryId: string) {
    const category = this.categories.find((cat:any) => cat.id === categoryId)
    return category.name
  }

  messageError(input: string) {
    const validate = this.productData.get(input);
    const isTouched = validate?.touched;
    const isValid = validate?.valid;
    if(validate?.value === "" && isTouched) return false
    if(validate?.value === "") return true
    if(validate?.value !== "" && isValid) return true
    return false
  }
}
