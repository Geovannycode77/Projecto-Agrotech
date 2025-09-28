<?php
$dbhost = 'localhost';
$dbname = 'agrotech';
$dbusername = 'root';  // Mude se necessário
$dbpassword = '';      // Mude se necessário

/**/try {
    $pdo = new PDO("mysql:host=$dbhost;dbname=$dbname;charset=utf8", $dbusername, $dbpassword);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "Conexão estabelecida com sucesso!";
} catch (PDOException $e) {
    die("Erro na conexão: " . $e->getMessage());
}
/**/
/*$conexao = new mysqli($dbhost,$dbusername, $dbpassword, $dbname );
if($conexao->connect_errno){
    echo "erro";
}
else{
    echo "conexao bem sucedida";
}*/
?>