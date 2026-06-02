import { useEffect, useMemo, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import type { FormEvent, ReactNode } from 'react'
import type {
  Backup,
  BackupTipo,
  Boleta,
  BoticaTableName,
  CartItem,
  Categoria,
  Cliente,
  DetallePedido,
  IconName,
  Inventario,
  Pedido,
  PedidoEstado,
  Producto,
  Proveedor,
  Reporte,
  ReporteTipo,
  Rol,
  Toast,
  Usuario,
  ViewId,
} from '../domain'
import { authUseCases } from '../application/authUseCases'
import { boticaUseCases } from '../application/boticaUseCases'
import {
  backupsSeed,
  boletasSeed,
  categoriasSeed,
  clientesSeed,
  detalleSeed,
  inventarioSeed,
  pedidosSeed,
  productosSeed,
  proveedoresSeed,
  reportesSeed,
  rolesSeed,
  usuariosSeed,
} from '../domain/seed'
import './App.css'

const currencyFormatter = new Intl.NumberFormat('es-PE', {
  style: 'currency',
  currency: 'PEN',
})

const numberFormatter = new Intl.NumberFormat('es-PE')

const navItems: ReadonlyArray<{ id: ViewId; label: string; icon: IconName }> = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { id: 'ventas', label: 'Ventas', icon: 'sales' },
  { id: 'pedidos', label: 'Pedidos', icon: 'orders' },
  { id: 'detalles-pedido', label: 'Detalles', icon: 'ticket' },
  { id: 'boletas', label: 'Boletas', icon: 'ticket' },
  { id: 'productos', label: 'Productos', icon: 'products' },
  { id: 'categorias', label: 'Categorias', icon: 'categories' },
  { id: 'inventario', label: 'Inventario', icon: 'inventory' },
  { id: 'clientes', label: 'Clientes', icon: 'clients' },
  { id: 'proveedores', label: 'Proveedores', icon: 'suppliers' },
  { id: 'reportes', label: 'Reportes', icon: 'reports' },
  { id: 'roles', label: 'Roles', icon: 'roles' },
  { id: 'usuarios', label: 'Usuarios', icon: 'users' },
  { id: 'backups', label: 'Backups', icon: 'backup' },
]

const viewRequiredTables: Record<ViewId, ReadonlyArray<BoticaTableName>> = {
  dashboard: [],
  ventas: ['clientes', 'productos', 'inventario', 'pedidos', 'detalle_pedidos', 'boletas', 'usuarios'],
  pedidos: ['pedidos', 'clientes', 'usuarios', 'detalle_pedidos', 'productos'],
  'detalles-pedido': ['detalle_pedidos', 'pedidos', 'productos'],
  boletas: ['boletas', 'pedidos', 'clientes', 'usuarios'],
  productos: ['productos', 'categorias', 'proveedores', 'inventario'],
  categorias: ['categorias'],
  inventario: ['inventario', 'productos'],
  clientes: ['clientes'],
  proveedores: ['proveedores'],
  reportes: ['reportes', 'usuarios'],
  roles: ['roles'],
  usuarios: ['usuarios', 'roles'],
  backups: ['backups', 'usuarios'],
}

function App() {
  const [activeView, setActiveView] = useState<ViewId>('dashboard')
  const [session, setSession] = useState<Session | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [dataLoading, setDataLoading] = useState(false)
  const [roles, setRoles] = useState<Rol[]>(rolesSeed)
  const [usuarios, setUsuarios] = useState<Usuario[]>(usuariosSeed)
  const [categorias, setCategorias] = useState<Categoria[]>(categoriasSeed)
  const [clientes, setClientes] = useState<Cliente[]>(clientesSeed)
  const [productos, setProductos] = useState<Producto[]>(productosSeed)
  const [proveedores, setProveedores] = useState<Proveedor[]>(proveedoresSeed)
  const [inventario, setInventario] = useState<Inventario[]>(inventarioSeed)
  const [pedidos, setPedidos] = useState<Pedido[]>(pedidosSeed)
  const [detalles, setDetalles] = useState<DetallePedido[]>(detalleSeed)
  const [boletas, setBoletas] = useState<Boleta[]>(boletasSeed)
  const [reportes, setReportes] = useState<Reporte[]>(reportesSeed)
  const [backups, setBackups] = useState<Backup[]>(backupsSeed)
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedClientId, setSelectedClientId] = useState<number>(clientes[0]?.idCliente ?? 0)
  const [productQuery, setProductQuery] = useState('')
  const [toast, setToast] = useState<Toast | null>(null)
  const [stockDrafts, setStockDrafts] = useState<Record<number, number>>({})
  const [currentUsuario, setCurrentUsuario] = useState<Usuario | null>(null)
  const [unavailableTables, setUnavailableTables] = useState<BoticaTableName[]>([])
  const [unavailableFunctions, setUnavailableFunctions] = useState<string[]>([])

  useEffect(() => {
    let ignore = false

    authUseCases.getSession().then(({ data }) => {
      if (ignore) return
      setSession(data.session)
      setAuthLoading(false)
    })

    const {
      data: { subscription },
    } = authUseCases.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      if (!nextSession) {
        setCurrentUsuario(null)
        setCart([])
        setUnavailableTables([])
        setUnavailableFunctions([])
      }
    })

    return () => {
      ignore = true
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!session) return
    refreshData()
  }, [session])

  async function refreshData() {
    setDataLoading(true)
    try {
      const data = await boticaUseCases.loadBoticaData()
      setRoles(data.roles)
      setUsuarios(data.usuarios)
      setCategorias(data.categorias)
      setClientes(data.clientes)
      setProductos(data.productos)
      setProveedores(data.proveedores)
      setInventario(data.inventario)
      setPedidos(data.pedidos)
      setDetalles(data.detalles)
      setBoletas(data.boletas)
      setReportes(data.reportes)
      setBackups(data.backups)
      setCurrentUsuario(data.currentUsuario)
      setUnavailableTables(data.unavailableTables)
      setUnavailableFunctions(data.unavailableFunctions)
      setSelectedClientId(data.clientes[0]?.idCliente ?? 0)

      if (data.unavailableTables.length > 0) {
        setToast({
          tone: 'warning',
          message: `Modulos desactivados porque faltan tablas en Supabase: ${data.unavailableTables.join(', ')}.`,
        })
      } else if (data.unavailableFunctions.length > 0) {
        setToast({
          tone: 'warning',
          message: `Migracion pendiente: falta la funcion ${data.unavailableFunctions.join(', ')}.`,
        })
      } else if (!data.currentUsuario) {
        setToast({
          tone: 'warning',
          message: 'Sesion valida, pero no hay usuario interno vinculado a auth_user_id.',
        })
      }
    } catch (error) {
      setToast({ tone: 'error', message: getErrorMessage(error) })
    } finally {
      setDataLoading(false)
    }
  }

  const completedPedidos = pedidos.filter((pedido) => pedido.estado === 'completado')
  const ventasTotal = completedPedidos.reduce((sum, pedido) => sum + pedido.total, 0)
  const inventarioBajo = inventario.filter((item) => item.stockActual < item.stockMinimo)
  const productosVencidos = productos.filter((producto) => isExpired(producto.fechaVencimiento))
  const productosPorVencer = productos.filter((producto) => isExpiringSoon(producto.fechaVencimiento))
  const pendientes = pedidos.filter((pedido) => pedido.estado === 'pendiente')

  const topProductos = useMemo(() => {
    return productos
      .map((producto) => {
        const cantidad = detalles
          .filter((detalle) => detalle.idProducto === producto.idProducto)
          .reduce((sum, detalle) => sum + detalle.cantidad, 0)
        const total = detalles
          .filter((detalle) => detalle.idProducto === producto.idProducto)
          .reduce((sum, detalle) => sum + detalle.cantidad * detalle.precioUnitario, 0)

        return { producto, cantidad, total }
      })
      .filter((item) => item.cantidad > 0)
      .sort((a, b) => b.cantidad - a.cantidad || b.total - a.total)
  }, [detalles, productos])

  const filteredProducts = productos.filter((producto) => {
    const normalizedQuery = productQuery.trim().toLowerCase()
    if (normalizedQuery.length === 0) return true

    return (
      producto.nombre.toLowerCase().includes(normalizedQuery) ||
      producto.codigoBarras.includes(normalizedQuery)
    )
  })

  const cartTotal = cart.reduce((sum, item) => {
    const producto = getProducto(productos, item.idProducto)
    return sum + (producto?.precioVenta ?? 0) * item.cantidad
  }, 0)

  function addProductToCart(idProducto: number) {
    const producto = getProducto(productos, idProducto)
    const stock = getInventario(inventario, idProducto)

    if (!producto || !stock) {
      setToast({ tone: 'error', message: 'Producto sin inventario registrado.' })
      return
    }

    if (isExpired(producto.fechaVencimiento)) {
      setToast({ tone: 'error', message: 'No se puede vender un producto vencido.' })
      return
    }

    const currentQuantity = cart.find((item) => item.idProducto === idProducto)?.cantidad ?? 0
    if (currentQuantity + 1 > stock.stockActual) {
      setToast({ tone: 'warning', message: 'Stock insuficiente para agregar otra unidad.' })
      return
    }

    setCart((currentCart) => {
      const existingItem = currentCart.find((item) => item.idProducto === idProducto)
      if (!existingItem) return [...currentCart, { idProducto, cantidad: 1 }]

      return currentCart.map((item) =>
        item.idProducto === idProducto ? { ...item, cantidad: item.cantidad + 1 } : item,
      )
    })
  }

  function updateCartQuantity(idProducto: number, quantity: number) {
    const stock = getInventario(inventario, idProducto)
    const safeQuantity = Math.max(1, Math.min(quantity, stock?.stockActual ?? 1))

    setCart((currentCart) =>
      currentCart.map((item) =>
        item.idProducto === idProducto ? { ...item, cantidad: safeQuantity } : item,
      ),
    )
  }

  function removeCartItem(idProducto: number) {
    setCart((currentCart) => currentCart.filter((item) => item.idProducto !== idProducto))
  }

  async function completeSale() {
    if (cart.length === 0) {
      setToast({ tone: 'warning', message: 'Agrega productos antes de completar la venta.' })
      return
    }

    if (!currentUsuario) {
      setToast({ tone: 'error', message: 'No hay usuario interno vinculado para registrar la venta.' })
      return
    }

    const invalidItem = cart.find((item) => {
      const producto = getProducto(productos, item.idProducto)
      const stock = getInventario(inventario, item.idProducto)
      return !producto || !stock || isExpired(producto.fechaVencimiento) || item.cantidad > stock.stockActual
    })

    if (invalidItem) {
      setToast({ tone: 'error', message: 'La venta contiene stock insuficiente o producto vencido.' })
      return
    }

    setDataLoading(true)
    try {
      await boticaUseCases.completeSale({
        idCliente: selectedClientId === 0 ? null : selectedClientId,
        idUsuario: currentUsuario.idUsuario,
        cart,
        productos,
        clientes,
        usuario: currentUsuario,
      })
      setCart([])
      await refreshData()
      setToast({ tone: 'success', message: `Venta registrada por ${formatCurrency(cartTotal)}.` })
    } catch (error) {
      setToast({ tone: 'error', message: getErrorMessage(error) })
    } finally {
      setDataLoading(false)
    }
  }

  async function addCliente(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(event.currentTarget)
    const newCliente: Cliente = {
      idCliente: 0,
      nombre: readFormValue(formData, 'nombre'),
      apellido: readFormValue(formData, 'apellido'),
      dni: readFormValue(formData, 'dni'),
      telefono: readFormValue(formData, 'telefono'),
      email: readFormValue(formData, 'email'),
    }

    try {
      await boticaUseCases.createCliente(newCliente)
      await refreshData()
      form.reset()
      setToast({ tone: 'success', message: 'Cliente registrado.' })
    } catch (error) {
      setToast({ tone: 'error', message: getErrorMessage(error) })
    }
  }

  async function addCategoria(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)

    try {
      await boticaUseCases.createCategoria({
        nombre: readFormValue(formData, 'nombre'),
        descripcion: readFormValue(formData, 'descripcion'),
      })
      await refreshData()
      form.reset()
      setToast({ tone: 'success', message: 'Categoria registrada.' })
    } catch (error) {
      setToast({ tone: 'error', message: getErrorMessage(error) })
    }
  }

  async function addRol(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)

    try {
      await boticaUseCases.createRol({
        nombre: readFormValue(formData, 'nombre'),
        descripcion: readFormValue(formData, 'descripcion'),
        activo: formData.get('activo') === 'on',
        puedeVender: formData.get('puedeVender') === 'on',
        puedeAdministrarInventario: formData.get('puedeAdministrarInventario') === 'on',
        puedeVerReportes: formData.get('puedeVerReportes') === 'on',
        puedeAdministrarUsuarios: formData.get('puedeAdministrarUsuarios') === 'on',
      })
      await refreshData()
      form.reset()
      setToast({ tone: 'success', message: 'Rol registrado.' })
    } catch (error) {
      setToast({ tone: 'error', message: getErrorMessage(error) })
    }
  }

  async function addProveedor(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(event.currentTarget)
    const newProveedor: Proveedor = {
      idProveedor: 0,
      nombre: readFormValue(formData, 'nombre'),
      ruc: readFormValue(formData, 'ruc'),
      telefono: readFormValue(formData, 'telefono'),
      email: readFormValue(formData, 'email'),
      direccion: readFormValue(formData, 'direccion'),
    }

    try {
      await boticaUseCases.createProveedor(newProveedor)
      await refreshData()
      form.reset()
      setToast({ tone: 'success', message: 'Proveedor registrado.' })
    } catch (error) {
      setToast({ tone: 'error', message: getErrorMessage(error) })
    }
  }

  async function addProducto(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(event.currentTarget)
    const stockInicial = Number(readFormValue(formData, 'stockInicial'))
    const stockMinimo = Number(readFormValue(formData, 'stockMinimo'))

    try {
      await boticaUseCases.createProducto({
        nombre: readFormValue(formData, 'nombre'),
        codigoBarras: readFormValue(formData, 'codigoBarras'),
        descripcion: readFormValue(formData, 'descripcion'),
        precioVenta: Number(readFormValue(formData, 'precioVenta')),
        precioCompra: Number(readFormValue(formData, 'precioCompra')),
        idCategoria: Number(readFormValue(formData, 'idCategoria')),
        idProveedor: Number(readFormValue(formData, 'idProveedor')),
        requiereReceta: formData.get('requiereReceta') === 'on',
        fechaVencimiento: readFormValue(formData, 'fechaVencimiento'),
        stockInicial: Number.isFinite(stockInicial) ? stockInicial : 0,
        stockMinimo: Number.isFinite(stockMinimo) ? stockMinimo : 10,
      })
      await refreshData()
      form.reset()
      setToast({ tone: 'success', message: 'Producto agregado al catalogo.' })
    } catch (error) {
      setToast({ tone: 'error', message: getErrorMessage(error) })
    }
  }

  async function saveStock(idProducto: number) {
    const draft = stockDrafts[idProducto]
    if (draft === undefined) return

    try {
      await boticaUseCases.updateStock(idProducto, Math.max(0, draft))
      await refreshData()
      setToast({ tone: 'success', message: 'Stock actualizado.' })
    } catch (error) {
      setToast({ tone: 'error', message: getErrorMessage(error) })
    }
  }

  async function addDetallePedido(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)

    try {
      await boticaUseCases.createDetallePedido({
        idPedido: Number(readFormValue(formData, 'idPedido')),
        idProducto: Number(readFormValue(formData, 'idProducto')),
        cantidad: Number(readFormValue(formData, 'cantidad')),
        precioUnitario: Number(readFormValue(formData, 'precioUnitario')),
      })
      await refreshData()
      form.reset()
      setToast({ tone: 'success', message: 'Detalle registrado.' })
    } catch (error) {
      setToast({ tone: 'error', message: getErrorMessage(error) })
    }
  }

  async function addBoleta(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    const idPedido = Number(readFormValue(formData, 'idPedido'))
    const pedido = pedidos.find((item) => item.idPedido === idPedido)

    try {
      await boticaUseCases.createBoleta({
        numeroBoleta: readFormValue(formData, 'numeroBoleta') || nextBoletaNumber(boletas),
        idPedido,
        total: Number(pedido?.total ?? readFormValue(formData, 'total') ?? 0),
        igv: Number(readFormValue(formData, 'igv') || 0),
        datosCliente: readFormValue(formData, 'datosCliente'),
        datosEmpleado: readFormValue(formData, 'datosEmpleado'),
        impresa: formData.get('impresa') === 'on',
      })
      await refreshData()
      form.reset()
      setToast({ tone: 'success', message: 'Boleta registrada.' })
    } catch (error) {
      setToast({ tone: 'error', message: getErrorMessage(error) })
    }
  }

  async function generateReport(tipoReporte: ReporteTipo) {
    if (!currentUsuario) {
      setToast({ tone: 'error', message: 'No hay usuario interno vinculado para generar reportes.' })
      return
    }

    try {
      await boticaUseCases.createReporte({
        tipoReporte,
        generadoPor: currentUsuario.idUsuario,
        datos: buildReportSummary(tipoReporte, ventasTotal, inventarioBajo.length, pendientes.length, clientes.length),
      })
      await refreshData()
      setToast({ tone: 'success', message: 'Reporte generado.' })
    } catch (error) {
      setToast({ tone: 'error', message: getErrorMessage(error) })
    }
  }

  async function generateBackup(tipo: BackupTipo) {
    if (!currentUsuario) {
      setToast({ tone: 'error', message: 'No hay usuario interno vinculado para registrar backups.' })
      return
    }

    const timestamp = new Date().toISOString().replaceAll(':', '-')
    const fileName = `botica-backup-${tipo}-${timestamp}.sql`
    const message = tipo === 'completo'
      ? 'Exportacion completa solicitada desde React'
      : 'Exportacion de inserts solicitada desde React'

    try {
      await boticaUseCases.createBackup({
        tipo,
        fileName,
        absolutePath: `client-generated/${fileName}`,
        sizeBytes: 0,
        message,
        generadoPor: currentUsuario.idUsuario,
      })
      await refreshData()
      setToast({ tone: 'success', message: 'Backup registrado.' })
    } catch (error) {
      setToast({ tone: 'error', message: getErrorMessage(error) })
    }
  }

  const availableNavItems = navItems.filter((item) => isViewAvailable(item.id, unavailableTables))
  const visibleView = isViewAvailable(activeView, unavailableTables) ? activeView : 'dashboard'
  const activeLabel = availableNavItems.find((item) => item.id === visibleView)?.label ?? 'Dashboard'
  const sessionEmail = session?.user.email ?? 'usuario@botica.com'
  const displayUser = currentUsuario
    ? `${currentUsuario.nombre} ${currentUsuario.apellido}`
    : sessionEmail
  const displayInitials = currentUsuario
    ? initials(currentUsuario.nombre, currentUsuario.apellido)
    : sessionEmail.slice(0, 2).toUpperCase()

  if (authLoading) {
    return <AuthShell title="Conectando con Supabase" detail="Validando sesion local." />
  }

  if (!session) {
    return <SignInView />
  }

  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Navegacion principal">
        <div className="brand">
          <span className="brand-mark">B</span>
          <div>
            <strong>Botica</strong>
            <span>Supabase</span>
          </div>
        </div>

        <nav className="nav-list">
          {availableNavItems.map((item) => (
            <button
              key={item.id}
              className={visibleView === item.id ? 'nav-item is-active' : 'nav-item'}
              type="button"
              onClick={() => setActiveView(item.id)}
              aria-current={visibleView === item.id ? 'page' : undefined}
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-status">
          <span className="status-dot" />
          <div>
            <strong>{unavailableTables.length > 0 ? 'Modulos omitidos' : 'RLS activo'}</strong>
            <span>
              {unavailableTables.length > 0
                ? `${unavailableTables.length} tablas pendientes`
                : unavailableFunctions.length > 0
                  ? 'RPC pendiente'
                  : 'Policies por rol'}
            </span>
          </div>
        </div>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <div>
            <span className="eyebrow">Gestion operativa</span>
            <h1>{activeLabel}</h1>
          </div>
          <div className="topbar-actions">
            <button className="icon-button" type="button" aria-label="Recargar datos" onClick={refreshData}>
              <Icon name="search" />
            </button>
            <div className="user-chip">
              <span>{displayInitials}</span>
              <div>
                <strong>{displayUser}</strong>
                <small>{currentUsuario ? 'Perfil interno activo' : 'Auth sin perfil'}</small>
              </div>
            </div>
            <button className="secondary-button" type="button" onClick={() => authUseCases.signOut()}>
              Salir
            </button>
          </div>
        </header>

        {dataLoading && (
          <div className="loading-strip" role="status">
            Sincronizando datos con Supabase...
          </div>
        )}

        {toast && (
          <div className={`toast toast-${toast.tone}`} role="status">
            <Icon name={toast.tone === 'success' ? 'check' : 'warning'} />
            <span>{toast.message}</span>
            <button type="button" onClick={() => setToast(null)} aria-label="Cerrar alerta">
              Cerrar
            </button>
          </div>
        )}

        {visibleView === 'dashboard' && (
          <DashboardView
            ventasTotal={ventasTotal}
            pedidos={pedidos}
            productos={productos}
            inventarioBajo={inventarioBajo}
            productosPorVencer={productosPorVencer}
            productosVencidos={productosVencidos}
            topProductos={topProductos}
            clientes={clientes}
            usuarios={usuarios}
            inventario={inventario}
          />
        )}

        {visibleView === 'ventas' && (
          <VentasView
            clientes={clientes}
            productos={filteredProducts}
            allProductos={productos}
            inventario={inventario}
            pedidos={pedidos}
            boletas={boletas}
            cart={cart}
            cartTotal={cartTotal}
            selectedClientId={selectedClientId}
            productQuery={productQuery}
            onClientChange={setSelectedClientId}
            onProductQueryChange={setProductQuery}
            onAddProduct={addProductToCart}
            onQuantityChange={updateCartQuantity}
            onRemoveProduct={removeCartItem}
            onCompleteSale={completeSale}
          />
        )}

        {visibleView === 'pedidos' && (
          <PedidosView
            pedidos={pedidos}
            clientes={clientes}
            usuarios={usuarios}
            detalles={detalles}
            productos={productos}
          />
        )}

        {visibleView === 'detalles-pedido' && (
          <DetallesPedidoView
            detalles={detalles}
            pedidos={pedidos}
            productos={productos}
            onAddDetalle={addDetallePedido}
          />
        )}

        {visibleView === 'boletas' && (
          <BoletasView
            boletas={boletas}
            pedidos={pedidos}
            clientes={clientes}
            usuarios={usuarios}
            nextNumber={nextBoletaNumber(boletas)}
            onAddBoleta={addBoleta}
          />
        )}

        {visibleView === 'productos' && (
          <ProductosView
            productos={productos}
            categorias={categorias}
            proveedores={proveedores}
            inventario={inventario}
            onAddProducto={addProducto}
          />
        )}

        {visibleView === 'categorias' && (
          <CategoriasView categorias={categorias} onAddCategoria={addCategoria} />
        )}

        {visibleView === 'inventario' && (
          <InventarioView
            productos={productos}
            inventario={inventario}
            stockDrafts={stockDrafts}
            onDraftChange={(idProducto, value) =>
              setStockDrafts((currentDrafts) => ({ ...currentDrafts, [idProducto]: value }))
            }
            onSaveStock={saveStock}
          />
        )}

        {visibleView === 'clientes' && <ClientesView clientes={clientes} onAddCliente={addCliente} />}

        {visibleView === 'proveedores' && (
          <ProveedoresView proveedores={proveedores} onAddProveedor={addProveedor} />
        )}

        {visibleView === 'reportes' && (
          <ReportesView
            reportes={reportes}
            usuarios={usuarios}
            ventasTotal={ventasTotal}
            inventarioBajo={inventarioBajo.length}
            pendientes={pendientes.length}
            clientes={clientes.length}
            onGenerateReport={generateReport}
          />
        )}

        {visibleView === 'roles' && <RolesView roles={roles} onAddRol={addRol} />}

        {visibleView === 'usuarios' && <UsuariosView usuarios={usuarios} roles={roles} />}

        {visibleView === 'backups' && (
          <BackupsView backups={backups} usuarios={usuarios} onGenerateBackup={generateBackup} />
        )}
      </main>
    </div>
  )
}

function AuthShell({ title, detail }: { title: string; detail: string }) {
  return (
    <main className="auth-screen">
      <section className="auth-card">
        <div className="brand auth-brand">
          <span className="brand-mark">B</span>
          <div>
            <strong>Botica</strong>
            <span>Supabase</span>
          </div>
        </div>
        <h1>{title}</h1>
        <p>{detail}</p>
      </section>
    </main>
  )
}

function SignInView() {
  const [email, setEmail] = useState('admin@botica.com')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError(null)

    const { error: signInError } = await authUseCases.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      setError(signInError.message)
    }

    setLoading(false)
  }

  return (
    <main className="auth-screen">
      <section className="auth-card">
        <div className="brand auth-brand">
          <span className="brand-mark">B</span>
          <div>
            <strong>Botica</strong>
            <span>Supabase</span>
          </div>
        </div>
        <h1>Ingresar al panel</h1>
        <p>Usa el email registrado en usuarios y su password de Supabase Auth.</p>

        <form className="auth-form" onSubmit={signIn}>
          <label>
            Email
            <input
              value={email}
              type="email"
              list="usuarios-emails"
              autoComplete="email"
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <datalist id="usuarios-emails">
              {usuariosSeed.map((usuario) => (
                <option value={usuario.email} key={usuario.idUsuario} />
              ))}
            </datalist>
          </label>
          <label>
            Password
            <input
              value={password}
              type="password"
              autoComplete="current-password"
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>
          {error && <div className="auth-error">{error}</div>}
          <button className="primary-button full" type="submit" disabled={loading}>
            {loading ? 'Validando...' : 'Entrar'}
          </button>
        </form>

        <div className="auth-note">
          <strong>Requisito RLS</strong>
          <span>
            Al ingresar, la app vincula el UUID de Auth con <code>usuarios.auth_user_id</code> por email.
          </span>
        </div>
      </section>
    </main>
  )
}

function DashboardView({
  ventasTotal,
  pedidos,
  productos,
  inventarioBajo,
  productosPorVencer,
  productosVencidos,
  topProductos,
  clientes,
  usuarios,
  inventario,
}: {
  ventasTotal: number
  pedidos: Pedido[]
  productos: Producto[]
  inventarioBajo: Inventario[]
  productosPorVencer: Producto[]
  productosVencidos: Producto[]
  topProductos: Array<{ producto: Producto; cantidad: number; total: number }>
  clientes: Cliente[]
  usuarios: Usuario[]
  inventario: Inventario[]
}) {
  const totalStock = inventario.reduce((sum, item) => sum + item.stockActual, 0)

  return (
    <section className="content-stack">
      <div className="metric-grid">
        <MetricCard title="Ventas completadas" value={formatCurrency(ventasTotal)} detail={`${pedidos.filter((pedido) => pedido.estado === 'completado').length} pedidos`} icon="sales" tone="green" />
        <MetricCard title="Productos activos" value={numberFormatter.format(productos.length)} detail={`${numberFormatter.format(totalStock)} unidades`} icon="products" tone="blue" />
        <MetricCard title="Stock bajo" value={numberFormatter.format(inventarioBajo.length)} detail="Requiere reposicion" icon="warning" tone="amber" />
        <MetricCard title="Clientes" value={numberFormatter.format(clientes.length)} detail={`${usuarios.length} usuarios internos`} icon="clients" tone="slate" />
      </div>

      <div className="dashboard-grid">
        <Panel title="Pedidos recientes" action="Estado">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Pedido</th>
                  <th>Cliente</th>
                  <th>Total</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {pedidos.slice(0, 6).map((pedido) => (
                  <tr key={pedido.idPedido}>
                    <td>#{pedido.idPedido}</td>
                    <td>{getClienteLabel(clientes, pedido.idCliente)}</td>
                    <td>{formatCurrency(pedido.total)}</td>
                    <td>
                      <StatusBadge status={pedido.estado} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel title="Alertas de inventario" action={`${productosVencidos.length} vencidos`}>
          <div className="alert-list">
            {inventarioBajo.length === 0 && productosPorVencer.length === 0 ? (
              <EmptyState title="Sin alertas" detail="El inventario se mantiene dentro de los parametros." />
            ) : (
              <>
                {inventarioBajo.map((item) => {
                  const producto = getProducto(productos, item.idProducto)
                  return (
                    <div className="alert-row" key={item.idInventario}>
                      <Icon name="warning" />
                      <div>
                        <strong>{producto?.nombre ?? 'Producto'}</strong>
                        <span>
                          Stock {item.stockActual} / minimo {item.stockMinimo}
                        </span>
                      </div>
                    </div>
                  )
                })}
                {productosPorVencer.map((producto) => (
                  <div className="alert-row" key={producto.idProducto}>
                    <Icon name="warning" />
                    <div>
                      <strong>{producto.nombre}</strong>
                      <span>Vence en {daysUntil(producto.fechaVencimiento)} dias</span>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </Panel>
      </div>

      <Panel title="Productos mas vendidos" action="Ranking">
        <div className="bar-list">
          {topProductos.map((item) => (
            <div className="bar-row" key={item.producto.idProducto}>
              <div>
                <strong>{item.producto.nombre}</strong>
                <span>{item.cantidad} unidades</span>
              </div>
              <div className="bar-track" aria-hidden="true">
                <span style={{ width: `${Math.min(item.cantidad * 20, 100)}%` }} />
              </div>
              <strong>{formatCurrency(item.total)}</strong>
            </div>
          ))}
        </div>
      </Panel>
    </section>
  )
}

function VentasView({
  clientes,
  productos,
  allProductos,
  inventario,
  pedidos,
  boletas,
  cart,
  cartTotal,
  selectedClientId,
  productQuery,
  onClientChange,
  onProductQueryChange,
  onAddProduct,
  onQuantityChange,
  onRemoveProduct,
  onCompleteSale,
}: {
  clientes: Cliente[]
  productos: Producto[]
  allProductos: Producto[]
  inventario: Inventario[]
  pedidos: Pedido[]
  boletas: Boleta[]
  cart: CartItem[]
  cartTotal: number
  selectedClientId: number
  productQuery: string
  onClientChange: (idCliente: number) => void
  onProductQueryChange: (query: string) => void
  onAddProduct: (idProducto: number) => void
  onQuantityChange: (idProducto: number, quantity: number) => void
  onRemoveProduct: (idProducto: number) => void
  onCompleteSale: () => void
}) {
  return (
    <section className="sales-layout">
      <div className="content-stack">
        <Panel title="Nueva venta" action="Completado descuenta stock">
          <div className="field-grid two">
            <label>
              Cliente
              <select value={selectedClientId} onChange={(event) => onClientChange(Number(event.target.value))}>
                <option value={0}>Cliente sin registrar</option>
                {clientes.map((cliente) => (
                  <option value={cliente.idCliente} key={cliente.idCliente}>
                    {cliente.nombre} {cliente.apellido} - {cliente.dni}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Buscar producto
              <input
                value={productQuery}
                onChange={(event) => onProductQueryChange(event.target.value)}
                placeholder="Nombre o codigo de barras"
              />
            </label>
          </div>

          <div className="product-pick-list">
            {productos.slice(0, 6).map((producto) => {
              const stock = getInventario(inventario, producto.idProducto)
              const disabled = !stock || stock.stockActual === 0 || isExpired(producto.fechaVencimiento)

              return (
                <button
                  key={producto.idProducto}
                  className="pick-product"
                  type="button"
                  onClick={() => onAddProduct(producto.idProducto)}
                  disabled={disabled}
                >
                  <span>
                    <strong>{producto.nombre}</strong>
                    <small>{producto.codigoBarras}</small>
                  </span>
                  <span>
                    {formatCurrency(producto.precioVenta)}
                    <small>Stock {stock?.stockActual ?? 0}</small>
                  </span>
                </button>
              )
            })}
          </div>
        </Panel>

        <Panel title="Pedidos y boletas" action={`${boletas.length} boletas`}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Pedido</th>
                  <th>Cliente</th>
                  <th>Total</th>
                  <th>Boleta</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {pedidos.map((pedido) => {
                  const boleta = boletas.find((item) => item.idPedido === pedido.idPedido)
                  return (
                    <tr key={pedido.idPedido}>
                      <td>#{pedido.idPedido}</td>
                      <td>{getClienteLabel(clientes, pedido.idCliente)}</td>
                      <td>{formatCurrency(pedido.total)}</td>
                      <td>{boleta?.numeroBoleta ?? 'Sin boleta'}</td>
                      <td>
                        <StatusBadge status={pedido.estado} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>

      <aside className="cart-panel">
        <Panel title="Carrito" action={formatCurrency(cartTotal)}>
          <div className="cart-list">
            {cart.length === 0 ? (
              <EmptyState title="Carrito vacio" detail="Selecciona productos disponibles para iniciar la venta." />
            ) : (
              cart.map((item) => {
                const producto = getProducto(allProductos, item.idProducto)
                const stock = getInventario(inventario, item.idProducto)

                return (
                  <div className="cart-item" key={item.idProducto}>
                    <div>
                      <strong>{producto?.nombre ?? 'Producto'}</strong>
                      <span>{formatCurrency(producto?.precioVenta ?? 0)}</span>
                    </div>
                    <input
                      type="number"
                      min={1}
                      max={stock?.stockActual ?? 1}
                      value={item.cantidad}
                      onChange={(event) => onQuantityChange(item.idProducto, Number(event.target.value))}
                      aria-label={`Cantidad de ${producto?.nombre ?? 'producto'}`}
                    />
                    <button type="button" onClick={() => onRemoveProduct(item.idProducto)}>
                      Quitar
                    </button>
                  </div>
                )
              })
            )}
          </div>
          <div className="cart-total">
            <span>Total</span>
            <strong>{formatCurrency(cartTotal)}</strong>
          </div>
          <button className="primary-button full" type="button" onClick={onCompleteSale}>
            <Icon name="check" />
            Completar venta
          </button>
        </Panel>
      </aside>
    </section>
  )
}

function PedidosView({
  pedidos,
  clientes,
  usuarios,
  detalles,
  productos,
}: {
  pedidos: Pedido[]
  clientes: Cliente[]
  usuarios: Usuario[]
  detalles: DetallePedido[]
  productos: Producto[]
}) {
  return (
    <section className="content-stack">
      <Panel title="Pedidos" action={`${pedidos.length} registros`}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Pedido</th>
                <th>Cliente</th>
                <th>Usuario</th>
                <th>Fecha</th>
                <th>Productos</th>
                <th>Total</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {pedidos.map((pedido) => {
                const pedidoDetalles = detalles.filter((detalle) => detalle.idPedido === pedido.idPedido)
                return (
                  <tr key={pedido.idPedido}>
                    <td>#{pedido.idPedido}</td>
                    <td>{getClienteLabel(clientes, pedido.idCliente)}</td>
                    <td>{getUsuarioLabel(usuarios, pedido.idUsuario)}</td>
                    <td>{formatDate(pedido.fechaPedido)}</td>
                    <td>{pedidoDetalles.map((detalle) => getProducto(productos, detalle.idProducto)?.nombre ?? 'Producto').join(', ') || 'Sin productos'}</td>
                    <td>{formatCurrency(pedido.total)}</td>
                    <td><StatusBadge status={pedido.estado} /></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Panel>
    </section>
  )
}

function DetallesPedidoView({
  detalles,
  pedidos,
  productos,
  onAddDetalle,
}: {
  detalles: DetallePedido[]
  pedidos: Pedido[]
  productos: Producto[]
  onAddDetalle: (event: FormEvent<HTMLFormElement>) => void
}) {
  return (
    <section className="content-stack">
      <Panel title="Registrar detalle" action="Pedido + producto">
        <form className="form-grid" onSubmit={onAddDetalle}>
          <label>
            Pedido
            <select name="idPedido" required>
              {pedidos.map((pedido) => (
                <option value={pedido.idPedido} key={pedido.idPedido}>
                  Pedido #{pedido.idPedido} - {pedido.estado} - {formatCurrency(pedido.total)}
                </option>
              ))}
            </select>
          </label>
          <label>
            Producto
            <select name="idProducto" required>
              {productos.map((producto) => (
                <option value={producto.idProducto} key={producto.idProducto}>
                  {producto.nombre} - {formatCurrency(producto.precioVenta)}
                </option>
              ))}
            </select>
          </label>
          <label>
            Cantidad
            <input name="cantidad" type="number" min={1} required defaultValue={1} />
          </label>
          <label>
            Precio unitario
            <input name="precioUnitario" type="number" min="0.01" step="0.01" required />
          </label>
          <button className="primary-button" type="submit">
            <Icon name="plus" />
            Guardar detalle
          </button>
        </form>
      </Panel>

      <Panel title="Mantenimiento de detalles" action={`${detalles.length} registros`}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Pedido</th>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Precio</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {detalles.map((detalle) => (
                <tr key={detalle.idDetalle}>
                  <td>#{detalle.idPedido}</td>
                  <td>{getProducto(productos, detalle.idProducto)?.nombre ?? 'Producto'}</td>
                  <td>{detalle.cantidad}</td>
                  <td>{formatCurrency(detalle.precioUnitario)}</td>
                  <td>{formatCurrency(detalle.cantidad * detalle.precioUnitario)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </section>
  )
}

function BoletasView({
  boletas,
  pedidos,
  clientes,
  usuarios,
  nextNumber,
  onAddBoleta,
}: {
  boletas: Boleta[]
  pedidos: Pedido[]
  clientes: Cliente[]
  usuarios: Usuario[]
  nextNumber: string
  onAddBoleta: (event: FormEvent<HTMLFormElement>) => void
}) {
  return (
    <section className="content-stack">
      <Panel title="Registrar boleta" action="Voucher">
        <form className="form-grid" onSubmit={onAddBoleta}>
          <label>
            Numero de boleta
            <input name="numeroBoleta" required readOnly defaultValue={nextNumber} />
          </label>
          <label>
            Pedido
            <select name="idPedido" required>
              {pedidos.map((pedido) => (
                <option value={pedido.idPedido} key={pedido.idPedido}>
                  Pedido #{pedido.idPedido} - {formatCurrency(pedido.total)}
                </option>
              ))}
            </select>
          </label>
          <label>
            IGV
            <input name="igv" type="number" min="0" step="0.01" defaultValue={0} />
          </label>
          <label className="checkbox-field">
            <input name="impresa" type="checkbox" />
            Impresa
          </label>
          <label className="span-2">
            Datos cliente
            <input name="datosCliente" placeholder='{"nombre":"Cliente","dni":"00000000"}' />
          </label>
          <label className="span-2">
            Datos empleado
            <input name="datosEmpleado" placeholder='{"empleado":"Vendedor"}' />
          </label>
          <button className="primary-button" type="submit">
            <Icon name="plus" />
            Guardar boleta
          </button>
        </form>
      </Panel>

      <Panel title="Boletas" action={`${boletas.length} registros`}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Numero</th>
                <th>Pedido</th>
                <th>Cliente</th>
                <th>Empleado</th>
                <th>Total</th>
                <th>IGV</th>
                <th>Total + IGV</th>
                <th>Impresa</th>
                <th>Emision</th>
              </tr>
            </thead>
            <tbody>
              {boletas.map((boleta) => {
                const pedido = pedidos.find((item) => item.idPedido === boleta.idPedido)
                return (
                  <tr key={boleta.idBoleta}>
                    <td>{boleta.numeroBoleta}</td>
                    <td>#{boleta.idPedido}</td>
                    <td>{getClienteLabel(clientes, pedido?.idCliente ?? null)}</td>
                    <td>{pedido ? getUsuarioLabel(usuarios, pedido.idUsuario) : 'Sin usuario'}</td>
                    <td>{formatCurrency(boleta.total)}</td>
                    <td>{formatCurrency(boleta.igv)}</td>
                    <td>{formatCurrency(boleta.totalConIgv)}</td>
                    <td><StatusPill label={boleta.impresa ? 'Impresa' : 'Pendiente'} /></td>
                    <td>{formatDate(boleta.fechaEmision)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Panel>
    </section>
  )
}

function ProductosView({
  productos,
  categorias,
  proveedores,
  inventario,
  onAddProducto,
}: {
  productos: Producto[]
  categorias: Categoria[]
  proveedores: Proveedor[]
  inventario: Inventario[]
  onAddProducto: (event: FormEvent<HTMLFormElement>) => void
}) {
  return (
    <section className="content-stack">
      <Panel title="Registrar producto" action="Catalogo">
        <form className="form-grid" onSubmit={onAddProducto}>
          <label>
            Nombre
            <input name="nombre" required placeholder="Producto" />
          </label>
          <label>
            Codigo de barras
            <input name="codigoBarras" required placeholder="775..." />
          </label>
          <label className="span-2">
            Descripcion
            <input name="descripcion" required placeholder="Presentacion y uso" />
          </label>
          <label>
            Precio venta
            <input name="precioVenta" required min="0.01" step="0.01" type="number" />
          </label>
          <label>
            Precio compra
            <input name="precioCompra" required min="0.01" step="0.01" type="number" />
          </label>
          <label>
            Categoria
            <select name="idCategoria" required>
              {categorias.map((categoria) => (
                <option value={categoria.idCategoria} key={categoria.idCategoria}>
                  {categoria.nombre}
                </option>
              ))}
            </select>
          </label>
          <label>
            Proveedor
            <select name="idProveedor" required>
              {proveedores.map((proveedor) => (
                <option value={proveedor.idProveedor} key={proveedor.idProveedor}>
                  {proveedor.nombre}
                </option>
              ))}
            </select>
          </label>
          <label>
            Vencimiento
            <input name="fechaVencimiento" required type="date" />
          </label>
          <label>
            Stock inicial
            <input name="stockInicial" required min="0" type="number" defaultValue={0} />
          </label>
          <label>
            Stock minimo
            <input name="stockMinimo" required min="0" type="number" defaultValue={10} />
          </label>
          <label className="checkbox-field">
            <input name="requiereReceta" type="checkbox" />
            Requiere receta
          </label>
          <button className="primary-button" type="submit">
            <Icon name="plus" />
            Agregar producto
          </button>
        </form>
      </Panel>

      <Panel title="Catalogo de productos" action={`${productos.length} registros`}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Categoria</th>
                <th>Proveedor</th>
                <th>Venta</th>
                <th>Stock</th>
                <th>Vencimiento</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((producto) => {
                const categoria = categorias.find((item) => item.idCategoria === producto.idCategoria)
                const proveedor = proveedores.find((item) => item.idProveedor === producto.idProveedor)
                const stock = getInventario(inventario, producto.idProducto)

                return (
                  <tr key={producto.idProducto}>
                    <td>
                      <strong>{producto.nombre}</strong>
                      <span className="muted-cell">{producto.codigoBarras}</span>
                    </td>
                    <td>{categoria?.nombre ?? 'Sin categoria'}</td>
                    <td>{proveedor?.nombre ?? 'Sin proveedor'}</td>
                    <td>{formatCurrency(producto.precioVenta)}</td>
                    <td>{stock?.stockActual ?? 0}</td>
                    <td>
                      <DateBadge date={producto.fechaVencimiento} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Panel>
    </section>
  )
}

function InventarioView({
  productos,
  inventario,
  stockDrafts,
  onDraftChange,
  onSaveStock,
}: {
  productos: Producto[]
  inventario: Inventario[]
  stockDrafts: Record<number, number>
  onDraftChange: (idProducto: number, value: number) => void
  onSaveStock: (idProducto: number) => void
}) {
  return (
    <section className="content-stack">
      <div className="inventory-board">
        {inventario.map((item) => {
          const producto = getProducto(productos, item.idProducto)
          const level = getStockLevel(item)

          return (
            <div className={`stock-card stock-${level}`} key={item.idInventario}>
              <div>
                <strong>{producto?.nombre ?? 'Producto'}</strong>
                <span>{producto?.codigoBarras ?? 'Sin codigo'}</span>
              </div>
              <div className="stock-meter">
                <span style={{ width: `${Math.min((item.stockActual / Math.max(item.stockMinimo, 1)) * 60, 100)}%` }} />
              </div>
              <div className="stock-card-bottom">
                <span>
                  {item.stockActual} / {item.stockMinimo}
                </span>
                <StatusPill label={level === 'low' ? 'Bajo' : level === 'watch' ? 'Atencion' : 'Correcto'} />
              </div>
            </div>
          )
        })}
      </div>

      <Panel title="Ajuste de stock" action="Inventario">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Actual</th>
                <th>Minimo</th>
                <th>Nuevo stock</th>
                <th>Accion</th>
              </tr>
            </thead>
            <tbody>
              {inventario.map((item) => {
                const producto = getProducto(productos, item.idProducto)

                return (
                  <tr key={item.idInventario}>
                    <td>{producto?.nombre ?? 'Producto'}</td>
                    <td>{item.stockActual}</td>
                    <td>{item.stockMinimo}</td>
                    <td>
                      <input
                        className="table-input"
                        type="number"
                        min={0}
                        value={stockDrafts[item.idProducto] ?? item.stockActual}
                        onChange={(event) => onDraftChange(item.idProducto, Number(event.target.value))}
                        aria-label={`Nuevo stock de ${producto?.nombre ?? 'producto'}`}
                      />
                    </td>
                    <td>
                      <button className="secondary-button" type="button" onClick={() => onSaveStock(item.idProducto)}>
                        Guardar
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Panel>
    </section>
  )
}

function ClientesView({
  clientes,
  onAddCliente,
}: {
  clientes: Cliente[]
  onAddCliente: (event: FormEvent<HTMLFormElement>) => void
}) {
  return (
    <section className="content-stack">
      <Panel title="Registrar cliente" action="DNI peruano">
        <form className="form-grid" onSubmit={onAddCliente}>
          <label>
            Nombre
            <input name="nombre" required />
          </label>
          <label>
            Apellido
            <input name="apellido" required />
          </label>
          <label>
            DNI
            <input name="dni" required maxLength={8} pattern="[0-9]{8}" />
          </label>
          <label>
            Telefono
            <input name="telefono" required maxLength={9} pattern="[0-9]{9}" />
          </label>
          <label className="span-2">
            Email
            <input name="email" required type="email" />
          </label>
          <button className="primary-button" type="submit">
            <Icon name="plus" />
            Guardar cliente
          </button>
        </form>
      </Panel>

      <Panel title="Directorio de clientes" action={`${clientes.length} registros`}>
        <div className="directory-grid">
          {clientes.map((cliente) => (
            <article className="person-card" key={cliente.idCliente}>
              <span>{initials(cliente.nombre, cliente.apellido)}</span>
              <div>
                <strong>
                  {cliente.nombre} {cliente.apellido}
                </strong>
                <small>DNI {cliente.dni}</small>
                <small>{cliente.telefono}</small>
              </div>
            </article>
          ))}
        </div>
      </Panel>
    </section>
  )
}

function CategoriasView({
  categorias,
  onAddCategoria,
}: {
  categorias: Categoria[]
  onAddCategoria: (event: FormEvent<HTMLFormElement>) => void
}) {
  return (
    <section className="content-stack">
      <Panel title="Registrar categoria" action="Catalogo">
        <form className="form-grid" onSubmit={onAddCategoria}>
          <label>
            Nombre
            <input name="nombre" required maxLength={100} />
          </label>
          <label className="span-2">
            Descripcion
            <input name="descripcion" maxLength={500} />
          </label>
          <button className="primary-button" type="submit">
            <Icon name="plus" />
            Guardar categoria
          </button>
        </form>
      </Panel>

      <Panel title="Categorias" action={`${categorias.length} registros`}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Descripcion</th>
              </tr>
            </thead>
            <tbody>
              {categorias.map((categoria) => (
                <tr key={categoria.idCategoria}>
                  <td>{categoria.nombre}</td>
                  <td>{categoria.descripcion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </section>
  )
}

function ProveedoresView({
  proveedores,
  onAddProveedor,
}: {
  proveedores: Proveedor[]
  onAddProveedor: (event: FormEvent<HTMLFormElement>) => void
}) {
  return (
    <section className="content-stack">
      <Panel title="Registrar proveedor" action="RUC peruano">
        <form className="form-grid" onSubmit={onAddProveedor}>
          <label>
            Razon social
            <input name="nombre" required />
          </label>
          <label>
            RUC
            <input name="ruc" required maxLength={11} pattern="[0-9]{11}" />
          </label>
          <label>
            Telefono
            <input name="telefono" required maxLength={9} pattern="[0-9]{9}" />
          </label>
          <label>
            Email
            <input name="email" required type="email" />
          </label>
          <label className="span-2">
            Direccion
            <input name="direccion" required />
          </label>
          <button className="primary-button" type="submit">
            <Icon name="plus" />
            Guardar proveedor
          </button>
        </form>
      </Panel>

      <Panel title="Proveedores" action={`${proveedores.length} registros`}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Proveedor</th>
                <th>RUC</th>
                <th>Telefono</th>
                <th>Email</th>
                <th>Direccion</th>
              </tr>
            </thead>
            <tbody>
              {proveedores.map((proveedor) => (
                <tr key={proveedor.idProveedor}>
                  <td>{proveedor.nombre}</td>
                  <td>{proveedor.ruc}</td>
                  <td>{proveedor.telefono}</td>
                  <td>{proveedor.email}</td>
                  <td>{proveedor.direccion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </section>
  )
}

function RolesView({
  roles,
  onAddRol,
}: {
  roles: Rol[]
  onAddRol: (event: FormEvent<HTMLFormElement>) => void
}) {
  return (
    <section className="content-stack">
      <Panel title="Registrar rol" action="Permisos RLS">
        <form className="form-grid" onSubmit={onAddRol}>
          <label>
            Nombre
            <input name="nombre" required maxLength={50} />
          </label>
          <label className="span-2">
            Descripcion
            <input name="descripcion" maxLength={255} />
          </label>
          <label className="checkbox-field"><input name="activo" type="checkbox" defaultChecked /> Activo</label>
          <label className="checkbox-field"><input name="puedeVender" type="checkbox" /> Puede vender</label>
          <label className="checkbox-field"><input name="puedeAdministrarInventario" type="checkbox" /> Administra inventario</label>
          <label className="checkbox-field"><input name="puedeVerReportes" type="checkbox" /> Puede ver reportes</label>
          <label className="checkbox-field"><input name="puedeAdministrarUsuarios" type="checkbox" /> Administra usuarios</label>
          <button className="primary-button" type="submit">
            <Icon name="plus" />
            Guardar rol
          </button>
        </form>
      </Panel>

      <Panel title="Roles y permisos" action={`${roles.length} registros`}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Rol</th>
                <th>Descripcion</th>
                <th>Ventas</th>
                <th>Inventario</th>
                <th>Reportes</th>
                <th>Usuarios</th>
                <th>Activo</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((rol) => (
                <tr key={rol.idRol}>
                  <td>{rol.nombre}</td>
                  <td>{rol.descripcion}</td>
                  <td><StatusPill label={rol.puedeVender ? 'Si' : 'No'} /></td>
                  <td><StatusPill label={rol.puedeAdministrarInventario ? 'Si' : 'No'} /></td>
                  <td><StatusPill label={rol.puedeVerReportes ? 'Si' : 'No'} /></td>
                  <td><StatusPill label={rol.puedeAdministrarUsuarios ? 'Si' : 'No'} /></td>
                  <td><StatusPill label={rol.activo ? 'Activo' : 'Inactivo'} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </section>
  )
}

function ReportesView({
  reportes,
  usuarios,
  ventasTotal,
  inventarioBajo,
  pendientes,
  clientes,
  onGenerateReport,
}: {
  reportes: Reporte[]
  usuarios: Usuario[]
  ventasTotal: number
  inventarioBajo: number
  pendientes: number
  clientes: number
  onGenerateReport: (tipoReporte: ReporteTipo) => void
}) {
  const reportCards: Array<{ tipo: ReporteTipo; title: string; value: string }> = [
    { tipo: 'ventas', title: 'Ventas', value: formatCurrency(ventasTotal) },
    { tipo: 'inventario', title: 'Inventario bajo', value: String(inventarioBajo) },
    { tipo: 'pedidos', title: 'Pedidos pendientes', value: String(pendientes) },
    { tipo: 'clientes', title: 'Clientes', value: String(clientes) },
  ]

  return (
    <section className="content-stack">
      <div className="report-grid">
        {reportCards.map((item) => (
          <button className="report-card" type="button" key={item.tipo} onClick={() => onGenerateReport(item.tipo)}>
            <span>{item.title}</span>
            <strong>{item.value}</strong>
            <small>Generar reporte</small>
          </button>
        ))}
      </div>

      <Panel title="Reportes generados" action={`${reportes.length} registros`}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Generado por</th>
                <th>Fecha</th>
                <th>Datos</th>
              </tr>
            </thead>
            <tbody>
              {reportes.map((reporte) => (
                <tr key={reporte.idReporte}>
                  <td className="capitalize">{reporte.tipoReporte}</td>
                  <td>{getUsuarioLabel(usuarios, reporte.generadoPor)}</td>
                  <td>{formatDate(reporte.fechaGeneracion)}</td>
                  <td>{reporte.datos}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </section>
  )
}

function UsuariosView({ usuarios, roles }: { usuarios: Usuario[]; roles: Rol[] }) {
  return (
    <section className="content-stack">
      <div className="role-grid">
        {roles.map((rol) => (
          <article className="role-card" key={rol.idRol}>
            <div>
              <strong>{rol.nombre}</strong>
              <span>{rol.descripcion}</span>
            </div>
            <div className="permission-list">
              <StatusPill label={rol.puedeVender ? 'Ventas' : 'Sin ventas'} />
              <StatusPill label={rol.puedeAdministrarInventario ? 'Inventario' : 'Sin inventario'} />
              <StatusPill label={rol.puedeVerReportes ? 'Reportes' : 'Sin reportes'} />
              <StatusPill label={rol.puedeAdministrarUsuarios ? 'Usuarios' : 'Sin usuarios'} />
            </div>
          </article>
        ))}
      </div>

      <Panel title="Usuarios internos" action="Auth vinculado por uuid">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((usuario) => {
                const rol = roles.find((item) => item.idRol === usuario.idRol)

                return (
                  <tr key={usuario.idUsuario}>
                    <td>
                      {usuario.nombre} {usuario.apellido}
                    </td>
                    <td>{usuario.email}</td>
                    <td>{rol?.nombre ?? 'Sin rol'}</td>
                    <td>
                      <StatusPill label={usuario.activo ? 'Activo' : 'Inactivo'} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Panel>
    </section>
  )
}

function BackupsView({
  backups,
  usuarios,
  onGenerateBackup,
}: {
  backups: Backup[]
  usuarios: Usuario[]
  onGenerateBackup: (tipo: BackupTipo) => void
}) {
  return (
    <section className="content-stack">
      <div className="report-grid">
        <button className="report-card" type="button" onClick={() => onGenerateBackup('completo')}>
          <span>Backup completo</span>
          <strong>SQL</strong>
          <small>Registrar exportacion completa</small>
        </button>
        <button className="report-card" type="button" onClick={() => onGenerateBackup('inserts')}>
          <span>Solo inserts</span>
          <strong>SQL</strong>
          <small>Registrar exportacion de datos</small>
        </button>
      </div>

      <Panel title="Historial de backups" action={`${backups.length} registros`}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Archivo</th>
                <th>Ruta</th>
                <th>Tamano</th>
                <th>Generado por</th>
                <th>Fecha</th>
                <th>Mensaje</th>
              </tr>
            </thead>
            <tbody>
              {backups.map((backup) => (
                <tr key={backup.idBackup}>
                  <td>{backup.tipo}</td>
                  <td>{backup.fileName}</td>
                  <td>{backup.absolutePath}</td>
                  <td>{numberFormatter.format(backup.sizeBytes)} bytes</td>
                  <td>{backup.generadoPor ? getUsuarioLabel(usuarios, backup.generadoPor) : 'Sistema'}</td>
                  <td>{formatDate(backup.fechaGeneracion)}</td>
                  <td>{backup.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </section>
  )
}

function MetricCard({
  title,
  value,
  detail,
  icon,
  tone,
}: {
  title: string
  value: string
  detail: string
  icon: IconName
  tone: 'green' | 'blue' | 'amber' | 'slate'
}) {
  return (
    <article className={`metric-card metric-${tone}`}>
      <div className="metric-icon">
        <Icon name={icon} />
      </div>
      <span>{title}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  )
}

function Panel({ title, action, children }: { title: string; action?: string; children: ReactNode }) {
  return (
    <section className="panel">
      <header className="panel-header">
        <h2>{title}</h2>
        {action && <span>{action}</span>}
      </header>
      {children}
    </section>
  )
}

function EmptyState({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="empty-state">
      <Icon name="check" />
      <strong>{title}</strong>
      <span>{detail}</span>
    </div>
  )
}

function StatusBadge({ status }: { status: PedidoEstado }) {
  return <span className={`status-badge status-${status}`}>{status}</span>
}

function StatusPill({ label }: { label: string }) {
  return <span className="status-pill">{label}</span>
}

function DateBadge({ date }: { date: string }) {
  const expired = isExpired(date)
  const warning = isExpiringSoon(date)

  return (
    <span className={`date-badge ${expired ? 'is-expired' : warning ? 'is-warning' : ''}`}>
      {formatDate(date)}
    </span>
  )
}

function Icon({ name }: { name: IconName }) {
  const paths: Record<IconName, ReactNode> = {
    dashboard: (
      <>
        <path d="M4 4h7v7H4z" />
        <path d="M13 4h7v5h-7z" />
        <path d="M13 11h7v9h-7z" />
        <path d="M4 13h7v7H4z" />
      </>
    ),
    sales: (
      <>
        <path d="M4 19V5" />
        <path d="M8 17V9" />
        <path d="M12 19V3" />
        <path d="M16 15V7" />
        <path d="M20 19V11" />
      </>
    ),
    orders: (
      <>
        <path d="M7 3h10" />
        <path d="M5 7h14v14H5z" />
        <path d="M8 11h8" />
        <path d="M8 15h6" />
      </>
    ),
    ticket: (
      <>
        <path d="M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-3a2 2 0 0 0 0-4z" />
        <path d="M9 9h6" />
        <path d="M9 15h6" />
      </>
    ),
    products: (
      <>
        <path d="M4 7l8-4 8 4-8 4z" />
        <path d="M4 7v10l8 4 8-4V7" />
        <path d="M12 11v10" />
      </>
    ),
    categories: (
      <>
        <path d="M4 4h7v7H4z" />
        <path d="M13 4h7v7h-7z" />
        <path d="M4 13h7v7H4z" />
        <path d="M13 13h7v7h-7z" />
      </>
    ),
    inventory: (
      <>
        <path d="M4 6h16" />
        <path d="M6 6v14h12V6" />
        <path d="M9 10h6" />
        <path d="M9 14h6" />
      </>
    ),
    clients: (
      <>
        <path d="M8 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
        <path d="M2 21a6 6 0 0 1 12 0" />
        <path d="M17 11a3 3 0 1 0 0-6" />
        <path d="M16 16a5 5 0 0 1 6 5" />
      </>
    ),
    suppliers: (
      <>
        <path d="M3 7h11v10H3z" />
        <path d="M14 11h4l3 3v3h-7z" />
        <path d="M6 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
        <path d="M18 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
      </>
    ),
    reports: (
      <>
        <path d="M5 3h14v18H5z" />
        <path d="M8 8h8" />
        <path d="M8 12h8" />
        <path d="M8 16h5" />
      </>
    ),
    roles: (
      <>
        <path d="M12 3l7 4v5c0 5-3 8-7 9-4-1-7-4-7-9V7z" />
        <path d="M9 12l2 2 4-4" />
      </>
    ),
    users: (
      <>
        <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </>
    ),
    backup: (
      <>
        <path d="M12 3a9 9 0 1 0 9 9" />
        <path d="M21 3v6h-6" />
        <path d="M21 9a9 9 0 0 0-9-6" />
        <path d="M12 8v5l3 2" />
      </>
    ),
    search: (
      <>
        <path d="M10 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16z" />
        <path d="M16 16l6 6" />
      </>
    ),
    plus: (
      <>
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </>
    ),
    check: (
      <>
        <path d="M20 6L9 17l-5-5" />
      </>
    ),
    warning: (
      <>
        <path d="M12 3l10 18H2z" />
        <path d="M12 9v5" />
        <path d="M12 17h.01" />
      </>
    ),
    print: (
      <>
        <path d="M7 8V3h10v5" />
        <path d="M7 17H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2" />
        <path d="M7 14h10v7H7z" />
      </>
    ),
  }

  return (
    <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
      {paths[name]}
    </svg>
  )
}

function getProducto(productos: Producto[], idProducto: number): Producto | undefined {
  return productos.find((producto) => producto.idProducto === idProducto)
}

function getInventario(inventario: Inventario[], idProducto: number): Inventario | undefined {
  return inventario.find((item) => item.idProducto === idProducto)
}

function getClienteLabel(clientes: Cliente[], idCliente: number | null): string {
  if (idCliente === null) return 'Publico general'

  const cliente = clientes.find((item) => item.idCliente === idCliente)
  return cliente ? `${cliente.nombre} ${cliente.apellido}` : 'Cliente no disponible'
}

function getUsuarioLabel(usuarios: Usuario[], idUsuario: number): string {
  const usuario = usuarios.find((item) => item.idUsuario === idUsuario)
  return usuario ? `${usuario.nombre} ${usuario.apellido}` : 'Usuario no disponible'
}

function nextBoletaNumber(boletas: Boleta[]): string {
  const lastNumber = boletas.reduce((max, boleta) => {
    const match = boleta.numeroBoleta.match(/^B001-(\d{1,6})$/i)
    return match ? Math.max(max, Number(match[1])) : max
  }, 0)

  return `B001-${String(lastNumber + 1).padStart(6, '0')}`
}

function readFormValue(formData: FormData, key: string): string {
  const value = formData.get(key)
  return typeof value === 'string' ? value.trim() : ''
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  return 'No se pudo completar la operacion.'
}

function isViewAvailable(viewId: ViewId, unavailableTables: BoticaTableName[]): boolean {
  const requiredTables = viewRequiredTables[viewId]
  return requiredTables.every((tableName) => !unavailableTables.includes(tableName))
}

function formatCurrency(value: number): string {
  return currencyFormatter.format(value)
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

function isExpired(date: string): boolean {
  return new Date(date) < startOfToday()
}

function isExpiringSoon(date: string): boolean {
  const days = daysUntil(date)
  return days >= 0 && days <= 30
}

function daysUntil(date: string): number {
  const target = new Date(date)
  const today = startOfToday()
  const difference = target.getTime() - today.getTime()
  return Math.ceil(difference / 86_400_000)
}

function startOfToday(): Date {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today
}

function initials(nombre: string, apellido: string): string {
  return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase()
}

function getStockLevel(item: Inventario): 'low' | 'watch' | 'ok' {
  if (item.stockActual < item.stockMinimo) return 'low'
  if (item.stockActual <= item.stockMinimo * 1.5) return 'watch'
  return 'ok'
}

function buildReportSummary(
  tipoReporte: ReporteTipo,
  ventasTotal: number,
  inventarioBajo: number,
  pendientes: number,
  clientes: number,
): string {
  if (tipoReporte === 'ventas') return `${formatCurrency(ventasTotal)} en ventas completadas`
  if (tipoReporte === 'inventario') return `${inventarioBajo} productos bajo stock`
  if (tipoReporte === 'pedidos') return `${pendientes} pedidos pendientes`
  return `${clientes} clientes registrados`
}

export default App
