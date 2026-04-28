<?php
    session_start();

    // === CONFIGURATION BASE DE DONNÉES ===
    $host = 'localhost';
    $dbname = 'ton_nom_de_base_de_donnees';     // À modifier
    $username = 'ton_utilisateur_db';           // À modifier
    $password = 'ton_mot_de_passe_db';          // À modifier

    try {
        $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    } catch (PDOException $e) {
        die("Erreur de connexion à la base de données : " . $e->getMessage());
    }
?>