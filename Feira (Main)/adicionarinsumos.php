<?php
$nome = $_POST['nome'];
$categoria = $_POST['categoria'];
$unidade = $_POST['unidade'];
$fornecedor = $_POST['fornecedor'];
$custo_unitario = $_POST['custo_unitario'];
$data_validade = $_POST['data_validade'];

$sql = "INSERT INTO insumos (nome, categoria, unidade, fornecedor, custo_unitario, data_validade)
        VALUES (?, ?, ?, ?, ?, ?)";

$stmt = $pdo->prepare($sql);
$stmt->execute([$nome, $categoria, $unidade, $fornecedor, $custo_unitario, $data_validade]);

echo "Insumo cadastrado com sucesso!";
?>