<?php
    require 'config.php';

    header('Content-Type: application/json');

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);

        if (!$input) {
            echo json_encode(["status" => "error", "message" => "Données invalides"]);
            exit();
        }

        try {
            $stmt = $pdo->prepare("INSERT INTO trajets 
                (date, trajet_data, duree_minutes, distance_metres, dechets_recuperes, problemes_rencontres, commentaires) 
                VALUES (NOW(), ?, ?, ?, ?, ?, ?)");
            
            $stmt->execute([
                json_encode($input['trajet_data'] ?? []),
                $input['duree_minutes'] ?? 0,
                $input['distance_metres'] ?? 0,
                $input['dechets_recuperes'] ?? 0,
                $input['problemes_rencontres'] ?? '',
                $input['commentaires'] ?? ''
            ]);

            echo json_encode([
                "status" => "success",
                "message" => "Trajet ajouté avec succès",
                "id" => $pdo->lastInsertId()
            ]);

        } catch (Exception $e) {
            echo json_encode([
                "status" => "error",
                "message" => "Erreur lors de l'insertion : " . $e->getMessage()
            ]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "Méthode non autorisée"]);
    }
?>