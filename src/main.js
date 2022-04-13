const { BrowserWindow, Menu, app, ipcMain, Notification } = require('electron');
const { cp } = require('original-fs');
const { getConnection } = require('./database');


/*============ MAIN WINDOW  =============*/
function createWindow() {

    const window = new BrowserWindow({
        width: 900,
        height:550,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,        
        }
    })

    window.loadFile('src/ui/index.html')
    window.on('closed', () => {
        app.quit();
    })
    // Set a window and a channel to electron-dialogs

    const mainMenu = Menu.buildFromTemplate(templateMenu);
    Menu.setApplicationMenu(mainMenu);
}

// New Product Window
function createNewProductWindow() {

    let newProductWindow = new BrowserWindow({
        width: 500,
        height: 200,
        title: 'Nuevo Product',
    });
    newProductWindow.loadFile('src/ui/new_product.html');
    newProductWindow.setMenu(null);
    newProductWindow.on('closed', () => {
        newProductWindow = null;
    })

}


/*============  Pesatañas superiores en la ventana principal  =============*/
const templateMenu = [
    {
        label: 'File',
        submenu: [
            {
                label: 'New Product', 
                acelerator: 'Ctrl+N',
                click() {
                    createNewProductWindow();
                }
            },
            {
                label: 'Remove Products',
                click() {

                }
            },
            {
                label: 'Exit',
                acelerator: process.platform == 'darwin' ? 'command+Q' : 'Ctrl+Q',
                click() {
                    app.quit();
                }
            }
        ]
    }
]


/*============  SHORTCUTS  =============*/
app.whenReady()


if ( process.platform === 'darwin' ) {
    templateMenu.unshift({
        label: app.getName()
    })
}

if (process.env.NODE_ENV !== 'production') {
    templateMenu.push({
        label: 'DevTools',
        submenu: [
            {
                label: 'Show/Hide',
                click(item, focusedWindow) {
                    focusedWindow.toggleDevTools();
                }
            },
            {
                role: 'reload'
            }
        ]
    })
}



//--------------------------------------------------------------------------------------//
//                                   CONSULTAS SQL                                      //
//--------------------------------------------------------------------------------------//

/*=============================================
=               Ingresar Priductos            =
=============================================*/
ipcMain.handle('createProduct', async (event, product) => {

    try {
        const conn = await getConnection();

        product.price = parseFloat(product.price);
        product.quantity = parseInt(product.quantity);
        const result = await conn.query('INSERT INTO products SET ?', product);

        new Notification({
            title: 'Mysql Notification',
            body: 'New Product Saved Successfully'
        }).show();

        product.id = result.insertId;        
        return product;

    } catch (err) { 
        console.log(err)
    }

})


/*=============================================
=               Registrar Pedidos             =
=============================================*/
ipcMain.handle('createOrder', async (event, clientOrder) => {
    try {
        const conn = await getConnection();

        clientOrder.client_quantity = parseInt(clientOrder.client_quantity);
        clientOrder.client_price = parseFloat(clientOrder.client_price);

        const result = await conn.query('INSERT INTO client_orders SET ?', clientOrder);

        new Notification({
            title: 'Mysql Notification',
            body: 'New Product Saved Successfully'
        }).show();

        clientOrder.id = result.insertId;
        return clientOrder;
    } catch (err) {
        console.log(err);
    }
})



/*============  QUERIE's FOR PRODUCTS  =============*/
/*==================================================*/

// Obtener lista de productos actuales
ipcMain.handle('getProducts', async (e, [table, column]) => {
    let order = '';
    if ( table === 'products') {
        order = 'DESC';
    }   else {
        order = 'ASC';
    }
    const conn = await getConnection();
    const result = await conn.query(`SELECT * FROM ${table} ORDER BY ${column} ${order};`);
    return result;
})

// Eliminar un product
ipcMain.handle('deleteProduct', async (e, id) => {
    const conn = await getConnection();
    const result = await conn.query(`DELETE FROM products WHERE id_product = ?`, id);
    return result;
})

// Busqueda de productos
ipcMain.handle('searchProduct', async (e, value) => {
    const conn = await getConnection();
    const result = await conn.query(`SELECT * FROM products WHERE name LIKE '%${value}%';`);
    return result;
})
ipcMain.handle('getSpecificProduct', async (e, id) => {
    
    id = parseInt(id);
    console.log(id);
    const conn = await getConnection();
    const result = await conn.query(`SELECT * FROM products WHERE id_product LIKE '%${id}%';`);
    return result;
})


/*============  Queries for update produts quantity  =============*/

ipcMain.handle('update-quantity', async (e, [id, value]) => {
    
    const idSelected = parseInt(id);
    const setValue = parseInt(value);

    const conn = await getConnection();
    const result = await conn.query(`UPDATE products SET quantity = ${setValue} WHERE id_product = ?`, idSelected);
    return result;
})


/*=============  QUERIE's FOR ORDERS  ==============*/
/*==================================================*/

// Obtener todos los pedidos
ipcMain.handle('getClientOrders', async () => {
    const conn = await getConnection();
    const result = await conn.query('SELECT * FROM client_orders ORDER BY date_delivery ASC;');
    console.log(result)
    return result;
})

//Eliminar una orden
ipcMain.handle('deleteOrder', async (e, id) => {
    const conn = await getConnection();
    const result = await conn.query(`DELETE FROM client_orders WHERE id_client_orders = ?`, id);
    return result;
})

// Busqueda de pedidos
ipcMain.handle('searchOrders', async (e, value) => {
    const conn = await getConnection();
    const result = await conn.query(`SELECT * FROM client_orders WHERE client_name LIKE '%${value}%';`);
    console.log(result);
    return result;
})



module.exports = {
    createWindow
}