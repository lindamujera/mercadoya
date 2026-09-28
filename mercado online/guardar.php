<?php
// 1. Cabeceras CORS indispensables para permitir peticiones desde Netlify sin bloqueos
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header('Content-Type: application/json; charset=utf-8');

// Responder inmediatamente si es una petición de verificación pre-vuelo (OPTIONS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// 2. Conexión segura extrayendo las credenciales ocultas desde las variables de Render
$host = getenv('DB_HOST');
$user = getenv('DB_USER');
$db   = getenv('DB_NAME');
$pass = getenv('DB_PASS');
$port = 3306;

// Validar que las variables existan en el servidor antes de conectar
if (!$host || !$user || !$db || !$pass) {
    echo json_encode(['status' => 'error', 'message' => 'Faltan las variables de entorno en el servidor']);
    exit;
}

$conn = new mysqli($host, $user, $pass, $db, $port);

// Verificar conexión con la base de datos remota
if ($conn->connect_error) {
    echo json_encode(['status' => 'error', 'message' => 'Error de conexión con la base de datos remota']);
    exit;
}

// 3. Recibir los campos enviados por el formulario HTML de contacto
$nombre  = $_POST['name'] ?? $_POST['customerName'] ?? 'Anónimo';
$email   = $_POST['email'] ?? 'cliente@mercadoya.com';
$message = $_POST['message'] ?? '';

// Si viene del carrito de compras y no del formulario de contacto general
if (empty($message) && isset($_POST['customerPhone'])) {
    $message = "Pedido de Tienda. Teléfono: " . ($_POST['customerPhone'] ?? '') . " | Dirección: " . ($_POST['customerAddress'] ?? '');
}

// Validar que los campos esenciales no estén vacíos
if (!empty($nombre) && !empty($message)) {
    
    // Consulta preparada adaptada a la estructura EXACTA de tu tabla 'contactos'
    $stmt = $conn->prepare("INSERT INTO contactos (nombre, email, mensaje) VALUES (?, ?, ?)");
    $stmt->bind_param("sss", $nombre, $email, $message);

    if ($stmt->execute()) {
        echo json_encode(['status' => 'success', 'message' => '¡Registro guardado con éxito de forma segura!']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Error al ejecutar la consulta en la base de datos']);
    }

    $stmt->close();
} else {
    echo json_encode(['status' => 'error', 'message' => 'Por favor completa todos los campos requeridos']);
}

$conn->close();
?>
