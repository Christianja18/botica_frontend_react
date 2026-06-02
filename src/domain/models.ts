export type PedidoEstado = 'pendiente' | 'completado' | 'cancelado'
export type ReporteTipo = 'ventas' | 'inventario' | 'pedidos' | 'clientes'
export type BackupTipo = 'completo' | 'inserts'
export type BoticaTableName =
  | 'roles'
  | 'usuarios'
  | 'clientes'
  | 'categorias'
  | 'proveedores'
  | 'productos'
  | 'inventario'
  | 'pedidos'
  | 'detalle_pedidos'
  | 'boletas'
  | 'reportes'
  | 'backups'
export type BoticaFunctionName = 'link_current_usuario_by_email'
export type ViewId =
  | 'dashboard'
  | 'ventas'
  | 'pedidos'
  | 'detalles-pedido'
  | 'boletas'
  | 'productos'
  | 'categorias'
  | 'inventario'
  | 'clientes'
  | 'proveedores'
  | 'reportes'
  | 'roles'
  | 'usuarios'
  | 'backups'

export type Rol = Readonly<{
  idRol: number
  nombre: string
  descripcion: string
  puedeVender: boolean
  puedeAdministrarInventario: boolean
  puedeVerReportes: boolean
  puedeAdministrarUsuarios: boolean
  activo: boolean
}>

export type Usuario = Readonly<{
  idUsuario: number
  nombre: string
  apellido: string
  email: string
  activo: boolean
  idRol: number
}>

export type Cliente = Readonly<{
  idCliente: number
  nombre: string
  apellido: string
  dni: string
  telefono: string
  email: string
}>

export type Categoria = Readonly<{
  idCategoria: number
  nombre: string
  descripcion: string
}>

export type Proveedor = Readonly<{
  idProveedor: number
  nombre: string
  ruc: string
  telefono: string
  email: string
  direccion: string
}>

export type Producto = Readonly<{
  idProducto: number
  nombre: string
  codigoBarras: string
  descripcion: string
  precioVenta: number
  precioCompra: number
  idCategoria: number
  idProveedor: number
  requiereReceta: boolean
  fechaVencimiento: string
}>

export type Inventario = Readonly<{
  idInventario: number
  idProducto: number
  stockActual: number
  stockMinimo: number
}>

export type Pedido = Readonly<{
  idPedido: number
  idCliente: number | null
  idUsuario: number
  fechaPedido: string
  total: number
  estado: PedidoEstado
}>

export type DetallePedido = Readonly<{
  idDetalle: number
  idPedido: number
  idProducto: number
  cantidad: number
  precioUnitario: number
}>

export type Boleta = Readonly<{
  idBoleta: number
  numeroBoleta: string
  idPedido: number
  fechaEmision: string
  total: number
  igv: number
  totalConIgv: number
  datosCliente: string
  datosEmpleado: string
  impresa: boolean
}>

export type Reporte = Readonly<{
  idReporte: number
  tipoReporte: ReporteTipo
  fechaGeneracion: string
  fechaInicio: string
  fechaFin: string
  generadoPor: number
  datos: string
}>

export type Backup = Readonly<{
  idBackup: number
  tipo: BackupTipo
  fileName: string
  absolutePath: string
  sizeBytes: number
  message: string
  generadoPor: number | null
  fechaGeneracion: string
}>

export type CartItem = Readonly<{
  idProducto: number
  cantidad: number
}>

export type Toast = Readonly<{
  tone: 'success' | 'warning' | 'error'
  message: string
}>

export type IconName =
  | 'dashboard'
  | 'sales'
  | 'orders'
  | 'ticket'
  | 'products'
  | 'categories'
  | 'inventory'
  | 'clients'
  | 'suppliers'
  | 'reports'
  | 'roles'
  | 'users'
  | 'backup'
  | 'search'
  | 'plus'
  | 'check'
  | 'warning'
  | 'print'
