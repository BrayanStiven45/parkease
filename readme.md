# 🚗 ParkEase - Sistema Inteligente de Gestión de Estacionamientos

**ParkEase** es una aplicación monolítica desarrollada en Next.js que proporciona una solución completa para la gestión inteligente de estacionamientos. La aplicación integra tecnologías modernas como Firebase, IA con Google Gemini, y un sistema de puntos de lealtad para ofrecer una experiencia de usuario optimizada.

## 🎯 Características Principales

### 🚙 Gestión de Vehículos
- **Registro de Entrada**: Captura automática de placa y hora de entrada
- **Vista en Tiempo Real**: Monitoreo en vivo de vehículos estacionados
- **Cálculo Dinámico de Costos**: Tarifas basadas en tiempo transcurrido
- **Historial Completo**: Registro paginado de todas las transacciones

### 🎁 Sistema de Lealtad
- **Puntos de Fidelidad**: Acumulación automática de puntos por tiempo estacionado
- **Canje de Puntos**: Redención de puntos para descuentos
- **Gestión de Clientes**: Seguimiento de historial de clientes por placa

### 👥 Gestión de Usuarios
- **Autenticación Segura**: Sistema de login con Firebase Auth
- **Control de Acceso**: Roles diferenciados (Admin, Operador)
- **Gestión de Sucursales**: Administración centralizada de múltiples ubicaciones

## 🏗️ Arquitectura de la Aplicación

### Estructura del Proyecto
```
parkease/
├── src/
│   ├── app/                    # Páginas de la aplicación (App Router)
│   │   ├── dashboard/         # Panel principal
│   │   │   ├── branches/      # Gestión de sucursales
│   │   │   ├── history/       # Historial de estacionamientos
│   │   │   └── rate-suggester/ # Sugeridor de tarifas IA
│   │   ├── signup/           # Registro de usuarios
│   │   └── page.tsx          # Página de login
│   ├── components/            # Componentes reutilizables
│   │   ├── auth/             # Componentes de autenticación
│   │   ├── dashboard/        # Componentes del dashboard
│   │   ├── layout/           # Componentes de layout
│   │   └── ui/               # Componentes de interfaz
│   ├── contexts/             # Contextos de React
│   ├── hooks/                # Hooks personalizados
│   ├── lib/                  # Utilidades y configuración
│   └── ai/                   # Integración con IA
├── docs/                     # Documentación
└── .idx/                     # Configuración de desarrollo
```

### Tecnologías Utilizadas

#### Frontend
- **Next.js 15.3.3** - Framework React con App Router
- **React 18.3.1** - Biblioteca de interfaz de usuario
- **TypeScript 5** - Tipado estático
- **Tailwind CSS 3.4.1** - Framework de estilos
- **Radix UI** - Componentes accesibles
- **Lucide React** - Iconografía

#### Backend y Base de Datos
- **Firebase 10.12.2** - Backend como servicio
- **Firestore** - Base de datos NoSQL
- **Firebase Auth** - Autenticación
- **Firebase Admin SDK** - Operaciones del servidor

#### Herramientas de Desarrollo
- **Turbopack** - Bundler de desarrollo
- **ESLint** - Linter de código
- **PostCSS** - Procesador de CSS

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 18+ 
- npm o yarn
- Cuenta de Firebase
- Cuenta de Google Cloud (para IA)

### 1. Clonar el Repositorio
```bash
git clone <repository-url>
cd parkease
```

### 2. Instalar Dependencias
```bash
npm install
```

### 3. Configurar Variables de Entorno
Crear archivo `.env.local` en la raíz del proyecto:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Firebase Admin SDK (para operaciones del servidor)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY=your_private_key

# Google AI API Key
GOOGLE_AI_API_KEY=your_google_ai_api_key
```

### 4. Configurar Firebase
1. Crear proyecto en [Firebase Console](https://console.firebase.google.com)
2. Habilitar Authentication (Email/Password)
3. Crear base de datos Firestore
4. Configurar reglas de seguridad
5. Generar claves de servicio para Admin SDK

## 🏃‍♂️ Ejecución del Servidor

### Desarrollo
```bash
# Iniciar servidor de desarrollo
npm run dev

# El servidor estará disponible en http://localhost:9002
```

### Producción
```bash
# Construir para producción
npm run build

# Iniciar servidor de producción
npm start
```

### Scripts Disponibles
- `npm run dev` - Servidor de desarrollo con Turbopack
- `npm run build` - Construcción para producción
- `npm run start` - Servidor de producción
- `npm run lint` - Verificación de código
- `npm run typecheck` - Verificación de tipos TypeScript

## 📱 Funcionalidades por Rol

### 👤 Operador de Estacionamiento
- **Dashboard Principal**: Vista general de vehículos estacionados
- **Registro de Entrada**: Agregar nuevos vehículos al sistema
- **Procesamiento de Pagos**: Cobro y salida de vehículos
- **Historial**: Consulta de transacciones pasadas
- **Gestión de Perfil**: Configuración personal

### 👨‍💼 Administrador
- **Gestión de Sucursales**: Crear, editar y eliminar sucursales
- **Monitoreo Global**: Vista consolidada de todas las ubicaciones
- **Sugeridor de Tarifas**: Herramienta de IA para optimizar precios
- **Reportes**: Análisis de ingresos y ocupación
- **Gestión de Usuarios**: Administración de operadores

## 🎨 Diseño y UX

### Paleta de Colores
- **Primario**: Teal oscuro (#468499) - Confiabilidad y profesionalismo
- **Fondo**: Gris muy claro (#F0F0F0) - Limpieza y neutralidad
- **Acento**: Amarillo mostaza (#FFB347) - Elementos interactivos y CTAs

### Tipografía
- **Cuerpo y Títulos**: PT Sans - Sans-serif humanista versátil
- **Código**: Source Code Pro - Monospace para IDs y códigos

### Características de UX
- **Interfaz Responsiva**: Adaptable a dispositivos móviles y desktop
- **Navegación Intuitiva**: Sidebar colapsible con iconografía clara
- **Feedback Visual**: Notificaciones toast para acciones del usuario
- **Carga Optimizada**: Estados de carga y transiciones suaves

## 🔧 Configuración Avanzada

### Estructura de Base de Datos
```
Firestore Collections:
├── users/{userId}
│   ├── parkingRecords/{recordId}
│   └── userData
├── plates/{plateNumber}
└── branches/{branchId}
```

### Reglas de Seguridad Firestore
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      match /parkingRecords/{recordId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
    match /plates/{plateNumber} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 🚀 Despliegue

### Vercel (Recomendado)
1. Conectar repositorio a Vercel
2. Configurar variables de entorno
3. Desplegar automáticamente

### Otras Plataformas
- **Netlify**: Compatible con Next.js
- **Firebase Hosting**: Integración nativa
- **Docker**: Contenedorización disponible

## 🤝 Contribución

1. Fork del repositorio
2. Crear rama de feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit de cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver archivo `LICENSE` para más detalles.

## 🆘 Soporte

Para soporte técnico o consultas:
- Crear issue en el repositorio
- Contactar al equipo de desarrollo
- Revisar documentación en `/docs`

---

**ParkEase** - Simplificando la gestión de estacionamientos con tecnología inteligente 🚗✨
