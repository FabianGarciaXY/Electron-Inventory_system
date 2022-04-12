/*===================================================
= Modulo de Invocación de procesos del proceso MAIN =
===================================================*/

const { ipcRenderer } = require('electron');


/*============ Products Form =============*/
const productsForm = document.getElementById('products-form');
const productName = document.getElementById('name-product');
const productPrice = document.getElementById('price-product');
const productQuantity = document.getElementById('quantity-products');
const productCategory = document.getElementById('category-product');
const productModel = document.getElementById('model-product');
const productSize = document.getElementById('size-product');
const productColor = document.getElementById('color-product');
const productGeneder = document.getElementById('gender-product');
const productDescription = document.getElementById('description-product');

/*============ Sales Form =============*/
const salesForm = document.getElementById('sales-form2');
const clientName = document.getElementById('name-client');
const clientProduct = document.getElementById('product-client');
const clientQuantityArticles = document.getElementById('quantity-client-articles');
const clientPrice = document.getElementById('price-client');
const clientDeliveryDate = document.getElementById('delivery-date-client');
const clientLocation = document.getElementById('location');
const clientOrderDetails = document.getElementById('description-sale');

/*============  Searching button Elements =============*/
const searchForm = document.getElementById('search-form');
const searchBox = document.getElementById('search-box');
const resetButton = document.getElementById('reset-button');
const selectSalesButton = document.getElementById('select-sales');
const selectProductsButton = document.getElementById('select-products');

/*============ Div element for rendering process  =============*/
const productsList = document.getElementById('products');
let products = [];
let myTable = 'client_orders';
let myColumn = 'date_delivery';



/*============ RECORD PRODUCTS =============*/
productsForm.addEventListener( 'submit', async (e) => {

    e.preventDefault();

    // String validations
    const newProduct = {
        name: productName.value.toLowerCase(),
        price: productPrice.value,
        quantity: productQuantity.value,
        category: productCategory.value.toLowerCase(),
        model: productModel.value.toLowerCase(),
        size: productSize.value.toLowerCase(),
        color: productColor.value.toLowerCase(),
        gender: productGeneder.value.toLowerCase(),
        description: productDescription.value.toLowerCase()
    }

    newProduct.name = newProduct.name.charAt(0).toUpperCase() + newProduct.name.slice(1)
    newProduct.category = newProduct.category.charAt(0).toUpperCase() + newProduct.category.slice(1)
    newProduct.model = newProduct.model.charAt(0).toUpperCase() + newProduct.model.slice(1)
    newProduct.size = newProduct.size.charAt(0).toUpperCase() + newProduct.size.slice(1)
    newProduct.color = newProduct.color.charAt(0).toUpperCase() + newProduct.color.slice(1)
    newProduct.gender = newProduct.gender.charAt(0).toUpperCase() + newProduct.gender.slice(1)
    newProduct.description = newProduct.description.charAt(0).toUpperCase() + newProduct.description.slice(1)
   

    const result = await ipcRenderer.invoke('createProduct', newProduct)

    productsForm.reset();
    productName.focus();
    getProducts();
}) 
/*============ Obtener Productos =============*/
const getProducts = async (table, column) => {
    const products = await ipcRenderer.invoke('getProducts', [myTable, myColumn]);
    renderProducts(products);
}
/*============ Eliminar productos =============*/
const deleteProduct = async (id) => {
    const confirmation = confirm('¿Seguro de que quieres eliminar todos los productos?');
    if (confirmation == false) {
        return
    }
    const productToRemove = await ipcRenderer.invoke('deleteProduct', id);
    getProducts();
}
/*============ Search a Product =============*/
const searchProduct = async (value) => {
    return await ipcRenderer.invoke('searchProduct', value);
}


//--------------------------------------------------------------------------------------//
//                  Get Products On Typing in ProductName Input                         //
//--------------------------------------------------------------------------------------//
const inputDisplay = document.getElementById('products-input-search-results');
const listOfResults = document.getElementById('list-products-found');
let searchProductsInputResults = [];

inputDisplay.style.position = 'absolute';
inputDisplay.style.color = '#e3eaa7';
inputDisplay.style.backgroundColor = '#36486a';
inputDisplay.style.borderRadius = '0 10px 10px 15px';
inputDisplay.style.padding = '5px 5px 0px 0px';
inputDisplay.style.display = 'none';
inputDisplay.style.width = '280px';
inputDisplay.style.textAlign = 'left';
listOfResults.style.listStyle = 'none';

productName.addEventListener('input', async () => {

    if (inputDisplay.textContent.length === 0 || productName.value == '') {
        inputDisplay.style.display = 'none';
        listOfResults.innerHTML = '';
        return
    } else {
        inputDisplay.style.display = 'flex';
    }

    const results = await ipcRenderer.invoke('searchProduct', productName.value);
    searchProductsInputResults = results;
    renderMatchedProducs(searchProductsInputResults);

    if (searchProductsInputResults.length === 0) {
        listOfResults.innerHTML = 'Ningun producto relacionado';
        console.log(searchProductsInputResults.length);
    }
});

// Render list of products founded
function renderMatchedProducs(array) {
    listOfResults.innerHTML = '';
    array.forEach( (product) => {
        listOfResults.innerHTML +=
            `<li id="product-found" stile="background-color: black;" onClick="displayProductSelected(${product.id_product})">${product.name}</li>`;
    });
}

// Populate products form
async function displayProductSelected(id) {
    const selectedArticle = await ipcRenderer.invoke('getSpecificProduct', id);
    console.log(selectedArticle);
    inputDisplay.style.display = 'none';

    productName.value = selectedArticle[0].name;
    productPrice.value = parseFloat(selectedArticle[0].price);
    productQuantity.value = parseInt(selectedArticle[0].quantity);
    productCategory.value = selectedArticle[0].category;
    productModel.value = selectedArticle[0].model;
    productSize.value = selectedArticle[0].size;
    productColor.value = selectedArticle[0].color;
    productGeneder.value = selectedArticle[0].gender;
    productDescription.value = selectedArticle[0].description;

}


/*============ RECORD ORDERS =============*/
salesForm.addEventListener('submit', async (e) => {

    e.preventDefault();
    const clientOrder = {
        client_name: clientName.value.toLowerCase(),
        client_product: clientProduct.value.toLowerCase(),
        client_quantity: clientQuantityArticles.value,
        client_price: clientPrice.value,
        date_delivery: clientDeliveryDate.value,
        client_location: clientLocation.value.toLowerCase(),
        client_order_details: clientOrderDetails.value.toLowerCase()
    }

    clientOrder.client_name = clientOrder.client_name.charAt(0).toUpperCase() + clientOrder.client_name.slice(1);
    clientOrder.client_product = clientOrder.client_product.charAt(0).toUpperCase() + clientOrder.client_product.slice(1);
    clientOrder.client_location = clientOrder.client_location.charAt(0).toUpperCase() + clientOrder.client_location.slice(1);
    clientOrder.client_order_details = clientOrder.client_order_details.charAt(0).toUpperCase() + clientOrder.client_order_details.slice(1);

    const result = await ipcRenderer.invoke('createOrder', clientOrder);

    console.log(result);

    salesForm.reset();
    clientName.focus();
    getProducts();
})
/*============  Get Orders  =============*/
const getOrders = async () => {
    const orders = await ipcRenderer.invoke('getClientOrders');
    console.log(orders);
}
/*============  Delete Orders  =============*/
const deleteOrder = async (id) => {
    const confirmation = confirm('¿Seguro de que quieres eliminar este Pedido?');
    if (confirmation == false) {
        return
    }
    const orderToRemove = await ipcRenderer.invoke('deleteOrder', id);
    getProducts();
}
/*============  Search For Orders  =============*/
const findOrders = async (value) => {
    const result = await ipcRenderer.invoke('searchOrders', value);
    console.log(result);
    return result;
}


/*============ Form de Busqueda =============*/
searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const item = searchBox.value;
    productsList.innerHTML = '';
    
    if (myTable === 'products') {
        products = await searchProduct(item);
        console.log('These are the items From searchForm producs', products);
    }   else if (myTable === 'client_orders'){
        products = await findOrders(item);
        console.log('This are the items From searchForm orders', products);
    }

    if(products.length === 0) {

        productsList.innerHTML = `<h3>Elemento no encontrado :(</h3>`;
        searchForm.reset();
        searchBox.focus();
        return
    }

    renderProducts(products);
    searchForm.reset();
    searchBox.focus();
})


/*=============================================
=       Rendering List of Products            =
=============================================*/

const renderProducts = (products) => {
    productsList.innerHTML = '';
    if (myTable === 'products') {

        products.forEach( (product) => {

            productsList.innerHTML += `
                <div class="card card-body m-2 animate__animated animate__slideInUp"
                    style="
                    display:flex; 
                    padding:20px 0 0 40px;
                    border-radius: 6px;">    
                
                    <h4> ${product.name} </h4>
                    <p>#Id ${product.id_product} </p>
                    <p>Cantidad: <b>${product.quantity}</b> </p>
                    <h3>$ ${product.price}.00</h3>
                    <p>
                        <button class="btn btn-secondary">
                            Modificar
                        </button>
                        <button class="btn btn-danger" onClick="deleteProduct(${product.id_product})">
                            Eliminar
                        </button>
                    </p>
                </div>`;
        });
    } else if (myTable === 'client_orders') {

        products.forEach( (product) => {

            const dateFormated = product.date_delivery.toString();
            const date = dateFormated.slice(4, 15);

            productsList.innerHTML += `
            
                <div class="card card-body m-2 animate__animated animate__slideInUp"
                    style="
                        display:flex; 
                        padding:20px 0 0 40px;
                        border-radius: 6px;">
                    
                    <h4> ${product.client_name} </h4>
                    <p style="padding: 4px 0 0px 25px; margin:0;">Entrega: <b>${date}</b></p>
                    <p style="padding: 1px 0 7px 25px; margin:0;">Dirección: <b> ${product.client_location}</b></p>
                    <p style="gap: 40px; display:flex; padding:0; margin:0 0 10px 0;">
                        <span><b>#${product.id_client_orders}</b></span>
                        <span><b>$ ${product.client_price}.00</b></span>
                        <span><b>Cantidad:${product.client_quantity}</span></p>
                    
                    <p>
                        <button class="btn btn-secondary">
                            Modificar
                        </button>
                        <button class="btn btn-danger" onClick="deleteOrder(${product.id_client_orders})">
                            Eliminar
                        </button>
                    </p>
                </div>`;
        });
     }
    
}


/*============ Reset Button to clear list of items =============*/
resetButton.addEventListener('click', () => {
    getProducts();
});


/*============ Select sections tables option Products/Ventas =============*/
selectSalesButton.addEventListener('click', () => {
    document.getElementById('products-button').style.color = 'grey';
    document.getElementById('sales-button').style.color = 'rgb(255, 249, 228)';

    document.getElementById('sales-button').style.fontWeight = 'bold';
    document.getElementById('products-button').style.fontWeight = '400';

    document.getElementById('sales-button').style.border = 'solid white 2px';
    document.getElementById('products-button').style.border = 'rgb(17, 17, 17) 1px solid';

    document.getElementById('title-elements-container1').style.display = 'block';
    document.getElementById('title-elements-container2').style.display = 'none';

    productsForm.style.display = 'none';
    myTable = 'client_orders';
    myColumn = 'date_delivery';
    salesForm.style.display = 'flex';
    getProducts();
});
document.getElementById('title-elements-container2').style.display = 'none';
selectProductsButton.addEventListener('click', () => {
    document.getElementById('sales-button').style.color = 'grey';
    document.getElementById('products-button').style.color = 'rgb(255, 249, 228)';

    document.getElementById('products-button').style.fontWeight = 'bold';
    document.getElementById('sales-button').style.fontWeight = '400';

    document.getElementById('products-button').style.border = 'solid white 2px';
    document.getElementById('sales-button').style.border = 'rgb(17, 17, 17) 1px solid';

    document.getElementById('title-elements-container2').style.display = 'block';
    document.getElementById('title-elements-container1').style.display = 'none';
    
    salesForm.style.display = 'none';
    myTable = 'products';
    myColumn = 'id_product';
    productsForm.style.display = 'flex';
    getProducts();
});


 
/*=============================================
=  Obtención de lista de productos al iniciar =
=============================================*/
(async function init() {
    await getProducts();
    productsForm.style.display = 'none';

})();