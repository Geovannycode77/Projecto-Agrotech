<?php 

   $servername = 'localhost';
   $username = 'root';
   $password = '';
   $database = 'livestock_management';
   $dsn = 'mysql:host='.$servername.';dbname='.$database;


   try{
        $conn = new PDO($dsn, $username, $password);
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
   }catch(PDOException $e){
        echo 'Connection Failed' . $e->getMessage(); 
   }


?>