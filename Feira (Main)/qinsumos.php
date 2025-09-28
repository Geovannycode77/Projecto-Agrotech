<?php
$sql = "
SELECT i.nome, i.unidade, 
       COALESCE(SUM(CASE WHEN ei.tipo_movimentacao = 'entrada' THEN ei.quantidade ELSE 0 END), 0) -
       COALESCE(SUM(CASE WHEN ei.tipo_movimentacao = 'saida' THEN ei.quantidade ELSE 0 END), 0) AS estoque_atual
FROM insumos i
LEFT JOIN estoque_insumos ei ON ei.insumo_id = i.id
GROUP BY i.id
";

$stmt = $pdo->query($sql);
$resultado = $stmt->fetchAll(PDO::FETCH_ASSOC);

foreach ($resultado as $linha) {
    echo "<p>{$linha['nome']} - Estoque atual: {$linha['estoque_atual']} {$linha['unidade']}</p>";
}
?>