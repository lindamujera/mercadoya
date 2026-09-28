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

// 2. Conexión dinámica desarmando la variable DB_URL de Render
$dbUrlString = getenv('DB_URL');

if (!$dbUrlString) {
    echo json_encode(['status' => 'error', 'message' => 'Falta la variable de entorno DB_URL en el servidor de Render']);
    exit;
}

// Descomponer la URL de conexión automática
$urlComponents = parse_url($dbUrlString);

$host = $urlComponents['host'] ?? null;
$user = $urlComponents['user'] ?? null;
$pass = $urlComponents['pass'] ?? null;
$db   = isset($urlComponents['path']) ? ltrim($urlComponents['path'], '/') : null;
$port = $urlComponents['port'] ?? 3306;

$conn = new mysqli($host, $user, $pass, $db, $port);

// Verificar conexión con la base de datos remota
if ($conn->connect_error) {
    echo json_encode(['status' => 'error', 'message' => 'Error de conexión con la base de datos remota']);
    exit;
}

// 3. Recibir los campos enviados por los formularios HTML (Contacto o Carrito)
$nombre  = $_POST['name'] ?? $_POST['customerName'] ?? 'Anónimo';
$email   = $_POST['email'] ?? 'cliente@mercadoya.com';
$message = $_POST['message'] ?? '';

// Si la petición viene del carrito (no tiene mensaje, pero tiene teléfono)
if (empty($message) && isset($_POST['customerPhone'])) {
    $telefono  = $_POST['customerPhone'] ?? '';
    $direccion = $_POST['customerAddress'] ?? '';
    $message   = "Pedido de Tienda. Teléfono: $telefono | Dirección: $direccion";
}

// Validar que los campos esenciales no estén vacíos
if (!empty($nombre) && !empty($message)) {
    
    // Consulta preparada adaptada a la estructura EXACTA de tu tabla 'contactos'
    $sql = "INSERT INTO contactos (nombre, email, mensaje) VALUES (?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sss", $nombre, $email, $message);

    if ($stmt->execute()) {
        echo json_encode(['status' => 'success', 'message' => '¡Datos guardados con éxito de forma segura!']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Error al ejecutar la consulta en la base de datos']);
    }

    $stmt->close();
} else {
    echo json_encode(['status' => 'error', 'message' => 'Por favor completa todos los campos requeridos']);
}

$conn->close();
?>
