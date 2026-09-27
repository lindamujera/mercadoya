<?php
header('Content-Type: application/json; charset=utf-8');

// Configuración de conexión
$host = 'localhost';
$user = 'root';
$pass = '';
$db   = 'mercado_db';

$conn = new mysqli($host, $user, $pass, $db);

// Verificar conexión
if ($conn->connect_error) {
    echo json_encode(['status' => 'error', 'message' => 'Error de conexión con la base de datos']);
    exit;
}

// Recibir los campos enviados por el formulario HTML
$nombre  = $_POST['name'] ?? '';
$email   = $_POST['email'] ?? '';
$message = $_POST['message'] ?? '';

// Validar que no estén vacíos
if (!empty($nombre) && !empty($email) && !empty($message)) {
    // Consulta preparada para mayor seguridad
    $stmt = $conn->prepare("INSERT INTO contactos (nombre, email, mensaje) VALUES (?, ?, ?)");
    $stmt->bind_param("sss", $nombre, $email, $message);

    if ($stmt->execute()) {
        echo json_encode(['status' => 'success', 'message' => 'Registro guardado con éxito']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Error al ejecutar la consulta']);
    }

    $stmt->close();
} else {
    echo json_encode(['status' => 'error', 'message' => 'Por favor completa todos los campos']);
}

$conn->close();
