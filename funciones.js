//para mostrar  alerta con espera de 0.5 segundos para simular
async function mostrarAlerta() {
    return new Promise((resolve) => {
        setTimeout(() => {
            // config de la alerta con SweetAlert
            const Toast = Swal.mixin({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 1200,
                timerProgressBar: true,
                didOpen: (toast) => {
                    toast.addEventListener('mouseenter', Swal.stopTimer);
                    toast.addEventListener('mouseleave', Swal.resumeTimer);
                }
            });

            // alerta del producto agregado al carrito con sweetalert (probar antes de entregar)
            Toast.fire({
                icon: 'success',
                title: 'Producto agregado al carrito'
            });

            resolve();
        }, 500);
    });
}

// alerta del producto eliminado del carrito tambien sweet alert))))
function mostrarAlertaEliminar(producto) {
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 1200,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer);
            toast.addEventListener('mouseleave', Swal.resumeTimer);
        }
    });

    Toast.fire({
        icon: 'info',
        title: `Producto eliminado del carrito`
    });
}

// funcion asincronica para mostrar la alerta de pago
async function mostrarAlertaPago(total) {
    try {
        // sweetalert para el pago
        const result = await Swal.fire({
            title: '¿Estás seguro de pagar?',
            text: `El total a pagar es: $${total}`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Pagar',
            cancelButtonText: 'Cancelar',
        });

        if (result.isConfirmed) {
            // si el usuario confirma mostrar mensaje de compra y console log de que pagó
            await Swal.fire('¡Compra exitosa!', 'Gracias por tu compra.', 'success');
            setTimeout(() => {
                console.log('El usuario pagó');
            }, 1000);

            // limpiar carrito, reiniciar total y actualizar el localStorage (REVISAR)
            carritoCompras.innerHTML = '';
            window.total = 0;
            totalDeCompra.textContent = window.total;
            localStorage.removeItem('carrito'); // eliminar carrito cuando se "paga"
        }
    } catch (error) {
        console.error('Error al pagar:', error);
    }
}

// sel elementos del DOM
const carritoCompras = document.getElementById('carrito-compras');
const totalDeCompra = document.getElementById('totalDeCompra');
window.total = 0;

// cargar productos del DOM
document.addEventListener('DOMContentLoaded', async function () {
    try {
        // obtenemos los datos de productos desde 'productos.json' (revisar antes de entregar que esto lo pusimos hace poco)
        const response = await fetch('productos.json');
        const data = await response.json();

        const productosDisponibles = data;

        // evento para agregar productos al carrito
        const agregarCarrito = document.querySelectorAll('[id^="add-product"]');
        agregarCarrito.forEach(button => {
            button.addEventListener('click', async e => {
                // obtenemos informacion del producto que elegimos
                const productId = e.target.id.split('-')[2];
                const selectedProduct = productosDisponibles[productId - 1];

                // verificams si existe el producto antes de mostrar la info
                if (selectedProduct && selectedProduct.nombre) {
                    // creamos elementos HTML para mostrar en el carrito 
                    const li = document.createElement('li');
                    li.textContent = `${selectedProduct.nombre} - $${selectedProduct.precio}`;

                    const deleteButton = document.createElement('button');
                    deleteButton.textContent = 'Eliminar';
                    deleteButton.classList.add('btn', 'btn-danger', 'ml-2');

                    // evento para eliminar el producto del carrito + consolelog
                    deleteButton.addEventListener('click', () => {
                        window.total -= selectedProduct.precio;
                        totalDeCompra.textContent = window.total;
                        li.remove();
                        actualizarLocalStorage();
                        mostrarAlertaEliminar(selectedProduct.nombre);
                        console.log(`Producto eliminado: ${selectedProduct.nombre}`);
                    });

                    li.appendChild(deleteButton);
                    carritoCompras.appendChild(li);

                    window.total += selectedProduct.precio;
                    totalDeCompra.textContent = window.total;

                    await mostrarAlerta();
                    console.log(`Producto agregado: ${selectedProduct.nombre}`);
                    actualizarLocalStorage();
                } else {
                    console.error('Producto no encontrado.');
                }
            });
        });
    } catch (error) {
        console.error('Error al obtener los productos:', error);
    }
});

// evento para mostrar u ocultar el carrito cuando hacemos click
document.getElementById('toggle-cart').addEventListener('click', function mostrarOcultarCarrito() {
    const cartContainer = document.getElementById('carrito-container');
    cartContainer.classList.toggle('d-none');
});

// evento para pagar al hacer clic en el botón de pagar
document.getElementById('checkout').addEventListener('click', async function() {
    await mostrarAlertaPago(window.total);
});

// funcion para actualizar el localStorage con el contenido del carrito (revisar)
function actualizarLocalStorage() {
    const itemsCarrito = [];
    carritoCompras.querySelectorAll('li').forEach(item => {
        const itemInfo = item.textContent.split(' - $');
        itemsCarrito.push({ producto: itemInfo[0], precio: parseInt(itemInfo[1]) });
    });
    localStorage.setItem('carrito', JSON.stringify(itemsCarrito)); // guardamos el carrito en localStorage
}

// cargamos el carrito desde localStorage al cargar la pag
window.addEventListener('load', () => {
    const carritoActual = JSON.parse(localStorage.getItem('carrito')) || [];
    carritoActual.forEach(item => {
        const li = document.createElement('li');
        li.textContent = `${item.producto} - $${item.precio}`;

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Eliminar';
        deleteButton.classList.add('btn', 'btn-danger', 'ml-2');

        //evento para eliminar el producto del carrito desde localStorage
        deleteButton.addEventListener('click', () => {
            window.total -= item.precio;
            totalDeCompra.textContent = window.total;
            li.remove();
            actualizarLocalStorage();
            console.log(`Producto eliminado: ${item.producto}`);
        });

        li.appendChild(deleteButton);
        carritoCompras.appendChild(li);
        window.total += item.precio;
        totalDeCompra.textContent = window.total;
    });
});
