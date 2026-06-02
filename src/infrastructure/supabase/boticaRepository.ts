import type {
  Backup,
  Boleta,
  BackupTipo,
  BoticaFunctionName,
  BoticaTableName,
  CartItem,
  Categoria,
  Cliente,
  DetallePedido,
  Inventario,
  Pedido,
  Producto,
  Proveedor,
  Reporte,
  ReporteTipo,
  Rol,
  Usuario,
} from '../../domain'
import type { Database } from './database.types'
import { supabase } from './client'

type Tables = Database['public']['Tables']
type Json = string | number | boolean | null | { readonly [key: string]: Json | undefined } | readonly Json[]
type RolRow = Tables['roles']['Row']
type UsuarioRow = Tables['usuarios']['Row']
type ClienteRow = Tables['clientes']['Row']
type CategoriaRow = Tables['categorias']['Row']
type ProveedorRow = Tables['proveedores']['Row']
type ProductoRow = Tables['productos']['Row']
type InventarioRow = Tables['inventario']['Row']
type PedidoRow = Tables['pedidos']['Row']
type DetallePedidoRow = Tables['detalle_pedidos']['Row']
type BoletaRow = Tables['boletas']['Row']
type ReporteRow = Tables['reportes']['Row']
type BackupRow = Tables['backups']['Row']

export type BoticaData = Readonly<{
  roles: Rol[]
  usuarios: Usuario[]
  clientes: Cliente[]
  categorias: Categoria[]
  proveedores: Proveedor[]
  productos: Producto[]
  inventario: Inventario[]
  pedidos: Pedido[]
  detalles: DetallePedido[]
  boletas: Boleta[]
  reportes: Reporte[]
  backups: Backup[]
  currentUsuario: Usuario | null
  unavailableTables: BoticaTableName[]
  unavailableFunctions: BoticaFunctionName[]
}>

export type ProductoInput = Readonly<{
  nombre: string
  codigoBarras: string
  descripcion: string
  precioVenta: number
  precioCompra: number
  idCategoria: number
  idProveedor: number
  requiereReceta: boolean
  fechaVencimiento: string
  stockInicial: number
  stockMinimo: number
}>

export async function loadBoticaData(): Promise<BoticaData> {
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError) throw new Error(userError.message)

  const unavailableTables: BoticaTableName[] = []
  const unavailableFunctions: BoticaFunctionName[] = []

  if (userData.user) {
    await linkCurrentUsuarioByEmail(unavailableFunctions)
  }

  const [
    roles,
    usuarios,
    clientes,
    categorias,
    proveedores,
    productos,
    inventario,
    pedidos,
    detalles,
    boletas,
    reportes,
    backups,
  ] = await Promise.all([
    safeFetch('roles', fetchRoles, unavailableTables),
    safeFetch('usuarios', fetchUsuarios, unavailableTables),
    safeFetch('clientes', fetchClientes, unavailableTables),
    safeFetch('categorias', fetchCategorias, unavailableTables),
    safeFetch('proveedores', fetchProveedores, unavailableTables),
    safeFetch('productos', fetchProductos, unavailableTables),
    safeFetch('inventario', fetchInventario, unavailableTables),
    safeFetch('pedidos', fetchPedidos, unavailableTables),
    safeFetch('detalle_pedidos', fetchDetalles, unavailableTables),
    safeFetch('boletas', fetchBoletas, unavailableTables),
    safeFetch('reportes', fetchReportes, unavailableTables),
    safeFetch('backups', fetchBackups, unavailableTables),
  ])

  const authEmail = userData.user?.email?.toLowerCase() ?? ''
  const currentUsuario = usuarios
    .map(mapUsuario)
    .find((usuario) => {
      const source = usuarios.find((row) => row.id_usuario === usuario.idUsuario)
      return (
        source?.auth_user_id === userData.user?.id ||
        usuario.email.toLowerCase() === authEmail
      )
    }) ?? null

  return {
    roles: roles.map(mapRol),
    usuarios: usuarios.map(mapUsuario),
    clientes: clientes.map(mapCliente),
    categorias: categorias.map(mapCategoria),
    proveedores: proveedores.map(mapProveedor),
    productos: productos.map(mapProducto),
    inventario: inventario.map(mapInventario),
    pedidos: pedidos.map(mapPedido),
    detalles: detalles.map(mapDetallePedido),
    boletas: boletas.map(mapBoleta),
    reportes: reportes.map(mapReporte),
    backups: backups.map(mapBackup),
    currentUsuario,
    unavailableTables: unique(unavailableTables),
    unavailableFunctions: unique(unavailableFunctions),
  }
}

export async function insertRol(rol: Omit<Rol, 'idRol'>): Promise<void> {
  const { error } = await supabase.from('roles').insert({
    nombre: rol.nombre,
    descripcion: rol.descripcion,
    puede_vender: rol.puedeVender,
    puede_administrar_inventario: rol.puedeAdministrarInventario,
    puede_ver_reportes: rol.puedeVerReportes,
    puede_administrar_usuarios: rol.puedeAdministrarUsuarios,
    activo: rol.activo,
  })

  if (error) throw new Error(error.message)
}

export async function insertCategoria(categoria: Omit<Categoria, 'idCategoria'>): Promise<void> {
  const { error } = await supabase.from('categorias').insert({
    nombre: categoria.nombre,
    descripcion: categoria.descripcion,
  })

  if (error) throw new Error(error.message)
}

export async function insertCliente(cliente: Omit<Cliente, 'idCliente'>): Promise<void> {
  const { error } = await supabase.from('clientes').insert({
    nombre: cliente.nombre,
    apellido: cliente.apellido,
    dni: cliente.dni,
    telefono: cliente.telefono,
    email: cliente.email,
  })

  if (error) throw new Error(error.message)
}

export async function insertProveedor(proveedor: Omit<Proveedor, 'idProveedor'>): Promise<void> {
  const { error } = await supabase.from('proveedores').insert({
    nombre: proveedor.nombre,
    ruc: proveedor.ruc,
    telefono: proveedor.telefono,
    email: proveedor.email,
    direccion: proveedor.direccion,
  })

  if (error) throw new Error(error.message)
}

export async function insertProducto(input: ProductoInput): Promise<void> {
  const { data: producto, error: productoError } = await supabase
    .from('productos')
    .insert({
      nombre: input.nombre,
      codigo_barras: input.codigoBarras,
      descripcion: input.descripcion,
      precio_venta: input.precioVenta,
      precio_compra: input.precioCompra,
      id_categoria: input.idCategoria,
      id_proveedor: input.idProveedor,
      requiere_receta: input.requiereReceta,
      fecha_vencimiento: input.fechaVencimiento,
    })
    .select('id_producto')
    .single()

  if (productoError) throw new Error(productoError.message)

  const { error: inventarioError } = await supabase.from('inventario').insert({
    id_producto: producto.id_producto,
    stock_actual: input.stockInicial,
    stock_minimo: input.stockMinimo,
  })

  if (inventarioError) throw new Error(inventarioError.message)
}

export async function updateStock(idProducto: number, stockActual: number): Promise<void> {
  const { error } = await supabase
    .from('inventario')
    .update({ stock_actual: stockActual })
    .eq('id_producto', idProducto)

  if (error) throw new Error(error.message)
}

export async function completeSale(params: {
  idCliente: number | null
  idUsuario: number
  cart: CartItem[]
  productos: Producto[]
  clientes: Cliente[]
  usuario: Usuario
}): Promise<void> {
  const { data: pedido, error: pedidoError } = await supabase
    .from('pedidos')
    .insert({
      id_cliente: params.idCliente,
      id_usuario: params.idUsuario,
      estado: 'pendiente',
    })
    .select('id_pedido')
    .single()

  if (pedidoError) throw new Error(pedidoError.message)

  const detalles = params.cart.map((item) => {
    const producto = params.productos.find((entry) => entry.idProducto === item.idProducto)
    if (!producto) throw new Error('Producto no encontrado para venta')

    return {
      id_pedido: pedido.id_pedido,
      id_producto: item.idProducto,
      cantidad: item.cantidad,
      precio_unitario: producto.precioVenta,
    }
  })

  const { error: detallesError } = await supabase.from('detalle_pedidos').insert(detalles)
  if (detallesError) throw new Error(detallesError.message)

  const { data: pedidoCompletado, error: completarError } = await supabase
    .from('pedidos')
    .update({ estado: 'completado' })
    .eq('id_pedido', pedido.id_pedido)
    .select('id_pedido,total')
    .single()

  if (completarError) throw new Error(completarError.message)

  const cliente = params.clientes.find((entry) => entry.idCliente === params.idCliente)
  const total = pedidoCompletado.total
  const { error: boletaError } = await supabase.from('boletas').insert({
    numero_boleta: `B001-${String(pedidoCompletado.id_pedido).padStart(6, '0')}`,
    id_pedido: pedidoCompletado.id_pedido,
    total,
    aplica_igv: true,
    igv: Number((total * 0.18).toFixed(2)),
    datos_cliente: cliente
      ? { nombre: `${cliente.nombre} ${cliente.apellido}`, dni: cliente.dni }
      : { nombre: 'Publico general' },
    datos_empleado: { empleado: `${params.usuario.nombre} ${params.usuario.apellido}` },
    impresa: false,
  })

  if (boletaError) throw new Error(boletaError.message)
}

export async function insertReporte(params: {
  tipoReporte: ReporteTipo
  generadoPor: number
  datos: string
}): Promise<void> {
  const { error } = await supabase.from('reportes').insert({
    tipo_reporte: params.tipoReporte,
    generado_por: params.generadoPor,
    datos: { resumen: params.datos },
  })

  if (error) throw new Error(error.message)
}

export async function insertDetallePedido(detalle: Omit<DetallePedido, 'idDetalle'>): Promise<void> {
  const { error } = await supabase.from('detalle_pedidos').insert({
    id_pedido: detalle.idPedido,
    id_producto: detalle.idProducto,
    cantidad: detalle.cantidad,
    precio_unitario: detalle.precioUnitario,
  })

  if (error) throw new Error(error.message)
}

export async function insertBoleta(params: {
  numeroBoleta: string
  idPedido: number
  total: number
  igv: number
  datosCliente: string
  datosEmpleado: string
  impresa: boolean
}): Promise<void> {
  const { error } = await supabase.from('boletas').insert({
    numero_boleta: params.numeroBoleta,
    id_pedido: params.idPedido,
    total: params.total,
    aplica_igv: params.igv > 0,
    igv: params.igv,
    datos_cliente: parseJsonObject(params.datosCliente),
    datos_empleado: parseJsonObject(params.datosEmpleado),
    impresa: params.impresa,
  })

  if (error) throw new Error(error.message)
}

export async function insertBackup(params: {
  tipo: BackupTipo
  fileName: string
  absolutePath: string
  sizeBytes: number
  message: string
  generadoPor: number | null
}): Promise<void> {
  const { error } = await supabase.from('backups').insert({
    tipo: params.tipo,
    file_name: params.fileName,
    absolute_path: params.absolutePath,
    size_bytes: params.sizeBytes,
    message: params.message,
    generado_por: params.generadoPor,
  })

  if (error) throw new Error(error.message)
}

async function linkCurrentUsuarioByEmail(
  unavailableFunctions: BoticaFunctionName[],
): Promise<void> {
  const functionName: BoticaFunctionName = 'link_current_usuario_by_email'
  const { error } = await supabase.rpc(functionName)

  if (!error) return

  if (isMissingSchemaResource(error)) {
    unavailableFunctions.push(functionName)
    return
  }

  throw new Error(error.message)
}

async function safeFetch<T>(
  tableName: BoticaTableName,
  loader: () => Promise<T[]>,
  unavailableTables: BoticaTableName[],
): Promise<T[]> {
  try {
    return await loader()
  } catch (error) {
    if (isMissingSchemaResource(error)) {
      unavailableTables.push(tableName)
      return []
    }

    throw error
  }
}

async function fetchRoles(): Promise<RolRow[]> {
  const { data, error } = await supabase.from('roles').select('*').order('id_rol')
  if (error) throw new Error(error.message)
  return data
}

async function fetchUsuarios(): Promise<UsuarioRow[]> {
  const { data, error } = await supabase.from('usuarios').select('*').order('id_usuario')
  if (error) throw new Error(error.message)
  return data
}

async function fetchClientes(): Promise<ClienteRow[]> {
  const { data, error } = await supabase.from('clientes').select('*').order('id_cliente')
  if (error) throw new Error(error.message)
  return data
}

async function fetchCategorias(): Promise<CategoriaRow[]> {
  const { data, error } = await supabase.from('categorias').select('*').order('id_categoria')
  if (error) throw new Error(error.message)
  return data
}

async function fetchProveedores(): Promise<ProveedorRow[]> {
  const { data, error } = await supabase.from('proveedores').select('*').order('id_proveedor')
  if (error) throw new Error(error.message)
  return data
}

async function fetchProductos(): Promise<ProductoRow[]> {
  const { data, error } = await supabase.from('productos').select('*').order('id_producto')
  if (error) throw new Error(error.message)
  return data
}

async function fetchInventario(): Promise<InventarioRow[]> {
  const { data, error } = await supabase.from('inventario').select('*').order('id_inventario')
  if (error) throw new Error(error.message)
  return data
}

async function fetchPedidos(): Promise<PedidoRow[]> {
  const { data, error } = await supabase.from('pedidos').select('*').order('fecha_pedido', { ascending: false })
  if (error) throw new Error(error.message)
  return data
}

async function fetchDetalles(): Promise<DetallePedidoRow[]> {
  const { data, error } = await supabase.from('detalle_pedidos').select('*').order('id_detalle')
  if (error) throw new Error(error.message)
  return data
}

async function fetchBoletas(): Promise<BoletaRow[]> {
  const { data, error } = await supabase.from('boletas').select('*').order('id_boleta', { ascending: false })
  if (error) throw new Error(error.message)
  return data
}

async function fetchReportes(): Promise<ReporteRow[]> {
  const { data, error } = await supabase.from('reportes').select('*').order('fecha_generacion', { ascending: false })
  if (error) throw new Error(error.message)
  return data
}

async function fetchBackups(): Promise<BackupRow[]> {
  const { data, error } = await supabase.from('backups').select('*').order('fecha_generacion', { ascending: false })
  if (error) throw new Error(error.message)
  return data
}

function mapRol(row: RolRow): Rol {
  return {
    idRol: row.id_rol,
    nombre: row.nombre,
    descripcion: row.descripcion ?? '',
    puedeVender: row.puede_vender,
    puedeAdministrarInventario: row.puede_administrar_inventario,
    puedeVerReportes: row.puede_ver_reportes,
    puedeAdministrarUsuarios: row.puede_administrar_usuarios,
    activo: row.activo,
  }
}

function mapUsuario(row: UsuarioRow): Usuario {
  return {
    idUsuario: row.id_usuario,
    nombre: row.nombre,
    apellido: row.apellido,
    email: row.email,
    activo: row.activo,
    idRol: row.id_rol,
  }
}

function mapCliente(row: ClienteRow): Cliente {
  return {
    idCliente: row.id_cliente,
    nombre: row.nombre,
    apellido: row.apellido,
    dni: row.dni ?? '',
    telefono: row.telefono ?? '',
    email: row.email ?? '',
  }
}

function mapCategoria(row: CategoriaRow): Categoria {
  return {
    idCategoria: row.id_categoria,
    nombre: row.nombre,
    descripcion: row.descripcion ?? '',
  }
}

function mapProveedor(row: ProveedorRow): Proveedor {
  return {
    idProveedor: row.id_proveedor,
    nombre: row.nombre,
    ruc: row.ruc ?? '',
    telefono: row.telefono ?? '',
    email: row.email ?? '',
    direccion: row.direccion ?? '',
  }
}

function mapProducto(row: ProductoRow): Producto {
  return {
    idProducto: row.id_producto,
    nombre: row.nombre,
    codigoBarras: row.codigo_barras,
    descripcion: row.descripcion ?? '',
    precioVenta: row.precio_venta,
    precioCompra: row.precio_compra,
    idCategoria: row.id_categoria,
    idProveedor: row.id_proveedor,
    requiereReceta: row.requiere_receta,
    fechaVencimiento: row.fecha_vencimiento ?? '',
  }
}

function mapInventario(row: InventarioRow): Inventario {
  return {
    idInventario: row.id_inventario,
    idProducto: row.id_producto,
    stockActual: row.stock_actual,
    stockMinimo: row.stock_minimo,
  }
}

function mapPedido(row: PedidoRow): Pedido {
  return {
    idPedido: row.id_pedido,
    idCliente: row.id_cliente,
    idUsuario: row.id_usuario,
    fechaPedido: row.fecha_pedido,
    total: row.total,
    estado: row.estado,
  }
}

function mapDetallePedido(row: DetallePedidoRow): DetallePedido {
  return {
    idDetalle: row.id_detalle,
    idPedido: row.id_pedido,
    idProducto: row.id_producto,
    cantidad: row.cantidad,
    precioUnitario: row.precio_unitario,
  }
}

function mapBoleta(row: BoletaRow): Boleta {
  return {
    idBoleta: row.id_boleta,
    numeroBoleta: row.numero_boleta,
    idPedido: row.id_pedido,
    fechaEmision: row.fecha_emision,
    total: row.total,
    igv: row.igv,
    totalConIgv: row.total_con_igv,
    datosCliente: stringifyJson(row.datos_cliente),
    datosEmpleado: stringifyJson(row.datos_empleado),
    impresa: row.impresa,
  }
}

function mapReporte(row: ReporteRow): Reporte {
  return {
    idReporte: row.id_reporte,
    tipoReporte: row.tipo_reporte,
    fechaGeneracion: row.fecha_generacion,
    fechaInicio: row.fecha_inicio ?? '',
    fechaFin: row.fecha_fin ?? '',
    generadoPor: row.generado_por,
    datos: extractReporteDatos(row.datos),
  }
}

function mapBackup(row: BackupRow): Backup {
  return {
    idBackup: row.id_backup,
    tipo: row.tipo,
    fileName: row.file_name,
    absolutePath: row.absolute_path,
    sizeBytes: row.size_bytes,
    message: row.message,
    generadoPor: row.generado_por,
    fechaGeneracion: row.fecha_generacion,
  }
}

function extractReporteDatos(datos: ReporteRow['datos']): string {
  if (datos === null) return 'Sin datos'
  if (typeof datos === 'string') return datos
  if (isRecord(datos) && typeof datos.resumen === 'string') {
    return datos.resumen
  }

  return JSON.stringify(datos)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isMissingSchemaResource(error: unknown): boolean {
  const code = isRecord(error) && typeof error.code === 'string' ? error.code : ''
  const message = getUnknownErrorMessage(error).toLowerCase()

  return (
    code === 'PGRST202' ||
    code === 'PGRST205' ||
    message.includes('schema cache') ||
    message.includes('could not find the table') ||
    message.includes('could not find the function') ||
    message.includes('relation') && message.includes('does not exist')
  )
}

function getUnknownErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (isRecord(error) && typeof error.message === 'string') return error.message
  if (typeof error === 'string') return error
  return ''
}

function unique<T extends string>(values: T[]): T[] {
  return [...new Set(values)]
}

function stringifyJson(value: unknown): string {
  if (value === null || value === undefined) return ''
  if (typeof value === 'string') return value
  return JSON.stringify(value)
}

function parseJsonObject(value: string): Json {
  if (!value.trim()) return null

  try {
    const parsed: unknown = JSON.parse(value)
    return toJsonValue(parsed)
  } catch {
    return { valor: value }
  }
}

function toJsonValue(value: unknown): Json {
  if (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return value
  }

  if (Array.isArray(value)) {
    return value.map(toJsonValue)
  }

  if (isRecord(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, entryValue]) => [key, toJsonValue(entryValue)]),
    )
  }

  return String(value)
}
