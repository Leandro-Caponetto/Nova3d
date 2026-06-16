export interface BlogArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  readTime: string;
  date: string;
  imageUrl: string;
  seoKeywords: string[];
  content: {
    type: 'paragraph' | 'heading' | 'list' | 'highlight' | 'table';
    text?: string;
    items?: string[];
    level?: number;
    rows?: { label: string; value: string }[];
  }[];
}

export const BLOG_ARTICLES: BlogArticle[] = [
  {
    id: 'costo-impresion-3d-argentina',
    title: '¿Cuánto cuesta imprimir en 3D en Argentina?',
    slug: 'cuanto-cuesta-imprimir-en-3d-argentina',
    excerpt: 'Guía detallada de costos de fabricación aditiva en el mercado argentino. Descubrí cómo se componen los precios de PLA, resina y horas de máquina.',
    category: 'Finanzas & Guías',
    readTime: '5 min de lectura',
    date: '10 Jun 2026',
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=600&auto=format&fit=crop',
    seoKeywords: ['costo de impresion 3D', 'precios impresion 3D Argentina', 'cuanto sale imprimir en 3D', 'precios PLA', 'precio resina 3D'],
    content: [
      {
        type: 'paragraph',
        text: 'Una de las preguntas más recurrentes en nuestra central de producción es cómo calculamos los presupuestos para proyectos impresos en 3D. En Argentina, la composición del precio final depende de diversas variables que van desde el tipo de tecnología utilizada hasta el comportamiento cambiante de los costos de filamentos importados.'
      },
      {
        type: 'heading',
        level: 3,
        text: 'Factores clave que determinan el costo'
      },
      {
        type: 'paragraph',
        text: 'A nivel industrial y profesional, el precio no se calcula "al ojo". En Nova3D, dividimos la cotización en cuatro pilares fundamentales:'
      },
      {
        type: 'list',
        items: [
          'Cantidad de gramos de filamento/resina: El peso neto del objeto es el factor directo de consumo de material base.',
          'Tiempo de impresión (Horas máquina): El tiempo de uso de la impresora 3D influye porque consume energía, mantenimiento operativo y amortización del equipo.',
          'Complejidad geométrica y post-procesado: Piezas con muchos soportes colgantes requieren remoción manual o lijas específicas que elevan las horas de mano de obra.',
          'Tipo de resina o filamento seleccionado: Variando entre PLA convencional, PETG para altas temperaturas, o Resinas UV de alta definición.'
        ]
      },
      {
        type: 'heading',
        level: 3,
        text: 'Referencia aproximada de precios en Argentina'
      },
      {
        type: 'paragraph',
        text: 'Para que tengas una perspectiva comercial clara de los costos de fabricación aditiva vigentes en nuestro taller en Buenos Aires:'
      },
      {
        type: 'table',
        rows: [
          { label: 'Llaveros y Tags Corporativos (PLA - por mayor)', value: 'Desde $500 c/u (mínimo 1000u)' },
          { label: 'Prototipo Industrial Pequeño (FDM - PLA/PETG)', value: 'Desde $5.500 / $12.000 dependiendo del peso' },
          { label: 'Figura de Colección de Alta Definición (Resina SLA)', value: 'Desde $14.000 / $35.000 según tamaño y nivel de detalle' },
          { label: 'Carcasa para Prototipo Electrónico', value: 'Entre $8.000 y $18.000' }
        ]
      },
      {
        type: 'highlight',
        text: '💡 TIP DE AHORRO SEO: Si querés reducir el costo de tu impresión, podés optar por un menor porcentaje de "Infill" (relleno interno de la pieza). Un relleno del 10% al 15% suele ser más que suficiente para garantizar robustez mecánica.'
      },
      {
        type: 'heading',
        level: 3,
        text: '¿Cómo obtener una cotización exacta al instante?'
      },
      {
        type: 'paragraph',
        text: 'En Nova3D simplificamos al 100% este proceso. Podés subir tu archivo de diseño (.STL o .OBJ) en nuestra sección de COTIZAR y el algoritmo calculará el costo de forma automática basándose en la configuración que elijas. ¡Sin demoras ni presupuestos manuales!'
      }
    ]
  },
  {
    id: 'materiales-impresion-3d',
    title: 'Qué materiales usamos para impresión 3D',
    slug: 'que-materiales-usamos-para-impresion-3d',
    excerpt: 'Conocé las características, puntos fuertes y diferencias de los termoplásticos y resinas más populares para llevar tus ideas a la realidad.',
    category: 'Tecnología',
    readTime: '6 min de lectura',
    date: '14 Jun 2026',
    imageUrl: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=600&auto=format&fit=crop',
    seoKeywords: ['materiales impresion 3D', 'impresion en PLA', 'resina 3D versus PLA', 'propiedades PETG', 'fabricacion digital argentina'],
    content: [
      {
        type: 'paragraph',
        text: 'Elegir el material indicado es crucial para el éxito de tu proyecto. No es lo mismo imprimir un tacho decorativo de Star Wars que un engranaje funcional para una máquina de empaque alimenticio. Aquí te contamos detalladamente cuáles son los materiales que usamos día a día en Nova3D.'
      },
      {
        type: 'heading',
        level: 3,
        text: '1. PLA (Ácido Poliláctico)'
      },
      {
        type: 'paragraph',
        text: 'Es el material rey de la impresión 3D por deposición fundida (FDM). Se obtiene a partir del almidón de maíz, lo que lo hace biodegradable y seguro para interiores. Es excelente para reproducir detalles decorativos, maquetas arquitectónicas y piezas de uso general que no van a estar expuestas a altas fuerzas mecánicas ni calor extremo.'
      },
      {
        type: 'list',
        items: [
          'Ventajas: Gran variedad de colores y acabados, libre de olores desagradables, terminaciones muy suaves y excelente estabilidad de forma.',
          'Limitaciones: Empieza a debilitarse si supera los 55°C de temperatura.'
        ]
      },
      {
        type: 'heading',
        level: 3,
        text: '2. PETG (Tereftalato de polietileno glicolado)'
      },
      {
        type: 'paragraph',
        text: 'Si necesitas resistencia y resistencia a la intemperie, el PETG es el termoplástico ideal. Es el primo técnico del plástico de las botellas de gaseosa. Soporta muy bien los rayos UV del sol y la fricción constante.'
      },
      {
        type: 'list',
        items: [
          'Ideal para: Autopartes, carcasas de exterior, soportes técnicos, ganchos industriales y engranajes ligeros.',
          'Resistencia Térmica: Tolera temperaturas de hasta 75°C-80°C sin deformación aparente.'
        ]
      },
      {
        type: 'heading',
        level: 3,
        text: '3. Resina UV Acrilato (SLA / LCD)'
      },
      {
        type: 'paragraph',
        text: 'A diferencia de los filamentos fundidos, las impresiones en resina usan un rayo de luz ultravioleta para curar resina líquida capa por capa. Las capas son tan diminutas (hasta 25 micrones) que la superficie final se siente completamente lisa, como moldeada por inyección.'
      },
      {
        type: 'list',
        items: [
          'Perfecto para: Miniaturas de rol, figuras coleccionables de anime o videojuegos, joyería fina y prototipos médicos de máxima exactitud.',
          'Terminación: Exquisita resolución, sin líneas de capas visibles a simple vista.'
        ]
      },
      {
        type: 'highlight',
        text: '🛠️ RECOMENDACIÓN TÉCNICA: ¿No estás seguro de cuál material elegir para tu diseño? En el calculador automático disponés de una descripción interactiva interactiva que te guiará para seleccionar el material ideal en segundos.'
      }
    ]
  },
  {
    id: 'como-pedir-modelo-3d-personalizado',
    title: 'Cómo pedir tu modelo 3D personalizado',
    slug: 'como-pedir-tu-modelo-3d-personalizado',
    excerpt: 'El paso a paso completo para encargar tus piezas a medida. Desde la descarga del archivo digital 3D gratis hasta la fabricación automatizada.',
    category: 'Tutoriales',
    readTime: '4 min de lectura',
    date: '15 Jun 2026',
    imageUrl: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=600&auto=format&fit=crop',
    seoKeywords: ['pedir impresion 3D', 'imprimir diseño propio', 'paginas para descargar archivos 3D gratis', 'STL personalizado buenos aires', 'fabricar pieza plastica'],
    content: [
      {
        type: 'paragraph',
        text: '¿Tenés la idea en la cabeza o un archivo descargado de internet pero no sabés cómo proceder para tenerlo en tus manos? En Nova3D hemos digitalizado y automatizado el flujo de trabajo para que encargar piezas personalizadas sea tan fácil como comprar un café.'
      },
      {
        type: 'heading',
        level: 3,
        text: 'Paso 1: Conseguir el archivo de diseño 3D'
      },
      {
        type: 'paragraph',
        text: 'Para que una máquina física pueda imprimir tu objeto, requiere un modelo tridimensional virtual en formato .STL, .OBJ o .STEP. Si no sos modelador, podés descargar miles de diseños premium creados por comunidades globales de forma totalmente gratuita en plataformas populares como:'
      },
      {
        type: 'list',
        items: [
          'Printables.com (La más moderna y de mejor calidad de filtrado)',
          'Thingiverse.com (El repositorio histórico de diseño 3D más grande del mundo)',
          'Cults3D.com (Excelente opción con modelos gratuitos y de pago independientes)',
          'Thangs.com (Un megabuscador que escanea todos los sitios de 3D a la vez)'
        ]
      },
      {
        type: 'heading',
        level: 3,
        text: 'Paso 2: Cargar el diseño en nuestro estimador web'
      },
      {
        type: 'paragraph',
        text: 'Hacé clic en el botón "COTIZAR" del menú. Arrastrá y soltá el archivo descargado. La plataforma leerá el volumen del modelo en tiempo real y mostrará una aproximación del peso e infill. Podrás elegir el material y la escala que prefieras presionando un par de botones.'
      },
      {
        type: 'heading',
        level: 3,
        text: 'Paso 3: Comunicación e impresión inteligente'
      },
      {
        type: 'paragraph',
        text: 'Si tenés consultas adicionales, piezas complejas, o precisás cotizaciones mayoristas personalizadas, podés usar nuestro acceso inmediato de WhatsApp en el botón verde. Un técnico evaluará el archivo y coordinará el pago seguro junto con las opciones de envío exprés a todo el país.'
      },
      {
        type: 'highlight',
        text: '🚚 ENVÍOS: Despachamos a todo el territorio argentino. Para piezas corporativas o mayoristas, contamos con tarifas super reducidas y promociones especiales directamente de fábrica.'
      }
    ]
  }
];
