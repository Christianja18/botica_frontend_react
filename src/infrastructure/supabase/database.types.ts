import type { PedidoEstado, ReporteTipo } from '../../domain'

type Json = string | number | boolean | null | { readonly [key: string]: Json | undefined } | readonly Json[]

export type Database = {
  public: {
    Tables: {
      roles: {
        Row: {
          id_rol: number
          nombre: string
          descripcion: string | null
          puede_vender: boolean
          puede_administrar_inventario: boolean
          puede_ver_reportes: boolean
          puede_administrar_usuarios: boolean
          activo: boolean
        }
        Insert: {
          nombre: string
          descripcion?: string | null
          puede_vender?: boolean
          puede_administrar_inventario?: boolean
          puede_ver_reportes?: boolean
          puede_administrar_usuarios?: boolean
          activo?: boolean
        }
        Update: Partial<Database['public']['Tables']['roles']['Insert']>
        Relationships: []
      }
      usuarios: {
        Row: {
          id_usuario: number
          auth_user_id: string | null
          nombre: string
          apellido: string
          email: string
          activo: boolean
          id_rol: number
        }
        Insert: {
          auth_user_id?: string | null
          nombre: string
          apellido: string
          email: string
          activo?: boolean
          id_rol: number
        }
        Update: Partial<Database['public']['Tables']['usuarios']['Insert']>
        Relationships: []
      }
      clientes: {
        Row: {
          id_cliente: number
          nombre: string
          apellido: string
          dni: string | null
          telefono: string | null
          email: string | null
        }
        Insert: {
          nombre: string
          apellido: string
          dni?: string | null
          telefono?: string | null
          email?: string | null
        }
        Update: Partial<Database['public']['Tables']['clientes']['Insert']>
        Relationships: []
      }
      categorias: {
        Row: {
          id_categoria: number
          nombre: string
          descripcion: string | null
        }
        Insert: {
          nombre: string
          descripcion?: string | null
        }
        Update: Partial<Database['public']['Tables']['categorias']['Insert']>
        Relationships: []
      }
      proveedores: {
        Row: {
          id_proveedor: number
          nombre: string
          ruc: string | null
          telefono: string | null
          email: string | null
          direccion: string | null
        }
        Insert: {
          nombre: string
          ruc?: string | null
          telefono?: string | null
          email?: string | null
          direccion?: string | null
        }
        Update: Partial<Database['public']['Tables']['proveedores']['Insert']>
        Relationships: []
      }
      productos: {
        Row: {
          id_producto: number
          nombre: string
          codigo_barras: string
          descripcion: string | null
          precio_venta: number
          precio_compra: number
          id_categoria: number
          id_proveedor: number
          requiere_receta: boolean
          fecha_vencimiento: string | null
        }
        Insert: {
          nombre: string
          codigo_barras: string
          descripcion?: string | null
          precio_venta: number
          precio_compra: number
          id_categoria: number
          id_proveedor: number
          requiere_receta?: boolean
          fecha_vencimiento?: string | null
        }
        Update: Partial<Database['public']['Tables']['productos']['Insert']>
        Relationships: []
      }
      inventario: {
        Row: {
          id_inventario: number
          id_producto: number
          stock_actual: number
          stock_minimo: number
        }
        Insert: {
          id_producto: number
          stock_actual?: number
          stock_minimo?: number
        }
        Update: Partial<Database['public']['Tables']['inventario']['Insert']>
        Relationships: []
      }
      pedidos: {
        Row: {
          id_pedido: number
          id_cliente: number | null
          id_usuario: number
          fecha_pedido: string
          total: number
          estado: PedidoEstado
        }
        Insert: {
          id_cliente?: number | null
          id_usuario: number
          fecha_pedido?: string
          total?: number
          estado?: PedidoEstado
        }
        Update: Partial<Database['public']['Tables']['pedidos']['Insert']>
        Relationships: []
      }
      detalle_pedidos: {
        Row: {
          id_detalle: number
          id_pedido: number
          id_producto: number
          cantidad: number
          precio_unitario: number
          subtotal: number
        }
        Insert: {
          id_pedido: number
          id_producto: number
          cantidad: number
          precio_unitario: number
        }
        Update: Partial<Database['public']['Tables']['detalle_pedidos']['Insert']>
        Relationships: []
      }
      boletas: {
        Row: {
          id_boleta: number
          numero_boleta: string
          id_pedido: number
          fecha_emision: string
          total: number
          aplica_igv: boolean
          igv: number
          total_con_igv: number
          datos_cliente: Json | null
          datos_empleado: Json | null
          impresa: boolean
        }
        Insert: {
          numero_boleta: string
          id_pedido: number
          total: number
          aplica_igv?: boolean
          igv?: number
          datos_cliente?: Json | null
          datos_empleado?: Json | null
          impresa?: boolean
        }
        Update: Partial<Database['public']['Tables']['boletas']['Insert']>
        Relationships: []
      }
      reportes: {
        Row: {
          id_reporte: number
          tipo_reporte: ReporteTipo
          fecha_generacion: string
          fecha_inicio: string | null
          fecha_fin: string | null
          generado_por: number
          datos: Json | null
        }
        Insert: {
          tipo_reporte: ReporteTipo
          fecha_inicio?: string | null
          fecha_fin?: string | null
          generado_por: number
          datos?: Json | null
        }
        Update: Partial<Database['public']['Tables']['reportes']['Insert']>
        Relationships: []
      }
      backups: {
        Row: {
          id_backup: number
          tipo: 'completo' | 'inserts'
          file_name: string
          absolute_path: string
          size_bytes: number
          message: string
          generado_por: number | null
          fecha_generacion: string
        }
        Insert: {
          tipo: 'completo' | 'inserts'
          file_name: string
          absolute_path: string
          size_bytes?: number
          message: string
          generado_por?: number | null
        }
        Update: Partial<Database['public']['Tables']['backups']['Insert']>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      link_current_usuario_by_email: {
        Args: Record<PropertyKey, never>
        Returns: number | null
      }
    }
    Enums: {
      pedido_estado: PedidoEstado
      reporte_tipo: ReporteTipo
    }
    CompositeTypes: Record<string, never>
  }
}
