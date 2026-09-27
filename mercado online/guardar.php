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

// 2. Configuración de conexión con tus credenciales reales de Clever Cloud
$host = '://clever-cloud.com';
$user = 'b58gxtqjsy1gquogbom1';
$db   = 'b58gxtqjsy1gquogbom1';
// ¡REEMPLAZA AQUÍ ABAJO CON LA CONTRASEÑA REAL QUE COPIASTE DE LA PESTAÑA "INFORMACIÓN"!
$pass = 'TU_CONTRASEÑA_REAL_DE_CLEVER_CLOUD'; 

$conn = new mysqli($host, $user, $pass, $db, 3306);

// Verificar conexión
if ($conn->connect_error) {
    echo json_encode(['status' => 'error', 'message' => 'Error de conexión con la base de datos remota']);
    exit;
}

// 3. Recibir los campos enviados por el formulario HTML de contacto
$nombre  = $_POST['name'] ?? '';
$email   = $_POST['email'] ?? '';
$message = $_POST['message'] ?? '';

// Validar que los campos esenciales no estén vacíos
if (!empty($nombre) && !empty($message)) {
    
    // Generar la fecha y hora actuales automáticamente
    $fecha = date('Y-m-d');
    $hora  = date('H:i');
    
    // Adaptar el mensaje del cliente al campo 'servicio' para que quepa en tu tabla actual
    $servicio_texto = 'Contacto: ' . substr($message, 0, 80); // Corta el texto si es muy largo
    $especialista   = 'soporte';
    $duracion       = 0;

    // Consulta preparada adaptada a la estructura exacta de tu tabla 'reservas'
    $stmt = $conn->prepare("INSERT INTO reservas (nombre, email, fecha, hora, servicio, especialista, duracion_minutos) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("ssssssi", $nombre, $email, $fecha, $hora, $servicio_texto, $especialista, $duracion);

    if ($stmt->execute()) {
        echo json_encode(['status' => 'success', 'message' => '¡Registro guardado con éxito en Clever Cloud!']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Error al ejecutar la consulta en la base de datos']);
    }

    $stmt->close();
} else {
    echo json_encode(['status' => 'error', 'message' => 'Por favor completa todos los campos requeridos']);
}

$conn->close();
?>
