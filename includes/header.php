<?php 
    if (session_status() === PHP_SESSION_NONE) session_start();

    if (!isset($_SESSION['user_id'])) {
        header("Location: login.php");
        exit();
    }
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Robot Tracking</title>
</head>
<body>
    <header>
        <h1>Robot Tracking System</h1>
        <p>Connecté en tant que : <strong><?= htmlspecialchars($_SESSION['username']) ?></strong> 
           (<?= htmlspecialchars($_SESSION['role']) ?>)
           | <a href="logout.php">Déconnexion</a>
        </p>
    </header>
    <hr>