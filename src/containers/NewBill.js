import { ROUTES_PATH } from '../constants/routes.js'
import Logout from "./Logout.js"

export default class NewBill {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.store = store
    const formNewBill = this.document.querySelector(`form[data-testid="form-new-bill"]`)
    formNewBill.addEventListener('submit', this.handleSubmit)
    const file = this.document.querySelector(`input[data-testid="file"]`)
    file.addEventListener('change', this.handleChangeFile)
    this.fileUrl = null
    this.fileName = null
    this.billId = null
    new Logout({ document, localStorage, onNavigate })
  }

  //* gerer le fichier de modif
  handleChangeFile = e => {
		e.preventDefault();
		const inputFile = this.document.querySelector(`input[data-testid="file"]`);
		const file = inputFile.files[0];
		const filePath = e.target.value.split(/\\/g);
		const fileName = filePath[filePath.length - 1];
		//! si la chaine est vide alors elle est utilisés comme separation entre chaque caractere, là .
		//! sans modifier le string d'origine
		// pop supprime le dernier element
		const fileExtension = fileName.split(".").pop();
		const formats = ["jpg", "jpeg", "png"];
		const formData = new FormData();
		const email = JSON.parse(localStorage.getItem("user")).email;

		/* istanbul ignore next */
		if (!formats.includes(fileExtension)) {
			//* Si la valeur est vide : le formulaire ne peut pas etre envoyé,  : alerte
			inputFile.value = "";
			return alert(
				"Ce type de fichier n'est pas supporté,merci de choisir un fichier extension .jpg, .jpeg ou .png"
			);
		}
		formData.append("file", file);
		formData.append("email", email);
		this.store
			.bills()
			.create({ data: formData, headers: { noContentType: true } })
			.then(
				/* istanbul ignore next */
				({ fileUrl, key }) => {
					this.billId = key;
					this.fileUrl = fileUrl;
					this.fileName = fileName;
				}
			)
			.catch(
				/* istanbul ignore next */
				(error) => console.error(error)
			);
  }

  handleSubmit = e => {
    e.preventDefault()
    const email = JSON.parse(localStorage.getItem("user")).email
    const bill = {
      email,
      type: e.target.querySelector(`select[data-testid="expense-type"]`).value,
      name:  e.target.querySelector(`input[data-testid="expense-name"]`).value,
      amount: parseInt(e.target.querySelector(`input[data-testid="amount"]`).value),
      date:  e.target.querySelector(`input[data-testid="datepicker"]`).value,
      vat: e.target.querySelector(`input[data-testid="vat"]`).value,
      pct: parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) || 20,
      commentary: e.target.querySelector(`textarea[data-testid="commentary"]`).value,
      fileUrl: this.fileUrl,
      fileName: this.fileName,
      status: 'pending'
    }
    this.updateBill(bill)
    this.onNavigate(ROUTES_PATH['Bills'])
  }

  // not need to cover this function by tests
  updateBill = (bill) => {
    if (this.store) {
      this.store
      .bills()
      .update({data: JSON.stringify(bill), selector: this.billId})
      .then(() => {
        this.onNavigate(ROUTES_PATH['Bills'])
      })
    
      .catch(
        /* istanbul ignore next */
        (error) => console.error(error))
    }
  }
}