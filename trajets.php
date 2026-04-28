<?php 
    require 'config.php';
    require 'includes/header.php'; 

    $stmt = $pdo->query("SELECT * FROM trajets ORDER BY date DESC");
    $trajets = $stmt->fetchAll(PDO::FETCH_ASSOC);
?>

<h2>Liste des Trajets</h2>

<?php if (empty($trajets)): ?>
    <p>Aucun trajet enregistré pour le moment.</p>
<?php else: ?>
    <table border="1" cellpadding="8" cellspacing="0">
        <tr>
            <th>Date</th>
            <th>Durée (min)</th>
            <th>Distance (m)</th>
            <th>Déchets récupérés</th>
            <th>Problèmes rencontrés</th>
            <th>Commentaires</th>
        </tr>
        <?php foreach ($trajets as $t): ?>
        <tr>
            <td><?= htmlspecialchars($t['date']) ?></td>
            <td><?= htmlspecialchars($t['duree_minutes']) ?></td>
            <td><?= htmlspecialchars($t['distance_metres']) ?></td>
            <td><?= htmlspecialchars($t['dechets_recuperes']) ?></td>
            <td><?= htmlspecialchars($t['problemes_rencontres']) ?></td>
            <td><?= htmlspecialchars($t['commentaires']) ?></td>
        </tr>
        <?php endforeach; ?>
    </table>
<?php endif; ?>

<?php require 'includes/footer.php'; ?>