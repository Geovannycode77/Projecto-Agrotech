<?php
print_r($_POST); // Apenas para debug, pode remover depois
session_start();
require 'config.php'; // Aqui deve estar tua conexão PDO como $pdo

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Captura e sanitiza os dados
    $username = trim($_POST['nome_completo']);
    $email = trim($_POST['email']);
    $data_fundacao = $_POST['data_nascimento'];
    $telefone = !empty($_POST['contacto']) ? trim($_POST['contacto']) : null;
    $nome_fazenda = !empty($_POST['fazenda']) ? trim($_POST['fazenda']) : null;
    $provincia = trim($_POST['provincia']);
    $municipio = trim($_POST['municipio']); 
    $tipo_gado = $_POST['tipo_gado'];
    $senha = $_POST['palavra_passe'];
    $confirmar_senha = $_POST['senha'];

    if ($senha !== $confirmar_senha) {
        die("Erro: As senhas não coincidem.");
    }

    $senha_hash = password_hash($senha, PASSWORD_BCRYPT);

    try {
        $stmt = $pdo->prepare("INSERT INTO userTable (username, email, data_fundacao, telefone, nome_fazenda, provincia, municipio, tipo_gado, senha_hash)
                               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([$username, $email, $data_fundacao, $telefone, $nome_fazenda, $provincia, $municipio, $tipo_gado, $senha_hash]);

        header("Location: ../login.html");
        exit;
    } catch (PDOException $e) {
        die("Erro ao registrar: " . $e->getMessage());
    }
}
?>
