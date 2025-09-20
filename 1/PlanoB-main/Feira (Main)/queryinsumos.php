<?php
$stmt = $pdo->query("SELECT * FROM insumos ORDER BY nome");
$insumos = $stmt->fetchAll(PDO::FETCH_ASSOC);

foreach ($insumos as $insumo) {
    echo "<p>{$insumo['nome']} - Categoria: {$insumo['categoria']} - Unidade: {$insumo['unidade']}</p>";
}
?>