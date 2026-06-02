import {
  completeSale,
  insertBackup,
  insertBoleta,
  insertCategoria,
  insertCliente,
  insertDetallePedido,
  insertProducto,
  insertProveedor,
  insertReporte,
  insertRol,
  loadBoticaData,
  updateStock,
} from '../infrastructure/supabase/boticaRepository'

export const boticaUseCases = {
  loadBoticaData,
  createCliente: insertCliente,
  createCategoria: insertCategoria,
  createProveedor: insertProveedor,
  createProducto: insertProducto,
  createRol: insertRol,
  updateStock,
  completeSale,
  createDetallePedido: insertDetallePedido,
  createBoleta: insertBoleta,
  createReporte: insertReporte,
  createBackup: insertBackup,
}
