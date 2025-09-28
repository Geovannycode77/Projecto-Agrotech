<?php
$insumo_id = $_POST['insumo_id'];
$quantidade = $_POST['quantidade'];
$local = $_POST['local_armazenado'];
$data_mov = $_POST['data_movimentacao'];
$tipo = $_POST['tipo_movimentacao']; // entrada ou saida
$destino = $_POST['destino_utilizacao'];

$sql = "INSERT INTO estoque_insumos (insumo_id, quantidade, local_armazenado, 
        data_entrada, data_saida, tipo_movimentacao, destino_utilizacao)
        VALUES (?, ?, ?, ?, ?, ?, ?)";

$data_entrada = ($tipo == 'entrada') ? $data_mov : null;
$data_saida = ($tipo == 'saida') ? $data_mov : null;

$stmt = $pdo->prepare($sql);
$stmt->execute([$insumo_id, $quantidade, $local, $data_entrada, $data_saida, $tipo, $destino]);

echo "Movimentação registrada com sucesso!";
?>