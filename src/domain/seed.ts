import type {
  Backup,
  Boleta,
  Categoria,
  Cliente,
  DetallePedido,
  Inventario,
  Pedido,
  Producto,
  Proveedor,
  Reporte,
  Rol,
  Usuario,
} from '../domain'

export const rolesSeed: Rol[] = [
  {
    idRol: 1,
    nombre: 'Administrador',
    descripcion: 'Acceso total al sistema',
    puedeVender: true,
    puedeAdministrarInventario: true,
    puedeVerReportes: true,
    puedeAdministrarUsuarios: true,
    activo: true,
  },
  {
    idRol: 2,
    nombre: 'Vendedor',
    descripcion: 'Registro de ventas y clientes',
    puedeVender: true,
    puedeAdministrarInventario: false,
    puedeVerReportes: false,
    puedeAdministrarUsuarios: false,
    activo: true,
  },
  {
    idRol: 3,
    nombre: 'Inventario',
    descripcion: 'Gestion de stock y productos',
    puedeVender: false,
    puedeAdministrarInventario: true,
    puedeVerReportes: false,
    puedeAdministrarUsuarios: false,
    activo: true,
  },
  {
    idRol: 4,
    nombre: 'Reportes',
    descripcion: 'Consulta y generacion de reportes',
    puedeVender: false,
    puedeAdministrarInventario: false,
    puedeVerReportes: true,
    puedeAdministrarUsuarios: false,
    activo: true,
  },
]

export const usuariosSeed: Usuario[] = [
  { idUsuario: 1, nombre: 'Admin', apellido: 'Inicial', email: 'admin@botica.com', activo: true, idRol: 1 },
  { idUsuario: 2, nombre: 'Maria', apellido: 'Perez', email: 'maria.perez@botica.com', activo: true, idRol: 1 },
  { idUsuario: 3, nombre: 'Juan', apellido: 'Lopez', email: 'juan.lopez@botica.com', activo: true, idRol: 2 },
  { idUsuario: 4, nombre: 'Ana', apellido: 'Suarez', email: 'ana.suarez@botica.com', activo: true, idRol: 3 },
  { idUsuario: 5, nombre: 'Luis', apellido: 'Castro', email: 'luis.castro@botica.com', activo: true, idRol: 4 },
]

export const clientesSeed: Cliente[] = [
  { idCliente: 1, nombre: 'Carlos', apellido: 'Garcia', dni: '12345678', telefono: '987654321', email: 'carlos.garcia@mail.com' },
  { idCliente: 2, nombre: 'Sofia', apellido: 'Ramos', dni: '87654321', telefono: '912345678', email: 'sofia.ramos@mail.com' },
  { idCliente: 3, nombre: 'Diego', apellido: 'Flores', dni: '10111213', telefono: '999888777', email: 'diego.flores@mail.com' },
  { idCliente: 4, nombre: 'Elena', apellido: 'Velasquez', dni: '14151617', telefono: '998877665', email: 'elena.velasquez@mail.com' },
]

export const categoriasSeed: Categoria[] = [
  { idCategoria: 1, nombre: 'Medicamentos', descripcion: 'Medicamentos de uso general y controlados' },
  { idCategoria: 2, nombre: 'Cuidado Personal', descripcion: 'Productos de higiene y cuidado diario' },
  { idCategoria: 3, nombre: 'Vitaminas', descripcion: 'Suplementos vitaminicos y minerales' },
  { idCategoria: 4, nombre: 'Higiene', descripcion: 'Productos de limpieza personal' },
]

export const proveedoresSeed: Proveedor[] = [
  { idProveedor: 1, nombre: 'PharmaPlus SAC', ruc: '20512345678', telefono: '914567890', email: 'contacto@pharmaplus.com', direccion: 'Av. Principal 123, Lima' },
  { idProveedor: 2, nombre: 'SaludCorp S.A.C.', ruc: '20623456789', telefono: '914567891', email: 'ventas@saludcorp.com', direccion: 'Jr. Salud 456, Lima' },
  { idProveedor: 3, nombre: 'BioDistribuciones', ruc: '20634567890', telefono: '914567892', email: 'info@biodistribuciones.com', direccion: 'Calle Bio 789, Lima' },
  { idProveedor: 4, nombre: 'FarmaGlobal S.A.', ruc: '20598765432', telefono: '914567893', email: 'service@farmaglobal.com', direccion: 'Avenida Farma 321, Lima' },
]

export const productosSeed: Producto[] = [
  { idProducto: 1, nombre: 'Paracetamol 500mg', codigoBarras: '7751234567890', descripcion: 'Tabletas para dolor y fiebre', precioVenta: 5.5, precioCompra: 2, idCategoria: 1, idProveedor: 1, requiereReceta: false, fechaVencimiento: '2026-05-29' },
  { idProducto: 2, nombre: 'Shampoo Anticaspa', codigoBarras: '7751234567891', descripcion: 'Shampoo para uso diario', precioVenta: 12.5, precioCompra: 5, idCategoria: 2, idProveedor: 2, requiereReceta: false, fechaVencimiento: '2026-06-08' },
  { idProducto: 3, nombre: 'Multivitaminico', codigoBarras: '7751234567892', descripcion: 'Vitaminas diarias para adultos', precioVenta: 18, precioCompra: 8, idCategoria: 3, idProveedor: 3, requiereReceta: false, fechaVencimiento: '2026-05-09' },
  { idProducto: 4, nombre: 'Jabon Higienico', codigoBarras: '7751234567893', descripcion: 'Jabon liquido suave para manos', precioVenta: 3.8, precioCompra: 1.2, idCategoria: 4, idProveedor: 4, requiereReceta: false, fechaVencimiento: '2026-04-29' },
]

export const inventarioSeed: Inventario[] = [
  { idInventario: 1, idProducto: 1, stockActual: 120, stockMinimo: 20 },
  { idInventario: 2, idProducto: 2, stockActual: 40, stockMinimo: 15 },
  { idInventario: 3, idProducto: 3, stockActual: 75, stockMinimo: 25 },
  { idInventario: 4, idProducto: 4, stockActual: 8, stockMinimo: 10 },
]

export const pedidosSeed: Pedido[] = [
  { idPedido: 1, idCliente: 1, idUsuario: 3, fechaPedido: '2026-01-01T10:15:00-05:00', total: 23.5, estado: 'completado' },
  { idPedido: 2, idCliente: 2, idUsuario: 2, fechaPedido: '2026-02-02T11:30:00-05:00', total: 0, estado: 'pendiente' },
  { idPedido: 3, idCliente: 3, idUsuario: 4, fechaPedido: '2026-03-03T14:05:00-05:00', total: 43, estado: 'completado' },
  { idPedido: 4, idCliente: 4, idUsuario: 5, fechaPedido: '2026-04-04T09:20:00-05:00', total: 0, estado: 'cancelado' },
]

export const detalleSeed: DetallePedido[] = [
  { idDetalle: 1, idPedido: 1, idProducto: 1, cantidad: 2, precioUnitario: 5.5 },
  { idDetalle: 2, idPedido: 1, idProducto: 2, cantidad: 1, precioUnitario: 12.5 },
  { idDetalle: 3, idPedido: 3, idProducto: 1, cantidad: 1, precioUnitario: 5.5 },
  { idDetalle: 4, idPedido: 3, idProducto: 2, cantidad: 3, precioUnitario: 12.5 },
]

export const boletasSeed: Boleta[] = [
  { idBoleta: 1, numeroBoleta: 'B001-000001', idPedido: 1, fechaEmision: '2026-01-01T10:16:00-05:00', total: 23.5, igv: 4.23, totalConIgv: 27.73, datosCliente: '{"nombre":"Carlos Garcia","dni":"12345678"}', datosEmpleado: '{"empleado":"Juan Lopez"}', impresa: true },
  { idBoleta: 2, numeroBoleta: 'B001-000002', idPedido: 2, fechaEmision: '2026-02-02T11:31:00-05:00', total: 0, igv: 0, totalConIgv: 0, datosCliente: '{"nombre":"Sofia Ramos","dni":"87654321"}', datosEmpleado: '{"empleado":"Maria Perez"}', impresa: false },
  { idBoleta: 3, numeroBoleta: 'B001-000003', idPedido: 3, fechaEmision: '2026-03-03T14:06:00-05:00', total: 43, igv: 7.74, totalConIgv: 50.74, datosCliente: '{"nombre":"Diego Flores","dni":"10111213"}', datosEmpleado: '{"empleado":"Ana Suarez"}', impresa: true },
  { idBoleta: 4, numeroBoleta: 'B001-000004', idPedido: 4, fechaEmision: '2026-04-04T09:21:00-05:00', total: 0, igv: 0, totalConIgv: 0, datosCliente: '{"nombre":"Elena Velasquez","dni":"14151617"}', datosEmpleado: '{"empleado":"Luis Castro"}', impresa: false },
]

export const reportesSeed: Reporte[] = [
  { idReporte: 1, tipoReporte: 'ventas', fechaGeneracion: '2026-01-31T23:59:59-05:00', fechaInicio: '2026-01-01T00:00:00-05:00', fechaFin: '2026-01-31T23:59:59-05:00', generadoPor: 2, datos: 'S/ 23.50 en ventas' },
  { idReporte: 2, tipoReporte: 'inventario', fechaGeneracion: '2026-02-28T23:59:59-05:00', fechaInicio: '2026-02-01T00:00:00-05:00', fechaFin: '2026-02-28T23:59:59-05:00', generadoPor: 4, datos: '1 producto bajo stock' },
  { idReporte: 3, tipoReporte: 'pedidos', fechaGeneracion: '2026-03-31T23:59:59-05:00', fechaInicio: '2026-03-01T00:00:00-05:00', fechaFin: '2026-03-31T23:59:59-05:00', generadoPor: 3, datos: '1 pendiente, 1 completado' },
  { idReporte: 4, tipoReporte: 'clientes', fechaGeneracion: '2026-04-30T23:59:59-05:00', fechaInicio: '2026-04-01T00:00:00-05:00', fechaFin: '2026-04-30T23:59:59-05:00', generadoPor: 2, datos: '4 clientes nuevos' },
]

export const backupsSeed: Backup[] = []
