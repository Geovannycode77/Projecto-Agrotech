<?php
session_start();
require 'config.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $email = trim($_POST['email']);
    $senha = $_POST['senha'];

    try {
        // Busca o usuário pelo email
        $stmt = $pdo->prepare("SELECT * FROM userTable WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        // Verifica a senha
        if ($user && password_verify($senha, $user['senha_hash'])) {
            // Armazena informações na sessão
            $_SESSION['user_id'] = $user['id_user'];
            $_SESSION['username'] = $user['username'];
            $_SESSION['nome_fazenda'] = $user['nome_fazenda'];
            $_SESSION['email'] = $user['email'];
            $_SESSION['provincia'] = $user['provincia'];
            $_SESSION['municipio'] = $user['municipio'];
            $_SESSION['data_fundacao'] = $user['data_fundacao'];
            $_SESSION['tipo_gado'] = $user['tipo_gado'];
            header("Location: ../dashboard.php");
            exit;
        } else {
            echo "E-mail ou senha incorretos.";
        }
    } catch (PDOException $e) {
        die("Erro no login: " . $e->getMessage());
    }
}
?>
